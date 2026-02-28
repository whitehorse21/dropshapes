import os
import uuid
import boto3
from fastapi import UploadFile, HTTPException
from typing import Optional
from botocore.exceptions import ClientError

from app.core.config import settings


def _s3_key_from_url(url: str) -> Optional[str]:
    """Extract S3 object key from a bucket URL. Returns None if not our bucket URL."""
    if not url:
        return None
    prefix = f"https://{settings.AWS_S3_BUCKET_NAME}.s3.{settings.AWS_S3_REGION}.amazonaws.com/"
    if url.startswith(prefix):
        return url[len(prefix) :].split("?")[0]
    return None


class S3Storage:
    def __init__(self):
        self.s3_client = boto3.client(
            's3',
            aws_access_key_id=settings.AWS_ACCESS_KEY_ID,
            aws_secret_access_key=settings.AWS_SECRET_ACCESS_KEY,
            region_name=settings.AWS_S3_REGION
        )
        self.bucket_name = settings.AWS_S3_BUCKET_NAME
    
    async def upload_file(self, file: UploadFile, folder: str = "") -> str:
        """Upload a file to S3 and return the URL"""
        if not file:
            return None
            
        # Create a unique filename
        file_extension = os.path.splitext(file.filename)[1]
        unique_filename = f"{uuid.uuid4()}{file_extension}"
        
        # Add folder path if provided
        key = unique_filename
        if folder:
            key = f"{folder}/{unique_filename}"
        try:
            contents = await file.read()
            self.s3_client.put_object(
                Bucket=self.bucket_name,
                Key=key,
                Body=contents,
                ContentType=file.content_type
            )
            # Generate URL
            url = f"https://{self.bucket_name}.s3.{settings.AWS_S3_REGION}.amazonaws.com/{key}"
            return url
        except ClientError as e:
            error_msg = f"Error uploading to S3: {e}"
            print(error_msg)
            print(f"Using bucket: {self.bucket_name}, region: {settings.AWS_S3_REGION}")
            print(f"Access Key ID: {settings.AWS_ACCESS_KEY_ID[:5]}...")  # Only print first 5 chars for security
            raise HTTPException(status_code=500, detail="Failed to upload file")
        finally:
            await file.seek(0)  # Reset file cursor

    def upload_file_content(
        self,
        file_obj,
        key: str,
        content_type: str = "application/pdf",
        public_read: bool = False,
    ) -> str:
        """Upload file content (bytes or file-like object) to S3 and return the URL.
        If public_read=True, sets ACL so the URL is playable in browser (e.g. chat voice messages).
        """
        try:
            if hasattr(file_obj, "read"):
                contents = file_obj.read()
            else:
                contents = file_obj
            params = {
                "Bucket": self.bucket_name,
                "Key": key,
                "Body": contents,
                "ContentType": content_type,
            }
            if public_read:
                params["ACL"] = "public-read"
            self.s3_client.put_object(**params)
            url = f"https://{self.bucket_name}.s3.{settings.AWS_S3_REGION}.amazonaws.com/{key}"
            return url
        except ClientError as e:
            error_msg = f"Error uploading to S3: {e}"
            print(error_msg)
            print(f"Using bucket: {self.bucket_name}, region: {settings.AWS_S3_REGION}")
            print(f"Access Key ID: {settings.AWS_ACCESS_KEY_ID[:5]}...")  # Only print first 5 chars for security
            raise HTTPException(status_code=500, detail="Failed to upload file")

    def delete_file(self, file_url: str) -> bool:
        """Delete a file from S3"""
        try:
            key = _s3_key_from_url(file_url)
            if not key:
                return False
            self.s3_client.delete_object(
                Bucket=self.bucket_name,
                Key=key
            )
            return True
        except Exception as e:
            print(f"Error deleting from S3: {e}")
            return False

    def generate_presigned_url(self, file_url: str, expires_in: int = 3600) -> Optional[str]:
        """Generate a presigned GET URL for private S3 object. Returns None if URL is not our S3 URL."""
        key = _s3_key_from_url(file_url)
        if not key:
            return None
        try:
            return self.s3_client.generate_presigned_url(
                "get_object",
                Params={"Bucket": self.bucket_name, "Key": key},
                ExpiresIn=expires_in,
            )
        except ClientError as e:
            print(f"Error generating presigned URL: {e}")
            return None


# Factory function to return appropriate storage based on settings
def get_storage():
    if settings.USE_S3_STORAGE:
        return S3Storage()
    # When S3 is disabled, return a no-op stub so callers don't break
    return None

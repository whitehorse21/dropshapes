from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.openapi.docs import get_swagger_ui_html, get_redoc_html
from fastapi.openapi.utils import get_openapi
from datetime import datetime

from app.api.api import api_router
from app.core.config import settings
from app.db.init_db import init_db
from app.utils.warnings import suppress_all_warnings

# Suppress non-critical warnings
suppress_all_warnings()

import logging
import traceback
from fastapi.responses import JSONResponse

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize app
app = FastAPI(
    title=settings.PROJECT_NAME,
    description="DropShapes",
    version="1.0.0",
    docs_url=None,  # Disable default docs
    redoc_url=None,  # Disable default redoc
    redirect_slashes=True  # Enable automatic redirects
)

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    logger.error(f"Unhandled exception occurred: {str(exc)}")
    logger.error(traceback.format_exc())
    return JSONResponse(
        status_code=500,
        content={"detail": str(exc)}
    )

# Add middleware to debug CORS issues
@app.middleware("http")
async def debug_cors_middleware(request, call_next):
    origin = request.headers.get("origin")
    method = request.method
    
    # Log CORS-related requests
    if method == "OPTIONS" or origin:
        logger.info(f"CORS Request - Method: {method}, Origin: {origin}, Path: {request.url.path}")
        if method == "OPTIONS":
            logger.info(f"Preflight headers: {dict(request.headers)}")
    
    response = await call_next(request)
    
    # Log CORS response headers
    if method == "OPTIONS" or origin:
        cors_headers = {k: v for k, v in response.headers.items() if k.lower().startswith('access-control')}
        logger.info(f"CORS Response - Status: {response.status_code}, CORS Headers: {cors_headers}")
    
    return response

# Set up CORS with proper configuration for production and Stripe
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://dropshapes.com",
        "https://www.dropshapes.com",
        "https://api.dropshapes.com",
        "https://api.www.dropshapes.com",
        "https://js.stripe.com",  # Allow Stripe JavaScript
        "https://m.stripe.network",  # Allow Stripe mobile
        "https://r.stripe.com",  # Allow Stripe requests
        "https://*.stripe.com",  # Allow all Stripe subdomains
        "https://*.stripe.network",  # Allow all Stripe network subdomains
        "http://localhost:3000",  # For development
        "http://127.0.0.1:3000"   # For development
    ],
    allow_credentials=True,  # Enable credentials for authentication
    allow_methods=["GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH", "HEAD"],
    allow_headers=[
        "Accept",
        "Accept-Language",
        "Content-Language",
        "Content-Type",
        "Authorization",
        "X-Requested-With",
        "Origin",
        "Access-Control-Request-Method",
        "Access-Control-Request-Headers",
        "Stripe-Signature",  # Allow Stripe webhook signature
        "X-Stripe-Client-Ip",  # Allow Stripe client IP
        "User-Agent",  # Allow User-Agent header
        "Referer",  # Allow Referer header
        "Cache-Control",  # Allow Cache-Control header
        "Pragma"  # Allow Pragma header
    ],
    expose_headers=[
        "Content-Length",
        "Access-Control-Max-Age",
        "Content-Type"
    ],
    max_age=3600  # Cache preflight request results for 1 hour
)

# Mount API routes
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/")
@app.head("/")
async def root():
    return {"message": "API is running...", "version": "1.0.0", "timestamp": datetime.utcnow()}

@app.get("/health/")
@app.head("/health/")
async def simple_health():
    """Simple health check endpoint at root level"""
    return {"status": "up", "timestamp": datetime.utcnow(), "service": "dropshapes-api"}

# Initialize database on startup
@app.on_event("startup")
async def startup_db_client():
    try:
        init_db()
        print("Database tables created successfully")
    except Exception as e:
        print(f"Error initializing database: {e}")

# Custom Swagger UI
@app.get("/docs", include_in_schema=False)
async def custom_swagger_ui_html():
    return get_swagger_ui_html(
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        title=f"{settings.PROJECT_NAME} - Swagger UI",
        oauth2_redirect_url=f"{settings.API_V1_STR}/docs/oauth2-redirect",
        swagger_js_url="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui-bundle.js",
        swagger_css_url="https://unpkg.com/swagger-ui-dist@5.9.0/swagger-ui.css",
    )

# Custom ReDoc
@app.get("/redoc", include_in_schema=False)
async def redoc_html():
    return get_redoc_html(
        openapi_url=f"{settings.API_V1_STR}/openapi.json",
        title=f"{settings.PROJECT_NAME} - ReDoc",
        redoc_js_url="https://cdn.jsdelivr.net/npm/redoc@next/bundles/redoc.standalone.js",
    )

# Custom OpenAPI schema
@app.get(f"{settings.API_V1_STR}/openapi.json", include_in_schema=False)
async def get_open_api_endpoint():
    return get_openapi(
        title=settings.PROJECT_NAME,
        version="1.0.0",
        description="DropShapes - Professional Resume & Cover Letter Builder with Educational Content API",
        routes=app.routes,
    )

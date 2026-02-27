'use client';

import React, { useCallback } from 'react';
import { getYouTubeVideoId } from '../utils/helpers';

interface VideoCardProps {
  resource: { id: number; title: string; description?: string; videoUrl?: string };
  animationDelay?: number;
  onPlay?: (videoUrl: string) => void;
}

export default function VideoCard({ resource, animationDelay = 0, onPlay }: VideoCardProps) {
  const videoId = resource.videoUrl ? getYouTubeVideoId(resource.videoUrl) : null;
  const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : '';

  const handlePlayVideo = useCallback(() => {
    if (resource.videoUrl) {
      if (onPlay) onPlay(resource.videoUrl);
      else window.dispatchEvent(new CustomEvent('playVideo', { detail: { videoUrl: resource.videoUrl } }));
    }
  }, [resource.videoUrl, onPlay]);

  return (
    <div className="education-resource-card education-resource-card--video" style={{ animationDelay: `${animationDelay}s` }}>
      <div className="education-resource-card__thumb">
        <img src={thumbnailUrl || 'https://img.freepik.com/free-vector/gradient-no-photo-sign_23-2149263898.jpg'} alt={resource.title} />
        {resource.videoUrl && (
          <button type="button" onClick={handlePlayVideo} className="education-resource-card__play" aria-label={`Play ${resource.title}`}>
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </button>
        )}
      </div>
      <div className="education-resource-card__body">
        <h3 className="education-resource-card__title">{resource.title}</h3>
        {resource.description && <p className="education-resource-card__desc">{resource.description}</p>}
        <div className="education-resource-card__actions">
          <button type="button" className="btn-resume btn-resume-primary" onClick={handlePlayVideo}>Watch Video</button>
        </div>
      </div>
    </div>
  );
}

'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { getYouTubeVideoId } from '../utils/helpers';

export default function VideoModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');

  const handlePlayVideo = useCallback((event: CustomEvent<{ videoUrl: string }>) => {
    const { videoUrl: url } = event.detail;
    setVideoUrl(url);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    window.addEventListener('playVideo', handlePlayVideo as EventListener);
    return () => window.removeEventListener('playVideo', handlePlayVideo as EventListener);
  }, [handlePlayVideo]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setVideoUrl('');
  }, []);

  if (!isOpen) return null;

  const videoId = getYouTubeVideoId(videoUrl);
  const embedUrl = videoId ? `https://www.youtube.com/embed/${videoId}` : videoUrl;

  return (
    <div className="education-video-modal" role="dialog" aria-modal="true" aria-label="Video player">
      <div className="education-video-modal__backdrop" onClick={handleClose} aria-hidden />
      <div className="education-video-modal__content">
        <div className="education-video-modal__header">
          <h3 className="education-video-modal__title">Video Player</h3>
          <button
            type="button"
            onClick={handleClose}
            className="education-video-modal__close"
            aria-label="Close"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="education-video-modal__embed">
          <iframe
            title="Video"
            src={embedUrl}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>
    </div>
  );
}

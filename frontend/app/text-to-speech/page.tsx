'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import axiosInstance from '@/app/apimodule/axiosConfig/Axios';
import { toast } from 'react-hot-toast';

const VOICES = [
  { id: 'alloy', label: 'Alloy' },
  { id: 'echo', label: 'Echo' },
  { id: 'fable', label: 'Fable' },
  { id: 'onyx', label: 'Onyx' },
  { id: 'nova', label: 'Nova' },
  { id: 'shimmer', label: 'Shimmer' },
  { id: 'joanna', label: 'Joanna' },
  { id: 'matthew', label: 'Matthew' },
  { id: 'salli', label: 'Salli' },
];

function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteChars = atob(base64);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: mimeType });
}

function TextToSpeechContent() {
  const router = useRouter();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [text, setText] = useState('');
  const [loading, setLoading] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const [playbackStatus, setPlaybackStatus] = useState({ isPlaying: false, currentTime: 0, duration: 0, progress: 0 });
  const [options, setOptions] = useState({ lang: 'en', rate: 1.0, pitch: 1.0, voice: 'alloy' });

  const handleSynthesize = async () => {
    if (!text.trim()) {
      toast.error('Please enter some text');
      return;
    }
    setLoading(true);
    setAudioBlob(null);
    try {
      const res = await axiosInstance.post<{ audio: string; duration: number; voice_used: string; language: string }>('text-to-speech/', {
        text: text.trim(),
        lang: options.lang,
        rate: options.rate,
        pitch: options.pitch,
        voice: options.voice,
      });
      const blob = base64ToBlob(res.data.audio, 'audio/mpeg');
      setAudioBlob(blob);
      toast.success('Speech synthesized successfully');
    } catch (err: unknown) {
      const msg = err && typeof err === 'object' && 'response' in err
        ? (err as { response?: { data?: { detail?: string } } }).response?.data?.detail
        : 'Synthesis failed';
      toast.error(typeof msg === 'string' ? msg : 'Synthesis failed');
    } finally {
      setLoading(false);
    }
  };

  const handlePlay = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const audio = new Audio(url);
    audioRef.current = audio;
    audio.play();
    setPlaybackStatus((p) => ({ ...p, isPlaying: true }));
    audio.addEventListener('ended', () => {
      setPlaybackStatus({ isPlaying: false, currentTime: 0, duration: audio.duration || 0, progress: 100 });
      URL.revokeObjectURL(url);
    });
    audio.addEventListener('timeupdate', () => {
      setPlaybackStatus({
        isPlaying: true,
        currentTime: audio.currentTime,
        duration: audio.duration || 0,
        progress: audio.duration ? (audio.currentTime / audio.duration) * 100 : 0,
      });
    });
  };

  const handleStop = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    setPlaybackStatus((p) => ({ ...p, isPlaying: false, currentTime: 0, progress: 0 }));
  };

  const handleDownload = () => {
    if (!audioBlob) return;
    const url = URL.createObjectURL(audioBlob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `speech_${Date.now()}.mp3`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Download started');
  };

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = Math.floor(s % 60);
    return `${m}:${sec.toString().padStart(2, '0')}`;
  };

  return (
    <section id="view-text-to-speech" className="view-section active-view" aria-label="Text-to-Speech">
      <div className="tool-page-wrap text-to-speech-page">
        <div className="header-minimal">
          <h1>Text-to-Speech</h1>
          <p>Convert text to natural-sounding speech using AI.</p>
        </div>
        <div className="tool-page-nav">
          <button type="button" className="btn-resume" onClick={() => router.push('/')} aria-label="Back to Home">
            ← Back to Home
          </button>
        </div>

        <div className="tool-page-card">
          <label className="form-label" htmlFor="tts-text">Text to convert</label>
          <textarea
            id="tts-text"
            className="auth-input"
            rows={5}
            maxLength={3000}
            placeholder="Enter the text you want to convert to speech..."
            value={text}
            onChange={(e) => setText(e.target.value)}
          />
          <p className="tts-char-count">{text.length}/3000</p>
        </div>

        <div className="tool-page-card tts-options-grid">
          <div className="add-task-form-row">
            <label className="form-label">Language</label>
            <select
              className="auth-input add-task-date-input"
              value={options.lang}
              onChange={(e) => setOptions((o) => ({ ...o, lang: e.target.value }))}
            >
              <option value="en">English</option>
              <option value="es">Spanish</option>
              <option value="fr">French</option>
              <option value="de">German</option>
              <option value="it">Italian</option>
              <option value="pt">Portuguese</option>
            </select>
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Voice</label>
            <select
              className="auth-input add-task-date-input"
              value={options.voice}
              onChange={(e) => setOptions((o) => ({ ...o, voice: e.target.value }))}
            >
              {VOICES.map((v) => (
                <option key={v.id} value={v.id}>{v.label}</option>
              ))}
            </select>
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Speed: {options.rate}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={options.rate}
              onChange={(e) => setOptions((o) => ({ ...o, rate: parseFloat(e.target.value) }))}
              className="tts-range"
            />
          </div>
          <div className="add-task-form-row">
            <label className="form-label">Pitch: {options.pitch}x</label>
            <input
              type="range"
              min="0.5"
              max="2"
              step="0.1"
              value={options.pitch}
              onChange={(e) => setOptions((o) => ({ ...o, pitch: parseFloat(e.target.value) }))}
              className="tts-range"
            />
          </div>
        </div>

        <div className="tool-page-card">
          <div className="tts-actions">
            <button type="button" className="btn-resume btn-resume-primary" onClick={handleSynthesize} disabled={loading || !text.trim()}>
              {loading ? 'Synthesizing…' : 'Synthesize'}
            </button>
            {audioBlob && (
              <>
                {!playbackStatus.isPlaying ? (
                  <button type="button" className="btn-resume" onClick={handlePlay}>Play</button>
                ) : (
                  <button type="button" className="btn-resume" onClick={handleStop}>Stop</button>
                )}
                <button type="button" className="btn-resume" onClick={handleDownload}>Download</button>
              </>
            )}
          </div>
          {audioBlob && playbackStatus.duration > 0 && (
            <div className="tts-progress-wrap">
              <span className="tts-time">{formatTime(playbackStatus.currentTime)}</span>
              <div className="tts-progress-track">
                <div className="tts-progress-fill" style={{ width: `${playbackStatus.progress}%` }} />
              </div>
              <span className="tts-time">{formatTime(playbackStatus.duration)}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

export default function TextToSpeechPage() {
  return (
    <TextToSpeechContent />
  );
}

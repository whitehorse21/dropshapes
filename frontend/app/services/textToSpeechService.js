/**
 * Text-to-Speech Service
 * ======================
 * Frontend service for AWS Polly-powered text-to-speech functionality
 * - High-Quality Speech Synthesis
 * - Multiple voices and languages
 * - Real-Time Voice Generation with playback controls
 * - Audio download capabilities
 */

import axiosInstance from '../apimodule/axiosConfig/Axios';
import axios from '../apimodule/axiosConfig/Axios';
import { toast } from 'react-hot-toast';

class TextToSpeechService {
  constructor() {
    this.isPlaying = false;
    this.currentAudio = null;
    this.audioQueue = [];
  }

  /**
   * Synthesize speech from text
   * @param {string} text - Text to convert to speech
   * @param {object} options - Voice options
   * @returns {Promise<Blob>} Audio blob
   */
  async synthesizeSpeech(text, options = {}) {
    try {
      if (!text || text.trim() === '') {
        throw new Error('Text input cannot be empty');
      }

      const requestData = {
        text: text.trim(),
        lang: options.language || 'en',
        slow: options.slow || false,
        speed: options.speed || 1.0,
        pitch: options.pitch || 1.0,
        volume: options.volume || 1.0,
        emotion: options.emotion || null,
        voice_id: options.voiceId || null
      };

      const response = await axiosInstance.post('/api/text-to-speech/', requestData, {
        responseType: 'blob',
        headers: {
          'Content-Type': 'application/json'
        }
      });

      if (response.status === 200) {
        return response.data;
      } else {
        throw new Error('Failed to synthesize speech');
      }
    } catch (error) {
      console.error('Text-to-speech synthesis error:', error);
      toast.error(`Speech synthesis failed: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  }

  /**
   * Play audio from blob
   * @param {Blob} audioBlob - Audio blob to play
   * @param {function} onEnded - Callback when audio ends
   * @param {function} onProgress - Callback for progress updates
   */
  async playAudio(audioBlob, onEnded = null, onProgress = null) {
    try {
      // Stop current audio if playing
      this.stopAudio();

      const audioUrl = URL.createObjectURL(audioBlob);
      this.currentAudio = new Audio(audioUrl);

      // Set up event listeners
      this.currentAudio.addEventListener('ended', () => {
        this.isPlaying = false;
        URL.revokeObjectURL(audioUrl);
        if (onEnded) onEnded();
      });

      this.currentAudio.addEventListener('timeupdate', () => {
        if (onProgress && this.currentAudio) {
          const progress = (this.currentAudio.currentTime / this.currentAudio.duration) * 100;
          onProgress(progress, this.currentAudio.currentTime, this.currentAudio.duration);
        }
      });

      this.currentAudio.addEventListener('error', (e) => {
        console.error('Audio playback error:', e);
        toast.error('Audio playback failed');
        this.isPlaying = false;
      });

      // Play audio
      await this.currentAudio.play();
      this.isPlaying = true;

    } catch (error) {
      console.error('Audio playback error:', error);
      toast.error('Audio playback failed');
      throw error;
    }
  }

  /**
   * Stop current audio playback
   */
  stopAudio() {
    if (this.currentAudio) {
      this.currentAudio.pause();
      this.currentAudio.currentTime = 0;
      this.isPlaying = false;
    }
  }

  /**
   * Pause current audio playback
   */
  pauseAudio() {
    if (this.currentAudio && this.isPlaying) {
      this.currentAudio.pause();
      this.isPlaying = false;
    }
  }

  /**
   * Resume audio playback
   */
  resumeAudio() {
    if (this.currentAudio && !this.isPlaying) {
      this.currentAudio.play();
      this.isPlaying = true;
    }
  }

  /**
   * Download audio blob as file
   * @param {Blob} audioBlob - Audio blob to download
   * @param {string} filename - Filename for download
   */
  downloadAudio(audioBlob, filename = 'speech.mp3') {
    try {
      const url = URL.createObjectURL(audioBlob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      toast.success('Audio downloaded successfully');
    } catch (error) {
      console.error('Audio download error:', error);
      toast.error('Audio download failed');
    }
  }

  /**
   * Get available voices for text-to-speech
   * @returns {Promise<Array>} List of available voices
   */
  async getAvailableVoices() {
    try {
      const response = await axios.get('/api/text-to-speech/play');
      return response.data.voices || [];
    } catch (error) {
      console.error('Failed to fetch voices:', error);
      return [];
    }
  }

  /**
   * Convert text to speech and immediately play
   * @param {string} text - Text to speak
   * @param {object} options - Voice options
   * @param {function} onEnded - Callback when speech ends
   * @param {function} onProgress - Progress callback
   */
  async speakText(text, options = {}, onEnded = null, onProgress = null) {
    try {
      const audioBlob = await this.synthesizeSpeech(text, options);
      await this.playAudio(audioBlob, onEnded, onProgress);
      return audioBlob;
    } catch (error) {
      console.error('Speak text error:', error);
      throw error;
    }
  }

  /**
   * Add text to speech queue for batch processing
   * @param {string} text - Text to add to queue
   * @param {object} options - Voice options
   */
  addToQueue(text, options = {}) {
    this.audioQueue.push({ text, options });
  }

  /**
   * Process speech queue
   * @param {function} onProgress - Progress callback
   */
  async processQueue(onProgress = null) {
    try {
      for (let i = 0; i < this.audioQueue.length; i++) {
        const { text, options } = this.audioQueue[i];
        
        if (onProgress) {
          onProgress(i + 1, this.audioQueue.length, text);
        }

        await this.speakText(text, options);
        
        // Wait for current audio to finish before proceeding
        await new Promise(resolve => {
          const checkAudio = () => {
            if (!this.isPlaying) {
              resolve();
            } else {
              setTimeout(checkAudio, 100);
            }
          };
          checkAudio();
        });
      }
      
      this.audioQueue = [];
      toast.success('Queue processing completed');
    } catch (error) {
      console.error('Queue processing error:', error);
      toast.error('Queue processing failed');
    }
  }

  /**
   * Clear speech queue
   */
  clearQueue() {
    this.audioQueue = [];
  }

  /**
   * Get current playback status
   */
  getPlaybackStatus() {
    return {
      isPlaying: this.isPlaying,
      currentTime: this.currentAudio?.currentTime || 0,
      duration: this.currentAudio?.duration || 0,
      queueLength: this.audioQueue.length
    };
  }
}

// Export singleton instance
// eslint-disable-next-line import/no-anonymous-default-export
export default new TextToSpeechService();

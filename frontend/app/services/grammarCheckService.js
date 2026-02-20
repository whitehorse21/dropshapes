/**
 * Grammar Check Service
 * ====================
 * Frontend service for AWS Comprehend and Bedrock-powered grammar checking
 * - Reaime grammar correction
 * - Sentiment analysis
 * - Key phrase extraction
 * - Writing improvement suggestions
 */

import axiosInstance from '../apimodule/axiosConfig/Axios';
import axios from '../apimodule/axiosConfig/Axios';
import { toast } from 'react-hot-toast';

class GrammarCheckService {
  constructor() {
    this.cache = new Map();
    this.cacheTimeout = 5 * 60 * 1000; // 5 minutes cache
  }

  /**
   * Check grammar and get corrections
   * @param {string} text - Text to check for grammar
   * @returns {Promise<object>} Grammar check results
   */
  async checkGrammar(text) {
    try {
      if (!text || text.trim() === '') {
        throw new Error('Text input cannot be empty');
      }

      const trimmedText = text.trim();
      
      // Check cache first
      const cachedResult = this.getCachedResult(trimmedText);
      if (cachedResult) {
        return cachedResult;
      }

      const response = await axiosInstance.post(`/grammar-check?text=${trimmedText}`);

      if (response.status === 200) {
        const result = response.data;
        
        // Cache the result
        this.cacheResult(trimmedText, result);
        
        return result;
      } else {
        throw new Error('Grammar check failed');
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      toast.error(`Grammar check failed: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  }

  /**
   * Get real-time grammar suggestions as user types
   * @param {string} text - Text to analyze
   * @param {function} callback - Callback for results
   * @param {number} debounceMs - Debounce delay in milliseconds
   */
  getRealTimeGrammarCheck(text, callback, debounceMs = 1000) {
    clearTimeout(this.debounceTimer);
    
    this.debounceTimer = setTimeout(async () => {
      try {
        if (text && text.trim().length > 10) { // Only check substantial text
          const result = await this.checkGrammar(text);
          callback(result);
        }
      } catch (error) {
        console.error('Real-time grammar check error:', error);
        callback(null);
      }
    }, debounceMs);
  }

  /**
   * Compare original text with corrected text
   * @param {string} originalText - Original text
   * @param {string} correctedText - Corrected text
   * @returns {Array} Array of differences
   */
  compareTexts(originalText, correctedText) {
    const originalWords = originalText.split(/\s+/);
    const correctedWords = correctedText.split(/\s+/);
    const differences = [];

    let i = 0, j = 0;
    while (i < originalWords.length || j < correctedWords.length) {
      if (i >= originalWords.length) {
        // Addition
        differences.push({
          type: 'addition',
          text: correctedWords[j],
          position: j
        });
        j++;
      } else if (j >= correctedWords.length) {
        // Deletion
        differences.push({
          type: 'deletion',
          text: originalWords[i],
          position: i
        });
        i++;
      } else if (originalWords[i] === correctedWords[j]) {
        // No change
        i++;
        j++;
      } else {
        // Substitution
        differences.push({
          type: 'substitution',
          original: originalWords[i],
          corrected: correctedWords[j],
          position: i
        });
        i++;
        j++;
      }
    }

    return differences;
  }

  /**
   * Get writing improvement suggestions
   * @param {string} text - Text to analyze
   * @returns {Promise<object>} Improvement suggestions
   */
  async getWritingImprovement(text) {
    try {
      if (!text || text.trim() === '') {
        throw new Error('Text input cannot be empty');
      }

      const response = await axios.post('/api/grammar-check/', {
        text: text.trim()
      });

      return response.data;
    } catch (error) {
      console.error('Writing improvement error:', error);
      toast.error(`Writing improvement failed: ${error.response?.data?.detail || error.message}`);
      throw error;
    }
  }

  /**
   * Get text readability score
   * @param {string} text - Text to analyze
   * @returns {object} Readability metrics
   */
  getReadabilityScore(text) {
    if (!text || text.trim() === '') {
      return null;
    }

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = text.split(/\s+/).filter(w => w.length > 0);
    const syllables = this.countSyllables(text);

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease Score
    const fleschScore = 206.835 - (1.015 * avgWordsPerSentence) - (84.6 * avgSyllablesPerWord);

    let readabilityLevel;
    if (fleschScore >= 90) readabilityLevel = 'Very Easy';
    else if (fleschScore >= 80) readabilityLevel = 'Easy';
    else if (fleschScore >= 70) readabilityLevel = 'Fairly Easy';
    else if (fleschScore >= 60) readabilityLevel = 'Standard';
    else if (fleschScore >= 50) readabilityLevel = 'Fairly Difficult';
    else if (fleschScore >= 30) readabilityLevel = 'Difficult';
    else readabilityLevel = 'Very Difficult';

    return {
      fleschScore: Math.round(fleschScore),
      readabilityLevel,
      sentenceCount: sentences.length,
      wordCount: words.length,
      syllableCount: syllables,
      avgWordsPerSentence: Math.round(avgWordsPerSentence * 10) / 10,
      avgSyllablesPerWord: Math.round(avgSyllablesPerWord * 10) / 10
    };
  }

  /**
   * Count syllables in text (approximation)
   * @param {string} text - Text to analyze
   * @returns {number} Syllable count
   */
  countSyllables(text) {
    const words = text.toLowerCase().split(/\s+/);
    let syllableCount = 0;

    words.forEach(word => {
      word = word.replace(/[^a-z]/g, '');
      if (word.length === 0) return;

      // Count vowel groups
      let syllables = word.match(/[aeiouy]+/g) || [];
      syllableCount += syllables.length;

      // Subtract silent e
      if (word.endsWith('e')) {
        syllableCount--;
      }

      // Ensure at least 1 syllable per word
      if (syllableCount === 0) {
        syllableCount = 1;
      }
    });

    return syllableCount;
  }

  /**
   * Cache management
   */
  getCachedResult(text) {
    const key = this.generateCacheKey(text);
    const cached = this.cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.result;
    }
    
    return null;
  }

  cacheResult(text, result) {
    const key = this.generateCacheKey(text);
    this.cache.set(key, {
      result,
      timestamp: Date.now()
    });

    // Clean old cache entries
    this.cleanOldCache();
  }

  generateCacheKey(text) {
    // Simple hash function for cache key
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  cleanOldCache() {
    const now = Date.now();
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      timeout: this.cacheTimeout
    };
  }

  /**
   * Batch grammar check for multiple texts
   * @param {Array<string>} texts - Array of texts to check
   * @param {function} progressCallback - Progress callback
   * @returns {Promise<Array>} Array of results
   */
  async batchGrammarCheck(texts, progressCallback = null) {
    const results = [];
    
    for (let i = 0; i < texts.length; i++) {
      try {
        if (progressCallback) {
          progressCallback(i + 1, texts.length);
        }
        
        const result = await this.checkGrammar(texts[i]);
        results.push({ index: i, success: true, result });
      } catch (error) {
        results.push({ index: i, success: false, error: error.message });
      }
    }
    
    return results;
  }
}

// Export singleton instance
// eslint-disable-next-line import/no-anonymous-default-export
export default new GrammarCheckService();

import { useCallback } from 'react';
import { APPOINTMENT_PATTERNS } from '../../../shared';

/**
 * Custom hook for intent classification
 * Extracted from ChatBot.js to improve maintainability
 */
const useIntentClassification = () => {
  /**
   * Classify user intent based on message content
   * @param {string} userMessage - The user's input message
   * @returns {Object} Intent classification result
   */
  const classifyIntent = useCallback((userMessage) => {
    // console.log('🔍 classifyIntent called with:', userMessage);
    
    // Debug: Test the specific pattern manually using imported patterns
    const testPattern = APPOINTMENT_PATTERNS.clientDateTimeFull.regex;
    const testMatch = userMessage.match(testPattern);
    // console.log('🔍 Manual test of clientDateTimeFull pattern:', testMatch);
    // console.log('🔍 Test string:', userMessage);
    // console.log('🔍 Test pattern:', testPattern.toString());
    
    for (const [intent, pattern] of Object.entries(APPOINTMENT_PATTERNS)) {
      const match = userMessage.match(pattern.regex);
      // console.log('🔍 Testing pattern:', intent, 'regex:', pattern.regex.toString(), 'match:', match);
      if (match) {
        // console.log('🔍 Pattern matched! Intent:', intent, 'groups:', match.slice(1));
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type 
        };
      }
    }
    // console.log('🔍 No patterns matched, returning unknown');
    return { intent: 'unknown', confidence: 0.0, groups: [], type: 'unknown' };
  }, []);

  return {
    classifyIntent
  };
};

export default useIntentClassification;

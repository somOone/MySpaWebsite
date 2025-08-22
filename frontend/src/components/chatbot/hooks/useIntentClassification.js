import { useCallback } from 'react';
import { APPOINTMENT_PATTERNS, APPOINTMENT_BOOKING_PATTERNS, APPOINTMENT_QUERY_PATTERNS, HELP_PATTERNS, HOW_TO_PATTERNS, EXPENSE_PATTERNS, EXPENSE_ADD_PATTERNS, EXPENSE_DELETE_PATTERNS } from '../../../shared';
import useMLIntentClassification from './useMLIntentClassification';

/**
 * Custom hook for intent classification
 * Extracted from ChatBot.js to improve maintainability
 * Now enhanced with ML fallback for better natural language understanding
 */
const useIntentClassification = () => {
  const { classifyIntentML, classifyIntentWithTraining } = useMLIntentClassification();

  /**
   * Classify user intent based on message content
   * @param {string} userMessage - The user's input message
   * @returns {Object} Intent classification result
   */
  const classifyIntent = useCallback((userMessage) => {
    // console.log('🔍 classifyIntent called with:', userMessage);
    
    // Debug: Test the specific pattern manually using imported patterns
    // console.log('🔍 Test string:', userMessage);
    
    // Check appointment patterns first
    for (const [intent, pattern] of Object.entries(APPOINTMENT_PATTERNS)) {
      const match = userMessage.match(pattern.regex);
      // console.log('🔍 Testing pattern:', intent, 'regex:', pattern.regex.toString(), 'match:', match);
      if (match) {
        // console.log('🔍 Pattern matched! Intent:', intent, 'groups:', match.slice(1));
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type,
          source: 'regex'
        };
      }
    }
    
    // Check appointment booking patterns
    for (const [intent, pattern] of Object.entries(APPOINTMENT_BOOKING_PATTERNS)) {
      const match = userMessage.match(pattern.regex);
      if (match) {
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type,
          source: 'regex'
        };
      }
    }
    
    // Check appointment query patterns
    for (const [intent, pattern] of Object.entries(APPOINTMENT_QUERY_PATTERNS)) {
      const match = userMessage.match(pattern.regex);
      if (match) {
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type,
          source: 'regex'
        };
      }
    }
    
    // Check help patterns
    for (const [intent, pattern] of Object.entries(HELP_PATTERNS)) {
      const match = userMessage.match(pattern.regex);
      if (match) {
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type,
          source: 'regex'
        };
      }
    }
    
    // Check how-to patterns
    for (const [intent, pattern] of Object.entries(HOW_TO_PATTERNS)) {
      const match = userMessage.match(pattern.regex);
      if (match) {
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type,
          source: 'regex'
        };
      }
    }
    
    // Check expense patterns if no appointment patterns matched
    for (const [intent, pattern] of Object.entries(EXPENSE_PATTERNS)) {
      const match = userMessage.match(pattern.regex);
      if (match) {
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type,
          source: 'regex'
        };
      }
    }
    
    // Check expense addition patterns
    for (const [intent, pattern] of Object.entries(EXPENSE_ADD_PATTERNS)) {
      const match = userMessage.match(pattern.regex);
      if (match) {
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type,
          source: 'regex'
        };
      }
    }
    
    // Check expense deletion patterns
    for (const [intent, pattern] of Object.entries(EXPENSE_DELETE_PATTERNS)) {
      const match = userMessage.match(pattern.regex);
      if (match) {
        return { 
          intent, 
          confidence: pattern.confidence, 
          groups: match.slice(1),
          type: pattern.type,
          source: 'regex'
        };
      }
    }
    
    // console.log('🔍 No regex patterns matched, trying TRAINING-ENHANCED ML classification...');
    
    // If no regex patterns matched, try TRAINING-ENHANCED ML classification first
    const trainingResult = classifyIntentWithTraining(userMessage);
    if (trainingResult) {
      // console.log('🔍 Training-enhanced ML classification successful:', trainingResult);
      return trainingResult;
    }
    
    // console.log('🔍 No training match, trying basic ML classification...');
    
    // If no training match, try basic ML classification as final fallback
    const mlResult = classifyIntentML(userMessage);
    if (mlResult) {
      // console.log('🔍 Basic ML classification successful:', mlResult);
      return mlResult;
    }
    
    // console.log('🔍 No patterns matched, returning unknown');
    return { intent: 'unknown', confidence: 0.0, groups: [], type: 'unknown', source: 'none' };
  }, [classifyIntentML, classifyIntentWithTraining]);

  return {
    classifyIntent
  };
};

export default useIntentClassification;

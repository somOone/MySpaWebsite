import { useCallback, useMemo } from 'react';
import { TRAINING_DATASET } from '../training/training_dataset';

/**
 * ML-enhanced intent classification using custom keyword matching + training data
 * Works alongside existing regex patterns as a fallback
 * No external dependencies - fully compatible with Jest
 */
const useMLIntentClassification = () => {
  // Initialize training data for enhanced classification
  const trainingData = useMemo(() => TRAINING_DATASET, []);
  /**
   * Simple entity extraction without external libraries
   */
  const extractEntities = useCallback((userMessage) => {
    const words = userMessage.toLowerCase().split(/\s+/);
    
    // Simple verb detection - exact matches only
    const commonVerbs = ['want', 'need', 'show', 'see', 'view', 'display', 'check', 'get', 'book', 'create', 'schedule', 'make', 'set', 'arrange', 'change', 'modify', 'edit', 'alter', 'update', 'reschedule', 'cancel', 'delete', 'remove', 'call', 'postpone', 'complete', 'finish', 'done', 'mark', 'add', 'enter', 'log', 'record', 'input', 'adjust'];
    
    // Simple noun detection - exact matches only
    const commonNouns = ['appointment', 'appointments', 'booking', 'bookings', 'session', 'sessions', 'massage', 'massages', 'facial', 'facials', 'combo', 'combos', 'schedule', 'schedules', 'calendar', 'calendars', 'expense', 'expenses', 'cost', 'costs', 'bill', 'bills', 'payment', 'payments', 'charge', 'charges'];
    
    // Time expressions
    const timeExpressions = ['today', 'tonight', 'tomorrow', 'yesterday', 'morning', 'afternoon', 'evening', 'night', 'week', 'month', 'year', 'now', 'soon', 'later'];
    
    // Question words
    const questionWords = ['what', 'when', 'where', 'who', 'why', 'how', 'which'];
    
    // Money indicators
    const moneyIndicators = ['dollar', 'dollars', 'buck', 'bucks', 'cent', 'cents', '$'];
    
    return {
      verbs: words.filter(word => commonVerbs.includes(word)),
      nouns: words.filter(word => commonNouns.includes(word)),
      times: words.filter(word => timeExpressions.includes(word)),
      questions: words.filter(word => questionWords.includes(word)),
      money: words.filter(word => moneyIndicators.includes(word) || /\$\d+/.test(word) || /\d+\.\d+/.test(word)),
      allWords: words
    };
  }, []);

  /**
   * Count keyword matches - more flexible matching
   */
  const countKeywordMatches = useCallback((words, keywords) => {
    return keywords.filter(keyword => 
      words.some(word => word.includes(keyword) || keyword.includes(word))
    ).length;
  }, []);

  /**
   * Classify intent using ML approach
   * Returns null if no confident match found
   */
  const classifyIntentML = useCallback((userMessage) => {
    const entities = extractEntities(userMessage);
    const words = entities.allWords;
    
    // Define intent patterns with priority ordering (higher priority = checked first)
    const intentPatterns = [
      // High Priority - Specific patterns first
      {
        name: 'book_appointment',
        type: 'book_appointment',
        priority: 1,
        keywords: ['book', 'create', 'schedule', 'make', 'set', 'arrange'],
        objects: ['appointment', 'appointments', 'booking', 'bookings', 'session', 'sessions', 'massage', 'massages', 'facial', 'facials', 'combo', 'combos'],
        confidence: 0.2,
        groups: []
      },
      {
        name: 'add_expense',
        type: 'add_expense',
        priority: 1,
        keywords: ['add', 'create', 'enter', 'log', 'record', 'input'],
        objects: ['expense', 'expenses', 'cost', 'costs', 'bill', 'bills', 'payment', 'payments', 'charge', 'charges'],
        confidence: 0.2,
        groups: []
      },
      {
        name: 'change_appointment',
        type: 'edit',
        priority: 2,
        keywords: ['change', 'modify', 'edit', 'alter', 'update', 'reschedule'],
        objects: ['appointment', 'appointments', 'booking', 'bookings', 'session', 'sessions'],
        confidence: 0.2,
        groups: []
      },
      {
        name: 'change_expense',
        type: 'edit_expense',
        priority: 2,
        keywords: ['change', 'modify', 'edit', 'alter', 'update', 'adjust'],
        objects: ['expense', 'expenses', 'cost', 'costs', 'bill', 'bills', 'payment', 'payments', 'charge', 'charges'],
        confidence: 0.2,
        groups: []
      },
      {
        name: 'show_appointments',
        type: 'show_appointments',
        priority: 3,
        keywords: ['show', 'display', 'view', 'see', 'check', 'get'],
        objects: ['appointment', 'appointments', 'schedule', 'schedules', 'calendar', 'calendars', 'booking', 'bookings'],
        timeContext: ['today', 'tonight', 'tomorrow', 'this week', 'next week'],
        confidence: 0.2,
        groups: []
      },
      {
        name: 'cancel_appointment',
        type: 'cancel',
        priority: 4,
        keywords: ['cancel', 'delete', 'remove', 'call', 'postpone'],
        objects: ['appointment', 'appointments', 'booking', 'bookings', 'session', 'sessions'],
        confidence: 0.2,
        groups: []
      },
      {
        name: 'delete_expense',
        type: 'delete_expense',
        priority: 4,
        keywords: ['delete', 'remove', 'erase', 'cancel'],
        objects: ['expense', 'expenses', 'cost', 'costs', 'bill', 'bills', 'payment', 'payments', 'charge', 'charges'],
        confidence: 0.2,
        groups: []
      },
      {
        name: 'complete_appointment',
        type: 'complete',
        priority: 5,
        keywords: ['complete', 'finish', 'done', 'mark'],
        objects: ['appointment', 'appointments', 'booking', 'bookings', 'session', 'sessions'],
        confidence: 0.2,
        groups: []
      },
      
      // Help and General - Lowest priority
      {
        name: 'help_general',
        type: 'help_general',
        priority: 10,
        keywords: ['help', 'capabilities', 'work'],
        confidence: 0.3,
        groups: []
      },
      {
        name: 'how_to_questions',
        type: 'how_to_general',
        priority: 10,
        keywords: ['how', 'what'],
        confidence: 0.3,
        groups: []
      }
    ];

    // Sort patterns by priority (lower number = higher priority)
    intentPatterns.sort((a, b) => a.priority - b.priority);

    // Score each intent pattern
    let bestMatch = null;
    let highestScore = 0;

    for (const pattern of intentPatterns) {
      let score = 0;
      
      // Check keyword matches (40% of score)
      if (pattern.keywords && pattern.keywords.length > 0) {
        const keywordMatches = countKeywordMatches(words, pattern.keywords);
        score += (keywordMatches / pattern.keywords.length) * 0.4;
      }
      
      // Check object matches (30% of score)
      if (pattern.objects && pattern.objects.length > 0) {
        const objectMatches = countKeywordMatches(words, pattern.objects);
        score += (objectMatches / pattern.objects.length) * 0.3;
      }
      
      // Check time context for appointment queries (20% of score)
      if (pattern.timeContext && pattern.timeContext.length > 0) {
        const timeMatches = countKeywordMatches(words, pattern.timeContext);
        if (timeMatches > 0) {
          score += 0.2;
        }
      }
      
      // Check for specific time patterns (10% of score)
      if (entities.times.length > 0) {
        score += 0.1;
      }
      
      // Check for money amounts (10% of score)
      if (entities.money.length > 0) {
        score += 0.1;
      }
      
      // Special handling for question-based intents
      if (entities.questions.length > 0) {
        // If it's a question and we're looking at show_appointments, boost the score significantly
        if (pattern.name === 'show_appointments' && entities.questions.includes('what')) {
          score += 0.5; // Very significant boost for question-based appointment queries
        }
        // If it's a question and we're looking at other patterns, reduce the score significantly
        else if (pattern.name !== 'show_appointments' && pattern.name !== 'how_to_questions') {
          score -= 0.4; // Heavy penalty for non-question patterns when user asks a question
        }
      }
      
      // Apply confidence threshold and priority-based selection
      if (score >= pattern.confidence) {
        // If we have a match with higher priority, use it
        if (bestMatch === null || pattern.priority < bestMatch.priority || 
            (pattern.priority === bestMatch.priority && score > highestScore)) {
          highestScore = score;
          bestMatch = {
            intent: pattern.name,
            confidence: score,
            groups: [],
            type: pattern.type,
            source: 'ml',
            priority: pattern.priority
          };
        }
      }
    }

    return bestMatch;
  }, [extractEntities, countKeywordMatches]);

  /**
   * Get intent type from category name
   */
  const getTypeFromCategory = useCallback((category) => {
    const typeMap = {
      'book_appointment': 'book_appointment',
      'add_expense': 'add_expense',
      'change_appointment': 'edit',
      'change_expense': 'edit_expense',
      'show_appointments': 'show_appointments',
      'cancel_appointment': 'cancel',
      'delete_expense': 'delete_expense',
      'complete_appointment': 'complete',
      'help_general': 'help_general',
      'how_to_general': 'how_to_general'
    };
    return typeMap[category] || category;
  }, []);

  /**
   * Get priority from category name
   */
  const getPriorityFromCategory = useCallback((category) => {
    const priorityMap = {
      'book_appointment': 1,
      'add_expense': 1,
      'change_appointment': 2,
      'change_expense': 2,
      'show_appointments': 3,
      'cancel_appointment': 4,
      'delete_expense': 4,
      'complete_appointment': 5,
      'help_general': 10,
      'how_to_general': 10
    };
    return priorityMap[category] || 5;
  }, []);

  /**
   * Find best match in training data
   */
  const findTrainingMatch = useCallback((userMessage) => {
    const lowerInput = userMessage.toLowerCase();
    let bestMatch = null;
    let highestScore = 0;

    // Check each training category
    Object.entries(trainingData).forEach(([category, examples]) => {
      examples.forEach(example => {
        const exampleLower = example.toLowerCase();
        
        // Calculate similarity score
        let score = 0;
        
        // Exact match gets highest score
        if (lowerInput === exampleLower) {
          score = 1.0;
        }
        // Contains the example gets high score
        else if (lowerInput.includes(exampleLower) || exampleLower.includes(lowerInput)) {
          score = 0.8;
        }
        // Word overlap gets medium score
        else {
          const inputWords = new Set(lowerInput.split(/\s+/));
          const exampleWords = new Set(exampleLower.split(/\s+/));
          const intersection = new Set([...inputWords].filter(x => exampleWords.has(x)));
          const union = new Set([...inputWords, ...exampleWords]);
          
          if (union.size > 0) {
            score = intersection.size / union.size;
          }
        }
        
        // Update best match if this score is higher
        if (score > highestScore && score > 0.6) {
          highestScore = score;
          bestMatch = {
            intent: category,
            confidence: score,
            groups: [],
            type: getTypeFromCategory(category),
            source: 'training',
            priority: getPriorityFromCategory(category)
          };
        }
      });
    });

    return bestMatch;
  }, [trainingData, getTypeFromCategory, getPriorityFromCategory]);

  /**
   * Enhanced classification using training data for better accuracy
   * Falls back to keyword-based classification if no training match found
   */
  const classifyIntentWithTraining = useCallback((userMessage) => {
    // First try to match against training data for higher accuracy
    const trainingMatch = findTrainingMatch(userMessage);
    if (trainingMatch) {
      return {
        ...trainingMatch,
        source: 'training',
        confidence: trainingMatch.confidence || 0.9
      };
    }
    
    // Fall back to keyword-based classification
    return classifyIntentML(userMessage);
  }, [classifyIntentML, findTrainingMatch]);

  return {
    classifyIntentML,
    classifyIntentWithTraining,
    extractEntities,
    trainingData
  };
};

export default useMLIntentClassification;

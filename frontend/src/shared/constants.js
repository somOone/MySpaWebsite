// Shared constants and regex patterns for both frontend and backend

// Regex tokens for reusability across chat components
export const REGEX_TOKENS = {
  CLIENT_NAME: '([a-zA-Z0-9\\-\\\'\\s]+)', // Allows letters, digits, spaces, hyphens, apostrophes
  TIME: '(\\d{1,2}(?::\\d{2})?\\s*(?:a\\.?m\\.?|p\\.?m\\.?)|\\d{1,2}(?::\\d{2})?\\s*hours?)', // 12-hour or military (e.g., "1900 hours", "19:00 hours")
  DATE: '([a-zA-Z]+\\s+\\d+(?:st|nd|rd|th)?)', // Date format: "August 16th", "March 3rd", etc.
  YEAR: '(?:\\s+(\\d{4}))?', // Optional year: " 2025", " 2026", etc.
  OPTIONAL_THE: '(?:the\\s+)?',
  APPOINTMENT_KEYWORDS: '(?:appointment|booking)'
};

// Category patterns for service types
export const CATEGORY_PATTERNS = '(?:facial|massage|combo|facial\\s*\\+\\s*massage|facial\\s*and\\s*massage)';

// Category translation utilities
export const CATEGORY_TRANSLATIONS = {
  // User-friendly terms → Database terms
  'combo': 'Facial + Massage',
  'facial': 'Facial',
  'massage': 'Massage',
  'facial + massage': 'Facial + Massage',
  'facial and massage': 'Facial + Massage'
};

export const REVERSE_CATEGORY_TRANSLATIONS = {
  // Database terms → User-friendly terms
  'Facial + Massage': 'combo',
  'Facial': 'facial',
  'Massage': 'massage'
};

// Category utility functions
export const calculatePayment = (category) => {
  const prices = {
    'Facial': 100.00,
    'Massage': 120.00,
    'Facial + Massage': 200.00
  };
  return prices[category] || 0;
};

export const translateCategoryToDatabase = (userCategory) => {
  const normalized = userCategory.toLowerCase().trim();
  const translations = {
    'combo': 'Facial + Massage',
    'facial': 'Facial',
    'massage': 'Massage',
    'facial + massage': 'Facial + Massage',
    'facial and massage': 'Facial + Massage'
  };
  
  return translations[normalized] || userCategory;
};

export const translateCategoryToUser = (dbCategory) => {
  const translations = {
    'Facial + Massage': 'combo',
    'Facial': 'facial',
    'Massage': 'massage'
  };
  
  return translations[dbCategory] || dbCategory;
};

// Command patterns for appointment cancellation
export const APPOINTMENT_PATTERNS = {
  clientDateTimeFull: {
    regex: new RegExp(`cancel\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+for\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 1.0,
    type: 'cancel',
    groups: ['clientName', 'time', 'date', 'year'] // year is now the 4th group
  },
  categoryDateTimeFull: {
    regex: new RegExp(`cancel\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.9,
    type: 'cancel',
    groups: ['clientName', 'time', 'date', 'year'] // year is now the 4th group
  },
  firstNameDateTimeFull: {
    regex: new RegExp(`cancel\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+for\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.8,
    type: 'cancel',
    groups: ['clientName', 'time', 'date', 'year'] // year is now the 4th group
  },
  lastNameDateTimeFull: {
    regex: new RegExp(`cancel\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+for\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.8,
    type: 'cancel',
    groups: ['clientName', 'time', 'date', 'year'] // year is now the 4th group
  },
  clientDateTime: {
    regex: new RegExp(`cancel\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+(?:for\\s+)?${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}$`, 'i'),
    confidence: 0.7,
    type: 'cancel',
    groups: ['clientName', 'time']
  },
  clientDate: {
    regex: new RegExp(`cancel\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+(?:for\\s+)?${REGEX_TOKENS.CLIENT_NAME}\\s+(?:on\\s+)?${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.6,
    type: 'cancel',
    groups: ['clientName', 'date', 'year'] // year is now the 3rd group
  },
  clientOnly: {
    regex: new RegExp(`cancel\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+(?:for\\s+)?${REGEX_TOKENS.CLIENT_NAME}$`, 'i'),
    confidence: 0.5,
    type: 'cancel',
    groups: ['clientName']
  },
  // Completion patterns - mirror cancellation patterns
  completeClientDateTimeFull: {
    regex: new RegExp(`complete\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+for\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 1.0,
    type: 'complete',
    groups: ['clientName', 'time', 'date', 'year']
  },
  completeCategoryDateTimeFull: {
    regex: new RegExp(`complete\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.9,
    type: 'complete',
    groups: ['clientName', 'time', 'date', 'year']
  },
  completeFirstNameDateTimeFull: {
    regex: new RegExp(`complete\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+for\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.8,
    type: 'complete',
    groups: ['clientName', 'time', 'date', 'year']
  },
  completeLastNameDateTimeFull: {
    regex: new RegExp(`complete\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+for\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.8,
    type: 'complete',
    groups: ['clientName', 'time', 'date', 'year']
  },
  completeClientDateTime: {
    regex: new RegExp(`complete\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+(?:for\\s+)?${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}$`, 'i'),
    confidence: 0.7,
    type: 'complete',
    groups: ['clientName', 'time']
  },
  completeClientDate: {
    regex: new RegExp(`complete\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+(?:for\\s+)?${REGEX_TOKENS.CLIENT_NAME}\\s+(?:on\\s+)?${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.6,
    type: 'complete',
    groups: ['clientName', 'date', 'year']
  },
  completeClientOnly: {
    regex: new RegExp(`complete\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+(?:for\\s+)?${REGEX_TOKENS.CLIENT_NAME}$`, 'i'),
    confidence: 0.5,
    type: 'complete',
    groups: ['clientName']
  },
  // Edit patterns - mirror cancellation patterns but for editing
  editClientDateTimeFull: {
    regex: new RegExp(`change\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+for\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 1.0,
    type: 'edit',
    groups: ['clientName', 'time', 'date', 'year']
  },
  editCategoryDateTimeFull: {
    regex: new RegExp(`change\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.9,
    type: 'edit',
    groups: ['clientName', 'time', 'date', 'year']
  },
  editFirstNameDateTimeFull: {
    regex: new RegExp(`change\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+for\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.8,
    type: 'edit',
    groups: ['clientName', 'time', 'date', 'year']
  },
  editLastNameDateTimeFull: {
    regex: new RegExp(`change\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+for\\s+${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.8,
    type: 'edit',
    groups: ['clientName', 'time', 'date', 'year']
  },
  editClientDateTime: {
    regex: new RegExp(`change\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+(?:for\\s+)?${REGEX_TOKENS.CLIENT_NAME}\\s+at\\s+${REGEX_TOKENS.TIME}$`, 'i'),
    confidence: 0.7,
    type: 'edit',
    groups: ['clientName', 'time']
  },
  editClientDate: {
    regex: new RegExp(`change\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+(?:for\\s+)?${REGEX_TOKENS.CLIENT_NAME}\\s+(?:on\\s+)?${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}`, 'i'),
    confidence: 0.6,
    type: 'edit',
    groups: ['clientName', 'date', 'year']
  },
  editClientOnly: {
    regex: new RegExp(`change\\s+${REGEX_TOKENS.OPTIONAL_THE}${REGEX_TOKENS.APPOINTMENT_KEYWORDS}\\s+(?:for\\s+)?${REGEX_TOKENS.CLIENT_NAME}$`, 'i'),
    confidence: 0.5,
    type: 'edit',
    groups: ['clientName']
  },
  stopTalking: {
    regex: /(?:stop\s+talking|shut\s+up|be\s+quiet|that'?s?\s+all)/i,
    confidence: 1.0,
    type: 'stop',
    groups: []
  },
  affirmative: {
    regex: /(?:yes|confirmed|affirmative)/i,
    confidence: 1.0,
    type: 'affirmative',
    groups: []
  }
};

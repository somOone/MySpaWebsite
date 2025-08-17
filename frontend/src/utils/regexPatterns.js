// Regex tokens for reusability across chat components
export const REGEX_TOKENS = {
  CLIENT_NAME: '([a-zA-Z0-9\\-\\\'\\s]+)', // Allows letters, digits, spaces, hyphens, apostrophes
  TIME: '(\\d{1,2}(?::\\d{2})?\\s*(?:a\\.?m\\.?|p\\.?m\\.?)|\\d{1,2}(?::\\d{2})?\\s*hours?)', // 12-hour or military (e.g., "1900 hours", "19:00 hours")
  DATE: '([a-zA-Z]+\\s+\\d+(?:st|nd|rd|th)?)', // Date format: "August 16th", "March 3rd", etc.
  YEAR: '(?:\\s+(\\d{4}))?', // Optional year: " 2025", " 2026", etc.
  OPTIONAL_THE: '(?:the\\s+)?',
  APPOINTMENT_KEYWORDS: '(?:appointment|booking)'
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

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

// Expense patterns for editing - following natural English grammar
export const EXPENSE_PATTERNS = {
  editExpenseDescriptionDate: {
    regex: new RegExp(`change\\s+expense\\s+(.+?)\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}\\s+(?:to|into)\\s+(.+?)$`, 'i'),
    confidence: 1.0,
    type: 'edit_expense',
    groups: ['searchTerm', 'date', 'year', 'newDescription'],
    editType: 'description'
  },
  editExpenseAmountDate: {
    regex: new RegExp(`change\\s+expense\\s+(.+?)\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}\\s+(?:to|into)\\s+\\$?([\\d.]+)$`, 'i'),
    confidence: 1.0,
    type: 'edit_expense',
    groups: ['searchTerm', 'date', 'year', 'newAmount'],
    editType: 'amount'
  },
  editExpenseCategoryDate: {
    regex: new RegExp(`change\\s+expense\\s+(.+?)\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}\\s+(?:to|into)\\s+(.+?)$`, 'i'),
    confidence: 1.0,
    type: 'edit_expense',
    groups: ['searchTerm', 'date', 'year', 'newCategory'],
    editType: 'category'
  },
  editExpenseDateChange: {
    regex: new RegExp(`change\\s+expense\\s+(.+?)\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}\\s+(?:to|into)\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}$`, 'i'),
    confidence: 1.0,
    type: 'edit_expense',
    groups: ['searchTerm', 'searchDate', 'searchYear', 'newDate', 'newYear'],
    editType: 'date'
  },
  editExpenseDescription: {
    regex: new RegExp(`change\\s+expense\\s+(.+?)\\s+(?:to|into)\\s+(.+?)$`, 'i'),
    confidence: 0.8,
    type: 'edit_expense',
    groups: ['searchTerm', 'newDescription'],
    editType: 'description'
  },
  editExpenseAmount: {
    regex: new RegExp(`change\\s+expense\\s+(.+?)\\s+(?:to|into)\\s+\\$?([\\d.]+)$`, 'i'),
    confidence: 0.8,
    type: 'edit_expense',
    groups: ['searchTerm', 'newAmount'],
    editType: 'amount'
  },
  editExpenseCategory: {
    regex: new RegExp(`change\\s+expense\\s+(.+?)\\s+(?:to|into)\\s+(.+?)$`, 'i'),
    confidence: 0.8,
    type: 'edit_expense',
    groups: ['searchTerm', 'newCategory'],
    editType: 'category'
  },
  editExpenseNoChange: {
    regex: new RegExp(`change\\s+expense\\s+(.+?)\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}$`, 'i'),
    confidence: 1.0,
    type: 'edit_expense_inline',
    groups: ['searchTerm', 'date', 'year']
  }
};

// Help and capability discovery patterns
export const HELP_PATTERNS = {
  whatCanYouDo: {
    regex: new RegExp(`(?:what\\s+can\\s+you\\s+do|what\\s+can\\s+you\\s+help\\s+with|what\\s+are\\s+your\\s+capabilities|what\\s+do\\s+you\\s+do)`, 'i'),
    confidence: 1.0,
    type: 'help_general',
    groups: []
  },
  help: {
    regex: new RegExp(`(?:help|show\\s+help|i\\s+need\\s+help|can\\s+you\\s+help)`, 'i'),
    confidence: 1.0,
    type: 'help_general',
    groups: []
  }
};

// "How to" question patterns for specific capabilities
export const HOW_TO_PATTERNS = {
  // Appointment how-to questions
  howToAddAppointment: {
    regex: new RegExp(`(?:how\\s+can\\s+i|how\\s+do\\s+i)\\s+(?:add|create|book|schedule)\\s+(?:a\\s+)?(?:new\\s+)?(?:appointment|booking)`, 'i'),
    confidence: 1.0,
    type: 'how_to_add_appointment',
    groups: []
  },
  howToChangeAppointment: {
    regex: new RegExp(`(?:how\\s+can\\s+i|how\\s+do\\s+i)\\s+(?:change|modify|edit|alter)\\s+(?:an\\s+)?(?:appointment|booking)`, 'i'),
    confidence: 1.0,
    type: 'how_to_change_appointment',
    groups: []
  },
  howToCancelAppointment: {
    regex: new RegExp(`(?:how\\s+can\\s+i|how\\s+do\\s+i)\\s+(?:cancel|delete|remove)\\s+(?:an\\s+)?(?:appointment|booking)`, 'i'),
    confidence: 1.0,
    type: 'how_to_cancel_appointment',
    groups: []
  },
  howToCompleteAppointment: {
    regex: new RegExp(`(?:how\\s+can\\s+i|how\\s+do\\s+i)\\s+(?:complete|finish|mark\\s+as\\s+complete)\\s+(?:an\\s+)?(?:appointment|booking)`, 'i'),
    confidence: 1.0,
    type: 'how_to_complete_appointment',
    groups: []
  },
  howToSeeAppointments: {
    regex: new RegExp(`(?:how\\s+can\\s+i|how\\s+do\\s+i)\\s+(?:see|view|show|check|display)\\s+(?:my\\s+)?(?:appointments|schedule)`, 'i'),
    confidence: 1.0,
    type: 'how_to_see_appointments',
    groups: []
  },
  
  // Expense how-to questions
  howToAddExpense: {
    regex: new RegExp(`(?:how\\s+can\\s+i|how\\s+do\\s+i)\\s+(?:add|create|enter)\\s+(?:a\\s+)?(?:new\\s+)?expense`, 'i'),
    confidence: 1.0,
    type: 'how_to_add_expense',
    groups: []
  },
  howToChangeExpense: {
    regex: new RegExp(`(?:how\\s+can\\s+i|how\\s+do\\s+i)\\s+(?:change|modify|edit|alter)\\s+(?:an\\s+)?expense`, 'i'),
    confidence: 1.0,
    type: 'how_to_change_expense',
    groups: []
  },
  howToDeleteExpense: {
    regex: new RegExp(`(?:how\\s+can\\s+i|how\\s+do\\s+i)\\s+(?:delete|remove|erase)\\s+(?:an\\s+)?expense`, 'i'),
    confidence: 1.0,
    type: 'how_to_delete_expense',
    groups: []
  }
};

// Appointment patterns for querying - show appointments
export const APPOINTMENT_QUERY_PATTERNS = {
  showTodayAppointments: {
    regex: new RegExp(`(?:show|display|view|see|check)\\s+(?:my\\s+)?(?:appointments\\s+)?(?:for\\s+)?(?:today|tonight)`, 'i'),
    confidence: 1.0,
    type: 'show_today_appointments',
    groups: []
  },
  showAppointments: {
    regex: new RegExp(`(?:show|display|view|see|check)\\s+(?:my\\s+)?(?:appointments)`, 'i'),
    confidence: 0.9,
    type: 'show_appointments',
    groups: []
  }
};

// Appointment patterns for booking - simple redirect approach
export const APPOINTMENT_BOOKING_PATTERNS = {
  bookAppointment: {
    regex: new RegExp(`(?:book|create|schedule)\\s+(?:a\\s+)?(?:new\\s+)?${REGEX_TOKENS.APPOINTMENT_KEYWORDS}`, 'i'),
    confidence: 1.0,
    type: 'book_appointment',
    groups: []
  },
  newAppointment: {
    regex: new RegExp(`(?:I\\s+want\\s+to\\s+book|I\\s+need\\s+to\\s+book|I\\s+want\\s+to\\s+create|I\\s+want\\s+to\\s+schedule)\\s+(?:a\\s+)?(?:new\\s+)?${REGEX_TOKENS.APPOINTMENT_KEYWORDS}`, 'i'),
    confidence: 1.0,
    type: 'book_appointment',
    groups: []
  },
  appointmentBook: {
    regex: new RegExp(`(?:new\\s+${REGEX_TOKENS.APPOINTMENT_KEYWORDS}|book\\s+${REGEX_TOKENS.APPOINTMENT_KEYWORDS})`, 'i'),
    confidence: 0.9,
    type: 'book_appointment',
    groups: []
  }
};

// Expense patterns for adding - simple redirect approach
export const EXPENSE_ADD_PATTERNS = {
  addExpense: {
    regex: new RegExp(`(?:add|create)\\s+(?:a\\s+)?(?:new\\s+)?expense`, 'i'),
    confidence: 1.0,
    type: 'add_expense',
    groups: []
  },
  newExpense: {
    regex: new RegExp(`(?:I\\s+want\\s+to\\s+add|I\\s+need\\s+to\\s+add|I\\s+want\\s+to\\s+create)\\s+(?:a\\s+)?(?:new\\s+)?expense`, 'i'),
    confidence: 1.0,
    type: 'add_expense',
    groups: []
  },
  expenseAdd: {
    regex: new RegExp(`(?:new\\s+expense|add\\s+expense)`, 'i'),
    confidence: 0.9,
    type: 'add_expense',
    groups: []
  }
};

// Expense patterns for deletion - following the same pattern as editing
export const EXPENSE_DELETE_PATTERNS = {
  deleteExpenseDate: {
    regex: new RegExp(`delete\\s+expense\\s+(.+?)\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}$`, 'i'),
    confidence: 1.0,
    type: 'delete_expense',
    groups: ['searchTerm', 'date', 'year']
  },
  deleteExpense: {
    regex: new RegExp(`delete\\s+expense\\s+(.+?)$`, 'i'),
    confidence: 0.8,
    type: 'delete_expense',
    groups: ['searchTerm']
  },
  removeExpenseDate: {
    regex: new RegExp(`remove\\s+expense\\s+(.+?)\\s+on\\s+${REGEX_TOKENS.DATE}${REGEX_TOKENS.YEAR}$`, 'i'),
    confidence: 1.0,
    type: 'delete_expense',
    groups: ['searchTerm', 'date', 'year']
  },
  removeExpense: {
    regex: new RegExp(`remove\\s+expense\\s+(.+?)$`, 'i'),
    confidence: 0.8,
    type: 'delete_expense',
    groups: ['searchTerm']
  }
};

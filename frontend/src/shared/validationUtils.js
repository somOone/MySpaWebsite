// Shared validation utility functions for both frontend and backend

/**
 * Validate client name format
 * @param {string} clientName - Client name to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateClientName = (clientName) => {
  if (!clientName || typeof clientName !== 'string') {
    return false;
  }
  
  // Allow letters, digits, spaces, hyphens, and apostrophes
  const validClientNameRegex = /^[a-zA-Z0-9\-'\s]+$/;
  return validClientNameRegex.test(clientName);
};

/**
 * Validate if a time string is in a recognized format
 * @param {string} timeString - Time string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateTimeFormat = (timeString) => {
  if (!timeString || typeof timeString !== 'string') {
    return false;
  }
  
  // Check for 12-hour format: "2:00 PM", "5:30 p.m.", etc.
  const twelveHourRegex = /^\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)$/i;
  
  // Check for military format: "1900 hours", "19:00 hours", "1730 hours", "17:30 hours", etc.
  const militaryRegex = /^\d{1,2}(?::\d{2})?\s*hours?$/i;
  
  return twelveHourRegex.test(timeString) || militaryRegex.test(timeString);
};

/**
 * Validate if a date string is in a recognized format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateDateFormat = (dateString) => {
  if (!dateString || typeof dateString !== 'string') {
    return false;
  }
  
  // Basic validation - should contain month and day
  const dateRegex = /\w+\s+\d{1,2}(?:st|nd|rd|th)?/i;
  return dateRegex.test(dateString);
};

/**
 * Validate tip amount input
 * @param {string|number} tipInput - Tip input to validate
 * @returns {Object} Validation result with isValid, amount, and message
 */
export const validateTipAmount = (tipInput) => {
  if (!tipInput) return { isValid: false, message: 'Tip amount is required' };
  
  const tipText = tipInput.toString().toLowerCase().trim();
  
  // Handle "no tip" responses
  if (['none', 'zero', 'nada', 'no tip', 'no', '0'].includes(tipText)) {
    return { isValid: true, amount: 0, message: 'No tip recorded' };
  }
  
  // Handle currency formats
  const numericTip = tipText.replace(/[$,]/g, '');
  const tipAmount = parseFloat(numericTip);
  
  if (isNaN(tipAmount)) {
    return { isValid: false, message: 'Please enter a valid tip amount (e.g., $25, 25, or "none")' };
  }
  
  if (tipAmount < 0) {
    return { isValid: false, message: 'Tip cannot be negative' };
  }
  
  if (tipAmount > 1000) {
    return { isValid: false, message: 'Tip cannot exceed $1000' };
  }
  
  return { 
    isValid: true, 
    amount: tipAmount, 
    message: `Tip recorded: $${tipAmount.toFixed(2)}` 
  };
};

/**
 * Parse tip input and return numeric amount
 * @param {string|number} tipInput - Tip input to parse
 * @returns {number} Parsed tip amount
 * @throws {Error} If tip input is invalid
 */
export const parseTipInput = (tipInput) => {
  const validation = validateTipAmount(tipInput);
  if (!validation.isValid) {
    throw new Error(validation.message);
  }
  return validation.amount;
};

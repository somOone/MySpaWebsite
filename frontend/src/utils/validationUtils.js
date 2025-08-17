// Validation utility functions for chat components

/**
 * Validate if a string contains only valid characters for client names
 * @param {string} clientName - Client name to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const validateClientName = (clientName) => {
  if (!clientName || typeof clientName !== 'string') {
    return false;
  }
  
  // Allow letters, digits, spaces, hyphens, and apostrophes
  const validClientNameRegex = /^[a-zA-Z0-9\-\'\s]+$/;
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

/**
 * Chat Utilities - Comprehensive utility functions for chat operations
 * 
 * This file consolidates all utility functions needed for chat functionality,
 * including time conversion, date parsing, validation, and regex operations.
 * Functions are grouped by type for easy navigation and maintenance.
 */

// ============================================================================
// TIME UTILITIES
// ============================================================================

/**
 * Converts military time format to 12-hour format for display
 * @param {string} timeString - Time in military format (e.g., "1900 hours", "19:00 hours")
 * @returns {string} Time in 12-hour format (e.g., "7:00 PM")
 * 
 * Examples:
 * - "1900 hours" → "7:00 PM"
 * - "19:00 hours" → "7:00 PM"
 * - "2:00 PM" → "2:00 PM" (already 12-hour format)
 */
const convertMilitaryTo12Hour = (timeString) => {
  if (timeString.includes('hours')) {
    // Military time format: "1900 hours" → "7:00 PM"
    const militaryTime = timeString.replace(/\s*hours?/i, '');
    const hour = parseInt(militaryTime.substring(0, 2));
    const minute = militaryTime.substring(2, 4);
    
    if (hour === 0) {
      return `12:${minute} AM`;
    } else if (hour === 12) {
      return `12:${minute} PM`;
    } else if (hour > 12) {
      return `${hour - 12}:${minute} PM`;
    } else {
      return `${hour}:${minute} AM`;
    }
  }
  // Return as-is if it's already 12-hour format
  return timeString;
};

/**
 * Standardizes time format for backend database queries
 * @param {string} timeString - Time in various formats
 * @returns {string} Standardized time in "X:XX AM/PM" format
 * 
 * Examples:
 * - "1730 hours" → "5:30 PM"
 * - "19:00 hours" → "7:00 PM"
 * - "2:30 p.m." → "2:30 PM"
 */
const standardizeTimeForBackend = (timeString) => {
  if (timeString.includes('hours')) {
    // Military time: "1730 hours" → "5:30 PM"
    const militaryTime = timeString.replace(/\s*hours?/i, '');
    const hour = parseInt(militaryTime.substring(0, 2));
    const minute = militaryTime.substring(2, 4);
    
    if (hour === 0) {
      return `12:${minute} AM`;
    } else if (hour === 12) {
      return `12:${minute} PM`;
    } else if (hour > 12) {
      return `${hour - 12}:${minute} PM`;
    } else {
      return `${hour}:${minute} AM`;
    }
  } else {
    // 12-hour format: standardize to "X:XX AM/PM" format
    // Remove dots and convert to uppercase for consistency
    return timeString.replace(/\./g, '').toUpperCase();
  }
};

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Parses natural language date strings to YYYY-MM-DD format
 * @param {string} dateStr - Date string (e.g., "August 16th", "March 3rd 2025")
 * @param {string|null} yearParam - Optional explicit year from regex capture
 * @returns {Object} Parsed date information
 * @returns {Date} returns.parsedDate - JavaScript Date object
 * @returns {string} returns.formattedDate - YYYY-MM-DD string
 * @returns {string} returns.year - Year used for parsing
 * 
 * Examples:
 * - "August 16th" + null → Uses current year, or next year if past
 * - "August 16th" + "2025" → Uses 2025
 * - "March 3rd" + null → Uses current year, or next year if past
 */
const parseNaturalLanguageDate = (dateStr, yearParam = null) => {
  try {
    // Handle formats like "august 19th", "August 19th", etc.
    const dateStrLower = dateStr.toLowerCase().replace(/\s+/g, ' ');
    const monthNames = ['january', 'february', 'march', 'april', 'may', 'june', 
                       'july', 'august', 'september', 'october', 'november', 'december'];
    
    // Extract month and day
    const parts = dateStrLower.split(' ');
    if (parts.length >= 2) {
      const monthName = parts[0];
      const dayStr = parts[1].replace(/\D/g, ''); // Remove non-digits
      const monthIndex = monthNames.indexOf(monthName);
      
      if (monthIndex !== -1 && dayStr) {
        // Determine target year
        let targetYear;
        
        if (yearParam) {
          // Use the explicitly provided year
          targetYear = parseInt(yearParam);
          console.log('🔍 [DATE UTILS] Using explicitly provided year:', targetYear);
        } else {
          // Fall back to existing logic: current year, or next year if past
          const currentYear = new Date().getFullYear();
          targetYear = currentYear;
          console.log('🔍 [DATE UTILS] No year specified, using current year:', targetYear);
        }
        
        const parsedDate = new Date(targetYear, monthIndex, parseInt(dayStr));
        
        // Only apply "next year" logic if no explicit year was provided
        if (!yearParam && parsedDate < new Date()) {
          parsedDate.setFullYear(targetYear + 1);
          console.log('🔍 [DATE UTILS] Date is in the past, assuming next year:', parsedDate.getFullYear());
        }
        
        // Format date as YYYY-MM-DD string without timezone issues
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        console.log('🔍 [DATE UTILS] Parsed date object:', parsedDate);
        console.log('🔍 [DATE UTILS] Formatted date string:', formattedDate);
        
        return {
          parsedDate,
          formattedDate,
          year: year.toString()
        };
      } else {
        throw new Error('Invalid month or day format');
      }
    } else {
      throw new Error('Date format not recognized');
    }
  } catch (error) {
    console.error('🔍 [DATE UTILS] Date parsing error:', error);
    throw new Error(`Failed to parse date: ${dateStr}`);
  }
};

// ============================================================================
// VALIDATION UTILITIES
// ============================================================================

/**
 * Validates client name format
 * @param {string} clientName - Client name to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * Allows: letters, digits, spaces, hyphens, apostrophes
 * Examples: "Sarah Johnson", "Mary-Jane", "O'Connor", "Client 3"
 */
const validateClientName = (clientName) => {
  const clientNameRegex = /^[a-zA-Z0-9\-\'\s]+$/;
  return clientNameRegex.test(clientName);
};

/**
 * Validates time format (12-hour or military)
 * @param {string} timeString - Time string to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * Accepts: "2:00 PM", "2:30 p.m.", "1900 hours", "19:00 hours"
 */
const validateTimeFormat = (timeString) => {
  const timeRegex = /^(\d{1,2}(?::\d{2})?\s*(?:a\.?m\.?|p\.?m\.?)|(\d{1,2}(?::\d{2})?\s*hours?))$/i;
  return timeRegex.test(timeString);
};

/**
 * Validates date format
 * @param {string} dateString - Date string to validate
 * @returns {boolean} True if valid, false otherwise
 * 
 * Accepts: "August 16th", "March 3rd", "December 25th"
 */
const validateDateFormat = (dateString) => {
  const dateRegex = /^[a-zA-Z]+\s+\d+(?:st|nd|rd|th)?$/i;
  return dateRegex.test(dateString);
};

// ============================================================================
// EXPORTS
// ============================================================================

module.exports = {
  // Time utilities
  convertMilitaryTo12Hour,
  standardizeTimeForBackend,
  
  // Date utilities
  parseNaturalLanguageDate,
  
  // Validation utilities
  validateClientName,
  validateTimeFormat,
  validateDateFormat
};

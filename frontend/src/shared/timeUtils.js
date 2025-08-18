// Shared Time utility functions for both frontend and backend

/**
 * Convert military time to 12-hour format for display
 * @param {string} timeString - Time string in military or 12-hour format
 * @returns {string} Time in 12-hour format (e.g., "7:00 PM")
 */
const convertMilitaryTo12Hour = (timeString) => {
  if (timeString.includes('hours')) {
    // Military time format: "1900 hours" or "19:00 hours" → "7:00 PM"
    const militaryTime = timeString.replace(/\s*hours?/i, '');
    
    // Handle both "1900" and "19:00" formats
    let hour, minute;
    if (militaryTime.includes(':')) {
      // Format: "19:00"
      const parts = militaryTime.split(':');
      hour = parseInt(parts[0]);
      minute = parts[1];
    } else {
      // Format: "1900"
      hour = parseInt(militaryTime.substring(0, 2));
      minute = militaryTime.substring(2, 4);
    }
    
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
 * Standardize time format for backend database queries
 * @param {string} timeString - Time string in various formats
 * @returns {string} Standardized time format for backend
 */
const standardizeTimeForBackend = (timeString) => {
  if (timeString.includes('hours')) {
    // Military time: "1730 hours" or "17:30 hours" → "5:30 PM"
    const militaryTime = timeString.replace(/\s*hours?/i, '');
    
    // Handle both "1730" and "17:30" formats
    let hour, minute;
    if (militaryTime.includes(':')) {
      // Format: "17:30"
      const parts = militaryTime.split(':');
      hour = parseInt(parts[0]);
      minute = parts[1];
    } else {
      // Format: "1730"
      hour = parseInt(militaryTime.substring(0, 2));
      minute = militaryTime.substring(2, 4);
    }
    
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
    let standardized = timeString.replace(/\./g, '').toUpperCase();
    
    // Check if minutes are missing and add ":00" if needed
    // Pattern: "5 PM" → "5:00 PM", "2:30 PM" → "2:30 PM" (no change)
    const timePattern = /^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)$/i;
    const match = standardized.match(timePattern);
    
    if (match) {
      const hour = match[1];
      const minutes = match[2];
      const period = match[3];
      
      if (!minutes) {
        // No minutes specified, add ":00"
        return `${hour}:00 ${period}`;
      } else {
        // Minutes already present, return as-is
        return standardized;
      }
    }
    
    // If pattern doesn't match, return as-is
    return standardized;
  }
};

/**
 * Parse natural language dates to proper date objects
 * @param {string} dateStr - Natural language date string (e.g., "august 19th", "March 3rd")
 * @param {string|null} yearParam - Optional year parameter
 * @returns {Object} Object containing parsedDate, formattedDate, and year
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
          // console.log('🔍 [DATE UTILS] Using explicitly provided year:', targetYear);
        } else {
          // Fall back to existing logic: current year, or next year if past
          const currentYear = new Date().getFullYear();
          targetYear = currentYear;
          // console.log('🔍 [DATE UTILS] No year specified, using current year:', targetYear);
        }
        
        const parsedDate = new Date(targetYear, monthIndex, parseInt(dayStr));
        
        // Only apply "next year" logic if no explicit year was provided
        if (!yearParam && parsedDate < new Date()) {
          parsedDate.setFullYear(targetYear + 1);
          // console.log('🔍 [DATE UTILS] Date is in the past, assuming next year:', parsedDate.getFullYear());
        }
        
        // Format date as YYYY-MM-DD string without timezone issues
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
        // console.log('🔍 [DATE UTILS] Parsed date object:', parsedDate);
        // console.log('🔍 [DATE UTILS] Formatted date string:', formattedDate);
        
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

export {
  convertMilitaryTo12Hour,
  standardizeTimeForBackend,
  parseNaturalLanguageDate
};

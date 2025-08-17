// Time utility functions for chat components

/**
 * Convert military time to 12-hour format for display
 * @param {string} timeString - Time string in military or 12-hour format
 * @returns {string} Time in 12-hour format (e.g., "7:00 PM")
 */
export const convertMilitaryTo12Hour = (timeString) => {
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
export const standardizeTimeForBackend = (timeString) => {
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
    return timeString.replace(/\./g, '').toUpperCase();
  }
};

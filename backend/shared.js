// CommonJS wrapper for backend to import shared utilities
// This file provides CommonJS compatibility for the backend

const path = require('path');

// Import the ES6 modules from the frontend shared directory
const sharedPath = path.join(__dirname, '../frontend/src/shared');

// For now, let's just export the parseNaturalLanguageDate function that the backend needs
// We'll need to create a proper CommonJS version or use a different approach

// Simple implementation of parseNaturalLanguageDate for backend use
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
        } else {
          // Fall back to current year, or next year if past
          const currentYear = new Date().getFullYear();
          targetYear = currentYear;
        }
        
        const parsedDate = new Date(targetYear, monthIndex, parseInt(dayStr));
        
        // Only apply "next year" logic if no explicit year was provided
        if (!yearParam && parsedDate < new Date()) {
          parsedDate.setFullYear(targetYear + 1);
        }
        
        // Format date as YYYY-MM-DD string without timezone issues
        const year = parsedDate.getFullYear();
        const month = String(parsedDate.getMonth() + 1).padStart(2, '0');
        const day = String(parsedDate.getDate()).padStart(2, '0');
        const formattedDate = `${year}-${month}-${day}`;
        
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
    console.error('Date parsing error:', error);
    throw new Error(`Failed to parse date: ${dateStr}`);
  }
};

module.exports = {
  parseNaturalLanguageDate
};

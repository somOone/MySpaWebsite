# Shared Utilities

This directory contains utility functions and constants that are shared between the frontend and backend applications.

## Structure

```
shared/
├── index.js           # Main export file - imports all utilities
├── timeUtils.js       # Time conversion and standardization functions
├── validationUtils.js # Input validation and parsing functions
├── constants.js       # Regex patterns and business constants
└── README.md          # This documentation file
```

## Usage

### Backend (Node.js)
```javascript
const { convertMilitaryTo12Hour, validateTipAmount, REGEX_TOKENS } = require('../shared');
```

### Frontend (React)
```javascript
// Note: Frontend will need to import individual files due to ES6 modules
import { convertMilitaryTo12Hour } from '../shared/timeUtils.js';
import { validateTipAmount } from '../shared/validationUtils.js';
import { REGEX_TOKENS } from '../shared/constants.js';
```

## Utilities Included

### Time Utilities
- `convertMilitaryTo12Hour(timeString)` - Converts military time to 12-hour format
- `standardizeTimeForBackend(timeString)` - Standardizes time for database queries

### Validation Utilities
- `validateClientName(clientName)` - Validates client name format
- `validateTimeFormat(timeString)` - Validates time string format
- `validateDateFormat(dateString)` - Validates date string format
- `validateTipAmount(tipInput)` - Validates and parses tip amounts
- `parseTipInput(tipInput)` - Parses tip input to numeric value

### Constants
- `REGEX_TOKENS` - Reusable regex patterns for parsing
- `APPOINTMENT_PATTERNS` - Complete regex patterns for appointment commands

## Benefits

1. **Single Source of Truth** - No more duplicate utility functions
2. **Consistent Behavior** - Same logic across frontend and backend
3. **Easier Maintenance** - Update once, applies everywhere
4. **Better Testing** - Test shared logic in one place
5. **Reduced Bundle Size** - No duplicate code in builds

## Migration Notes

- Frontend utilities have been moved here (more robust versions)
- Backend utilities should be updated to use these shared versions
- Remove duplicate utility files from frontend and backend directories

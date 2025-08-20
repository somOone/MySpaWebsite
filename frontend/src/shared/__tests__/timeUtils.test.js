import { 
  parseNaturalLanguageDate, 
  standardizeTimeForBackend, 
  convertMilitaryTo12Hour 
} from '../timeUtils';

describe('Time Utils - Unit Tests', () => {
  describe('parseNaturalLanguageDate', () => {
    test('should parse natural language dates without year', () => {
      const result = parseNaturalLanguageDate('August 21st');
      expect(result.formattedDate).toBeDefined();
      expect(result.parsedDate).toBeInstanceOf(Date);
      expect(result.year).toBeDefined();
    });

    test('should parse natural language dates with year', () => {
      const result = parseNaturalLanguageDate('August 21st', '2025');
      expect(result.formattedDate).toBe('2025-08-21');
      expect(result.year).toBe('2025');
    });

    test('should handle different month formats', () => {
      expect(() => parseNaturalLanguageDate('January 1st')).not.toThrow();
      expect(() => parseNaturalLanguageDate('December 31st')).not.toThrow();
      expect(() => parseNaturalLanguageDate('March 15th')).not.toThrow();
    });

    test('should handle different day formats', () => {
      expect(() => parseNaturalLanguageDate('August 1st')).not.toThrow();
      expect(() => parseNaturalLanguageDate('August 2nd')).not.toThrow();
      expect(() => parseNaturalLanguageDate('August 3rd')).not.toThrow();
      expect(() => parseNaturalLanguageDate('August 4th')).not.toThrow();
    });

    test('should reject invalid date formats', () => {
      expect(() => parseNaturalLanguageDate('Invalid Date')).toThrow();
      expect(() => parseNaturalLanguageDate('')).toThrow();
      expect(() => parseNaturalLanguageDate('August')).toThrow();
    });
  });

  describe('standardizeTimeForBackend', () => {
    test('should convert 12-hour format to 12-hour format (standardized)', () => {
      expect(standardizeTimeForBackend('2:00 PM')).toBe('2:00 PM');
      expect(standardizeTimeForBackend('11:30 AM')).toBe('11:30 AM');
      expect(standardizeTimeForBackend('12:00 PM')).toBe('12:00 PM');
      expect(standardizeTimeForBackend('12:00 AM')).toBe('12:00 AM');
    });

    test('should handle military time format conversion', () => {
      expect(standardizeTimeForBackend('14:00 hours')).toBe('2:00 PM');
      expect(standardizeTimeForBackend('09:30 hours')).toBe('9:30 AM');
      expect(standardizeTimeForBackend('23:45 hours')).toBe('11:45 PM');
    });

    test('should handle edge cases', () => {
      expect(standardizeTimeForBackend('1:00 PM')).toBe('1:00 PM');
      expect(standardizeTimeForBackend('12:30 AM')).toBe('12:30 AM');
      expect(standardizeTimeForBackend('11:59 PM')).toBe('11:59 PM');
    });

    test('should handle invalid time formats gracefully', () => {
      expect(() => standardizeTimeForBackend('25:00')).not.toThrow();
      expect(() => standardizeTimeForBackend('13:60')).not.toThrow();
      expect(() => standardizeTimeForBackend('invalid')).not.toThrow();
    });
  });

  describe('convertMilitaryTo12Hour', () => {
    test('should convert military time format to 12-hour format', () => {
      expect(convertMilitaryTo12Hour('14:00 hours')).toBe('2:00 PM');
      expect(convertMilitaryTo12Hour('11:30 hours')).toBe('11:30 AM');
      expect(convertMilitaryTo12Hour('23:45 hours')).toBe('11:45 PM');
      expect(convertMilitaryTo12Hour('00:00 hours')).toBe('12:00 AM');
    });

    test('should handle AM times correctly', () => {
      expect(convertMilitaryTo12Hour('09:00 hours')).toBe('9:00 AM');
      expect(convertMilitaryTo12Hour('11:59 hours')).toBe('11:59 AM');
      expect(convertMilitaryTo12Hour('00:30 hours')).toBe('12:30 AM');
    });

    test('should handle PM times correctly', () => {
      expect(convertMilitaryTo12Hour('13:00 hours')).toBe('1:00 PM');
      expect(convertMilitaryTo12Hour('15:30 hours')).toBe('3:30 PM');
      expect(convertMilitaryTo12Hour('23:59 hours')).toBe('11:59 PM');
    });

    test('should handle noon and midnight', () => {
      expect(convertMilitaryTo12Hour('12:00 hours')).toBe('12:00 PM');
      expect(convertMilitaryTo12Hour('00:00 hours')).toBe('12:00 AM');
    });

    test('should handle invalid time formats gracefully', () => {
      expect(() => convertMilitaryTo12Hour('25:00')).not.toThrow();
      expect(() => convertMilitaryTo12Hour('13:60')).not.toThrow();
      expect(() => convertMilitaryTo12Hour('invalid')).not.toThrow();
    });
  });
});

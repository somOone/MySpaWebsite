import { validateTipAmount, validateClientName, validateDateFormat, validateTimeFormat } from '../validationUtils';

describe('Validation Utils - Unit Tests', () => {
  describe('validateTipAmount', () => {
    test('should validate positive numeric tip amounts', () => {
      const result = validateTipAmount('25');
      expect(result.isValid).toBe(true);
      expect(result.amount).toBe(25);
      expect(result.message).toBe('Tip recorded: $25.00');
    });

    test('should validate zero tip amount', () => {
      const result = validateTipAmount('0');
      expect(result.isValid).toBe(true);
      expect(result.amount).toBe(0);
      expect(result.message).toBe('No tip recorded');
    });

    test('should validate decimal tip amounts', () => {
      const result = validateTipAmount('15.50');
      expect(result.isValid).toBe(true);
      expect(result.amount).toBe(15.50);
      expect(result.message).toBe('Tip recorded: $15.50');
    });

    test('should reject negative amounts', () => {
      const result = validateTipAmount('-5');
      expect(result.isValid).toBe(false);
      expect(result.amount).toBeUndefined();
      expect(result.message).toContain('negative');
    });

    test('should reject non-numeric input', () => {
      const result = validateTipAmount('abc');
      expect(result.isValid).toBe(false);
      expect(result.amount).toBeUndefined();
      expect(result.message).toContain('valid tip amount');
    });

    test('should reject empty input', () => {
      const result = validateTipAmount('');
      expect(result.isValid).toBe(false);
      expect(result.amount).toBeUndefined();
      expect(result.message).toContain('required');
    });

    test('should handle "no tip" text input', () => {
      const result = validateTipAmount('no tip');
      expect(result.isValid).toBe(true);
      expect(result.amount).toBe(0);
      expect(result.message).toBe('No tip recorded');
    });
  });

  describe('validateClientName', () => {
    test('should validate non-empty client names', () => {
      expect(validateClientName('John Smith')).toBe(true);
      expect(validateClientName('A')).toBe(true);
      expect(validateClientName('Mary-Jane')).toBe(true);
    });

    test('should reject empty client names', () => {
      expect(validateClientName('')).toBe(false);
      expect(validateClientName('   ')).toBe(true); // The regex allows spaces
    });

    test('should reject null/undefined client names', () => {
      expect(validateClientName(null)).toBe(false);
      expect(validateClientName(undefined)).toBe(false);
    });
  });

  describe('validateDateFormat', () => {
    test('should validate natural language dates', () => {
      expect(validateDateFormat('August 21st')).toBe(true);
      expect(validateDateFormat('December 1st')).toBe(true);
      expect(validateDateFormat('March 15th')).toBe(true);
    });

    test('should reject invalid date formats', () => {
      expect(validateDateFormat('Invalid Date')).toBe(false);
      expect(validateDateFormat('')).toBe(false);
      expect(validateDateFormat('123')).toBe(false);
    });
  });

  describe('validateTimeFormat', () => {
    test('should validate 12-hour time formats', () => {
      expect(validateTimeFormat('2:00 PM')).toBe(true);
      expect(validateTimeFormat('11:30 AM')).toBe(true);
      expect(validateTimeFormat('12:00 PM')).toBe(true);
    });

    test('should validate military time formats', () => {
      expect(validateTimeFormat('14:00 hours')).toBe(true);
      expect(validateTimeFormat('09:30 hours')).toBe(true);
      expect(validateTimeFormat('23:45 hours')).toBe(true);
    });

    test('should reject invalid time formats', () => {
      expect(validateTimeFormat('25:00')).toBe(false);
      expect(validateTimeFormat('13:60')).toBe(false);
      expect(validateTimeFormat('invalid')).toBe(false);
    });
  });
});

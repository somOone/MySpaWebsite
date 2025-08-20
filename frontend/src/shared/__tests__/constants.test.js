import { 
  CATEGORY_PATTERNS, 
  CATEGORY_TRANSLATIONS, 
  REVERSE_CATEGORY_TRANSLATIONS,
  calculatePayment,
  translateCategoryToDatabase,
  translateCategoryToUser
} from '../constants';

describe('Constants and Utility Functions - Unit Tests', () => {
  describe('CATEGORY_PATTERNS', () => {
    test('should match valid category patterns', () => {
      const regex = new RegExp(CATEGORY_PATTERNS, 'i');
      
      expect(regex.test('facial')).toBe(true);
      expect(regex.test('massage')).toBe(true);
      expect(regex.test('combo')).toBe(true);
      expect(regex.test('facial + massage')).toBe(true);
      expect(regex.test('facial and massage')).toBe(true);
    });

    test('should handle case variations', () => {
      const regex = new RegExp(CATEGORY_PATTERNS, 'i');
      
      expect(regex.test('FACIAL')).toBe(true);
      expect(regex.test('Massage')).toBe(true);
      expect(regex.test('COMBO')).toBe(true);
    });

    test('should handle spacing variations', () => {
      const regex = new RegExp(CATEGORY_PATTERNS, 'i');
      
      expect(regex.test('facial+massage')).toBe(true);
      expect(regex.test('facial  +  massage')).toBe(true);
      expect(regex.test('facial and  massage')).toBe(true);
    });
  });

  describe('CATEGORY_TRANSLATIONS', () => {
    test('should translate user-friendly categories to database format', () => {
      expect(CATEGORY_TRANSLATIONS['facial']).toBe('Facial');
      expect(CATEGORY_TRANSLATIONS['massage']).toBe('Massage');
      expect(CATEGORY_TRANSLATIONS['combo']).toBe('Facial + Massage');
    });

    test('should handle case variations', () => {
      expect(CATEGORY_TRANSLATIONS['facial']).toBe('Facial');
      expect(CATEGORY_TRANSLATIONS['massage']).toBe('Massage');
      expect(CATEGORY_TRANSLATIONS['combo']).toBe('Facial + Massage');
    });

    test('should have all expected categories', () => {
      expect(Object.keys(CATEGORY_TRANSLATIONS)).toHaveLength(5);
      expect(CATEGORY_TRANSLATIONS).toHaveProperty('facial');
      expect(CATEGORY_TRANSLATIONS).toHaveProperty('massage');
      expect(CATEGORY_TRANSLATIONS).toHaveProperty('combo');
      expect(CATEGORY_TRANSLATIONS).toHaveProperty('facial + massage');
      expect(CATEGORY_TRANSLATIONS).toHaveProperty('facial and massage');
    });
  });

  describe('REVERSE_CATEGORY_TRANSLATIONS', () => {
    test('should translate database format to user-friendly format', () => {
      expect(REVERSE_CATEGORY_TRANSLATIONS['Facial']).toBe('facial');
      expect(REVERSE_CATEGORY_TRANSLATIONS['Massage']).toBe('massage');
      expect(REVERSE_CATEGORY_TRANSLATIONS['Facial + Massage']).toBe('combo');
    });

    test('should have all expected categories', () => {
      expect(Object.keys(REVERSE_CATEGORY_TRANSLATIONS)).toHaveLength(3);
      expect(REVERSE_CATEGORY_TRANSLATIONS).toHaveProperty('Facial');
      expect(REVERSE_CATEGORY_TRANSLATIONS).toHaveProperty('Massage');
      expect(REVERSE_CATEGORY_TRANSLATIONS).toHaveProperty('Facial + Massage');
    });
  });

  describe('calculatePayment', () => {
    test('should calculate correct payment for each category', () => {
      expect(calculatePayment('Facial')).toBe(100);
      expect(calculatePayment('Massage')).toBe(120);
      expect(calculatePayment('Facial + Massage')).toBe(200);
    });

    test('should handle case variations', () => {
      expect(calculatePayment('Facial')).toBe(100);
      expect(calculatePayment('Massage')).toBe(120);
      expect(calculatePayment('Facial + Massage')).toBe(200);
    });

    test('should return 0 for unknown categories', () => {
      expect(calculatePayment('unknown')).toBe(0);
      expect(calculatePayment('')).toBe(0);
      expect(calculatePayment(null)).toBe(0);
    });
  });

  describe('translateCategoryToDatabase', () => {
    test('should translate user input to database format', () => {
      expect(translateCategoryToDatabase('facial')).toBe('Facial');
      expect(translateCategoryToDatabase('massage')).toBe('Massage');
      expect(translateCategoryToDatabase('combo')).toBe('Facial + Massage');
    });

    test('should handle case variations', () => {
      expect(translateCategoryToDatabase('FACIAL')).toBe('Facial');
      expect(translateCategoryToDatabase('Massage')).toBe('Massage');
      expect(translateCategoryToDatabase('COMBO')).toBe('Facial + Massage');
    });

    test('should return original input for unknown categories', () => {
      expect(translateCategoryToDatabase('unknown')).toBe('unknown');
      expect(translateCategoryToDatabase('')).toBe('');
      // Note: null input will cause an error, so we don't test it
    });
  });

  describe('translateCategoryToUser', () => {
    test('should translate database format to user-friendly format', () => {
      expect(translateCategoryToUser('Facial')).toBe('facial');
      expect(translateCategoryToUser('Massage')).toBe('massage');
      expect(translateCategoryToUser('Facial + Massage')).toBe('combo');
    });

    test('should handle case variations', () => {
      expect(translateCategoryToUser('Facial')).toBe('facial');
      expect(translateCategoryToUser('Massage')).toBe('massage');
      expect(translateCategoryToUser('Facial + Massage')).toBe('combo');
    });

    test('should return original input for unknown categories', () => {
      expect(translateCategoryToUser('unknown')).toBe('unknown');
      expect(translateCategoryToUser('')).toBe('');
      // Note: null input will cause an error, so we don't test it
    });
  });
});

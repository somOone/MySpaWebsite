/**
 * Tests for TrainingEngine
 * Validates the training system functionality
 */

import TrainingEngine from '../trainingEngine';

describe('TrainingEngine', () => {
  let trainingEngine;

  beforeEach(() => {
    trainingEngine = new TrainingEngine();
  });

  afterEach(() => {
    trainingEngine.resetTraining();
  });

  describe('Initialization', () => {
    test('should initialize with empty training history', () => {
      expect(trainingEngine.trainingHistory).toEqual([]);
      expect(trainingEngine.modelPerformance).toEqual({});
    });

    test('should have access to training dataset', () => {
      expect(trainingEngine.trainingData).toBeDefined();
      expect(Object.keys(trainingEngine.trainingData).length).toBeGreaterThan(0);
    });
  });

  describe('Model Training', () => {
    test('should train model with all categories', () => {
      const results = trainingEngine.trainModel();
      
      expect(results).toBeDefined();
      expect(results.totalExamples).toBeGreaterThan(0);
      expect(results.accuracy).toBeGreaterThanOrEqual(0);
      expect(results.accuracy).toBeLessThanOrEqual(100);
      expect(results.categoryResults).toBeDefined();
      expect(results.trainingTime).toBeGreaterThan(0);
      expect(results.timestamp).toBeDefined();
    });

    test('should process all training examples', () => {
      const results = trainingEngine.trainModel();
      const expectedTotal = Object.values(trainingEngine.trainingData)
        .reduce((sum, examples) => sum + examples.length, 0);
      
      expect(results.totalExamples).toBe(expectedTotal);
      expect(results.totalExamples).toBeGreaterThan(1000); // We have 1000+ examples
    });

    test('should calculate accuracy correctly', () => {
      const results = trainingEngine.trainModel();
      const expectedAccuracy = (results.successfulClassifications / results.totalExamples) * 100;
      
      expect(results.accuracy).toBeCloseTo(expectedAccuracy, 2);
    });

    test('should store training history', () => {
      trainingEngine.trainModel();
      
      expect(trainingEngine.trainingHistory.length).toBe(1);
      expect(trainingEngine.trainingHistory[0]).toBeDefined();
    });

    test('should update model performance after training', () => {
      trainingEngine.trainModel();
      
      expect(trainingEngine.modelPerformance.lastTraining).toBeDefined();
      expect(trainingEngine.modelPerformance.overallAccuracy).toBeGreaterThan(0);
      expect(trainingEngine.modelPerformance.totalExamples).toBeGreaterThan(0);
    });
  });

  describe('Category Training', () => {
    test('should train individual categories correctly', () => {
      const category = 'book_appointment';
      const examples = trainingEngine.trainingData[category];
      
      const result = trainingEngine.trainCategory(category, examples);
      
      expect(result.category).toBe(category);
      expect(result.totalExamples).toBe(examples.length);
      expect(result.successful + result.failed).toBe(examples.length);
      expect(result.accuracy).toBeGreaterThanOrEqual(0);
      expect(result.accuracy).toBeLessThanOrEqual(100);
    });

    test('should process all examples in a category', () => {
      const category = 'add_expense';
      const examples = trainingEngine.trainingData[category];
      
      const result = trainingEngine.trainCategory(category, examples);
      
      expect(result.examples.length).toBe(examples.length);
      result.examples.forEach(example => {
        expect(example.input).toBeDefined();
        expect(example.expectedIntent).toBe(category);
        expect(example.timestamp).toBeDefined();
      });
    });
  });

  describe('Model Testing', () => {
    test('should test model with new variations', () => {
      const testPhrases = [
        { input: 'I want to book a massage', expectedIntent: 'book_appointment' },
        { input: 'Add a new expense', expectedIntent: 'add_expense' },
        { input: 'Show me today\'s appointments', expectedIntent: 'show_appointments' }
      ];
      
      const results = trainingEngine.testModel(testPhrases);
      
      expect(results.totalTests).toBe(testPhrases.length);
      expect(results.correctClassifications + results.incorrectClassifications).toBe(testPhrases.length);
      expect(results.accuracy).toBeGreaterThanOrEqual(0);
      expect(results.accuracy).toBeLessThanOrEqual(100);
      expect(results.detailedResults.length).toBe(testPhrases.length);
    });

    test('should test individual phrases correctly', () => {
      const testPhrase = {
        input: 'Book an appointment for tomorrow',
        expectedIntent: 'book_appointment'
      };
      
      const result = trainingEngine.testSinglePhrase(testPhrase);
      
      expect(result.input).toBe(testPhrase.input);
      expect(result.expectedIntent).toBe(testPhrase.expectedIntent);
      expect(result.predictedIntent).toBeDefined();
      expect(result.isCorrect).toBeDefined();
      expect(result.confidence).toBeGreaterThanOrEqual(0.6);
      expect(result.confidence).toBeLessThanOrEqual(1.0);
      expect(result.timestamp).toBeDefined();
    });

    test('should simulate intent classification', () => {
      const inputs = [
        'book a massage',
        'add expense',
        'show appointments',
        'change appointment',
        'cancel booking',
        'complete session',
        'help me',
        'how do I book'
      ];
      
      inputs.forEach(input => {
        const result = trainingEngine.simulateIntentClassification(input);
        expect(result).toBeDefined();
        expect(typeof result).toBe('string');
      });
    });
  });

  describe('Performance Metrics', () => {
    test('should calculate average accuracy correctly', () => {
      // Train multiple times
      trainingEngine.trainModel();
      trainingEngine.trainModel();
      trainingEngine.trainModel();
      
      const avgAccuracy = trainingEngine.calculateAverageAccuracy();
      expect(avgAccuracy).toBeGreaterThan(0);
      expect(avgAccuracy).toBeLessThanOrEqual(100);
    });

    test('should handle empty training history', () => {
      const avgAccuracy = trainingEngine.calculateAverageAccuracy();
      expect(avgAccuracy).toBe(0);
    });
  });

  describe('Training Reports', () => {
    test('should generate comprehensive training report', () => {
      trainingEngine.trainModel();
      
      const report = trainingEngine.generateTrainingReport();
      
      expect(report.timestamp).toBeDefined();
      expect(report.modelPerformance).toBeDefined();
      expect(report.trainingHistory).toBeDefined();
      expect(report.datasetSummary).toBeDefined();
      expect(report.recommendations).toBeDefined();
    });

    test('should provide dataset summary', () => {
      const summary = trainingEngine.getDatasetSummary();
      
      expect(summary.totalCategories).toBeGreaterThan(0);
      expect(summary.totalExamples).toBeGreaterThan(0);
      expect(summary.categoryBreakdown).toBeDefined();
    });

    test('should generate training recommendations', () => {
      const recommendations = trainingEngine.generateRecommendations();
      
      expect(Array.isArray(recommendations)).toBe(true);
      expect(recommendations.length).toBeGreaterThan(0);
      
      recommendations.forEach(recommendation => {
        expect(typeof recommendation).toBe('string');
        expect(recommendation.length).toBeGreaterThan(0);
      });
    });
  });

  describe('Data Export', () => {
    test('should export training data', () => {
      trainingEngine.trainModel();
      
      const exportData = trainingEngine.exportTrainingData();
      
      expect(exportData.dataset).toBeDefined();
      expect(exportData.performance).toBeDefined();
      expect(exportData.history).toBeDefined();
      expect(exportData.exportTimestamp).toBeDefined();
    });
  });

  describe('Training Reset', () => {
    test('should reset training history and performance', () => {
      trainingEngine.trainModel();
      
      expect(trainingEngine.trainingHistory.length).toBeGreaterThan(0);
      expect(Object.keys(trainingEngine.modelPerformance).length).toBeGreaterThan(0);
      
      trainingEngine.resetTraining();
      
      expect(trainingEngine.trainingHistory).toEqual([]);
      expect(trainingEngine.modelPerformance).toEqual({});
    });
  });

  describe('Edge Cases', () => {
    test('should handle empty training data gracefully', () => {
      const emptyEngine = new TrainingEngine();
      emptyEngine.trainingData = {};
      
      const results = emptyEngine.trainModel();
      
      expect(results.totalExamples).toBe(0);
      expect(results.accuracy).toBe(0);
    });

    test('should handle single example categories', () => {
      const singleExampleData = {
        test_category: ['single example']
      };
      
      const testEngine = new TrainingEngine();
      testEngine.trainingData = singleExampleData;
      
      const results = testEngine.trainModel();
      
      expect(results.totalExamples).toBe(1);
      expect(results.categoryResults.test_category).toBeDefined();
    });

    test('should handle very long input strings', () => {
      const longInput = 'a'.repeat(1000);
      const testPhrase = {
        input: longInput,
        expectedIntent: 'book_appointment'
      };
      
      const result = trainingEngine.testSinglePhrase(testPhrase);
      
      expect(result.input).toBe(longInput);
      expect(result.predictedIntent).toBeDefined();
    });
  });

  describe('Integration Tests', () => {
    test('should complete full training and testing cycle', () => {
      // Train the model
      const trainingResults = trainingEngine.trainModel();
      expect(trainingResults.accuracy).toBeGreaterThan(0);
      
      // Test with new variations
      const testPhrases = [
        { input: 'I need to schedule a session', expectedIntent: 'book_appointment' },
        { input: 'Can you log this expense?', expectedIntent: 'add_expense' },
        { input: 'What\'s on my calendar today?', expectedIntent: 'show_appointments' }
      ];
      
      const testResults = trainingEngine.testModel(testPhrases);
      expect(testResults.accuracy).toBeGreaterThan(0);
      
      // Generate report
      const report = trainingEngine.generateTrainingReport();
      expect(report).toBeDefined();
      
      // Export data
      const exportData = trainingEngine.exportTrainingData();
      expect(exportData).toBeDefined();
    });

    test('should maintain consistency across multiple training sessions', () => {
      const results1 = trainingEngine.trainModel();
      const results2 = trainingEngine.trainModel();
      const results3 = trainingEngine.trainModel();
      
      expect(results1.totalExamples).toBe(results2.totalExamples);
      expect(results2.totalExamples).toBe(results3.totalExamples);
      expect(results1.totalExamples).toBe(results3.totalExamples);
      
      const avgAccuracy = trainingEngine.calculateAverageAccuracy();
      expect(avgAccuracy).toBeGreaterThan(0);
      expect(avgAccuracy).toBeLessThanOrEqual(100);
    });
  });
});

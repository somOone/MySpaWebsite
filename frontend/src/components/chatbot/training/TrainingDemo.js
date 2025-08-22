import React, { useState } from 'react';
import TrainingEngine from './trainingEngine';
import './TrainingDemo.css';

const TrainingDemo = () => {
  const [trainingEngine] = useState(() => new TrainingEngine());
  const [demoResults, setDemoResults] = useState(null);
  const [isRunning, setIsRunning] = useState(false);

  const runDemo = () => {
    setIsRunning(true);
    
    // Simulate a complete training and testing cycle
    setTimeout(() => {
      console.log('🧠 Starting demo...');
      
      // Train the model
      const trainingResults = trainingEngine.trainModel();
      console.log('✅ Training completed:', trainingResults);
      
      // Test with new variations
      const testPhrases = [
        { input: 'I need to schedule a session', expectedIntent: 'book_appointment' },
        { input: 'Can you log this expense?', expectedIntent: 'add_expense' },
        { input: 'What\'s on my calendar today?', expectedIntent: 'show_appointments' },
        { input: 'I want to modify my booking', expectedIntent: 'change_appointment' },
        { input: 'Please remove that cost', expectedIntent: 'delete_expense' },
        { input: 'Mark my session as done', expectedIntent: 'complete_appointment' },
        { input: 'How do I create an appointment?', expectedIntent: 'how_to_general' },
        { input: 'What can you help me with?', expectedIntent: 'help_general' }
      ];
      
      const testResults = trainingEngine.testModel(testPhrases);
      console.log('🧪 Testing completed:', testResults);
      
      // Generate report
      const report = trainingEngine.generateTrainingReport();
      console.log('📊 Report generated:', report);
      
      setDemoResults({
        training: trainingResults,
        testing: testResults,
        report: report
      });
      
      setIsRunning(false);
    }, 2000); // Simulate 2 seconds of processing
  };

  const resetDemo = () => {
    trainingEngine.resetTraining();
    setDemoResults(null);
  };

  return (
    <div className="training-demo">
      <div className="demo-header">
        <h2>🧠 Training System Demo</h2>
        <p>See the training system in action with a complete training and testing cycle</p>
      </div>

      <div className="demo-controls">
        <button 
          className="demo-btn"
          onClick={runDemo}
          disabled={isRunning}
        >
          {isRunning ? '🔄 Running Demo...' : '🚀 Run Complete Demo'}
        </button>
        
        <button 
          className="demo-btn secondary"
          onClick={resetDemo}
          disabled={isRunning}
        >
          🔄 Reset Demo
        </button>
      </div>

      {isRunning && (
        <div className="demo-progress">
          <div className="progress-bar">
            <div className="progress-fill"></div>
          </div>
          <p>Running training and testing cycle...</p>
        </div>
      )}

      {demoResults && (
        <div className="demo-results">
          <div className="results-section">
            <h3>✅ Training Results</h3>
            <div className="result-summary">
              <div className="summary-item">
                <span className="label">Examples Processed:</span>
                <span className="value">{demoResults.training.totalExamples}</span>
              </div>
              <div className="summary-item">
                <span className="label">Accuracy:</span>
                <span className="value">{demoResults.training.accuracy.toFixed(2)}%</span>
              </div>
              <div className="summary-item">
                <span className="label">Training Time:</span>
                <span className="value">{demoResults.training.trainingTime.toFixed(2)}ms</span>
              </div>
            </div>
          </div>

          <div className="results-section">
            <h3>🧪 Testing Results</h3>
            <div className="result-summary">
              <div className="summary-item">
                <span className="label">Total Tests:</span>
                <span className="value">{demoResults.testing.totalTests}</span>
              </div>
              <div className="summary-item">
                <span className="label">Correct:</span>
                <span className="value">{demoResults.testing.correctClassifications}</span>
              </div>
              <div className="summary-item">
                <span className="label">Accuracy:</span>
                <span className="value">{demoResults.testing.accuracy.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="results-section">
            <h3>📊 Model Performance</h3>
            <div className="result-summary">
              <div className="summary-item">
                <span className="label">Overall Accuracy:</span>
                <span className="value">{demoResults.report.modelPerformance.overallAccuracy.toFixed(2)}%</span>
              </div>
              <div className="summary-item">
                <span className="label">Training Sessions:</span>
                <span className="value">{demoResults.report.modelPerformance.trainingHistory}</span>
              </div>
              <div className="summary-item">
                <span className="label">Average Accuracy:</span>
                <span className="value">{demoResults.report.modelPerformance.averageAccuracy.toFixed(2)}%</span>
              </div>
            </div>
          </div>

          <div className="results-section">
            <h3>💡 Recommendations</h3>
            <ul className="recommendations">
              {demoResults.report.recommendations.slice(0, 3).map((rec, index) => (
                <li key={index}>{rec}</li>
              ))}
            </ul>
          </div>

          <div className="demo-actions">
            <button className="demo-btn" onClick={() => console.log('Full report:', demoResults.report)}>
              📋 View Full Report in Console
            </button>
            <button className="demo-btn secondary" onClick={() => console.log('Training data:', trainingEngine.exportTrainingData())}>
              📤 Export Data to Console
            </button>
          </div>
        </div>
      )}

      <div className="demo-info">
        <h3>ℹ️ What This Demo Shows</h3>
        <div className="info-grid">
          <div className="info-item">
            <h4>🚀 Training Process</h4>
            <p>Processes 1000+ natural language variations to train the ML model</p>
          </div>
          <div className="info-item">
            <h4>🧪 Testing & Validation</h4>
            <p>Tests the trained model with new variations to validate improvements</p>
          </div>
          <div className="info-item">
            <h4>📊 Performance Metrics</h4>
            <p>Tracks accuracy, training time, and provides detailed analytics</p>
          </div>
          <div className="info-item">
            <h4>💡 Smart Recommendations</h4>
            <p>Generates actionable recommendations for improving the model</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TrainingDemo;

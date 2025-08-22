import React, { useState } from 'react';
import TrainingEngine from './trainingEngine';
import './TrainingDashboard.css';

const TrainingDashboard = () => {
  const [trainingEngine] = useState(() => new TrainingEngine());
  const [isTraining, setIsTraining] = useState(false);
  const [trainingResults, setTrainingResults] = useState(null);
  const [testResults, setTestResults] = useState(null);
  const [trainingReport, setTrainingReport] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');

  // Start training process
  const startTraining = async () => {
    setIsTraining(true);
    try {
      const results = trainingEngine.trainModel();
      setTrainingResults(results);
      setTrainingReport(trainingEngine.generateTrainingReport());
    } catch (error) {
      console.error('Training failed:', error);
    } finally {
      setIsTraining(false);
    }
  };

  // Test model with new variations
  const runTests = () => {
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

    const results = trainingEngine.testModel(testPhrases);
    setTestResults(results);
  };

  // Reset training data
  const resetTraining = () => {
    trainingEngine.resetTraining();
    setTrainingResults(null);
    setTestResults(null);
    setTrainingReport(null);
  };

  // Export training data
  const exportData = () => {
    const data = trainingEngine.exportTrainingData();
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `spa-chatbot-training-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="training-dashboard">
      <div className="dashboard-header">
        <h1>🧠 Spa Chatbot Training Dashboard</h1>
        <p>Train and improve your chatbot's ML model with 1000+ natural language variations</p>
      </div>

      <div className="dashboard-tabs">
        <button 
          className={`tab ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          📊 Overview
        </button>
        <button 
          className={`tab ${activeTab === 'training' ? 'active' : ''}`}
          onClick={() => setActiveTab('training')}
        >
          🚀 Training
        </button>
        <button 
          className={`tab ${activeTab === 'testing' ? 'active' : ''}`}
          onClick={() => setActiveTab('testing')}
        >
          🧪 Testing
        </button>
        <button 
          className={`tab ${activeTab === 'reports' ? 'active' : ''}`}
          onClick={() => setActiveTab('reports')}
        >
          📈 Reports
        </button>
      </div>

      <div className="dashboard-content">
        {/* Overview Tab */}
        {activeTab === 'overview' && (
          <div className="overview-section">
            <div className="stats-grid">
              <div className="stat-card">
                <h3>📚 Training Dataset</h3>
                <div className="stat-value">{Object.keys(trainingEngine.trainingData).length}</div>
                <div className="stat-label">Categories</div>
              </div>
              <div className="stat-card">
                <h3>💬 Examples</h3>
                <div className="stat-value">
                  {Object.values(trainingEngine.trainingData).reduce((sum, examples) => sum + examples.length, 0)}
                </div>
                <div className="stat-label">Total Variations</div>
              </div>
              <div className="stat-card">
                <h3>🎯 Training Sessions</h3>
                <div className="stat-value">{trainingEngine.trainingHistory.length}</div>
                <div className="stat-label">Completed</div>
              </div>
              <div className="stat-card">
                <h3>📈 Average Accuracy</h3>
                <div className="stat-value">
                  {trainingEngine.calculateAverageAccuracy().toFixed(1)}%
                </div>
                <div className="stat-label">Overall</div>
              </div>
            </div>

            <div className="category-breakdown">
              <h3>📋 Category Breakdown</h3>
              <div className="category-list">
                {Object.entries(trainingEngine.trainingData).map(([category, examples]) => (
                  <div key={category} className="category-item">
                    <span className="category-name">{category.replace(/_/g, ' ')}</span>
                    <span className="category-count">{examples.length} examples</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="quick-actions">
              <h3>⚡ Quick Actions</h3>
              <div className="action-buttons">
                <button 
                  className="btn btn-primary"
                  onClick={startTraining}
                  disabled={isTraining}
                >
                  {isTraining ? '🔄 Training...' : '🚀 Start Training'}
                </button>
                <button className="btn btn-secondary" onClick={runTests}>
                  🧪 Run Tests
                </button>
                <button className="btn btn-secondary" onClick={resetTraining}>
                  🔄 Reset Training
                </button>
                <button className="btn btn-secondary" onClick={exportData}>
                  📤 Export Data
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Training Tab */}
        {activeTab === 'training' && (
          <div className="training-section">
            <div className="training-controls">
              <h3>🚀 Model Training</h3>
              <p>Train your chatbot's ML model using the comprehensive training dataset</p>
              
              <button 
                className="btn btn-primary btn-large"
                onClick={startTraining}
                disabled={isTraining}
              >
                {isTraining ? '🔄 Training in Progress...' : '🚀 Start Training Session'}
              </button>
            </div>

            {trainingResults && (
              <div className="training-results">
                <h3>✅ Training Results</h3>
                <div className="results-grid">
                  <div className="result-card">
                    <div className="result-value">{trainingResults.totalExamples}</div>
                    <div className="result-label">Examples Processed</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{trainingResults.successfulClassifications}</div>
                    <div className="result-label">Successful</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{trainingResults.failedClassifications}</div>
                    <div className="result-label">Failed</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{trainingResults.accuracy.toFixed(2)}%</div>
                    <div className="result-label">Accuracy</div>
                  </div>
                  <div className="result-card">
                    <div className="result-value">{trainingResults.trainingTime.toFixed(2)}ms</div>
                    <div className="result-label">Training Time</div>
                  </div>
                </div>

                <div className="category-results">
                  <h4>📊 Category Results</h4>
                  <div className="category-results-grid">
                    {Object.entries(trainingResults.categoryResults).map(([category, result]) => (
                      <div key={category} className="category-result">
                        <div className="category-header">
                          <span className="category-name">{category.replace(/_/g, ' ')}</span>
                          <span className="category-accuracy">{result.accuracy.toFixed(1)}%</span>
                        </div>
                        <div className="category-stats">
                          <span>{result.successful}/{result.totalExamples} successful</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Testing Tab */}
        {activeTab === 'testing' && (
          <div className="testing-section">
            <div className="testing-controls">
              <h3>🧪 Model Testing</h3>
              <p>Test your trained model with new variations to validate improvements</p>
              
              <button className="btn btn-primary" onClick={runTests}>
                🧪 Run Test Suite
              </button>
            </div>

            {testResults && (
              <div className="test-results">
                <h3>🧪 Test Results</h3>
                <div className="test-summary">
                  <div className="test-stat">
                    <span className="stat-label">Total Tests:</span>
                    <span className="stat-value">{testResults.totalTests}</span>
                  </div>
                  <div className="test-stat">
                    <span className="stat-label">Correct:</span>
                    <span className="stat-value">{testResults.correctClassifications}</span>
                  </div>
                  <div className="test-stat">
                    <span className="stat-label">Incorrect:</span>
                    <span className="stat-value">{testResults.incorrectClassifications}</span>
                  </div>
                  <div className="test-stat">
                    <span className="stat-label">Accuracy:</span>
                    <span className="stat-value">{testResults.accuracy.toFixed(2)}%</span>
                  </div>
                </div>

                <div className="detailed-results">
                  <h4>📝 Detailed Results</h4>
                  <div className="test-results-list">
                    {testResults.detailedResults.map((result, index) => (
                      <div key={index} className={`test-result ${result.isCorrect ? 'correct' : 'incorrect'}`}>
                        <div className="test-input">
                          <strong>Input:</strong> "{result.input}"
                        </div>
                        <div className="test-prediction">
                          <span>Expected: <strong>{result.expectedIntent}</strong></span>
                          <span>Predicted: <strong>{result.predictedIntent}</strong></span>
                          <span>Confidence: <strong>{(result.confidence * 100).toFixed(1)}%</strong></span>
                        </div>
                        <div className="test-status">
                          {result.isCorrect ? '✅ Correct' : '❌ Incorrect'}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reports Tab */}
        {activeTab === 'reports' && (
          <div className="reports-section">
            <div className="reports-controls">
              <h3>📈 Training Reports</h3>
              <p>Generate comprehensive reports and export training data</p>
              
              <button 
                className="btn btn-primary"
                onClick={() => setTrainingReport(trainingEngine.generateTrainingReport())}
              >
                📊 Generate Report
              </button>
            </div>

            {trainingReport && (
              <div className="training-report">
                <h3>📊 Training Report</h3>
                <div className="report-timestamp">
                  Generated: {new Date(trainingReport.timestamp).toLocaleString()}
                </div>

                <div className="report-section">
                  <h4>🎯 Model Performance</h4>
                  <div className="performance-stats">
                    <div className="perf-stat">
                      <span>Last Training:</span>
                      <span>{new Date(trainingReport.modelPerformance.lastTraining).toLocaleString()}</span>
                    </div>
                    <div className="perf-stat">
                      <span>Overall Accuracy:</span>
                      <span>{trainingReport.modelPerformance.overallAccuracy.toFixed(2)}%</span>
                    </div>
                    <div className="perf-stat">
                      <span>Total Examples:</span>
                      <span>{trainingReport.modelPerformance.totalExamples}</span>
                    </div>
                    <div className="perf-stat">
                      <span>Training Sessions:</span>
                      <span>{trainingReport.modelPerformance.trainingHistory}</span>
                    </div>
                    <div className="perf-stat">
                      <span>Average Accuracy:</span>
                      <span>{trainingReport.modelPerformance.averageAccuracy.toFixed(2)}%</span>
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h4>📚 Dataset Summary</h4>
                  <div className="dataset-summary">
                    <div className="summary-stat">
                      <span>Total Categories:</span>
                      <span>{trainingReport.datasetSummary.totalCategories}</span>
                    </div>
                    <div className="summary-stat">
                      <span>Total Examples:</span>
                      <span>{trainingReport.datasetSummary.totalExamples}</span>
                    </div>
                  </div>
                </div>

                <div className="report-section">
                  <h4>💡 Recommendations</h4>
                  <ul className="recommendations-list">
                    {trainingReport.recommendations.map((recommendation, index) => (
                      <li key={index}>{recommendation}</li>
                    ))}
                  </ul>
                </div>

                <div className="report-actions">
                  <button className="btn btn-secondary" onClick={exportData}>
                    📤 Export Training Data
                  </button>
                  <button className="btn btn-secondary" onClick={resetTraining}>
                    🔄 Reset Training History
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default TrainingDashboard;

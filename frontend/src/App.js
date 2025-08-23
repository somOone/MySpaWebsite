import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import './styles/index.css';

// Import components
import Navigation from './components/Navigation';
import Home from './pages/Home';
import Appointments from './pages/Appointments';
import Expenses from './pages/Expenses';
import Reports from './pages/Reports';
import ChatBot from './components/ChatBot';
import TrainingDashboard from './components/chatbot/training/TrainingDashboard';
import Admin from './pages/Admin';

function App() {
  return (
    <Router>
      <div className="App">
        <Navigation />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/appointments" element={<Appointments />} />
            <Route path="/expenses" element={<Expenses />} />
            <Route path="/reports" element={<Reports />} />
            <Route path="/training" element={<TrainingDashboard />} />
            <Route path="/admin" element={<Admin />} />
          </Routes>
        </main>
        <ChatBot />
      </div>
    </Router>
  );
}

export default App;

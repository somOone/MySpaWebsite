import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => {
    return location.pathname === path;
  };

  return (
    <nav className="navigation">
      <div className="nav-container">
        <NavLink to="/" className="logo">
          🧖‍♀️ Serenity Spa
        </NavLink>
        
        <div className="nav-tabs">
          <NavLink 
            to="/" 
            className={`nav-tab ${isActive('/') ? 'active' : ''}`}
          >
            🏠 Home
          </NavLink>
          
          <NavLink 
            to="/appointments" 
            className={`nav-tab ${isActive('/appointments') ? 'active' : ''}`}
          >
            📅 Manage Appointments
          </NavLink>
          
          <NavLink 
            to="/expenses" 
            className={`nav-tab ${isActive('/expenses') ? 'active' : ''}`}
          >
            💰 Track Expenses
          </NavLink>
          
          <NavLink 
            to="/reports" 
            className={`nav-tab ${isActive('/reports') ? 'active' : ''}`}
          >
            📊 View/Generate Reports
          </NavLink>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

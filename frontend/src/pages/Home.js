import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookingModal from '../components/BookingModal';
import ExpenseModal from '../components/ExpenseModal';
import { useLocation } from 'react-router-dom';

const Home = () => {
  const location = useLocation();
  const [, setStats] = useState({
    totalAppointments: 0,
    totalRevenue: 0,
    totalClients: 0
  });
  const [spaServices, setSpaServices] = useState({
    allTime: { massages: 0, facials: 0, combos: 0 },
    currentYear: { massages: 0, facials: 0, combos: 0 }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  // Handle URL parameter for opening booking modal from chatbot
  useEffect(() => {
    const urlParams = new URLSearchParams(location.search);
    const bookAppointment = urlParams.get('bookAppointment');
    const addExpense = urlParams.get('addExpense');
    
    if (bookAppointment === 'true') {
      setIsModalOpen(true);
    }
    
    if (addExpense === 'true') {
      setIsExpenseModalOpen(true);
    }
  }, [location.search]);

  const fetchDashboardStats = async () => {
    try {
      const response = await axios.get('/api/reports/dashboard');
      setStats(response.data.totals || {
        totalAppointments: 0,
        totalRevenue: 0,
        totalClients: 0
      });
      setSpaServices(response.data.spaServices || {
        allTime: { massages: 0, facials: 0, combos: 0 },
        currentYear: { massages: 0, facials: 0, combos: 0 }
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values on error
      setStats({
        totalAppointments: 0,
        totalRevenue: 0,
        totalClients: 0
      });
      setSpaServices({
        allTime: { massages: 0, facials: 0, combos: 0 },
        currentYear: { massages: 0, facials: 0, combos: 0 }
      });
    }
  };

  const openBookingModal = () => {
    setIsModalOpen(true);
  };

  const closeBookingModal = () => {
    setIsModalOpen(false);
    // Refresh stats after booking
    fetchDashboardStats();
  };

  const openExpenseModal = () => {
    setIsExpenseModalOpen(true);
  };

  const closeExpenseModal = () => {
    setIsExpenseModalOpen(false);
    // Refresh stats after adding expense
    fetchDashboardStats();
  };

  return (
    <div className="home-page">
      {/* Compact Hero Section with All Statistics */}
      <section className="hero-section ultra-compact">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to Serenity Spa</h1>
            <p className="hero-subtitle">
              Experience ultimate relaxation and rejuvenation in our tranquil oasis
            </p>
            <div className="hero-buttons">
              <button className="cta-button primary" onClick={openBookingModal}>
                Book New Appointment
              </button>
              <button className="cta-button secondary" onClick={openExpenseModal}>
                Add New Expense
              </button>
            </div>
          </div>
          
          {/* Comprehensive Statistics Grid */}
          <div className="hero-stats-comprehensive">
            {/* Current Year Statistics */}
            <div className="stats-period current-year">
              <h3 className="period-title">This Year</h3>
              <div className="stats-grid-compact">
                <div className="stat-item-compact massage">
                  <div className="stat-icon-small">💆‍♀️</div>
                  <div className="stat-content-compact">
                    <div className="stat-number-compact">{spaServices.currentYear.massages}</div>
                    <div className="stat-label-compact">Massages</div>
                  </div>
                </div>
                
                <div className="stat-item-compact facial">
                  <div className="stat-icon-small">✨</div>
                  <div className="stat-content-compact">
                    <div className="stat-number-compact">{spaServices.currentYear.facials}</div>
                    <div className="stat-label-compact">Facials</div>
                  </div>
                </div>
                
                <div className="stat-item-compact combo">
                  <div className="stat-icon-small">🌟</div>
                  <div className="stat-content-compact">
                    <div className="stat-number-compact">{spaServices.currentYear.combos}</div>
                    <div className="stat-label-compact">Combos</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* All Time Statistics */}
            <div className="stats-period all-time">
              <h3 className="period-title">All Time</h3>
              <div className="stats-grid-compact">
                <div className="stat-item-compact massage">
                  <div className="stat-icon-small">💆‍♀️</div>
                  <div className="stat-content-compact">
                    <div className="stat-number-compact">{spaServices.allTime.massages}</div>
                    <div className="stat-label-compact">Massages</div>
                  </div>
                </div>
                
                <div className="stat-item-compact facial">
                  <div className="stat-icon-small">✨</div>
                  <div className="stat-content-compact">
                    <div className="stat-number-compact">{spaServices.allTime.facials}</div>
                    <div className="stat-label-compact">Facials</div>
                  </div>
                </div>
                
                <div className="stat-item-compact combo">
                  <div className="stat-icon-small">🌟</div>
                  <div className="stat-content-compact">
                    <div className="stat-number-compact">{spaServices.allTime.combos}</div>
                    <div className="stat-label-compact">Combos</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ultra Compact Features Grid */}
      <section className="features-grid ultra-compact">
        <div className="feature-card ultra-compact">
          <div className="feature-icon">🧖‍♀️</div>
          <h3 className="feature-title">Professional Services</h3>
          <p className="feature-description">
            Expert facials, therapeutic massages, and rejuvenating treatments 
            delivered by certified professionals.
          </p>
        </div>

        <div className="feature-card ultra-compact">
          <div className="feature-icon">🌿</div>
          <h3 className="feature-title">Natural Products</h3>
          <p className="feature-description">
            Premium organic and natural products that nourish your skin and 
            promote overall wellness.
          </p>
        </div>

        <div className="feature-card ultra-compact">
          <div className="feature-icon">✨</div>
          <h3 className="feature-title">Luxury Experience</h3>
          <p className="feature-description">
            Immerse yourself in our serene atmosphere designed for complete 
            relaxation and peace of mind.
          </p>
        </div>
      </section>

      {/* Booking Modal */}
      {isModalOpen && (
        <BookingModal 
          onClose={closeBookingModal}
          onSuccess={closeBookingModal}
        />
      )}

      {/* Expense Modal */}
      {isExpenseModalOpen && (
        <ExpenseModal 
          onClose={closeExpenseModal}
          onSuccess={closeExpenseModal}
        />
      )}
    </div>
  );
};

export default Home;

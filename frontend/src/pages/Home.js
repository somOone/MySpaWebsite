import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookingModal from '../components/BookingModal';

const Home = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalRevenue: 0,
    totalClients: 0
  });
  const [spaServices, setSpaServices] = useState({
    allTime: { massages: 0, facials: 0, combos: 0 },
    currentYear: { massages: 0, facials: 0, combos: 0 }
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

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

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <h1 className="hero-title">Welcome to Serenity Spa</h1>
        <p className="hero-subtitle">
          Experience ultimate relaxation and rejuvenation in our tranquil oasis
        </p>
        <button className="cta-button" onClick={openBookingModal}>
          Book Your Appointment
        </button>
      </section>

      {/* Features Grid */}
      <section className="features-grid">
        <div className="feature-card">
          <div className="feature-icon">🧖‍♀️</div>
          <h3 className="feature-title">Professional Services</h3>
          <p className="feature-description">
            Expert facials, therapeutic massages, and rejuvenating treatments 
            delivered by certified professionals.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🌿</div>
          <h3 className="feature-title">Natural Products</h3>
          <p className="feature-description">
            Premium organic and natural products that nourish your skin and 
            promote overall wellness.
          </p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">✨</div>
          <h3 className="feature-title">Luxury Experience</h3>
          <p className="feature-description">
            Immerse yourself in our serene atmosphere designed for complete 
            relaxation and peace of mind.
          </p>
        </div>
      </section>

      {/* Spa Service Statistics Section */}
      <section className="spa-stats-section">
        <h2 className="spa-stats-title">Our Spa Services</h2>
        <p className="spa-stats-subtitle">Experience the numbers that reflect our commitment to excellence</p>
        
        <div className="spa-stats-container">
          {/* Current Year Statistics */}
          <div className="stats-period-section">
            <h3 className="period-title">This Year ({new Date().getFullYear()})</h3>
            <div className="spa-stats-grid">
              <div className="spa-stat-card massage">
                <div className="stat-icon">💆‍♀️</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.currentYear.massages}</div>
                  <div className="stat-label">Massages Given</div>
                </div>
              </div>
              
              <div className="spa-stat-card facial">
                <div className="stat-icon">✨</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.currentYear.facials}</div>
                  <div className="stat-label">Facials Done</div>
                </div>
              </div>
              
              <div className="spa-stat-card combo">
                <div className="stat-icon">🌟</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.currentYear.combos}</div>
                  <div className="stat-label">Massage + Facial Combos</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* All Time Statistics */}
          <div className="stats-period-section">
            <h3 className="period-title">All Time</h3>
            <div className="spa-stats-grid">
              <div className="spa-stat-card massage all-time">
                <div className="stat-icon">💆‍♀️</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.allTime.massages}</div>
                  <div className="stat-label">Massages Given</div>
                </div>
              </div>
              
              <div className="spa-stat-card facial all-time">
                <div className="stat-icon">✨</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.allTime.facials}</div>
                  <div className="stat-label">Facials Done</div>
                </div>
              </div>
              
              <div className="spa-stat-card combo all-time">
                <div className="stat-icon">🌟</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.allTime.combos}</div>
                  <div className="stat-label">Massage + Facial Combos</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Booking Modal */}
      {isModalOpen && (
        <BookingModal 
          onClose={closeBookingModal}
          onSuccess={closeBookingModal}
        />
      )}
    </div>
  );
};

export default Home;

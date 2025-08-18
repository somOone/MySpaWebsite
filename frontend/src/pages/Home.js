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
      {/* Compact Hero Section with Inline Stats */}
      <section className="hero-section compact">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">Welcome to Serenity Spa</h1>
            <p className="hero-subtitle">
              Experience ultimate relaxation and rejuvenation in our tranquil oasis
            </p>
            <button className="cta-button" onClick={openBookingModal}>
              Book Your Appointment
            </button>
          </div>
          
          {/* Inline Key Statistics */}
          <div className="hero-stats">
            <div className="hero-stat-item">
              <div className="hero-stat-number">{stats.totalAppointments || 0}</div>
              <div className="hero-stat-label">Total Appointments</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-number">${(stats.totalRevenue || 0).toLocaleString()}</div>
              <div className="hero-stat-label">Total Revenue</div>
            </div>
            <div className="hero-stat-item">
              <div className="hero-stat-number">{stats.totalClients || 0}</div>
              <div className="hero-stat-label">Happy Clients</div>
            </div>
          </div>
        </div>
      </section>

      {/* Compact Features Grid */}
      <section className="features-grid compact">
        <div className="feature-card compact">
          <div className="feature-icon">🧖‍♀️</div>
          <h3 className="feature-title">Professional Services</h3>
          <p className="feature-description">
            Expert facials, therapeutic massages, and rejuvenating treatments 
            delivered by certified professionals.
          </p>
        </div>

        <div className="feature-card compact">
          <div className="feature-icon">🌿</div>
          <h3 className="feature-title">Natural Products</h3>
          <p className="feature-description">
            Premium organic and natural products that nourish your skin and 
            promote overall wellness.
          </p>
        </div>

        <div className="feature-card compact">
          <div className="feature-icon">✨</div>
          <h3 className="feature-title">Luxury Experience</h3>
          <p className="feature-description">
            Immerse yourself in our serene atmosphere designed for complete 
            relaxation and peace of mind.
          </p>
        </div>
      </section>

      {/* Compact Spa Service Statistics Section */}
      <section className="spa-stats-section compact">
        <h2 className="spa-stats-title">Our Spa Services</h2>
        
        <div className="spa-stats-container compact">
          {/* Current Year Statistics */}
          <div className="stats-period-section compact">
            <h3 className="period-title">This Year ({new Date().getFullYear()})</h3>
            <div className="spa-stats-grid compact">
              <div className="spa-stat-card massage compact">
                <div className="stat-icon">💆‍♀️</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.currentYear.massages}</div>
                  <div className="stat-label">Massages Given</div>
                </div>
              </div>
              
              <div className="spa-stat-card facial compact">
                <div className="stat-icon">✨</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.currentYear.facials}</div>
                  <div className="stat-label">Facials Done</div>
                </div>
              </div>
              
              <div className="spa-stat-card combo compact">
                <div className="stat-icon">🌟</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.currentYear.combos}</div>
                  <div className="stat-label">Massage + Facial Combos</div>
                </div>
              </div>
            </div>
          </div>
          
          {/* All Time Statistics */}
          <div className="stats-period-section compact">
            <h3 className="period-title">All Time</h3>
            <div className="spa-stats-grid compact">
              <div className="spa-stat-card massage all-time compact">
                <div className="stat-icon">💆‍♀️</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.allTime.massages}</div>
                  <div className="stat-label">Massages Given</div>
                </div>
              </div>
              
              <div className="spa-stat-card facial all-time compact">
                <div className="stat-icon">✨</div>
                <div className="stat-content">
                  <div className="stat-number">{spaServices.allTime.facials}</div>
                  <div className="stat-label">Facials Done</div>
                </div>
              </div>
              
              <div className="spa-stat-card combo all-time compact">
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

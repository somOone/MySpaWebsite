import React, { useState, useEffect } from 'react';
import axios from 'axios';
import BookingModal from '../components/BookingModal';

const Home = () => {
  const [stats, setStats] = useState({
    totalAppointments: 0,
    totalRevenue: 0,
    totalClients: 0
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
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      // Set default values on error
      setStats({
        totalAppointments: 0,
        totalRevenue: 0,
        totalClients: 0
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

      {/* Statistics Section */}
      <section className="stats-section">
        <h2 className="stats-title">Spa Statistics</h2>
        <div className="stats-grid">
          <div className="stat-item">
            <div className="stat-number">{stats.totalAppointments || 0}</div>
            <div className="stat-label">Total Appointments</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">${(stats.totalRevenue || 0).toLocaleString()}</div>
            <div className="stat-label">Total Revenue</div>
          </div>
          <div className="stat-item">
            <div className="stat-number">{stats.totalClients || 0}</div>
            <div className="stat-label">Happy Clients</div>
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

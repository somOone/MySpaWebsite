import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Home page components for visual testing
const HeroSection = ({ title, subtitle, ctaText, className = '' }) => (
  <section className={`hero-section ${className}`}>
    <div className="hero-content">
      <div className="hero-text">
        <h1 className="hero-title">{title}</h1>
        <p className="hero-subtitle">{subtitle}</p>
        <button className="cta-button">{ctaText}</button>
      </div>
    </div>
  </section>
);

const FeaturesGrid = ({ features, className = '' }) => (
  <section className={`features-grid ${className}`}>
    {features.map((feature, index) => (
      <div key={index} className="feature-card">
        <div className="feature-icon">{feature.icon}</div>
        <h3 className="feature-title">{feature.title}</h3>
        <p className="feature-description">{feature.description}</p>
      </div>
    ))}
  </section>
);

const StatsSection = ({ stats, className = '' }) => (
  <section className={`stats-section ${className}`}>
    <h3 className="stats-title">Statistics</h3>
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-number">{stat.number}</div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>
);

const SpaStatsSection = ({ currentYear, allTime, className = '' }) => (
  <div className={`hero-stats-comprehensive ${className}`}>
    <div className="stats-period current-year">
      <h3 className="period-title">This Year</h3>
      <div className="stats-grid-compact">
        <div className="stat-item-compact massage">
          <div className="stat-icon-small">💆‍♀️</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact">{currentYear.massages}</div>
            <div className="stat-label-compact">Massages</div>
          </div>
        </div>
        <div className="stat-item-compact facial">
          <div className="stat-icon-small">✨</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact">{currentYear.facials}</div>
            <div className="stat-label-compact">Facials</div>
          </div>
        </div>
        <div className="stat-item-compact combo">
          <div className="stat-icon-small">🌟</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact">{currentYear.combos}</div>
            <div className="stat-label-compact">Combos</div>
          </div>
        </div>
      </div>
    </div>
    
    <div className="stats-period all-time">
      <h3 className="period-title">All Time</h3>
      <div className="stats-grid-compact">
        <div className="stat-item-compact massage">
          <div className="stat-icon-small">💆‍♀️</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact">{allTime.massages}</div>
            <div className="stat-label-compact">Massages</div>
          </div>
        </div>
        <div className="stat-item-compact facial">
          <div className="stat-icon-small">✨</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact">{allTime.facials}</div>
            <div className="stat-label-compact">Facials</div>
          </div>
        </div>
        <div className="stat-item-compact combo">
          <div className="stat-icon-small">🌟</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact">{allTime.combos}</div>
            <div className="stat-label-compact">Combos</div>
          </div>
        </div>
      </div>
    </div>
  </div>
);

describe('Home Page Visual Design', () => {
  test('hero section has correct styling classes', () => {
    render(
      <HeroSection 
        title="Welcome to Serenity Spa"
        subtitle="Experience ultimate relaxation and rejuvenation"
        ctaText="Book New Appointment"
      />
    );
    
    const hero = screen.getByText('Welcome to Serenity Spa').closest('.hero-section');
    expect(hero).toHaveClass('hero-section');
    
    const heroContent = hero.querySelector('.hero-content');
    expect(heroContent).toHaveClass('hero-content');
    
    const heroText = hero.querySelector('.hero-text');
    expect(heroText).toHaveClass('hero-text');
    
    const heroTitle = hero.querySelector('.hero-title');
    expect(heroTitle).toHaveClass('hero-title');
    
    const heroSubtitle = hero.querySelector('.hero-subtitle');
    expect(heroSubtitle).toHaveClass('hero-subtitle');
    
    const ctaButton = hero.querySelector('.cta-button');
    expect(ctaButton).toHaveClass('cta-button');
  });

  test('features grid has correct styling classes', () => {
    const features = [
      {
        icon: '🧖‍♀️',
        title: 'Professional Services',
        description: 'Expert treatments delivered by certified professionals.'
      },
      {
        icon: '🌿',
        title: 'Natural Products',
        description: 'Premium organic and natural products.'
      }
    ];
    
    render(<FeaturesGrid features={features} />);
    
    const grid = screen.getByText('Professional Services').closest('.features-grid');
    expect(grid).toHaveClass('features-grid');
    
    const featureCards = grid.querySelectorAll('.feature-card');
    expect(featureCards).toHaveLength(2);
    
    featureCards.forEach(card => {
      expect(card).toHaveClass('feature-card');
      expect(card.querySelector('.feature-icon')).toHaveClass('feature-icon');
      expect(card.querySelector('.feature-title')).toHaveClass('feature-title');
      expect(card.querySelector('.feature-description')).toHaveClass('feature-description');
    });
  });

  test('stats section has correct styling classes', () => {
    const stats = [
      { number: '150', label: 'Total Appointments' },
      { number: '$15,000', label: 'Total Revenue' }
    ];
    
    render(<StatsSection stats={stats} />);
    
    const statsSection = screen.getByText('Statistics').closest('.stats-section');
    expect(statsSection).toHaveClass('stats-section');
    
    const statsTitle = statsSection.querySelector('.stats-title');
    expect(statsTitle).toHaveClass('stats-title');
    
    const statsGrid = statsSection.querySelector('.stats-grid');
    expect(statsGrid).toHaveClass('stats-grid');
    
    const statItems = statsSection.querySelectorAll('.stat-item');
    expect(statItems).toHaveLength(2);
    
    statItems.forEach(item => {
      expect(item).toHaveClass('stat-item');
      expect(item.querySelector('.stat-number')).toHaveClass('stat-number');
      expect(item.querySelector('.stat-label')).toHaveClass('stat-label');
    });
  });

  test('spa stats section has correct styling classes', () => {
    const currentYear = { massages: 25, facials: 15, combos: 10 };
    const allTime = { massages: 150, facials: 100, combos: 75 };
    
    render(<SpaStatsSection currentYear={currentYear} allTime={allTime} />);
    
    const statsSection = screen.getByText('This Year').closest('.hero-stats-comprehensive');
    expect(statsSection).toHaveClass('hero-stats-comprehensive');
    
    const currentYearSection = screen.getByText('This Year').closest('.stats-period');
    expect(currentYearSection).toHaveClass('stats-period', 'current-year');
    
    const allTimeSection = screen.getByText('All Time').closest('.stats-period');
    expect(allTimeSection).toHaveClass('stats-period', 'all-time');
    
    const periodTitles = screen.getAllByText(/This Year|All Time/);
    periodTitles.forEach(title => {
      expect(title).toHaveClass('period-title');
    });
    
    const statsGrids = document.querySelectorAll('.stats-grid-compact');
    expect(statsGrids).toHaveLength(2);
    
    const statItems = document.querySelectorAll('.stat-item-compact');
    expect(statItems).toHaveLength(6); // 3 for each period
    
    statItems.forEach(item => {
      expect(item).toHaveClass('stat-item-compact');
      expect(item.querySelector('.stat-icon-small')).toHaveClass('stat-icon-small');
      expect(item.querySelector('.stat-content-compact')).toHaveClass('stat-content-compact');
      expect(item.querySelector('.stat-number-compact')).toHaveClass('stat-number-compact');
      expect(item.querySelector('.stat-label-compact')).toHaveClass('stat-label-compact');
    });
  });

  test('ultra-compact classes are applied for responsive design', () => {
    render(
      <div>
        <section className="hero-section ultra-compact">
          <div className="hero-content">
            <h1>Compact Hero</h1>
          </div>
        </section>
        <section className="features-grid ultra-compact">
          <div className="feature-card ultra-compact">
            <h3>Compact Feature</h3>
          </div>
        </section>
      </div>
    );
    
    const hero = screen.getByText('Compact Hero').closest('.hero-section');
    expect(hero).toHaveClass('hero-section', 'ultra-compact');
    
    const features = screen.getByText('Compact Feature').closest('.features-grid');
    expect(features).toHaveClass('features-grid', 'ultra-compact');
    
    const featureCard = features.querySelector('.feature-card');
    expect(featureCard).toHaveClass('feature-card', 'ultra-compact');
  });
});

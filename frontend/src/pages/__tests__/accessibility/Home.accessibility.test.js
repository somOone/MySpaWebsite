import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock Home page components for accessibility testing
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
      <article key={index} className="feature-card">
        <div className="feature-icon" aria-hidden="true">{feature.icon}</div>
        <h2 className="feature-title">{feature.title}</h2>
        <p className="feature-description">{feature.description}</p>
      </article>
    ))}
  </section>
);

const StatsSection = ({ stats, className = '' }) => (
  <section className={`stats-section ${className}`}>
    <h2 className="stats-title">Statistics</h2>
    <div className="stats-grid">
      {stats.map((stat, index) => (
        <div key={index} className="stat-item">
          <div className="stat-number" aria-label={`${stat.label}: ${stat.number}`}>
            {stat.number}
          </div>
          <div className="stat-label">{stat.label}</div>
        </div>
      ))}
    </div>
  </section>
);

const SpaStatsSection = ({ currentYear, allTime, className = '' }) => (
  <div className={`hero-stats-comprehensive ${className}`}>
    <section className="stats-period current-year">
      <h3 className="period-title">This Year</h3>
      <div className="stats-grid-compact">
        <div className="stat-item-compact massage">
          <div className="stat-icon-small" aria-hidden="true">💆‍♀️</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact" aria-label={`Massages this year: ${currentYear.massages}`}>
              {currentYear.massages}
            </div>
            <div className="stat-label-compact">Massages</div>
          </div>
        </div>
        <div className="stat-item-compact facial">
          <div className="stat-icon-small" aria-hidden="true">✨</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact" aria-label={`Facials this year: ${currentYear.facials}`}>
              {currentYear.facials}
            </div>
            <div className="stat-label-compact">Facials</div>
          </div>
        </div>
        <div className="stat-item-compact combo">
          <div className="stat-icon-small" aria-hidden="true">🌟</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact" aria-label={`Combos this year: ${currentYear.combos}`}>
              {currentYear.combos}
            </div>
            <div className="stat-label-compact">Combos</div>
          </div>
        </div>
      </div>
    </section>
    
    <section className="stats-period all-time">
      <h3 className="period-title">All Time</h3>
      <div className="stats-grid-compact">
        <div className="stat-item-compact massage">
          <div className="stat-icon-small" aria-hidden="true">💆‍♀️</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact" aria-label={`Total massages: ${allTime.massages}`}>
              {allTime.massages}
            </div>
            <div className="stat-label-compact">Massages</div>
          </div>
        </div>
        <div className="stat-item-compact facial">
          <div className="stat-icon-small" aria-hidden="true">✨</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact" aria-label={`Total facials: ${allTime.facials}`}>
              {allTime.facials}
            </div>
            <div className="stat-label-compact">Facials</div>
          </div>
        </div>
        <div className="stat-item-compact combo">
          <div className="stat-icon-small" aria-hidden="true">🌟</div>
          <div className="stat-content-compact">
            <div className="stat-number-compact" aria-label={`Total combos: ${allTime.combos}`}>
              {allTime.combos}
            </div>
            <div className="stat-label-compact">Combos</div>
          </div>
        </div>
      </div>
    </section>
  </div>
);

describe('Home Page Accessibility', () => {
  test('page has proper heading hierarchy', () => {
    render(
      <div>
        <HeroSection 
          title="Welcome to Serenity Spa"
          subtitle="Experience ultimate relaxation and rejuvenation"
          ctaText="Book New Appointment"
        />
        <FeaturesGrid 
          features={[
            {
              icon: '🧖‍♀️',
              title: 'Professional Services',
              description: 'Expert treatments delivered by certified professionals.'
            }
          ]}
        />
      </div>
    );
    
    const h1 = screen.getByRole('heading', { level: 1 });
    expect(h1).toBeInTheDocument();
    expect(h1).toHaveTextContent('Welcome to Serenity Spa');
    
    const h2s = screen.getAllByRole('heading', { level: 2 });
    expect(h2s).toHaveLength(1);
    expect(h2s[0]).toHaveTextContent('Professional Services');
  });

  test('hero section has semantic structure', () => {
    render(
      <HeroSection 
        title="Welcome to Serenity Spa"
        subtitle="Experience ultimate relaxation and rejuvenation"
        ctaText="Book New Appointment"
      />
    );
    
    const hero = screen.getByText('Welcome to Serenity Spa').closest('section');
    expect(hero).toHaveClass('hero-section');
    
    const title = hero.querySelector('h1');
    expect(title).toHaveClass('hero-title');
    
    const subtitle = hero.querySelector('p');
    expect(subtitle).toHaveClass('hero-subtitle');
    
    const ctaButton = hero.querySelector('button');
    expect(ctaButton).toHaveClass('cta-button');
  });

  test('features grid uses semantic HTML elements', () => {
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
    
    const grid = screen.getByText('Professional Services').closest('section');
    expect(grid).toHaveClass('features-grid');
    
    const featureCards = grid.querySelectorAll('article');
    expect(featureCards).toHaveLength(2);
    
    featureCards.forEach(card => {
      expect(card).toHaveClass('feature-card');
      expect(card.querySelector('h2')).toBeInTheDocument();
      expect(card.querySelector('p')).toBeInTheDocument();
    });
  });

  test('feature icons are hidden from screen readers', () => {
    const features = [
      {
        icon: '🧖‍♀️',
        title: 'Professional Services',
        description: 'Expert treatments delivered by certified professionals.'
      }
    ];
    
    render(<FeaturesGrid features={features} />);
    
    const icon = screen.getByText('🧖‍♀️');
    expect(icon).toHaveAttribute('aria-hidden', 'true');
  });

  test('stats section has proper semantic structure', () => {
    const stats = [
      { number: '150', label: 'Total Appointments' },
      { number: '$15,000', label: 'Total Revenue' }
    ];
    
    render(<StatsSection stats={stats} />);
    
    const statsSection = screen.getByText('Statistics').closest('section');
    expect(statsSection).toHaveClass('stats-section');
    
    const title = statsSection.querySelector('h2');
    expect(title).toHaveClass('stats-title');
    
    const statsGrid = statsSection.querySelector('.stats-grid');
    expect(statsGrid).toBeInTheDocument();
    
    const statItems = statsSection.querySelectorAll('.stat-item');
    expect(statItems).toHaveLength(2);
  });

  test('stat numbers have descriptive aria-labels', () => {
    const stats = [
      { number: '150', label: 'Total Appointments' },
      { number: '$15,000', label: 'Total Revenue' }
    ];
    
    render(<StatsSection stats={stats} />);
    
    const appointmentStat = screen.getByLabelText('Total Appointments: 150');
    const revenueStat = screen.getByLabelText('Total Revenue: $15,000');
    
    expect(appointmentStat).toBeInTheDocument();
    expect(revenueStat).toBeInTheDocument();
  });

  test('spa stats section has proper heading hierarchy', () => {
    const currentYear = { massages: 25, facials: 15, combos: 10 };
    const allTime = { massages: 150, facials: 100, combos: 75 };
    
    render(<SpaStatsSection currentYear={currentYear} allTime={allTime} />);
    
    const h3s = screen.getAllByRole('heading', { level: 3 });
    expect(h3s).toHaveLength(2);
    expect(h3s[0]).toHaveTextContent('This Year');
    expect(h3s[1]).toHaveTextContent('All Time');
  });

  test('spa stats use semantic sections', () => {
    const currentYear = { massages: 25, facials: 15, combos: 10 };
    const allTime = { massages: 150, facials: 100, combos: 75 };
    
    render(<SpaStatsSection currentYear={currentYear} allTime={allTime} />);
    
    const currentYearSection = screen.getByText('This Year').closest('section');
    const allTimeSection = screen.getByText('All Time').closest('section');
    
    expect(currentYearSection).toHaveClass('stats-period', 'current-year');
    expect(allTimeSection).toHaveClass('stats-period', 'all-time');
  });

  test('spa stat numbers have descriptive aria-labels', () => {
    const currentYear = { massages: 25, facials: 15, combos: 10 };
    const allTime = { massages: 150, facials: 100, combos: 75 };
    
    render(<SpaStatsSection currentYear={currentYear} allTime={allTime} />);
    
    const currentYearMassage = screen.getByLabelText('Massages this year: 25');
    const allTimeMassage = screen.getByLabelText('Total massages: 150');
    
    expect(currentYearMassage).toBeInTheDocument();
    expect(allTimeMassage).toBeInTheDocument();
  });

  test('spa stat icons are hidden from screen readers', () => {
    const currentYear = { massages: 25, facials: 15, combos: 10 };
    const allTime = { massages: 150, facials: 100, combos: 75 };
    
    render(<SpaStatsSection currentYear={currentYear} allTime={allTime} />);
    
    const icons = screen.getAllByText(/[💆‍♀️✨🌟]/);
    icons.forEach(icon => {
      expect(icon).toHaveAttribute('aria-hidden', 'true');
    });
  });

  test('CTA button has accessible text content', () => {
    render(
      <HeroSection 
        title="Welcome to Serenity Spa"
        subtitle="Experience ultimate relaxation and rejuvenation"
        ctaText="Book New Appointment"
      />
    );
    
    const ctaButton = screen.getByRole('button', { name: 'Book New Appointment' });
    expect(ctaButton).toBeInTheDocument();
    expect(ctaButton).toHaveClass('cta-button');
  });

  test('page content is properly structured for screen readers', () => {
    render(
      <div>
        <main>
          <HeroSection 
            title="Welcome to Serenity Spa"
            subtitle="Experience ultimate relaxation and rejuvenation"
            ctaText="Book New Appointment"
          />
          <FeaturesGrid 
            features={[
              {
                icon: '🧖‍♀️',
                title: 'Professional Services',
                description: 'Expert treatments delivered by certified professionals.'
              }
            ]}
          />
        </main>
      </div>
    );
    
    const main = screen.getByRole('main');
    expect(main).toBeInTheDocument();
    
    const sections = main.querySelectorAll('section');
    expect(sections).toHaveLength(2);
  });

  test('statistics are presented in logical groups', () => {
    const currentYear = { massages: 25, facials: 15, combos: 10 };
    const allTime = { massages: 150, facials: 100, combos: 75 };
    
    render(<SpaStatsSection currentYear={currentYear} allTime={allTime} />);
    
    const currentYearSection = screen.getByText('This Year').closest('section');
    const allTimeSection = screen.getByText('All Time').closest('section');
    
    // Check that each section contains the expected number of stats
    const currentYearStats = currentYearSection.querySelectorAll('.stat-item-compact');
    const allTimeStats = allTimeSection.querySelectorAll('.stat-item-compact');
    
    expect(currentYearStats).toHaveLength(3);
    expect(allTimeStats).toHaveLength(3);
  });
});

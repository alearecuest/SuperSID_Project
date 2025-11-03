import React, { useState, useEffect } from 'react';
import { analysisService, SolarActivity } from '../services/analysis.service';
import '../styles/pages.css';

const SpaceWeather: React.FC = () => {
  const [current, setCurrent] = useState<SolarActivity | null>(null);
  const [forecast, setForecast] = useState<SolarActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [currentData, forecastData] = await Promise.all([
          analysisService.getCurrentSolarActivity(),
          analysisService.getSolarForecast(),
        ]);
        setCurrent(currentData);
        setForecast(forecastData);
        setError('');
      } catch (err) {
        console.error('Error loading space weather:', err);
        setError('Failed to load space weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="page-container">
        <div className="loading">Loading space weather data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="alert alert-error">{error}</div>
      </div>
    );
  }

  if (!current) return null;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Space Weather</h1>
        <p>Current solar activity and forecasts from spaceweatherlive.com</p>
      </div>

      <div className="section-card">
        <h2>Current Solar Activity</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem' }}>
          <div className="stat-box">
            <div className="stat-value" style={{ fontSize: '2.5rem', color: getSeverityColor(current.kIndex) }}>
              {current.kIndex}/9
            </div>
            <div className="stat-label">K-Index</div>
            <div className="stat-description">{getKIndexDescription(current.kIndex)}</div>
          </div>

          <div className="stat-box">
            <div className="stat-value" style={{ fontSize: '2.5rem' }}>
              {current.solarFlux}
            </div>
            <div className="stat-label">Solar Flux (SFU)</div>
          </div>

          <div className="stat-box">
            <div className="stat-value" style={{ fontSize: '2.5rem' }}>
              {current.xrayClass}
            </div>
            <div className="stat-label">X-Ray Class</div>
          </div>

          <div className="stat-box">
            <div className="stat-value" style={{ fontSize: '2.5rem' }}>
              {current.activeRegions}
            </div>
            <div className="stat-label">Active Regions</div>
          </div>

          <div className="stat-box">
            <div className="stat-value" style={{ fontSize: '2.5rem' }}>
              {current.sunspots}
            </div>
            <div className="stat-label">Sunspots</div>
          </div>

          <div className="stat-box">
            <div
              className="stat-value"
              style={{
                fontSize: '1.5rem',
                color: current.magneticStorm !== 'none' ? '#ef4444' : '#22c55e',
              }}
            >
              {current.magneticStorm}
            </div>
            <div className="stat-label">Magnetic Storm</div>
          </div>
        </div>
      </div>

      {forecast.length > 0 && (
        <div className="section-card">
          <h2>27-Day Forecast</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', gap: '1rem' }}>
            {forecast.slice(0, 10).map((day, idx) => (
              <div
                key={idx}
                style={{
                  padding: '1rem',
                  backgroundColor: 'rgba(15, 23, 42, 0.5)',
                  borderRadius: '8px',
                  border: '1px solid #1e293b',
                  textAlign: 'center',
                }}
              >
                <div style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '0.5rem' }}>
                  {new Date(day.timestamp).toLocaleDateString()}
                </div>
                <div
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 'bold',
                    color: getSeverityColor(day.kIndex),
                  }}
                >
                  {day.kIndex}/9
                </div>
                <div style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '0.5rem' }}>
                  {day.solarFlux} SFU
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
        Last updated: {new Date(current.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

function getSeverityColor(kIndex: number): string {
  if (kIndex >= 7) return '#ef4444';
  if (kIndex >= 5) return '#f97316';
  if (kIndex >= 3) return '#eab308';
  return '#22c55e';
}

function getKIndexDescription(kIndex: number): string {
  if (kIndex >= 7) return 'Severe Storm';
  if (kIndex >= 5) return 'Strong Storm';
  if (kIndex >= 3) return 'Moderate Activity';
  return 'Quiet';
}

export default SpaceWeather;
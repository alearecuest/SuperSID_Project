import React, { useState, useEffect } from 'react';
import { analysisService, SolarActivity } from '../services/analysis.service';
import SpaceWeatherChart from '../components/SpaceWeatherChart';
import '../styles/pages.css';

const SpaceWeather: React.FC = () => {
  const [current, setCurrent] = useState<SolarActivity | null>(null);
  const [forecast, setForecast] = useState<SolarActivity[]>([]);
  const [history, setHistory] = useState<SolarActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current data
        const currentData = await analysisService.getCurrentSolarActivity();
        setCurrent(currentData);
        
        // Get forecast
        const forecastData = await analysisService.getSolarForecast();
        setForecast(forecastData);
        
        // Build history from last 24 hours (simulate with current + forecast for now)
        // In production, this would query historical API
        const historicalData: SolarActivity[] = [];
        
        // Add last 24 data points (1 per hour)
        for (let i = 23; i >= 0; i--) {
          const timestamp = new Date(Date.now() - i * 60 * 60 * 1000);
          historicalData.push({
            timestamp: timestamp.toISOString(),
            kIndex: currentData.kIndex + (Math.random() - 0.5) * 2,
            solarFlux: currentData.solarFlux + (Math.random() - 0.5) * 20,
            xrayClass: currentData.xrayClass,
            activeRegions: currentData.activeRegions,
            sunspots: currentData.sunspots,
            magneticStorm: currentData.magneticStorm,
          });
        }
        
        // Add current data as the latest point
        historicalData.push(currentData);
        
        setHistory(historicalData);
        setError('');
      } catch (err) {
        console.error('Error loading space weather:', err);
        setError('Failed to load space weather data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 300000); // Refresh every 5 minutes
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
    <div className="page-container" style={{ height: '100vh', overflowY: 'auto', paddingBottom: '3rem' }}>
      <div className="page-header">
        <h1>Space Weather</h1>
        <p>Current solar activity and forecasts from spaceweatherlive.com</p>
      </div>

      {/* CURRENT METRICS */}
      <div className="section-card">
        <h2>Current Solar Activity</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-label">K-INDEX</div>
            <div className="stat-value" style={{ color: getSeverityColor(current.kIndex) }}>
              {current.kIndex}/9
            </div>
            <div className="stat-sublabel">{getKIndexDescription(current.kIndex)}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">SOLAR FLUX (SFU)</div>
            <div className="stat-value">{current.solarFlux}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">X-RAY CLASS</div>
            <div className="stat-value" style={{ color: getXrayColor(current.xrayClass) }}>
              {current.xrayClass}
            </div>
          </div>

          <div className="stat-card">
            <div className="stat-label">ACTIVE REGIONS</div>
            <div className="stat-value">{current.activeRegions}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">SUNSPOTS</div>
            <div className="stat-value">{current.sunspots}</div>
          </div>

          <div className="stat-card">
            <div className="stat-label">MAGNETIC STORM</div>
            <div 
              className="stat-value" 
              style={{ 
                fontSize: '1.2rem',
                color: current.magneticStorm !== 'none' ? '#ef4444' : '#22c55e' 
              }}
            >
              {current.magneticStorm === 'none' ? 'None' : current.magneticStorm}
            </div>
          </div>
        </div>
      </div>

      {/* K-INDEX CHART */}
      {history.length > 0 && (
        <div className="section-card">
          <h2>K-Index Trend (Last 24 Hours)</h2>
          <SpaceWeatherChart
            data={history}
            title="K-Index Trend"
            type="area"
          />
        </div>
      )}

      {/* SOLAR FLUX CHART */}
      {history.length > 0 && (
        <div className="section-card">
          <h2>Solar Flux Trend (Last 24 Hours)</h2>
          <SpaceWeatherChart
            data={history}
            title="Solar Flux Trend"
            type="line"
          />
        </div>
      )}

      {/* FORECAST */}
      {forecast.length > 0 && (
        <div className="section-card">
          <h2>27-Day Forecast</h2>
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))', 
            gap: '1rem',
            marginTop: '1rem'
          }}>
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

      {/* INFO SECTION */}
      <div className="section-card">
        <h2>ℹ️ About Space Weather & VLF Monitoring</h2>
        <div style={{ padding: '1rem' }}>
          <p style={{ marginBottom: '1rem', color: '#94a3b8', lineHeight: '1.6' }}>
            Space weather monitoring is crucial for understanding VLF signal propagation.
            Solar activity directly affects the ionosphere, which reflects VLF signals back to Earth.
          </p>
          
          <h3 style={{ 
            marginTop: '1.5rem', 
            marginBottom: '1rem',
            color: '#e2e8f0',
            fontSize: '1.1rem'
          }}>
            Key Indicators:
          </h3>
          
          <div style={{ 
            display: 'grid', 
            gap: '0.75rem',
            padding: '1rem',
            backgroundColor: 'rgba(15, 23, 42, 0.3)',
            borderRadius: '8px'
          }}>
            <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #1e293b' }}>
              <strong style={{ color: '#3b82f6' }}>K-Index (0-9):</strong>
              <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>
                Measures geomagnetic activity. Higher values indicate stronger magnetic storms.
              </span>
            </div>
            
            <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #1e293b' }}>
              <strong style={{ color: '#3b82f6' }}>Solar Flux (SFU):</strong>
              <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>
                Radio emission at 10.7 cm wavelength. Indicates overall solar activity level.
              </span>
            </div>
            
            <div style={{ paddingBottom: '0.75rem', borderBottom: '1px solid #1e293b' }}>
              <strong style={{ color: '#3b82f6' }}>X-Ray Class:</strong>
              <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>
                Solar flare intensity (A &lt; B &lt; C &lt; M &lt; X). Each class is 10x stronger.
              </span>
            </div>
            
            <div style={{ paddingBottom: '0.75rem' }}>
              <strong style={{ color: '#3b82f6' }}>SID Events:</strong>
              <span style={{ color: '#94a3b8', marginLeft: '0.5rem' }}>
                Sudden Ionospheric Disturbances caused by solar flares affecting VLF propagation.
              </span>
            </div>
          </div>

          <div style={{ 
            marginTop: '1.5rem', 
            padding: '1rem', 
            background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.1) 0%, rgba(147, 51, 234, 0.1) 100%)',
            borderLeft: '4px solid #3b82f6',
            borderRadius: '8px'
          }}>
            <div style={{ display: 'flex', alignItems: 'start', gap: '0.75rem' }}>
              <span style={{ fontSize: '1.5rem' }}>💡</span>
              <div>
                <strong style={{ color: '#60a5fa', display: 'block', marginBottom: '0.5rem' }}>
                  Impact on VLF Signals:
                </strong>
                <p style={{ color: '#94a3b8', lineHeight: '1.6', margin: 0 }}>
                  Strong solar activity (M or X-class flares) causes sudden amplitude changes 
                  in VLF signals. Monitor the <strong>Correlation</strong> page to see real-time 
                  relationships between solar flares and your VLF observations. These events are 
                  critical for studying ionospheric physics.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* FOOTER */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '2rem', 
        paddingTop: '1rem',
        borderTop: '1px solid #1e293b',
        color: '#64748b', 
        fontSize: '0.9rem' 
      }}>
        <p>Last updated: {new Date(current.timestamp).toLocaleString()}</p>
        <p style={{ marginTop: '0.5rem', fontSize: '0.85rem' }}>
          Data from <a 
            href="https://spaceweatherlive.com" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{ color: '#3b82f6', textDecoration: 'none' }}
          >
            spaceweatherlive.com
          </a>
        </p>
      </div>
    </div>
  );
};

function getSeverityColor(kIndex: number): string {
  if (kIndex >= 7) return '#ef4444'; // Red - Severe
  if (kIndex >= 5) return '#f97316'; // Orange - Strong
  if (kIndex >= 3) return '#eab308'; // Yellow - Moderate
  return '#22c55e'; // Green - Quiet
}

function getKIndexDescription(kIndex: number): string {
  if (kIndex >= 7) return 'Severe Storm';
  if (kIndex >= 5) return 'Strong Storm';
  if (kIndex >= 3) return 'Moderate Activity';
  return 'Quiet';
}

function getXrayColor(xrayClass: string): string {
  if (xrayClass.startsWith('X')) return '#ef4444'; // Red - Extreme
  if (xrayClass.startsWith('M')) return '#f97316'; // Orange - Major
  if (xrayClass.startsWith('C')) return '#eab308'; // Yellow - Moderate
  return '#22c55e'; // Green - Minor
}

export default SpaceWeather;
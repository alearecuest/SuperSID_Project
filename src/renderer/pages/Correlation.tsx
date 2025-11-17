import React, { useState, useEffect } from 'react';
import { analysisService, CorrelationData } from '../services/analysis.service';
import '../styles/pages.css';

const Correlation: React.FC<{ observatoryId?: number }> = ({ observatoryId = 999 }) => {
  const [correlation, setCorrelation] = useState<CorrelationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');
  const [refreshInterval, setRefreshInterval] = useState(60);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await analysisService.correlateData(observatoryId);
        setCorrelation(data);
        setError('');
      } catch (err) {
        console.error('Error loading correlation data:', err);
        setError('Failed to load correlation data');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, refreshInterval * 1000);
    return () => clearInterval(interval);
  }, [observatoryId, refreshInterval]);

  if (loading && !correlation) {
    return (
      <div className="page-container">
        <div className="loading">Loading correlation analysis...</div>
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

  if (!correlation) return null;

  const coef = correlation.correlationCoefficient;
  const isPositive = coef > 0;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Space Weather ↔ VLF Correlation</h1>
        <p>Analyzing the relationship between solar activity and VLF disturbances</p>
        <div style={{ marginTop: '1rem' }}>
          <label>
            Auto-refresh every
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(parseInt(e.target.value))}
              style={{
                marginLeft: '0.5rem',
                marginRight: '0.5rem',
                padding: '0.5rem',
                backgroundColor: '#1e293b',
                color: '#0ea5e9',
                border: '1px solid #334155',
                borderRadius: '4px',
              }}
            >
              <option value={30}>30 seconds</option>
              <option value={60}>1 minute</option>
              <option value={300}>5 minutes</option>
              <option value={600}>10 minutes</option>
            </select>
          </label>
        </div>
      </div>

      {/* CORRELATION COEFFICIENT */}
      <div className="section-card">
        <h2>Correlation Coefficient</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <div
              style={{
                fontSize: '4rem',
                fontWeight: 'bold',
                color: isPositive ? '#22c55e' : '#ef4444',
                marginBottom: '0.5rem',
              }}
            >
              {coef.toFixed(3)}
            </div>
            <p style={{ color: '#94a3b8', margin: 0 }}>
              {isPositive ? 'Positive Correlation' : 'Negative Correlation'}
            </p>
          </div>

          <div>
            <div style={{ marginBottom: '1rem' }}>
              <p style={{ color: '#94a3b8', marginBottom: '0.5rem' }}>Correlation Strength</p>
              <div
                style={{
                  width: '100%',
                  height: '20px',
                  backgroundColor: '#1e293b',
                  borderRadius: '10px',
                  overflow: 'hidden',
                  border: '1px solid #334155',
                }}
              >
                <div
                  style={{
                    width: `${Math.abs(coef) * 100}%`,
                    height: '100%',
                    backgroundColor: getStrengthColor(coef),
                    transition: 'width 0.5s ease',
                  }}
                />
              </div>
            </div>
            <p style={{ color: '#94a3b8', fontSize: '0.9rem', margin: 0 }}>
              {getStrengthDescription(coef)}
            </p>
          </div>
        </div>
      </div>

      {/* RELATIONSHIP */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Relationship</div>
          <div className="stat-value" style={{ fontSize: '1.25rem' }}>
            {correlation.relationship.replace(/-/g, ' ').toUpperCase()}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Confidence Level</div>
          <div className="stat-value">{correlation.confidence.toFixed(1)}%</div>
        </div>
      </div>

      {/* SUMMARY */}
      <div className="section-card">
        <h2>Analysis Summary</h2>
        <p style={{ color: '#e2e8f0', lineHeight: '1.6', fontSize: '1rem' }}>
          {correlation.summary}
        </p>
      </div>

      {/* COMPARISON */}
      <div className="section-card">
        <h2>Solar vs VLF Comparison</h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <div>
            <h3 style={{ marginTop: 0, color: '#0ea5e9' }}>Solar Activity</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>K-Index:</span>
                <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                  {correlation.solarActivity.kIndex}/9
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Solar Flux:</span>
                <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                  {correlation.solarActivity.solarFlux.toFixed(1)} SFU
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>X-Ray Class:</span>
                <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                  {correlation.solarActivity.xrayClass}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Active Regions:</span>
                <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                  {correlation.solarActivity.activeRegions}
                </span>
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ marginTop: 0, color: '#0ea5e9' }}>📡 VLF Signals</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Avg Amplitude:</span>
                <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                  {correlation.vlsSignals.averageAmplitude.toFixed(2)} dB
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Peak Amplitude:</span>
                <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                  {correlation.vlsSignals.peakAmplitude.toFixed(2)} dB
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Disturbance Index:</span>
                <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                  {correlation.vlsSignals.disturbanceIndex.toFixed(1)}%
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ color: '#94a3b8' }}>Signal Count:</span>
                <span style={{ color: '#f1f5f9', fontWeight: '600' }}>
                  {correlation.vlsSignals.signals.length}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ textAlign: 'center', marginTop: '2rem', color: '#64748b', fontSize: '0.9rem' }}>
        Last updated: {new Date(correlation.timestamp).toLocaleString()}
      </div>
    </div>
  );
};

function getStrengthColor(coef: number): string {
  const abs = Math.abs(coef);
  if (abs >= 0.8) return '#10b981';
  if (abs >= 0.6) return '#0ea5e9';
  if (abs >= 0.4) return '#f59e0b';
  return '#ef4444';
}

function getStrengthDescription(coef: number): string {
  const abs = Math.abs(coef);
  if (abs >= 0.8) return 'Very Strong correlation';
  if (abs >= 0.6) return 'Strong correlation';
  if (abs >= 0.4) return 'Moderate correlation';
  if (abs >= 0.2) return 'Weak correlation';
  return 'Very weak or no correlation';
}

export default Correlation;
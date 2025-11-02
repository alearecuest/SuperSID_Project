import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

interface DataVisualizationProps {
  stationId: number;
}

interface FrequencyData {
  frequency: number;
  amplitude: number;
  phase: number;
}

interface TimeSeriesPoint {
  timestamp: string;
  value: number;
}

const DataVisualization: React.FC<DataVisualizationProps> = ({ stationId }) => {
  const [visualizationType, setVisualizationType] = useState<'spectrogram' | 'timeseries' | 'frequency'>('spectrogram');
  const [timeRange, setTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('24h');
  const [isLoading, setIsLoading] = useState(true);
  const [frequencyData, setFrequencyData] = useState<FrequencyData[]>([]);
  const [timeSeriesData, setTimeSeriesData] = useState<TimeSeriesPoint[]>([]);

  useEffect(() => {
    loadVisualizationData();
  }, [stationId, timeRange]);

  const loadVisualizationData = async () => {
    try {
      setIsLoading(true);
      const mockFrequencyData: FrequencyData[] = [
        { frequency: 19800, amplitude: 0.85, phase: 45 },
        { frequency: 22100, amplitude: 0.72, phase: 30 },
        { frequency: 23400, amplitude: 0.91, phase: 60 },
        { frequency: 24000, amplitude: 0.88, phase: 50 },
        { frequency: 25200, amplitude: 0.79, phase: 35 },
      ];

      const mockTimeSeriesData: TimeSeriesPoint[] = Array.from({ length: 24 }, (_, i) => ({
        timestamp: new Date(Date.now() - (23 - i) * 3600000).toISOString(),
        value: Math.sin(i / 4) * 0.5 + 0.5 + Math.random() * 0.1,
      }));

      setFrequencyData(mockFrequencyData);
      setTimeSeriesData(mockTimeSeriesData);
    } catch (error) {
      console.error('Failed to load visualization data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const renderVisualization = () => {
    switch (visualizationType) {
      case 'spectrogram':
        return (
          <div className="visualization-container">
            <div className="spectrogram-placeholder">
              <div className="placeholder-content">
                <span className="placeholder-icon">📊</span>
                <p>Spectrogram View</p>
                <small>Real-time frequency analysis over time</small>
              </div>
            </div>
          </div>
        );
      case 'timeseries':
        return (
          <div className="visualization-container">
            <div className="timeseries-chart">
              <svg viewBox="0 0 800 300" className="chart-svg">
                <defs>
                  <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" style={{ stopColor: '#0ea5e9', stopOpacity: 0.3 }} />
                    <stop offset="100%" style={{ stopColor: '#0ea5e9', stopOpacity: 0 }} />
                  </linearGradient>
                </defs>
                
                {/* Grid lines */}
                {Array.from({ length: 5 }).map((_, i) => (
                  <line
                    key={`grid-${i}`}
                    x1="50"
                    y1={50 + i * 50}
                    x2="750"
                    y2={50 + i * 50}
                    stroke="#1e293b"
                    strokeWidth="1"
                  />
                ))}
                
                {/* Chart line */}
                <polyline
                  points={timeSeriesData
                    .map((d, i) => `${50 + (i / (timeSeriesData.length - 1)) * 700},${250 - d.value * 200}`)
                    .join(' ')}
                  fill="none"
                  stroke="#0ea5e9"
                  strokeWidth="2"
                />
                
                {/* Axes */}
                <line x1="50" y1="50" x2="50" y2="250" stroke="#64748b" strokeWidth="1" />
                <line x1="50" y1="250" x2="750" y2="250" stroke="#64748b" strokeWidth="1" />
              </svg>
            </div>
          </div>
        );
      case 'frequency':
        return (
          <div className="visualization-container">
            <div className="frequency-bars">
              {frequencyData.map((data, idx) => (
                <div key={idx} className="frequency-bar-item">
                  <div className="bar-label">{(data.frequency / 1000).toFixed(1)}k</div>
                  <div className="bar-container">
                    <div
                      className="bar-fill"
                      style={{ height: `${data.amplitude * 100}%` }}
                    ></div>
                  </div>
                  <div className="bar-value">{(data.amplitude * 100).toFixed(0)}%</div>
                </div>
              ))}
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading visualization...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Data Visualization</h1>
        <p>Advanced signal analysis and visualization for Station {stationId}</p>
      </div>

      {/* Controls */}
      <div className="visualization-controls">
        <div className="control-group">
          <label>Visualization Type:</label>
          <div className="button-group">
            <button
              className={`btn-control ${visualizationType === 'spectrogram' ? 'active' : ''}`}
              onClick={() => setVisualizationType('spectrogram')}
            >
              Spectrogram
            </button>
            <button
              className={`btn-control ${visualizationType === 'timeseries' ? 'active' : ''}`}
              onClick={() => setVisualizationType('timeseries')}
            >
              Time Series
            </button>
            <button
              className={`btn-control ${visualizationType === 'frequency' ? 'active' : ''}`}
              onClick={() => setVisualizationType('frequency')}
            >
              Frequency
            </button>
          </div>
        </div>

        <div className="control-group">
          <label>Time Range:</label>
          <div className="button-group">
            {(['1h', '6h', '24h', '7d'] as const).map(range => (
              <button
                key={range}
                className={`btn-control ${timeRange === range ? 'active' : ''}`}
                onClick={() => setTimeRange(range)}
              >
                {range.toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <button className="btn-primary">📥 Export Chart</button>
      </div>

      {/* Visualization */}
      <div className="section-card">
        {renderVisualization()}
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Peak Amplitude</div>
          <div className="stat-value">
            {Math.max(...frequencyData.map(d => d.amplitude)).toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Amplitude</div>
          <div className="stat-value">
            {(
              frequencyData.reduce((sum, d) => sum + d.amplitude, 0) / frequencyData.length
            ).toFixed(2)}
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Frequency Range</div>
          <div className="stat-value">
            {Math.min(...frequencyData.map(d => d.frequency)).toLocaleString()} -
            {Math.max(...frequencyData.map(d => d.frequency)).toLocaleString()} Hz
          </div>
        </div>
      </div>
    </div>
  );
};

export default DataVisualization;
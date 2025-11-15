import React, { useState, useEffect } from 'react';
import { analysisService, DashboardData, VLFSignal } from '../services/analysis.service';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import '../styles/pages.css';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardProps {
  stationId: number;
}

const Dashboard: React.FC<DashboardProps> = ({ stationId }) => {
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000); // Update every 30 seconds
    return () => clearInterval(interval);
  }, [stationId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log(`📊 Loading dashboard data for observatory ${stationId}...`);
      
      const data = await analysisService.getDashboard(stationId);
      setDashboardData(data);
      
      console.log(`✅ Dashboard data loaded: ${data.vlsData.signals.length} signals`);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      setError('Failed to load dashboard data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Prepare chart data
  const getChartData = () => {
    if (!dashboardData || !dashboardData.vlsData.signals.length) {
      return null;
    }

    const signals = dashboardData.vlsData.signals.slice(-100); // Last 100 points

    return {
      labels: signals.map(s => {
        const date = new Date(s.timestamp);
        return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      }),
      datasets: [
        {
          label: 'VLF Amplitude',
          data: signals.map(s => s.amplitude),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top' as const,
      },
      title: {
        display: true,
        text: 'VLF Signal Amplitude (Last 100 readings)',
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Amplitude (dB)',
        },
      },
      x: {
        title: {
          display: true,
          text: 'Time (UTC)',
        },
      },
    },
  };

  if (isLoading && !dashboardData) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h3>⚠️ Error</h3>
          <p>{error}</p>
          <button className="btn-primary" onClick={loadDashboardData}>
            Retry
          </button>
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="page-container">
        <div className="error-state">
          <h3>No Data Available</h3>
          <p>No dashboard data found for station {stationId}</p>
        </div>
      </div>
    );
  }

  const chartData = getChartData();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time VLF signal monitoring for Observatory {stationId}</p>
        {dashboardData.vlsData.signals.length > 0 && (
          <span className="data-badge">
            {dashboardData.vlsData.signals.length} signals loaded
          </span>
        )}
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">📡</div>
          <div className="stat-content">
            <div className="stat-label">Total Signals</div>
            <div className="stat-value">{dashboardData.vlsData.signals.length.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-label">Avg Amplitude</div>
            <div className="stat-value">{dashboardData.vlsData.averageAmplitude.toFixed(2)} dB</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">⚡</div>
          <div className="stat-content">
            <div className="stat-label">Peak Amplitude</div>
            <div className="stat-value">{dashboardData.vlsData.peakAmplitude.toFixed(2)} dB</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">🌞</div>
          <div className="stat-content">
            <div className="stat-label">Solar Activity</div>
            <div className="stat-value">{dashboardData.solarActivity.xrayClass} Class</div>
            <div className="stat-sublabel">K-Index: {dashboardData.solarActivity.kIndex}</div>
          </div>
        </div>
      </div>

      {/* VLF Signal Chart */}
      {chartData && (
        <div className="section-card">
          <div className="section-header">
            <h2>VLF Signal Timeline</h2>
            <button className="btn-secondary" onClick={loadDashboardData}>
              🔄 Refresh
            </button>
          </div>
          <div className="chart-container" style={{ height: '400px', padding: '20px' }}>
            <Line data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Space Weather Info */}
      <div className="section-card">
        <div className="section-header">
          <h2>☀️ Space Weather Conditions</h2>
        </div>
        <div className="space-weather-grid">
          <div className="weather-item">
            <span className="weather-label">X-Ray Class:</span>
            <span className="weather-value">{dashboardData.solarActivity.xrayClass}</span>
          </div>
          <div className="weather-item">
            <span className="weather-label">K-Index:</span>
            <span className="weather-value">{dashboardData.solarActivity.kIndex}</span>
          </div>
          <div className="weather-item">
            <span className="weather-label">Solar Flux:</span>
            <span className="weather-value">{dashboardData.solarActivity.solarFlux} sfu</span>
          </div>
          <div className="weather-item">
            <span className="weather-label">Active Regions:</span>
            <span className="weather-value">{dashboardData.solarActivity.activeRegions}</span>
          </div>
          <div className="weather-item">
            <span className="weather-label">Sunspots:</span>
            <span className="weather-value">{dashboardData.solarActivity.sunspots}</span>
          </div>
          <div className="weather-item">
            <span className="weather-label">Magnetic Storm:</span>
            <span className="weather-value">{dashboardData.solarActivity.magneticStorm}</span>
          </div>
        </div>
      </div>

      {/* Recent Signals Table */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recent Signal Detections</h2>
          <span className="signal-count">Last 10 signals</span>
        </div>

        <div className="signals-table">
          <div className="table-header">
            <div className="table-cell">Timestamp</div>
            <div className="table-cell">Frequency (Hz)</div>
            <div className="table-cell">Amplitude (dB)</div>
            <div className="table-cell">SNR</div>
            <div className="table-cell">Phase</div>
          </div>

          {dashboardData.vlsData.signals.slice(-10).reverse().map((signal, idx) => (
            <div key={idx} className="table-row">
              <div className="table-cell">
                <span className="timestamp">
                  {new Date(signal.timestamp).toLocaleTimeString('en-US', {
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit',
                  })}
                </span>
              </div>
              <div className="table-cell">
                <span className="frequency-badge">{signal.frequency.toLocaleString()} Hz</span>
              </div>
              <div className="table-cell">
                <div className="amplitude-bar">
                  <div
                    className="amplitude-fill"
                    style={{ width: `${Math.min((signal.amplitude / 100) * 100, 100)}%` }}
                  ></div>
                </div>
                <span className="amplitude-value">{signal.amplitude.toFixed(2)} dB</span>
              </div>
              <div className="table-cell">
                <span className="snr-value">{signal.snr.toFixed(1)} dB</span>
              </div>
              <div className="table-cell">
                <span className="phase-value">{signal.phase.toFixed(1)}°</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="btn-primary" onClick={loadDashboardData}>
          <span>🔄</span> Refresh Data
        </button>
        <button className="btn-secondary">
          <span>📥</span> Export Data
        </button>
        <button className="btn-secondary">
          <span>📊</span> View Reports
        </button>
        <button className="btn-secondary">
          <span>⚙️</span> Settings
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
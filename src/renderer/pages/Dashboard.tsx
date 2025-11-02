import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

interface DashboardProps {
  stationId: number;
}

interface SignalData {
  frequency: number;
  amplitude: number;
  timestamp: string;
}

interface StationStats {
  totalObservations: number;
  sidEventsDetected: number;
  uptime: string;
  lastUpdate: string;
}

const Dashboard: React.FC<DashboardProps> = ({ stationId }) => {
  const [stats, setStats] = useState<StationStats>({
    totalObservations: 0,
    sidEventsDetected: 0,
    uptime: '99.8%',
    lastUpdate: new Date().toISOString(),
  });

  const [recentSignals, setRecentSignals] = useState<SignalData[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadDashboardData();
    const interval = setInterval(loadDashboardData, 5000);
    return () => clearInterval(interval);
  }, [stationId]);

  const loadDashboardData = async () => {
    try {
      setIsLoading(true);
      const mockData: SignalData[] = [
        { frequency: 24000, amplitude: 0.85, timestamp: new Date().toISOString() },
        { frequency: 25200, amplitude: 0.72, timestamp: new Date(Date.now() - 60000).toISOString() },
        { frequency: 19800, amplitude: 0.91, timestamp: new Date(Date.now() - 120000).toISOString() },
      ];

      setRecentSignals(mockData);
      setStats(prev => ({
        ...prev,
        totalObservations: prev.totalObservations + 3,
        lastUpdate: new Date().toISOString(),
      }));
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading && recentSignals.length === 0) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Dashboard</h1>
        <p>Real-time VLF signal monitoring for Station {stationId}</p>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-label">Total Observations</div>
            <div className="stat-value">{stats.totalObservations.toLocaleString()}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-label">SID Events Detected</div>
            <div className="stat-value">{stats.sidEventsDetected}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-label">System Uptime</div>
            <div className="stat-value">{stats.uptime}</div>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon"></div>
          <div className="stat-content">
            <div className="stat-label">Last Update</div>
            <div className="stat-value">
              {new Date(stats.lastUpdate).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Recent Signals */}
      <div className="section-card">
        <div className="section-header">
          <h2>Recent Signal Detections</h2>
          <button className="btn-secondary">View All</button>
        </div>

        <div className="signals-table">
          <div className="table-header">
            <div className="table-cell">Frequency (Hz)</div>
            <div className="table-cell">Amplitude</div>
            <div className="table-cell">Timestamp</div>
            <div className="table-cell">Status</div>
          </div>

          {recentSignals.map((signal, idx) => (
            <div key={idx} className="table-row">
              <div className="table-cell">
                <span className="frequency-badge">{signal.frequency.toLocaleString()}</span>
              </div>
              <div className="table-cell">
                <div className="amplitude-bar">
                  <div
                    className="amplitude-fill"
                    style={{ width: `${signal.amplitude * 100}%` }}
                  ></div>
                </div>
                <span className="amplitude-value">{(signal.amplitude * 100).toFixed(0)}%</span>
              </div>
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
                <span className="status-badge status-normal">Normal</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button className="btn-primary">
          <span></span> Start Recording
        </button>
        <button className="btn-secondary">
          <span></span> Export Data
        </button>
        <button className="btn-secondary">
          <span></span> View Reports
        </button>
        <button className="btn-secondary">
          <span></span> Calibrate
        </button>
      </div>
    </div>
  );
};

export default Dashboard;
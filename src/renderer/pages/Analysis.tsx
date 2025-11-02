import React, { useState, useEffect } from 'react';
import '../styles/pages.css';

interface AnalysisProps {
  stationId: number;
}

interface AnalysisResult {
  eventType: string;
  confidence: number;
  timestamp: string;
  duration: number;
  affectedFrequencies: number[];
}

const Analysis: React.FC<AnalysisProps> = ({ stationId }) => {
  const [analysisResults, setAnalysisResults] = useState<AnalysisResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [analysisType, setAnalysisType] = useState<'sid' | 'anomaly' | 'correlation'>('sid');

  useEffect(() => {
    loadAnalysisData();
  }, [stationId, analysisType]);

  const loadAnalysisData = async () => {
    try {
      setIsLoading(true);
      const mockResults: AnalysisResult[] = [
        {
          eventType: 'SID Event',
          confidence: 0.95,
          timestamp: new Date(Date.now() - 3600000).toISOString(),
          duration: 180,
          affectedFrequencies: [19800, 22100, 23400],
        },
        {
          eventType: 'Anomaly Detected',
          confidence: 0.87,
          timestamp: new Date(Date.now() - 7200000).toISOString(),
          duration: 45,
          affectedFrequencies: [24000],
        },
        {
          eventType: 'SID Event',
          confidence: 0.92,
          timestamp: new Date(Date.now() - 10800000).toISOString(),
          duration: 240,
          affectedFrequencies: [19800, 22100, 23400, 24000, 25200],
        },
      ];
      setAnalysisResults(mockResults);
    } catch (error) {
      console.error('Failed to load analysis data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.9) return '#10b981';
    if (confidence >= 0.8) return '#f59e0b';
    return '#ef4444';
  };

  if (isLoading) {
    return (
      <div className="page-container">
        <div className="loading-state">
          <div className="spinner"></div>
          <p>Loading analysis...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <h1>Signal Analysis</h1>
        <p>Advanced analysis and event detection for Station {stationId}</p>
      </div>

      {/* Analysis Type Selection */}
      <div className="visualization-controls">
        <div className="control-group">
          <label>Analysis Type:</label>
          <div className="button-group">
            <button
              className={`btn-control ${analysisType === 'sid' ? 'active' : ''}`}
              onClick={() => setAnalysisType('sid')}
            >
              SID Events
            </button>
            <button
              className={`btn-control ${analysisType === 'anomaly' ? 'active' : ''}`}
              onClick={() => setAnalysisType('anomaly')}
            >
              Anomalies
            </button>
            <button
              className={`btn-control ${analysisType === 'correlation' ? 'active' : ''}`}
              onClick={() => setAnalysisType('correlation')}
            >
              Correlations
            </button>
          </div>
        </div>
      </div>

      {/* Results */}
      <div className="section-card">
        <div className="section-header">
          <h2>Analysis Results</h2>
          <span className="result-count">{analysisResults.length} events</span>
        </div>

        <div className="analysis-results">
          {analysisResults.map((result, idx) => (
            <div key={idx} className="result-item">
              <div className="result-header">
                <div className="result-title">
                  <h3>{result.eventType}</h3>
                  <p className="result-timestamp">
                    {new Date(result.timestamp).toLocaleString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                      second: '2-digit',
                    })}
                  </p>
                </div>
                <div className="result-confidence">
                  <div className="confidence-meter">
                    <div
                      className="confidence-fill"
                      style={{
                        width: `${result.confidence * 100}%`,
                        backgroundColor: getConfidenceColor(result.confidence),
                      }}
                    ></div>
                  </div>
                  <span className="confidence-value">
                    {(result.confidence * 100).toFixed(0)}%
                  </span>
                </div>
              </div>

              <div className="result-details">
                <div className="detail">
                  <span className="detail-label">Duration:</span>
                  <span className="detail-value">{result.duration} seconds</span>
                </div>
                <div className="detail">
                  <span className="detail-label">Affected Frequencies:</span>
                  <span className="detail-value">
                    {result.affectedFrequencies.map(f => `${f}Hz`).join(', ')}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistics */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-label">Total Events</div>
          <div className="stat-value">{analysisResults.length}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Average Confidence</div>
          <div className="stat-value">
            {(
              analysisResults.reduce((sum, r) => sum + r.confidence, 0) /
              analysisResults.length
            ).toFixed(2)}
          </div>
        </div>
				<div className="stat-card">
					<div className="stat-label">Most Common Event</div>
					<div className="stat-value">
						{(() => {
							const counts = analysisResults.reduce((prev, current) => {
								prev[current.eventType] = (prev[current.eventType] || 0) + 1;
								return prev;
							}, {} as Record<string, number>);
							
							const entries = Object.entries(counts);
							if (entries.length === 0) return 'N/A';

							const mostCommon = entries.reduce((a, b) => 
								b[1] > a[1] ? b : a
							);
							
							return mostCommon[0];
						})()}
					</div>
				</div>
      </div>
    </div>
  );
};

export default Analysis;
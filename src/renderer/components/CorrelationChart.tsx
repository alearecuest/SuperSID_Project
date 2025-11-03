import React from 'react';
import {
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface CorrelationPoint {
  solarIndex: number;
  vlfIndex: number;
  timestamp: string;
}

interface CorrelationChartProps {
  data: CorrelationPoint[];
  coefficient: number;
}

const CorrelationChart: React.FC<CorrelationChartProps> = ({
  data,
  coefficient,
}) => {
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      return (
        <div
          style={{
            backgroundColor: 'rgba(30, 41, 59, 0.95)',
            padding: '0.75rem',
            borderRadius: '8px',
            border: '1px solid #0ea5e9',
          }}
        >
          <p style={{ color: '#0ea5e9', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            Solar: {payload[0].payload.solarIndex?.toFixed(2)}
          </p>
          <p style={{ color: '#10b981', margin: '0.25rem 0', fontSize: '0.9rem' }}>
            VLF: {payload[0].payload.vlfIndex?.toFixed(2)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div
      style={{
        background: 'rgba(30, 41, 59, 0.4)',
        border: '1px solid #1e293b',
        borderRadius: '0.75rem',
        padding: '1.5rem',
        marginBottom: '2rem',
      }}
    >
      <div style={{ marginBottom: '1rem' }}>
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#f1f5f9' }}>
          Solar Activity vs VLF Correlation
        </h3>
        <p
          style={{
            margin: 0,
            fontSize: '0.9rem',
            color: coefficient > 0 ? '#10b981' : '#ef4444',
          }}
        >
          Coefficient: <strong>{coefficient.toFixed(3)}</strong>
        </p>
      </div>

      <ResponsiveContainer width="100%" height={300}>
        <ScatterChart
          margin={{ top: 20, right: 20, bottom: 20, left: 20 }}
          data={data}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
          <XAxis
            dataKey="solarIndex"
            name="Solar Index"
            stroke="#64748b"
            style={{ fontSize: '0.85rem' }}
          />
          <YAxis
            dataKey="vlfIndex"
            name="VLF Index"
            stroke="#64748b"
            style={{ fontSize: '0.85rem' }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Scatter
            name="Data Points"
            data={data}
            fill="#0ea5e9"
            shape="circle"
          />
        </ScatterChart>
      </ResponsiveContainer>
    </div>
  );
};

export default CorrelationChart;
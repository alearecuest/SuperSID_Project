import React from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface VLFSignal {
  timestamp: string;
  frequency: number;
  amplitude: number;
  phase: number;
  snr: number;
  quality: number;
}

interface VLFSignalsChartProps {
  data: VLFSignal[];
  title: string;
  type?: 'line' | 'bar';
}

const VLFSignalsChart: React.FC<VLFSignalsChartProps> = ({
  data,
  title,
  type = 'line',
}) => {
  const formattedData = data.slice(-50).map((point, idx) => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    }),
    index: idx,
  }));

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
          {payload.map((entry: any, index: number) => (
            <p
              key={index}
              style={{
                color: entry.color,
                margin: '0.25rem 0',
                fontSize: '0.9rem',
              }}
            >
              {entry.name}: {entry.value?.toFixed(2) || entry.value}
            </p>
          ))}
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
      <h3 style={{ margin: '0 0 1rem 0', color: '#f1f5f9' }}>{title}</h3>
      <ResponsiveContainer width="100%" height={300}>
        {type === 'bar' ? (
          <BarChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              style={{ fontSize: '0.8rem' }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis stroke="#64748b" style={{ fontSize: '0.85rem' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#94a3b8', fontSize: '0.9rem' }}
            />
            <Bar
              dataKey="amplitude"
              fill="#0ea5e9"
              name="Amplitude (dB)"
              radius={[8, 8, 0, 0]}
            />
            <Bar dataKey="quality" fill="#10b981" name="Quality (%)" />
          </BarChart>
        ) : (
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="index"
              stroke="#64748b"
              style={{ fontSize: '0.85rem' }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: '0.85rem' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#94a3b8', fontSize: '0.9rem' }}
            />
            <Line
              type="monotone"
              dataKey="amplitude"
              stroke="#0ea5e9"
              dot={false}
              name="Amplitude (dB)"
              isAnimationActive={true}
            />
            <Line
              type="monotone"
              dataKey="snr"
              stroke="#f59e0b"
              dot={false}
              name="SNR (dB)"
              isAnimationActive={true}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default VLFSignalsChart;
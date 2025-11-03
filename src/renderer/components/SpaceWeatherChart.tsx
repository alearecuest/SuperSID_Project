import React from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface ChartDataPoint {
  timestamp: string;
  kIndex?: number;
  solarFlux?: number;
  xrayClass?: string;
  time?: string;
}

interface SpaceWeatherChartProps {
  data: ChartDataPoint[];
  title: string;
  type?: 'line' | 'area';
}

const SpaceWeatherChart: React.FC<SpaceWeatherChartProps> = ({
  data,
  title,
  type = 'line',
}) => {
  const formattedData = data.map(point => ({
    ...point,
    time: new Date(point.timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    }),
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
        {type === 'area' ? (
          <AreaChart data={formattedData}>
            <defs>
              <linearGradient id="colorKIndex" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.8} />
                <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
              stroke="#64748b"
              style={{ fontSize: '0.85rem' }}
            />
            <YAxis stroke="#64748b" style={{ fontSize: '0.85rem' }} />
            <Tooltip content={<CustomTooltip />} />
            <Legend
              wrapperStyle={{ color: '#94a3b8', fontSize: '0.9rem' }}
            />
            <Area
              type="monotone"
              dataKey="kIndex"
              stroke="#0ea5e9"
              fillOpacity={1}
              fill="url(#colorKIndex)"
              name="K-Index"
            />
          </AreaChart>
        ) : (
          <LineChart data={formattedData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
            <XAxis
              dataKey="time"
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
              dataKey="solarFlux"
              stroke="#10b981"
              dot={false}
              isAnimationActive={true}
              name="Solar Flux (SFU)"
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
};

export default SpaceWeatherChart;
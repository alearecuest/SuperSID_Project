import React, { useMemo } from 'react';
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
  Area,
  AreaChart,
} from 'recharts';

export interface ChartData {
  [key: string]: any;
}

interface ChartProps {
  data: ChartData[];
  type?: 'line' | 'bar' | 'area';
  dataKey: string;
  xAxisKey: string;
  title?: string;
  height?: number;
  showLegend?: boolean;
  showGrid?: boolean;
  color?: string;
}

const Chart: React.FC<ChartProps> = ({
  data,
  type = 'line',
  dataKey,
  xAxisKey,
  title,
  height = 300,
  showLegend = true,
  showGrid = true,
  color = '#0ea5e9',
}) => {
  const chartData = useMemo(() => data, [data]);

  const renderChart = () => {
    switch (type) {
      case 'bar':
        return (
          <BarChart data={chartData} height={height}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f35',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            {showLegend && <Legend />}
            <Bar dataKey={dataKey} fill={color} radius={[8, 8, 0, 0]} />
          </BarChart>
        );

      case 'area':
        return (
          <AreaChart data={chartData} height={height}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f35',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            {showLegend && <Legend />}
            <Area
              type="monotone"
              dataKey={dataKey}
              fill={color}
              stroke={color}
              fillOpacity={0.3}
            />
          </AreaChart>
        );

      case 'line':
      default:
        return (
          <LineChart data={chartData} height={height}>
            {showGrid && <CartesianGrid strokeDasharray="3 3" stroke="#334155" />}
            <XAxis dataKey={xAxisKey} stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip
              contentStyle={{
                backgroundColor: '#1a1f35',
                border: '1px solid #334155',
                borderRadius: '8px',
              }}
              labelStyle={{ color: '#f1f5f9' }}
            />
            {showLegend && <Legend />}
            <Line
              type="monotone"
              dataKey={dataKey}
              stroke={color}
              dot={false}
              isAnimationActive={true}
            />
          </LineChart>
        );
    }
  };

  return (
    <div className="chart-container">
      {title && <h3 className="chart-title">{title}</h3>}
      <ResponsiveContainer width="100%" height={height}>
        {renderChart()}
      </ResponsiveContainer>
    </div>
  );
};

export default Chart;
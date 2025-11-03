import React from 'react';
import { render, screen } from '@testing-library/react';
import SpaceWeatherChart from '../SpaceWeatherChart';

describe('SpaceWeatherChart', () => {
  const mockData = [
    {
      timestamp: '2025-11-03T17:00:00Z',
      kIndex: 3,
      solarFlux: 150,
    },
    {
      timestamp: '2025-11-03T18:00:00Z',
      kIndex: 4,
      solarFlux: 160,
    },
  ];

  it('renders chart title', () => {
    render(
      <SpaceWeatherChart
        data={mockData}
        title="Test Chart"
        type="line"
      />
    );

    expect(screen.getByText('Test Chart')).toBeInTheDocument();
  });

  it('renders with area chart type', () => {
    const { container } = render(
      <SpaceWeatherChart
        data={mockData}
        title="Area Chart"
        type="area"
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('renders with line chart type', () => {
    const { container } = render(
      <SpaceWeatherChart
        data={mockData}
        title="Line Chart"
        type="line"
      />
    );

    expect(container).toBeInTheDocument();
  });

  it('handles empty data', () => {
    render(
      <SpaceWeatherChart
        data={[]}
        title="Empty Chart"
        type="line"
      />
    );

    expect(screen.getByText('Empty Chart')).toBeInTheDocument();
  });
});
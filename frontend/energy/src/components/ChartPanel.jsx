import { Card } from 'react-bootstrap';
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useState, useEffect } from 'react';
import './ChartPanel.css';

function ChartPanel({ title, data = [], dataKey = 'value', xAxisKey = 'timestamp', unit = '', type = 'line', color = '#007bff' }) {
  const [chartHeight, setChartHeight] = useState(300);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 576) {
        setChartHeight(200);
      } else if (window.innerWidth < 768) {
        setChartHeight(250);
      } else {
        setChartHeight(300);
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);
  // Format data for charts
  const formattedData = data.map(item => ({
    ...item,
    timestamp: new Date(item.captured_at || item.timestamp).toLocaleTimeString('ro-RO', {
      hour: '2-digit',
      minute: '2-digit'
    }),
    value: parseFloat(item.value)
  }));

  const ChartComponent = type === 'area' ? AreaChart : LineChart;
  const DataComponent = type === 'area' ? Area : Line;

  return (
    <Card className="chart-panel">
      <Card.Header>
        <h5 className="mb-0">{title}</h5>
      </Card.Header>
      <Card.Body>
        {formattedData.length === 0 ? (
          <div className="no-data-message">
            <p>No data available</p>
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={chartHeight}>
            <ChartComponent data={formattedData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey={xAxisKey}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                tick={{ fontSize: 12 }}
                label={{ value: unit, angle: -90, position: 'insideLeft' }}
              />
              <Tooltip 
                contentStyle={{ backgroundColor: 'rgba(255,255,255,0.95)' }}
                formatter={(value) => [value.toFixed(2), dataKey]}
              />
              <Legend />
              <DataComponent
                type="monotone"
                dataKey={dataKey}
                stroke={color}
                fill={type === 'area' ? color : undefined}
                fillOpacity={type === 'area' ? 0.3 : undefined}
                strokeWidth={2}
                dot={false}
                name={title}
              />
            </ChartComponent>
          </ResponsiveContainer>
        )}
      </Card.Body>
    </Card>
  );
}

export default ChartPanel;

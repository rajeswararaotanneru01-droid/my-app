import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { SentimentData } from '../../../types';
import { useChartTheme, ChartTooltip } from './chartTheme';

interface SentimentTrendChartProps {
  data: SentimentData;
}

const SentimentTrendChart: React.FC<SentimentTrendChartProps> = ({ data }) => {
  const theme = useChartTheme();

  const chartData = data.labels.map((label, index) => ({
    name: label,
    Frustration: data.data[index],
  }));

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={chartData} margin={{ top: 5, right: 30, left: -10, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="name" tick={{ fill: theme.text, fontSize: 12 }} />
        <YAxis tick={{ fill: theme.text, fontSize: 12 }} domain={[0, 1]} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 14 }}/>
        <Line 
            type="monotone" 
            dataKey="Frustration" 
            stroke={theme.p2}
            strokeWidth={2} 
            dot={{ r: 4, fill: theme.p2, strokeWidth: 2, stroke: theme.p2 }}
            activeDot={{ r: 8, stroke: theme.tooltipBg, strokeWidth: 2 }}
            connectNulls
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default SentimentTrendChart;

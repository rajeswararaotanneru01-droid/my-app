import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Label } from 'recharts';
import type { AvgResolutionTimeData } from '../../../types';
import { useChartTheme } from './chartTheme';

interface AvgResolutionTimeChartProps {
  data: AvgResolutionTimeData[];
}

const CustomTooltipContent: React.FC<any> = ({ active, payload, label }) => {
  const theme = useChartTheme();
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="p-3 bg-light-card dark:bg-dark-card shadow-lg rounded-lg border border-light-border dark:border-dark-border text-sm">
        <p className="font-bold mb-2 text-light-text dark:text-dark-text">{label}</p>
        <p><span className="text-gray-500 dark:text-gray-400">Avg. Time:</span> <span className="font-semibold">{data['Avg Hours']} hours</span></p>
        {data.ticketCount && <p><span className="text-gray-500 dark:text-gray-400">Based on:</span> <span className="font-semibold">{data.ticketCount.toLocaleString()} tickets</span></p>}
      </div>
    );
  }
  return null;
};

const AvgResolutionTimeChart: React.FC<AvgResolutionTimeChartProps> = ({ data }) => {
  const theme = useChartTheme();

  const sortedData = [...data].sort((a, b) => b['Avg Hours'] - a['Avg Hours']);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} margin={{ top: 5, right: 30, left: 20, bottom: 90 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis 
            dataKey="name" 
            tick={{ fill: theme.text, fontSize: 12 }} 
            angle={-45} 
            textAnchor="end" 
            interval={0} 
            height={80}
        />
        <YAxis tick={{ fill: theme.text, fontSize: 12 }}>
            <Label value="Avg. Hours to Resolve" position="insideLeft" angle={-90} style={{ textAnchor: 'middle', fill: theme.text, fontSize: 14 }} />
        </YAxis>
        <Tooltip
          content={<CustomTooltipContent />}
          cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }}
        />
        <Bar dataKey="Avg Hours" fill={theme.p1} radius={[4, 4, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default AvgResolutionTimeChart;

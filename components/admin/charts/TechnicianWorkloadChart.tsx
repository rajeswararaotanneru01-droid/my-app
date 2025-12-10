import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import type { TechnicianWorkloadData } from '../../../types';
import { useChartTheme, ChartTooltip } from './chartTheme';

interface TechnicianWorkloadChartProps {
  data: TechnicianWorkloadData[];
}

const TechnicianWorkloadChart: React.FC<TechnicianWorkloadChartProps> = ({ data }) => {
  const theme = useChartTheme();

  const sortedData = [...data].sort((a, b) => a.tickets - b.tickets);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis type="number" tick={{ fill: theme.text, fontSize: 12 }} />
        <YAxis dataKey="name" type="category" tick={{ fill: theme.text, fontSize: 12 }} width={100} />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
        <Bar dataKey="tickets" name="Assigned Tickets" fill={theme.forecast} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default TechnicianWorkloadChart;

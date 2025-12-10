import React from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { TicketStatusData } from '../../../types';
import { useChartTheme, ChartTooltip } from './chartTheme';

interface TicketStatusChartProps {
  data: TicketStatusData[];
}

const TicketStatusChart: React.FC<TicketStatusChartProps> = ({ data }) => {
  const theme = useChartTheme();
  const chartColors = [theme.accent1, theme.p2, theme.p3, theme.p1, theme.subtleText, theme.accent2, theme.accent3];

  const totalValue = data.reduce((sum, entry) => sum + entry.value, 0);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          cx="50%"
          cy="50%"
          labelLine={false}
          outerRadius="85%"
          innerRadius="60%"
          fill="#8884d8"
          dataKey="value"
          nameKey="name"
          paddingAngle={3}
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={chartColors[index % chartColors.length]} />
          ))}
        </Pie>
        <Tooltip content={<ChartTooltip />} />
        <Legend iconType="circle" wrapperStyle={{ fontSize: '14px', bottom: 0 }} />
         <text x="50%" y="50%" textAnchor="middle" dominantBaseline="central"
            className="text-3xl font-bold"
            style={{ fill: theme.text }}>
            {totalValue.toLocaleString()}
        </text>
        <text x="50%" y="50%" dy={24} textAnchor="middle"
            className="text-sm"
            style={{ fill: theme.subtleText }}>
            Total Tickets
        </text>
      </PieChart>
    </ResponsiveContainer>
  );
};

export default TicketStatusChart;

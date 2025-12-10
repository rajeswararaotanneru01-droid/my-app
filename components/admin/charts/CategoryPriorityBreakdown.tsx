import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import type { CategoryPriorityBreakdownData } from '../../../types';
import { useChartTheme, ChartTooltip } from './chartTheme';

interface CategoryPriorityBreakdownProps {
  data: CategoryPriorityBreakdownData[];
}

const CategoryPriorityBreakdownChart: React.FC<CategoryPriorityBreakdownProps> = ({ data }) => {
  const theme = useChartTheme();

  const priorityNames = {
      p1: 'High Priority',
      p2: 'Medium Priority',
      p3: 'Low Priority'
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout="vertical"
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 25,
        }}
        barSize={20}
      >
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis type="number" tick={{ fill: theme.text, fontSize: 12 }} />
        <YAxis
          dataKey="name"
          type="category"
          tick={{ fill: theme.text, fontSize: 12 }}
          width={150}
          interval={0}
        />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
        <Legend wrapperStyle={{ fontSize: 14, paddingTop: '20px' }} iconType="circle" />
        <Bar dataKey="p3" name={priorityNames.p3} stackId="a" fill={theme.p3} radius={[4, 0, 0, 4]} />
        <Bar dataKey="p2" name={priorityNames.p2} stackId="a" fill={theme.p2} />
        <Bar dataKey="p1" name={priorityNames.p1} stackId="a" fill={theme.p1} radius={[0, 4, 4, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
};

export default CategoryPriorityBreakdownChart;

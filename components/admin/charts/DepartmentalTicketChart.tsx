import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LabelList } from 'recharts';
import type { DepartmentalTicketData } from '../../../types';
import { useChartTheme, ChartTooltip } from './chartTheme';

interface DepartmentalTicketChartProps {
  data: DepartmentalTicketData[];
}

const DepartmentalTicketChart: React.FC<DepartmentalTicketChartProps> = ({ data }) => {
  const theme = useChartTheme();
  
  if (!data || data.length === 0) {
    return (
        <div className="flex items-center justify-center h-full text-center text-gray-500 dark:text-gray-400">
            <p>No departmental data available. <br/> Please train a model from the Knowledge Base page to see this chart.</p>
        </div>
    );
  }

  // Sort ascending for horizontal bar chart (so largest bar is at the top)
  const sortedData = [...data].sort((a, b) => a.Total - b.Total);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={sortedData} layout="vertical" margin={{ top: 5, right: 40, left: 20, bottom: 5 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis type="number" tick={{ fill: theme.text, fontSize: 12 }} />
        <YAxis
            dataKey="name"
            type="category"
            tick={{ fill: theme.text, fontSize: 12 }}
            width={150} // Allocate more space for long names
            interval={0}
            />
        <Tooltip content={<ChartTooltip />} cursor={{ fill: 'rgba(128, 128, 128, 0.1)' }} />
        <Bar dataKey="Total" fill={theme.p3} radius={[0, 4, 4, 0]}>
          <LabelList dataKey="Total" position="right" style={{ fill: theme.text, fontSize: 12 }} />
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
};

export default DepartmentalTicketChart;

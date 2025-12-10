import React from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import type { TicketVolumeForecastDataPoint } from '../../../types';
import { useChartTheme, ChartTooltip } from './chartTheme';

interface TicketVolumeForecastChartProps {
  data: TicketVolumeForecastDataPoint[];
}

const TicketVolumeForecastChart: React.FC<TicketVolumeForecastChartProps> = ({ data }) => {
  const theme = useChartTheme();

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorActual" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.actual} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={theme.actual} stopOpacity={0}/>
          </linearGradient>
          <linearGradient id="colorForecast" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor={theme.forecast} stopOpacity={0.8}/>
            <stop offset="95%" stopColor={theme.forecast} stopOpacity={0}/>
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke={theme.grid} />
        <XAxis dataKey="day" tick={{ fill: theme.text, fontSize: 12 }} />
        <YAxis tick={{ fill: theme.text, fontSize: 12 }} />
        <Tooltip content={<ChartTooltip />} />
        <Legend wrapperStyle={{ fontSize: 14 }}/>
        <Area 
            type="monotone" 
            dataKey="actual" 
            stroke={theme.actual}
            strokeWidth={2}
            fillOpacity={1} 
            fill="url(#colorActual)" 
            name="Actual Tickets"
        />
         <Area 
            type="monotone" 
            dataKey="forecast" 
            stroke={theme.forecast}
            strokeWidth={2}
            strokeDasharray="5 5"
            fillOpacity={1} 
            fill="url(#colorForecast)" 
            name="Forecasted Tickets"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

export default TicketVolumeForecastChart;

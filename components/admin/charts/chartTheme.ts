import React from 'react';
import { useTheme } from '../../../hooks/useTheme';

const THEME_COLORS = {
    light: {
        text: '#1F2937',
        subtleText: '#6B7280',
        grid: '#E5E7EB',
        tooltipBg: '#FFFFFF',
        tooltipBorder: '#F3F4F6',
        p1: '#ef4444', // red-500
        p2: '#f59e0b', // amber-500
        p3: '#3b82f6', // blue-500
        forecast: '#8b5cf6', // violet-500
        actual: '#0ea5e9', // cyan-500
        accent1: '#10b981', // emerald-500
        accent2: '#6366f1', // indigo-500
        accent3: '#ec4899', // pink-500
    },
    dark: {
        text: '#F3F4F6',
        subtleText: '#9CA3AF',
        grid: '#374151',
        tooltipBg: '#1F2937',
        tooltipBorder: '#374151',
        p1: '#f87171', // red-400
        p2: '#facc15', // amber-400
        p3: '#60a5fa', // blue-400
        forecast: '#a78bfa', // violet-400
        actual: '#22d3ee', // cyan-400
        accent1: '#34d399', // emerald-400
        accent2: '#818cf8', // indigo-400
        accent3: '#f472b6', // pink-400
    }
};

export const useChartTheme = () => {
    const { theme } = useTheme();
    return theme === 'light' ? THEME_COLORS.light : THEME_COLORS.dark;
};

export const ChartTooltip: React.FC<any> = ({ active, payload, label, formatter }) => {
    const theme = useChartTheme();

    if (active && payload && payload.length) {
        // FIX: Replaced JSX with React.createElement to be valid in a .ts file
        return React.createElement(
            'div',
            { className: "p-3 bg-light-card dark:bg-dark-card shadow-lg rounded-lg border border-light-border dark:border-dark-border text-sm" },
            React.createElement('p', { className: "font-bold mb-2 text-light-text dark:text-dark-text" }, label),
            React.createElement('ul', { className: "space-y-1" },
                payload.map((entry: any, index: number) =>
                    React.createElement('li', { key: `item-${index}`, className: "flex items-center justify-between" },
                        React.createElement('div', { className: "flex items-center" },
                            React.createElement('span', { className: "block w-2.5 h-2.5 rounded-full mr-2", style: { backgroundColor: entry.color || entry.fill } }),
                            React.createElement('span', { className: "text-gray-500 dark:text-gray-400" }, `${entry.name}:`)
                        ),
                        React.createElement('span', { className: "font-semibold ml-4 text-light-text dark:text-dark-text" },
                            formatter ? formatter(entry.value, entry.name) : (typeof entry.value === 'number' ? entry.value.toLocaleString() : entry.value)
                        )
                    )
                )
            )
        );
    }

    return null;
};

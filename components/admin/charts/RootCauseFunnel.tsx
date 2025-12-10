
import React from 'react';
import { ResponsiveContainer, Treemap } from 'recharts';
import type { RootCauseData } from '../../../types';
import { useTheme } from '../../../hooks/useTheme';

interface RootCauseFunnelProps {
  data: RootCauseData[];
  onBarClick: (cause: string) => void;
  selectedCause: string | null;
}

const CustomizedContent: React.FC<any> = ({
  depth, x, y, width, height, name, tickets, selectedCause, onBarClick, colors,
}) => {
  // Only render the actual data tiles, not the root container
  if (depth < 1) return null;

  const isSelected = name === selectedCause;
  const fill = isSelected ? colors.accentHover : colors.accent;
  const opacity = isSelected ? 1 : 0.9;

  // Check if box is big enough for text
  const canFitText = width > 50 && height > 35;
  
  // Calculate font size dynamically but clamp it for readability
  // Adjusted logic: proportionally scale but keep between 11px and 15px
  const fontSize = Math.max(11, Math.min(width / 7, height / 4, 15));

  return (
    <g>
      <rect
        x={x}
        y={y}
        width={width}
        height={height}
        rx={4} // Rounded corners
        ry={4}
        style={{
          fill,
          opacity,
          stroke: '#fff', // Keep white stroke for separation
          strokeWidth: 2,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        }}
        onClick={() => onBarClick(name)}
      />
      {canFitText && (
        <text
          x={x + width / 2}
          y={y + height / 2}
          textAnchor="middle"
          dominantBaseline="middle"
          fill="#fff"
          style={{
            fontSize: `${fontSize}px`,
            fontWeight: 600,
            fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
            pointerEvents: 'none',
            textShadow: '0 1px 2px rgba(0,0,0,0.15)', // Softer, cleaner shadow
            letterSpacing: '0.01em',
          }}
        >
          <tspan x={x + width / 2} dy="-0.6em">{name}</tspan>
          <tspan 
            x={x + width / 2} 
            dy="1.4em" 
            style={{ 
                fontSize: `${fontSize * 0.85}px`, 
                fontWeight: 400, 
                opacity: 0.9 
            }}
          >
            {tickets.toLocaleString()}
          </tspan>
        </text>
      )}
    </g>
  );
};


const RootCauseFunnel: React.FC<RootCauseFunnelProps> = ({ data, onBarClick, selectedCause }) => {
  const { theme } = useTheme();
  const colors = theme === 'light' 
    ? { text: '#1F2937', accent: '#0ea5e9', accentHover: '#0284c7', grid: '#F3F4F6' }
    : { text: '#F3F4F6', accent: '#38bdf8', accentHover: '#0284c7', grid: '#1f2937' };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <Treemap
        data={data}
        dataKey="tickets"
        ratio={16 / 9}
        stroke="none" // Handled in CustomContent
        content={
            <CustomizedContent 
                colors={colors} 
                selectedCause={selectedCause} 
                onBarClick={onBarClick} 
            />
        }
        isAnimationActive={true}
        animationDuration={500}
      />
    </ResponsiveContainer>
  );
};

export default RootCauseFunnel;

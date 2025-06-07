import React from 'react';
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const StockChart: React.FC = () => {
  const data = [
    { date: 'Jun 01', user: 100000, monkey: 100000 },
    { date: 'Jun 02', user: 102000, monkey: 101000 },
    { date: 'Jun 03', user: 101500, monkey: 102000 },
    { date: 'Jun 04', user: 103000, monkey: 101500 },
    { date: 'Jun 05', user: 105000, monkey: 103000 },
    { date: 'Jun 06', user: 106500, monkey: 104000 },
    { date: 'Jun 07', user: 108000, monkey: 106000 },
    { date: 'Jun 08', user: 107500, monkey: 107000 },
    { date: 'Jun 09', user: 109000, monkey: 107500 },
    { date: 'Jun 10', user: 110500, monkey: 109000 },
    { date: 'Jun 11', user: 112000, monkey: 110000 },
    { date: 'Jun 12', user: 111000, monkey: 111500 },
    { date: 'Jun 13', user: 113500, monkey: 112000 },
    { date: 'Jun 14', user: 115000, monkey: 112500 },
  ];

  const formatYAxis = (value: number) => {
    if (value >= 1000000) {
      return `$${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `$${(value / 1000).toFixed(0)}K`;
    }
    return `$${value}`;
  };

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-dark-100 border border-dark-100 p-2 rounded-md shadow-lg">
          <p className="text-xs font-medium">{label}</p>
          <p className="text-xs text-success-500">
            You: {formatYAxis(payload[0].value)}
          </p>
          <p className="text-xs text-warning-500">
            Monkey: {formatYAxis(payload[1].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart
        data={data}
        margin={{ top: 5, right: 5, left: 5, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="#2D3748" vertical={false} />
        <XAxis 
          dataKey="date" 
          tick={{ fontSize: 12, fill: '#718096' }} 
          axisLine={{ stroke: '#2D3748' }}
          tickLine={false}
        />
        <YAxis 
          tickFormatter={formatYAxis} 
          tick={{ fontSize: 12, fill: '#718096' }} 
          axisLine={{ stroke: '#2D3748' }}
          tickLine={false}
        />
        <Tooltip content={<CustomTooltip />} />
        <ReferenceLine y={100000} stroke="#4A5568" strokeDasharray="3 3" />
        <Line 
          type="monotone" 
          dataKey="user" 
          stroke="#6366F1" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: '#6366F1', stroke: '#FFF', strokeWidth: 2 }}
        />
        <Line 
          type="monotone" 
          dataKey="monkey" 
          stroke="#F97316" 
          strokeWidth={2}
          dot={false}
          activeDot={{ r: 6, fill: '#F97316', stroke: '#FFF', strokeWidth: 2 }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
};

export default StockChart;
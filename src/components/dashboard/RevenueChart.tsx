import React, { useMemo } from 'react';

interface RevenueChartProps {
  data: Array<{
    month: string;
    revenue: number;
  }>;
}

const RevenueChart: React.FC<RevenueChartProps> = ({ data }) => {
  const maxRevenue = useMemo(() => {
    return Math.max(...data.map(d => d.revenue), 1); // Ensure at least 1 to avoid division by zero
  }, [data]);

  const totalRevenue = useMemo(() => {
    return data.reduce((sum, d) => sum + d.revenue, 0);
  }, [data]);

  const averageRevenue = useMemo(() => {
    return data.length > 0 ? Math.round(totalRevenue / data.length) : 0;
  }, [totalRevenue, data.length]);

  if (!data || data.length === 0) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <h3 className="text-xl font-semibold text-white mb-6">Revenue Overview</h3>
        <div className="flex items-center justify-center h-64 text-gray-400">
          <p>No revenue data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Revenue Overview</h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full"></div>
          <span className="text-gray-400 text-sm">Monthly Revenue</span>
        </div>
      </div>

      {/* Simple Bar Chart */}
      <div className="space-y-4">
        {data.map((item, index) => (
          <div key={index} className="flex items-center space-x-4">
            <div className="w-8 text-gray-400 text-sm">{item.month}</div>
            <div className="flex-1 bg-gray-800/50 rounded-full h-8 relative overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full transition-all duration-1000 ease-out flex items-center justify-end pr-3"
                style={{ width: `${maxRevenue > 0 ? (item.revenue / maxRevenue) * 100 : 0}%` }}
              >
                {item.revenue > 0 && (
                  <span className="text-white text-xs font-medium">
                    ${item.revenue >= 1000 ? `${(item.revenue / 1000).toFixed(0)}k` : item.revenue.toFixed(0)}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="mt-6 pt-6 border-t border-gray-700/50">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-gray-400 text-sm">Total Revenue ({data.length} months)</p>
            <p className="text-white text-2xl font-bold">
              ${totalRevenue.toLocaleString()}
            </p>
          </div>
          <div className="text-right">
            <p className="text-gray-400 text-sm">Average Monthly</p>
            <p className="text-white text-xl font-semibold">
              ${averageRevenue.toLocaleString()}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RevenueChart;
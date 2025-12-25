import React, { useMemo } from 'react';
import { TrendingUp, TrendingDown, DollarSign, ShoppingCart, Users, Package } from 'lucide-react';
import { getCurrentUser } from '../../utils/auth';

interface StatCard {
  title: string;
  value: string;
  change: number;
  changeType: 'increase' | 'decrease';
  icon: React.ReactNode;
  color: string;
}

interface StatsCardsProps {
  data: {
    totalRevenue: number;
    totalOrders: number;
    totalCustomers: number;
    productsSold: number;
    pendingOrders: number;
    processingOrders: number;
  };
}

const StatsCards: React.FC<StatsCardsProps> = ({ data }) => {
  const currentUser = getCurrentUser();
  
  const stats: StatCard[] = useMemo(() => {
    const role = currentUser?.role?.name_role;
    const dept = currentUser?.department?.name_department;
    
    // Calculate mock change percentages (in real app, you'd compare with previous period)
    const revenueChange = Math.random() * 20 - 5; // -5% to +15%
    const ordersChange = Math.random() * 25 - 10; // -10% to +15%
    const productsChange = Math.random() * 30 - 5; // -5% to +25%
    
    // Determine labels based on user role
    const pendingLabel = dept === 'KINH_DOANH' ? 'Draft Orders' :
                        dept === 'CUNG_UNG' ? 'Pending Orders' :
                        role === 'giam_doc' ? 'Approved Orders' : 'Pending Orders';
    
    const processingLabel = dept === 'KINH_DOANH' ? 'Sent Orders' :
                           dept === 'CUNG_UNG' ? 'Approved Orders' :
                           role === 'giam_doc' ? 'Fulfilled Orders' : 'Processing Orders';
    
    return [
      {
        title: 'Total Revenue',
        value: `$${data.totalRevenue.toLocaleString()}`,
        change: revenueChange,
        changeType: revenueChange >= 0 ? 'increase' : 'decrease',
        icon: <DollarSign className="h-6 w-6" />,
        color: 'from-green-500/20 to-emerald-500/20 border-green-500/30'
      },
      {
        title: pendingLabel,
        value: data.pendingOrders.toString(),
        change: ordersChange,
        changeType: ordersChange >= 0 ? 'increase' : 'decrease',
        icon: <ShoppingCart className="h-6 w-6" />,
        color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30'
      },
      {
        title: processingLabel,
        value: data.processingOrders.toString(),
        change: Math.random() * 15 - 5,
        changeType: Math.random() > 0.5 ? 'increase' : 'decrease',
        icon: <Package className="h-6 w-6" />,
        color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30'
      },
      {
        title: 'Products Sold',
        value: data.productsSold.toLocaleString(),
        change: productsChange,
        changeType: productsChange >= 0 ? 'increase' : 'decrease',
        icon: <Package className="h-6 w-6" />,
        color: 'from-purple-500/20 to-pink-500/20 border-purple-500/30'
      }
    ];
  }, [data, currentUser]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, index) => (
        <div
          key={index}
          className={`bg-gradient-to-br ${stat.color} backdrop-blur-xl border rounded-2xl p-6 hover:scale-105 transition-all duration-300`}
        >
          <div className="flex items-center justify-between mb-4">
            <div className="text-gray-300">
              {stat.icon}
            </div>
            <div className={`flex items-center space-x-1 text-sm ${
              stat.changeType === 'increase' ? 'text-green-400' : 'text-red-400'
            }`}>
              {stat.changeType === 'increase' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>{Math.abs(stat.change).toFixed(1)}%</span>
            </div>
          </div>
          
          <div>
            <h3 className="text-2xl font-bold text-white mb-1">{stat.value}</h3>
            <p className="text-gray-400 text-sm">{stat.title}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default StatsCards;
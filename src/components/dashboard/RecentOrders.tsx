import React, { useMemo } from 'react';
import { Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface RecentOrdersProps {
  orders: any[];
}

const RecentOrders: React.FC<RecentOrdersProps> = ({ orders }) => {
  const formattedOrders = useMemo(() => {
    return orders.slice(0, 5).map((order: any) => ({
      id: order.order_number || `#${order.id}`,
      supplier: order.supplier_name || 'Unknown Supplier',
      amount: Number(order.total_amount || 0),
      status: order.status,
      time: formatDistanceToNow(new Date(order.created_at || order.order_date), { addSuffix: true }),
      paymentStatus: order.payment_status
    }));
  }, [orders]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'approved':
        return <AlertCircle className="h-4 w-4 text-yellow-400" />;
      case 'pending':
        return <Clock className="h-4 w-4 text-blue-400" />;
      case 'draft':
        return <Clock className="h-4 w-4 text-gray-400" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-400" />;
      default:
        return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'fulfilled':
        return 'text-green-400 bg-green-500/10';
      case 'approved':
        return 'text-yellow-400 bg-yellow-500/10';
      case 'pending':
        return 'text-blue-400 bg-blue-500/10';
      case 'draft':
        return 'text-gray-400 bg-gray-500/10';
      case 'rejected':
        return 'text-red-400 bg-red-500/10';
      default:
        return 'text-gray-400 bg-gray-500/10';
    }
  };

  if (!orders || orders.length === 0) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Recent Orders</h3>
        </div>
        <div className="flex items-center justify-center h-32 text-gray-400">
          <p>No recent orders found</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Recent Orders</h3>
        <button className="text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View All
        </button>
      </div>

      <div className="space-y-4">
        {formattedOrders.map((order) => (
          <div
            key={order.id}
            className="flex items-center justify-between p-4 bg-gray-800/30 rounded-xl hover:bg-gray-800/50 transition-colors"
          >
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {getStatusIcon(order.status)}
                <span className="text-white font-medium">{order.id}</span>
              </div>
              <div>
                <p className="text-white text-sm">{order.supplier}</p>
                <p className="text-gray-400 text-xs">{order.time}</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <span className="text-white font-semibold">${order.amount.toFixed(2)}</span>
              <span className={`px-2 py-1 rounded-full text-xs font-medium capitalize ${getStatusColor(order.status)}`}>
                {order.status}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Total Orders Today</span>
          <span className="text-white font-semibold">{orders.length} orders</span>
        </div>
      </div>
    </div>
  );
};

export default RecentOrders;
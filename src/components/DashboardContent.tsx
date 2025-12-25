import React, { useState, useEffect } from 'react';
import StatsCards from './dashboard/StatsCards';
import RevenueChart from './dashboard/RevenueChart';
import RecentOrders from './dashboard/RecentOrders';
import TopProducts from './dashboard/TopProducts';
import api from '../services/api';
import { getCurrentUser } from '../utils/auth';

interface DashboardData {
  totalRevenue: number;
  totalOrders: number;
  totalCustomers: number;
  productsSold: number;
  recentOrders: any[];
  topProducts: any[];
  monthlyRevenue: any[];
  pendingOrders: number;
  processingOrders: number;
}

const DashboardContent: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<DashboardData>({
    totalRevenue: 0,
    totalOrders: 0,
    totalCustomers: 0,
    productsSold: 0,
    recentOrders: [],
    topProducts: [],
    monthlyRevenue: [],
    pendingOrders: 0,
    processingOrders: 0,
  });
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        
        // Fetch orders data
        const ordersRes = await api.get('/orders?per_page=1000');
        const orders = ordersRes.data.data || [];
        
        // Fetch products data
        const productsRes = await api.get('/products?per_page=1000');
        const products = productsRes.data.products || [];
        
        // Calculate stats
        const totalRevenue = orders
          .filter((o: any) => o.payment_status === 'paid')
          .reduce((sum: number, o: any) => sum + Number(o.total_amount), 0);
        
        const totalOrders = orders.length;
        
        // Calculate products sold from order items
        const productsSold = orders.reduce((sum: number, order: any) => {
          return sum + (order.items?.reduce((itemSum: number, item: any) => itemSum + Number(item.quantity), 0) || 0);
        }, 0);
        
        // Get recent orders (last 5)
        const recentOrders = orders
          .sort((a: any, b: any) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
          .slice(0, 5);
        
        // Calculate top products by quantity sold
        const productSales: { [key: string]: { name: string; quantity: number; revenue: number; id: string } } = {};
        
        orders.forEach((order: any) => {
          order.items?.forEach((item: any) => {
            const productId = item.product_id;
            const productName = item.product_name || item.product?.name || 'Unknown Product';
            const quantity = Number(item.quantity);
            const revenue = Number(item.line_total || (item.quantity * item.unit_price));
            
            if (!productSales[productId]) {
              productSales[productId] = { name: productName, quantity: 0, revenue: 0, id: productId };
            }
            productSales[productId].quantity += quantity;
            productSales[productId].revenue += revenue;
          });
        });
        
        const topProducts = Object.values(productSales)
          .sort((a, b) => b.quantity - a.quantity)
          .slice(0, 5);
        
        // Calculate monthly revenue for the last 6 months
        const monthlyRevenue = [];
        const now = new Date();
        
        for (let i = 5; i >= 0; i--) {
          const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
          const monthName = date.toLocaleDateString('en-US', { month: 'short' });
          const year = date.getFullYear();
          const month = date.getMonth() + 1;
          
          const monthlyTotal = orders
            .filter((order: any) => {
              const orderDate = new Date(order.order_date || order.created_at);
              return orderDate.getFullYear() === year && 
                     orderDate.getMonth() + 1 === month &&
                     order.payment_status === 'paid';
            })
            .reduce((sum: number, order: any) => sum + Number(order.total_amount), 0);
          
          monthlyRevenue.push({
            month: monthName,
            revenue: monthlyTotal
          });
        }
        
        // Calculate pending and processing orders based on user role
        let pendingOrders = 0;
        let processingOrders = 0;
        
        const department = currentUser?.department?.name_department;
        const role = currentUser?.role?.name_role;
        
        orders.forEach((order: any) => {
          const status = order.status;
          
          if (department === 'KINH_DOANH') {
            if (status === 'draft') pendingOrders++;
            if (status === 'pending') processingOrders++;
          } else if (department === 'CUNG_UNG') {
            if (status === 'pending') pendingOrders++;
            if (status === 'approved') processingOrders++;
          } else if (role === 'giam_doc') {
            if (status === 'approved') pendingOrders++;
            if (status === 'fulfilled') processingOrders++;
          }
        });
        
        setDashboardData({
          totalRevenue,
          totalOrders,
          totalCustomers: 0, // We don't have customers data yet
          productsSold,
          recentOrders,
          topProducts,
          monthlyRevenue,
          pendingOrders,
          processingOrders,
        });
        
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [currentUser]);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Dashboard Overview</h1>
          <p className="text-gray-400">Welcome back! Here's what's happening with your business today.</p>
        </div>
        <div className="text-right">
          <p className="text-gray-400 text-sm">Last updated</p>
          <p className="text-white font-medium">{new Date().toLocaleString()}</p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards data={dashboardData} />

      {/* Charts and Data */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RevenueChart data={dashboardData.monthlyRevenue} />
        <RecentOrders orders={dashboardData.recentOrders} />
      </div>

      {/* Additional Widgets */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <TopProducts products={dashboardData.topProducts} />
        
        {/* Quick Actions */}
        <div className="lg:col-span-2 bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <h3 className="text-xl font-semibold text-white mb-4">Quick Actions</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <button className="p-4 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-xl hover:from-blue-500/30 hover:to-cyan-500/30 transition-all duration-300 group">
              <div className="text-blue-400 mb-2 group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">New Order</p>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-xl hover:from-green-500/30 hover:to-emerald-500/30 transition-all duration-300 group">
              <div className="text-green-400 mb-2 group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">Add Customer</p>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-purple-500/20 to-pink-500/20 border border-purple-500/30 rounded-xl hover:from-purple-500/30 hover:to-pink-500/30 transition-all duration-300 group">
              <div className="text-purple-400 mb-2 group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">New Product</p>
            </button>
            
            <button className="p-4 bg-gradient-to-br from-orange-500/20 to-red-500/20 border border-orange-500/30 rounded-xl hover:from-orange-500/30 hover:to-red-500/30 transition-all duration-300 group">
              <div className="text-orange-400 mb-2 group-hover:scale-110 transition-transform">
                <svg className="h-8 w-8 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-white text-sm font-medium">View Reports</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardContent;

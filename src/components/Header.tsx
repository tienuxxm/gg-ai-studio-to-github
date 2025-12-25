import React, { useState, useEffect } from 'react';
import {
  Search,
  Plus,
  Bell,
  ChevronDown,
  Menu,
  Mail,
  LogOut,
  User
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import toast from 'react-hot-toast';
import Swal from '../utils/swal';
import type { Pagetype } from '../layouts/DashboardLayout';
interface HeaderProps {
  user: {
    name: string;
    avatar: string;
    role: string;
    department:string;
  };
  onToggleSidebar: () => void;
  sidebarCollapsed: boolean;
  onPageChange?: (page: Pagetype) => void;

}

const Header: React.FC<HeaderProps> = ({ user, onToggleSidebar, sidebarCollapsed, onPageChange }) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<any[]>([]);

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);


  const navigate = useNavigate();


  const handleCreateOrder = () => {
    alert('Create Order functionality would be implemented here');
  };

  const handleLogout = async () => {
    try {
      await api.post('/logout');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      navigate('/login');
    }

  };
  const searchAll = async (query: string) => {
    try {
      const [ordersRes, productsRes] = await Promise.all([
        api.get('/orders/search', { params: { q: query } }),
        api.get('/products/search', { params: { q: query } }),
      ]);

      const orders = ordersRes.data.map((item: any) => ({
        type: 'order',
        label: item.order_number,
        id: item.id,
      }));

      const products = productsRes.data.map((item: any) => ({
        type: 'product',
        label: item.name,
        id: item.id,
      }));

      const combined = [...orders, ...products];
      setResults(combined);
      setShowDropdown(true);

      if (combined.length === 0) toast.error('Không tìm thấy kết quả nào');
    } catch (error) {
      console.error('Lỗi tìm kiếm:', error);
      toast.error('Đã xảy ra lỗi khi tìm kiếm');
    }
  };

  useEffect(() => {
    const delay = setTimeout(() => {
      if (searchQuery.trim()) {
        searchAll(searchQuery);
      } else {
        setShowDropdown(false);
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(delay);
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (e: any) => {
      if (!e.target.closest('.search-dropdown')) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, []);
  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await api.get('/notifications');
        const notiList = res.data.notifications || [];
        setNotifications(notiList);
      } catch (error) {
        console.error('Lỗi khi lấy thông báo:', error);
      }
    };

    fetchNotifications();
  }, []);

  const handleToggleNotifications = async () => {
    const nextState = !showNotifications;
    setShowNotifications(nextState);

    if (nextState) {
      try {
        await api.post('/notifications/mark-read'); // 👈 Gọi API BE cập nhật
        setTimeout(() => {
          setNotifications([]); // 👈 Dọn thông báo sau 30s (hoặc tuỳ ý)
        }, 30000);
      } catch (err) {
        console.error('Lỗi mark-read:', err);
      }
    }
  };
  const handleSendReminders = async () => {
    // 1. Hiển thị Popup xác nhận (Dùng Swal cấu hình sẵn)
    const result = await Swal.fire({
      title: 'Gửi email nhắc nhở?',
      text: 'Hệ thống sẽ quét và gửi email cho TẤT CẢ user có đơn hàng Pending (Chờ xử lý).',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Gửi ngay',
      cancelButtonText: 'Hủy bỏ'
    });

    // Nếu user bấm Hủy thì dừng
    if (!result.isConfirmed) return;

    // 2. Hiển thị Loading Toast (để user biết đang chạy)
    const loadingToastId = toast.loading('Đang gửi lệnh gửi mail...');

    try {
      // 3. Gọi API Admin
      const response = await api.post('/admin/send-reminders',{force:true});

      // 4. Thành công
      toast.dismiss(loadingToastId); // Tắt loading

      // Hiển thị thông báo thành công bằng Swal
      Swal.fire({
        title: 'Thành công!',
        text: response.data.message || 'Đã gửi mail nhắc nhở xong.',
        icon: 'success',
        timer: 3000,
        showConfirmButton: false
      });

    } catch (error: any) {
      // 5. Thất bại
      toast.dismiss(loadingToastId); // Tắt loading

      const errorMsg = error.response?.data?.message || 'Có lỗi xảy ra khi gửi mail.';

      // Hiển thị lỗi bằng Swal
      Swal.fire({
        title: 'Lỗi!',
        text: errorMsg,
        icon: 'error'
      });
    }
  };







  return (
    <header className="h-16 bg-gray-900/80 backdrop-blur-xl border-b border-gray-700/50 flex items-center px-3 sm:px-6 relative z-30">
      {/* Left Section */}
      <div className="flex items-center space-x-4">
        {/* Sidebar Toggle */}
        <button
          onClick={onToggleSidebar}
          className="p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-200"
        >
          <Menu className="h-5 w-5" />
        </button>

        {/* Logo */}
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30">
            <img
              src="public/assets/Bitex_logo.png"
              alt="BITEX"
              className="h-6 sm:h-8 w-auto"
            />
          </div>
          {/* {!sidebarCollapsed && (
            <span className="text-lg sm:text-xl font-bold text-white hidden sm:block">Dashboard</span>
          )} */}
        </div>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-2xl mx-2 sm:mx-8">
        {/* <div className="relative search-dropdown ">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all duration-300 text-sm sm:text-base"
            placeholder="Search..."
          />
          {showDropdown && results.length > 0 && (
            <div className="absolute z-50 mt-2 w-full bg-gray-900 border border-gray-700 rounded-xl shadow-xl max-h-64 overflow-y-auto left-0 right-0">
              {results.map((item, index) => (
                <div
                  key={`${item.type}-${item.id}`}
                  className="px-4 py-2 text-white hover:bg-gray-700 cursor-pointer text-xs sm:text-sm"
                  onClick={() => {
                    if (item.type === 'order') {
                          onPageChange?.('orders'); // 👈 cập nhật currentPage

                navigate('/dashboard/orders', { state: { searchTerm: item.label } });
                    } else if (item.type === 'product') {
                          onPageChange?.('products'); // 👈 cập nhật currentPage

                navigate('/dashboard/products', { state: { searchTerm: item.label } });
                    }
                    setShowDropdown(false);
                    setSearchQuery('');
                  }}
                >
                  <span className="text-blue-400 font-medium">{item.type.toUpperCase()}</span>: {item.label}
                </div>
              ))}
            </div>
          )}

        </div> */}
      </div>

      {/* Right Section */}
      <div className="flex items-center space-x-4 ml-auto">
        {/* Notifications */}
        <div className="relative">
          {/* <button
            onClick={handleToggleNotifications}
            className="relative p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 text-gray-300 hover:text-white transition-all duration-200"
          >
            <Bell className="h-5 w-5" />
            {notifications.length > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {notifications.length}
              </span>
            )}
            

          </button> */}

          {/* Notifications Dropdown */}
          {/* {showNotifications && (
            <div className="absolute right-0 mt-2 w-72 sm:w-80 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-4 border-b border-gray-700/50">
                <h3 className="text-white font-semibold">Notifications</h3>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {notifications.map((notification) => (
                  <div key={notification.id} className="p-4 border-b border-gray-700/30 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-start space-x-3">
                      <div className={`w-2 h-2 rounded-full mt-2 ${
                          notification.type.includes('created') ? 'bg-blue-500' :
                          notification.type.includes('updated') ? 'bg-yellow-500' :
                            'bg-gray-400'                      
                            }`}></div>
                      <div className="flex-1">
                        <p className="text-gray-300 text-sm">{notification.message}</p>
                        <p className="text-gray-500 text-xs mt-1">{formatDistanceToNow(new Date(notification.created_at), { addSuffix: true, locale: vi })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )} */}
        </div>

        {/* User Profile */}
        <div className="relative">
          <button
            onClick={() => setShowUserMenu(!showUserMenu)}
            className="flex items-center space-x-3 p-2 rounded-lg bg-gray-800/50 hover:bg-gray-700/50 transition-all duration-200"
          >
            <User className="h-8 w-8 text-white bg-gray-700 rounded-full p-1" />

            <div className="hidden sm:block text-left">
              <p className="text-white text-sm font-medium">{user.name}</p>
              <p className="text-gray-400 text-xs capitalize">{user.department}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-40 sm:w-48 bg-gray-800/95 backdrop-blur-xl border border-gray-700/50 rounded-xl shadow-2xl overflow-hidden">
              <div className="p-2">
                <hr className="my-2 border-gray-700/50" />
                <button
                  onClick={handleSendReminders}
                  className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors text-sm"
                >
                  <Mail className='h-4 w-4'/>
                  <span>Mail</span>                  
                </button>
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-3 px-2 sm:px-3 py-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
                
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;

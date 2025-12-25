import React, { useState } from 'react';
import type { Pagetype } from '../layouts/DashboardLayout';
import { 
  BarChart3, 
  ShoppingCart, 
  Users, 
  Package, 
  Settings, 
  FileText,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Home
} from 'lucide-react';

interface SidebarProps {
  collapsed: boolean;
  userRole: string;
  userDepartment: string;
  currentPage: Pagetype;
  onPageChange: (page: Pagetype) => void;
  isMobile?: boolean;
}

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
  badge?: number;
  children?: MenuItem[];
  roles?: string[];
  department?: string[];
  page?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ 
  collapsed, 
  userRole, 
  userDepartment, 
  currentPage, 
  onPageChange,
  isMobile = false 
}) => {
   console.log('userRole', userRole);
   console.log('userDepartment', userDepartment);

  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const menuItems: MenuItem[] = [
    {
      id: 'overview',
      label: 'Overview',
      icon: <Home className="h-5 w-5" />,
      page: 'dashboard',
      roles:[]
    },
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: <BarChart3 className="h-5 w-5" />,
      page: 'dashboard',
     roles:[]
    },
    {
      id: 'orders',
      label: 'Orders',
      icon: <ShoppingCart className="h-5 w-5" />,
      //badge: 3,
      // department: ['CUNG_UNG','KINH_DOANH','HANH_CHANH','Công nghệ thông tin (IT)','Cung ứng','Hành chính - Miền Nam'],
      roles: ['truong_phong', 'pho_phong', 'nhan_vien_chinh_thuc','giam_doc','Administrator','Supply','Sales','Leader'],
      children: [
        { id: 'orders-all', label: 'All Orders', icon: <FileText className="h-4 w-4" />, page: 'orders',roles:['Sales','Supply'] },
        { id: 'orders-monthly', label: 'Monthly Orders', icon: <FileText className="h-4 w-4" />, page: 'ordersMonthly',roles:[] },
        { id: 'orders-yearly', label: 'Yearly Orders', icon: <FileText className="h-4 w-4" />, page: 'ordersYearly',roles:[] },
        { id: 'orders-merged', label: 'Merged Orders', icon: <FileText className="h-4 w-4" />, page: 'ordersMerged' ,roles:['Supply','Leader']},
        { id: 'orders-completed', label: 'Completed', icon: <FileText className="h-4 w-4" />, page: 'ordersCompleted' },
        { id: 'orders-cancelled', label: 'Cancelled', icon: <FileText className="h-4 w-4" />, page: 'orders',roles: [] },
      ]
    },
    {
      id: 'customers',
      label: 'Customers',
      icon: <Users className="h-5 w-5" />,
      roles: [],

      children: [
        { id: 'customers-all', label: 'All Customers', icon: <Users className="h-4 w-4" />, page: 'customers' },
        { id: 'customers-active', label: 'Active', icon: <Users className="h-4 w-4" />, page: 'customers' },
        { id: 'customers-inactive', label: 'Inactive', icon: <Users className="h-4 w-4" />, page: 'customers' },
      ]
    },
    {
      id: 'products',
      label: 'Products',
      icon: <Package className="h-5 w-5" />,
      children: [
        { id: 'products-all', label: 'All Products', icon: <Package className="h-4 w-4" />, page: 'products' },
        { id: 'products-categories', label: 'Categories', icon: <Package className="h-4 w-4" />, page: 'productsCategories' },
        { id: 'products-inventory', label: 'Inventory', icon: <Package className="h-4 w-4" />, page: 'products',roles: [] },
      ]
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: <TrendingUp className="h-5 w-5" />,
      roles: [],

      children: [
        { id: 'analytics-sales', label: 'Sales Report', icon: <BarChart3 className="h-4 w-4" /> },
        { id: 'analytics-customers', label: 'Customer Analytics', icon: <Users className="h-4 w-4" /> },
        { id: 'analytics-products', label: 'Product Performance', icon: <Package className="h-4 w-4" /> },
      ]
    },
    {
      id: 'settings',
      label: 'System Settings',
      icon: <Settings className="h-5 w-5" />,
      roles: [],
    
      children: [
        { id: 'settings-general', label: 'General', icon: <Settings className="h-4 w-4" /> },
        { id: 'settings-users', label: 'User Management', icon: <Users className="h-4 w-4" /> },
        { id: 'settings-permissions', label: 'Permissions', icon: <Settings className="h-4 w-4" /> },
      ]
    },
  ];

  const toggleExpanded = (itemId: string) => {
    setExpandedItems(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    );
  };

  const isItemVisible = (item: MenuItem) => {
  // roles whitelist
  if (item.roles && !item.roles.includes(userRole)) return false;
    if (userRole === 'giam_doc') return true;


  // departments whitelist
  if (item.department && !item.department.includes(userDepartment)) return false;

  return true;  // không rơi vào điều kiện cấm ⇒ hiển thị
};


  const handleItemClick = (item: MenuItem) => {
    if (item.page) {
      onPageChange(item.page as Pagetype);
    } else if (item.children && item.children.length > 0) {
      toggleExpanded(item.id);
    }
  };

  const renderMenuItem = (item: MenuItem, level = 0) => {
    if (!isItemVisible(item)) return null;

    const isExpanded = expandedItems.includes(item.id);
    const hasChildren = item.children && item.children.length > 0;
    const isActive = item.page === currentPage;

    return (
      <div key={item.id}>
        <button
          onClick={() => handleItemClick(item)}
          className={`w-full flex items-center justify-between px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all duration-200 group ${
            level > 0 ? 'ml-4 text-sm' : ''
          } ${isActive ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' : ''}`}
        >
          <div className="flex items-center space-x-3">
            <div className="flex-shrink-0">
              {item.icon}
            </div>
            {!collapsed && (
              <span className="flex-1 text-left">{item.label}</span>
            )}
          </div>
          
          {!collapsed && (
            <div className="flex items-center space-x-2">
              {item.badge && (
                <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {item.badge}
                </span>
              )}
              {hasChildren && (
                <div className="text-gray-400 group-hover:text-white transition-colors">
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4" />
                  ) : (
                    <ChevronRight className="h-4 w-4" />
                  )}
                </div>
              )}
            </div>
          )}
        </button>

        {/* Submenu */}
        {hasChildren && isExpanded && !collapsed && (
          <div className="mt-1 space-y-1">
            {item.children?.map(child => renderMenuItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={`fixed left-0 top-16 h-[calc(100vh-4rem)] bg-gray-900/80 backdrop-blur-xl border-r border-gray-700/50 transition-all duration-300 z-20 ${
      isMobile 
        ? collapsed 
          ? '-translate-x-full w-64' 
          : 'translate-x-0 w-64'
        : collapsed 
          ? 'w-16' 
          : 'w-64'
    }`}>
      <div className="p-4 h-full overflow-y-auto">
        <nav className="space-y-2">
          {menuItems.map(item => renderMenuItem(item))}
        </nav>
      </div>
      
      {/* Mobile overlay */}
      {isMobile && !collapsed && (
        <div 
          className="fixed inset-0 bg-black/50 z-[-1]"
          onClick={() => onPageChange(currentPage)} // This will trigger sidebar close
        />
      )}
    </aside>
  );
};

export default Sidebar;
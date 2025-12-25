import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Plus, Search, RotateCcw, Edit, Eye, Package, Clock, CheckCircle, XCircle, AlertCircle, GitMerge, Upload ,HandCoins} from 'lucide-react';
import api from '../../services/api';

import { OrderPayload, OrderFromAPI } from './OrderModal';
import OrderModal from './OrderModal'; 

import { getCurrentUser } from '../../utils/auth';
import { useLocation } from 'react-router-dom';
import MySwal from '../../utils/swal';
import { getStatConfig } from '../../utils/orderStatusMapping';
import toast from 'react-hot-toast';

interface OrderItem {
  productCode: string;
  productName: string;
  quantity: number;
  quantity_old:number;
  price: number;
  color: string;
}

interface StatusOption {
  ID: number;
  Name: string;
  Type: number;
}

interface Order {
  id: string;
  orderNumber: string;
  supplier_name: string; // Tùy chọn nếu có
  items: OrderItem[];
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status_name: string;
  status: number; // 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  shippingAddress: string;
  orderDate: string;
  estimatedDelivery: string;
  notes: string;
}

interface OrdersPageProps {
  mode: 'normal' | 'monthly' | 'yearly' | 'merged';
  filterType?: string; 
}



const OrdersPage: React.FC<OrdersPageProps> = ({ mode, filterType }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const [importIndustryId, setImportIndustryId] = useState<string>('');
  const { searchTerm: initialSearch } = location.state || {};
  const [search, setSearch] = useState(initialSearch || '');
  const [monthlyOrders, setMonthlyOrders] = useState<any[]>([]);
  const [yearlyOrders, setYearlyOrders] = useState<any[]>([]);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [allStatuses, setAllStatuses] = useState<StatusOption[]>([]);
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);


  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processing: 0,
    revenue: 0
  });

  const fetchOrders = async () => {
    setLoading(true);
    try {
     
      const endpoint = mode === 'merged' ? '/merge-orders' : '/orders';

      const params = {
        page, 
        q: search,
        status: selectedStatus !== 'all' ? selectedStatus : undefined,
        limit: 6,
        group: filterType
      };

      const res = await api.get(endpoint, { params });
      const mappedOrders: Order[] = res.data.data.map((o: any) => ({
        id: o.id, 
        orderNumber: o.order_number,
        supplier_name: o.supplier_name || 'N/A',
        customerName: o.customer_name,
        intendedUse: o.intended_use,
        total: o.total_amount || o.total, 
        status: Number(o.status),
        status_name: o.status_name,
        orderDate: o.created_at || o.order_date, 
        itemsCount: o.items_count,

        items: o.items ? o.items.map((i: any) => ({
          id: i.id, 
          productCode: i.product_code,
          productName: i.product_name,
          quantity: i.quantity,
          quantityOld: i.quantity_old,
          price: i.price || 0,
          total: i.total || (i.quantity * i.price)
        })) : []
      }));

      setOrders(mappedOrders);
      setLastPage(res.data.last_page);

    } catch (error) {
      console.error("Failed to fetch orders", error);
      toast.error("Không thể tải danh sách đơn hàng");
    } finally {
      setLoading(false);
    }
  };



const loadStats = async () => {
  try {
    const endpoint = mode === 'merged' ? '/merge-orders/stats' : '/orders/stats';

    const params = {
      group: filterType 
    };

    const res = await api.get(endpoint, { params });

    setStats({
      total: res.data.total_orders,
      pending: res.data.pending_orders,
      processing: res.data.processing_orders,
      revenue: res.data.total_revenue
    });
  } catch (error) {
    console.error("Lỗi tải thống kê", error);
  }
};
  useEffect(() => {
    const fetchCategories = async () => {
      try {
       
        const res = await api.get('/categories');
      
        setCategories(res.data.categories || []);
      } catch (e) {
        console.error("Lỗi tải danh mục", e);
      }
    };
    fetchCategories();
  }, []);

  const [selectedStatus, setSelectedStatus] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [editingOrder, setEditingOrder] = useState<OrderFromAPI | null>(null);
  const [readOnlyMode, setReadOnlyMode] = useState(false);


  const filteredOrders = useMemo(() => {
    let temp = orders;
    if (search.trim()) {
      const q = search.toLowerCase();
      temp = temp.filter(o =>
        o.orderNumber.toLowerCase().includes(q) ||
        o.supplier_name.toLowerCase().includes(q)
      );
    }
    return temp;
  }, [orders, search]);


  const getStatusIcon = (statusId: number) => {
    switch (statusId) {
      case 1:
        return <Clock className="h-4 w-4" />;
      case 2:
      case 6:
      case 10:
        return <AlertCircle className="h-4 w-4" />;
      case 3:
      case 7:
      case 13:
        return <CheckCircle className="h-4 w-4" />;
      case 5:
        return <XCircle className="h-4 w-4" />;
      case 9:
      case 15:
        return <Package className="h-4 w-4" />;
      default:
        return <XCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (statusId: number) => {
    switch (statusId) {
      case 1:
        return 'text-yellow-400 bg-yellow-500/10 border-yellow-500/30';
      case 2:
      case 6:
      case 10:
        return 'text-blue-400 bg-blue-500/10 border-blue-500/30';
      case 3: 
      case 7: 
        return 'text-purple-400 bg-purple-500/10 border-purple-500/30';
      case 4:
      case 8: 
        return 'text-cyan-400 bg-cyan-500/10 border-cyan-500/30';
      case 9:
      case 11:
        return 'text-green-400 bg-green-500/10 border-green-500/30';
      case 5:
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      default:
        return 'text-gray-500 bg-gray-400/10 border-gray-400/30';
    }
  };

  const handleAddOrder = () => {
    setEditingOrder(null);
    setReadOnlyMode(false);
    setShowModal(true);
  };

  const handleEditOrder = async (order: Order, readOnly = false) => {
    try {
      const orderId = order.id || order.orderNumber;
      const isMergeOrder = orderId?.toString().startsWith('MP'); // Check tiền tố MP
      const url = isMergeOrder
        ? `/merge-orders/${orderId}`
        : `/orders/${orderId}`;
      const res = await api.get(url);
      const apiOrder = res.data.order;

      const orderFromAPI: OrderFromAPI = {
        ...apiOrder,
        orderNumber: apiOrder.order_number,
        supplierName: apiOrder.supplier_name ?? '',
        paymentStatus: apiOrder.payment_status,
        intendedUse: apiOrder.intended_use,
        orderDate: apiOrder.order_date,
        estimatedDelivery: apiOrder.estimated_delivery ?? '',
        notes: apiOrder.notes ?? '',
        subtotal: Number(apiOrder.subtotal),
        tax: Number(apiOrder.tax),
        shipping: Number(apiOrder.shipping),
        total: Number(apiOrder.total_amount),
        items: apiOrder.items.map((it: any) => ({
          id: it.id,
          product: {
            id: it.product.id || '',
            code: it.product?.code || '',
            name: it.product?.name || '',
            price: Number(it.product?.price || 0),
            color: it.product?.color,
          },
          quantity: Number(it.quantity),
          quantityOld: Number(it.quantity_old),

        }))
      };
      setReadOnlyMode(readOnly);
      setEditingOrder(orderFromAPI);
      setShowModal(true);
      toast.success('Đơn hàng đã được tải thành công!');
    } catch (err) {
      toast.error('Không thể tải đơn hàng từ server');
    }
  };


  const handleDeleteOrder = async (order: Order) => {
    const result = await MySwal.fire({
      title: 'Bạn có chắc muốn xóa?',
      text: `Đơn hàng ${order.orderNumber} sẽ bị xóa`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Xóa',
      cancelButtonText: 'Hủy',
    });

    if (!result.isConfirmed) return;
    try {
      const res = await api.delete(`/orders/${order.orderNumber}`);
      toast.success('Đã xóa đơn hàng');
      fetchOrders();
    } catch (error: any) {
      const message = error.response?.data?.message || 'Xóa thất bại';
      toast.error(message);
    }
  };



  const handleSaveOrder = async (orderData: OrderPayload) => {
    if (editingOrder) {
      try {
        const isMergeOrder = editingOrder.orderNumber.startsWith('MP') || editingOrder.orderNumber.startsWith('MP');
        const url = isMergeOrder
          ? `/merge-orders/${editingOrder.orderNumber}`
          : `/orders/${editingOrder.orderNumber}`;
        const res = await api.put(url, orderData);
        fetchOrders();
        setShowModal(false);
        toast.success('Cập nhật đơn hàng thành công!');
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Cập nhật đơn hàng thất bại');
      }
    }
    else {
      try {
        const payload = {
          orderDate: orderData.orderDate,
          supplier_name: orderData.supplier_name,
          industry_id: orderData.industry_id,
          intended_use: orderData.intended_use,
          status: orderData.status,
          estimated_delivery: orderData.estimated_delivery,
          shipping: orderData.shipping,
          notes: orderData.notes,
          items: orderData.items.map(it => ({
            productCode: it.productCode,
            quantity: it.quantity,
            quatityOld: it.quantityOld,
            productName: it.productName,
            price: it.price,
            color: it.variant || '',
          })),
        };
        await api.post('/orders', payload);
        fetchOrders(); 
        setShowModal(false);
        toast.success('Tạo đơn hàng thành công!');
      } catch (err: any) {
        console.error(err);
        toast.error(err.response?.data?.message || 'Tạo đơn hàng thất bại');
      }
    }
  };
  const [selectedOrders, setSelectedOrders] = useState<string[]>([]);
  const [isSelectingAll, setIsSelectingAll] = useState(false);
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrders(prev =>
      prev.includes(orderId)
        ? prev.filter(id => id !== orderId)
        : [...prev, orderId]
    );
  };
  const handleSelectAll = async () => {
    if (selectedOrders.length > 0) {
      setSelectedOrders([]);
      return;
    }
    try {
      setIsSelectingAll(true); 
      const res = await api.get('/orders/ids?status=7');
      setSelectedOrders(res.data);
      toast.success(`Đã chọn toàn bộ ${res.data.length} đơn hàng "Chốt" trong hệ thống.`);
    } catch (error) {
      toast.error("Lỗi khi lấy danh sách ID.");
    } finally {
      setIsSelectingAll(false);
    }
  };


  const isHeaderChecked = selectedOrders.length > 0;
  const handleMergeOrders = async () => {

    const result = await MySwal.fire({
      title: 'Xác nhận gộp đơn?',
      html: `
            <div class="flex flex-col items-center gap-2">
                <p>Bạn đang chọn gộp <span class="text-yellow-400 font-bold text-lg">${selectedOrders.length}</span> đơn hàng.</p>
                <p class="text-sm opacity-80">Hệ thống sẽ tạo ra một đơn <b>MP (Merge PO)</b> mới.</p>
            </div>
        `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Tiến hành gộp',
      cancelButtonText: 'Suy nghĩ lại',
      reverseButtons: true, 

     
    });

    if (!result.isConfirmed) return;

    try {
      MySwal.fire({
        title: 'Đang xử lý...',
        didOpen: () => MySwal.showLoading()
      });
    
      await MySwal.fire({
        icon: 'success',
        title: 'Gộp đơn thành công!',
        timer: 2000,
        showConfirmButton: false
      });

    } catch (error) {
      MySwal.fire({
        icon: 'error',
        title: 'Có lỗi xảy ra',
        text: 'Không thể gộp đơn hàng lúc này.'
      });
    }

    try {
      await api.post('/orders/merge', { order_ids: selectedOrders });
      toast.success("Gộp đơn thành công!");
      setSelectedOrders([]); 
      fetchOrders();
    } catch (error) {
      toast.error("Gộp đơn thất bại");
    }
  };
  const handleExportOrders = async () => {
    try {
      const res = await api.post(
        '/export-order',
        { order_ids: selectedOrders },
        { responseType: 'blob' }
      );

      const blob = new Blob([res.data], {
        type:
          'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      });
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'orders.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Xuất đơn thất bại');
    }
  };

  const handleImportOrders = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!importIndustryId) {
      toast.error("Vui lòng chọn Ngành hàng trước!");
      event.target.value = ''; // Reset input file
      return;
    }
    MySwal.fire({
      title: 'Đang xử lý...',
      text: 'Đang đọc file Excel và tạo đơn hàng...',
      didOpen: () => MySwal.showLoading()
    });

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('industry_id', importIndustryId); 

      
const res = await api.post('/orders/import', formData, {
        headers: {
          'Content-Type': 'multipart/form-data', 
        },
      });
      await MySwal.fire({
        icon: 'success',
        title: 'Thành công!',
        text: res.data.message
      });
    } catch (error: any) {
      console.error(error);
      const msg = error.response?.data?.message || "Lỗi khi import file";

      await MySwal.fire({
        icon: 'error',
        title: 'Lỗi Import',
        text: msg
      });
    } finally {
      event.target.value = '';
    }
  };

  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);


  useEffect(() => {
    const user = getCurrentUser();
    setCurrentUser(user);
  }, []); 

  const fetchMonthlyOrders = async () => {
    try {
      const res = await api.get('/orders/merged-by-month');
      setMonthlyOrders(res.data); 
    } catch (error) {
      console.error('❌ Lỗi khi fetch đơn gộp theo tháng:', error);
    }
  };

  const fetchYearlyOrders = async () => {
    try {
      const res = await api.get('/orders/merged-by-year');
      setYearlyOrders(res.data); 
    } catch (error) {
      console.error('❌ Lỗi khi fetch đơn gộp theo năm:', error);
    }
  };
  useEffect(() => {
    setOrders([]);
    setMonthlyOrders([]);
    setYearlyOrders([]);
    setSelectedOrders([]);
    setSelectedMonths([]);
    setSelectedYears([]);
    loadStats();

    if (mode === 'normal' || mode === 'merged') {
      fetchOrders();
    } else if (mode === 'monthly') {
      fetchMonthlyOrders();
    } else if (mode === 'yearly') {
      fetchYearlyOrders();
    }
  }, [mode, page, refreshKey, currentUser, search, filterType]);

  const toggleMonthSelection = (month: string) => {
    setSelectedMonths(prev =>
      prev.includes(month)
        ? prev.filter(m => m !== month)
        : [...prev, month]
    );
  };

  const toggleYearSelection = (year: string) => {
    setSelectedYears(prev =>
      prev.includes(year)
        ? prev.filter(y => y !== year)
        : [...prev, year]
    );
  };
  const handleExportSelectedMonths = async () => {
    try {
      const response = await api.post(
        '/export-merged-orders-multi-months',
        { months: selectedMonths }, 
        { responseType: 'blob' }
      );
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'don-gop-theo-thang.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Xuất thất bại');
    }
  };
  const reloadList = () => {
    setRefreshKey(prev => prev + 1);
  };

  const handleExportSelectedYears = async () => {
    try {
      const response = await api.post(
        '/export-merged-orders-multi-years',
        { years: selectedYears },
        { responseType: 'blob' }
      );

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'don-gop-theo-nam.xlsx');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err: any) {
      console.error(err);
      toast.error(err.response?.data?.message || 'Xuất thất bại');
    }
  };

  const role = currentUser?.role?.name_role;
  const dept = currentUser?.department?.name_department;
  const config = getStatConfig(role, dept);
  useEffect(() => {
    if (initialSearch) {
      setSearch(initialSearch);
    }
  }, [initialSearch]);
  useEffect(() => {
    const fetchStatuses = async () => {
      try {
        const res = await api.get('order-statuses');
        setAllStatuses(res.data);
      } catch (error) {
        console.error("Lỗi lấy danh sách trạng thái", error);
      }
    };
    fetchStatuses();
  }, []);
  useEffect(() => {
    setPage(1);
  }, [mode])
  useEffect(() => {
    fetchOrders();
  }, [search, page, selectedStatus, mode]);


  const renderPagination = () => {
    const delta = 1;
    const range = [];
    const rangeWithDots = [];
    let l;

    for (let i = 1; i <= lastPage; i++) {
      if (i === 1 || i === lastPage || (i >= page - delta && i <= page + delta)) {
        range.push(i);
      }
    }

    for (let i of range) {
      if (l) {
        if (i - l === 2) rangeWithDots.push(l + 1);
        else if (i - l !== 1) rangeWithDots.push('...');
      }
      rangeWithDots.push(i);
      l = i;
    }

    return rangeWithDots.map((pageNum, index) => (
      pageNum === '...' ? (
        <span key={`dots-${index}`} className="px-3 py-1 text-gray-400">...</span>
      ) : (
        <button
          key={pageNum}
          onClick={() => setPage(Number(pageNum))}
          className={`px-3 py-1 rounded text-sm ${pageNum === page ? 'bg-blue-600 text-white' : 'bg-gray-800/50 text-gray-300'
            }`}
        >
          {pageNum}
        </button>
      )
    ));
  };
  const STATUS_CHOT = 7;
  const eligibleOrders = orders.filter(o => Number(o.status) === STATUS_CHOT);
  const showMergeButton = mode === 'normal' && selectedOrders.length > 0;
  const showCheckbox = mode === 'normal';
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">

        <div>
          <h1 className="text-xl sm:text-3xl font-bold text-white mb-2">Order Management</h1>
        </div>
        <div className='flex items-center gap-4 justify-end-4'>
          <button
            onClick={handleAddOrder}
            className="flex items-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
          >
            <Plus className="h-5 w-5" />
            <span className="hidden sm:inline">Create Order</span>
            <span className="sm:hidden">Create</span>
          </button>
          <button
            onClick={() => { reloadList(); setPage(1) }}
            className="flex items-center space-x-2 px-6 py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105"
          >
            <RotateCcw className="h-5 w-5" />
            <span>Load Orders</span>
          </button>
        </div>

      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Orders</p>
              <p className="text-white text-lg sm:text-2xl font-bold">{stats.total.toLocaleString()}</p>
            </div>
            <Package className="h-6 w-6 sm:h-8 sm:w-8 text-blue-400" />
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">{config.pending.label}</p>
              <h3 className="text-white text-lg sm:text-2xl font-bold">{stats.pending}</h3>
            </div>
            <div className={`p-2 rounded-lg ${config.pending.color}`}>
              <config.pending.icon  />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">{config.processing.label}</p>
              <h3 className="text-white text-lg sm:text-2xl font-bold">{stats.processing}</h3>
            </div>
            <div className={`p-2 rounded-lg ${config.processing.color}`}>
              <config.processing.icon />
            </div>
          </div>
        </div>

        <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-400 text-xs sm:text-sm">Total Revenue</p>
              <p className="text-white text-lg sm:text-2xl font-bold">{stats.revenue.toLocaleString()} VNĐ</p>
            </div>
            <HandCoins className="h-6 w-6 sm:h-8 sm:w-8 text-green-400" />
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-3 sm:p-6">
        <div className="flex flex-col space-y-4 lg:flex-row lg:items-center lg:justify-between lg:space-y-0 lg:space-x-4">
          {/* Search */}
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search..."
              className="w-full pl-10 pr-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500"
            />
          </div>
          {showMergeButton && (
            <div className='flex items-center space-x-4 mb-4 animate-fade-in-up'>
              <button
                onClick={handleMergeOrders}
                className="flex items-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
              >
                <GitMerge className="h-5 w-5" />
                <span className="hidden sm:inline">Gộp {selectedOrders.length} đơn đã chọn</span>
                <span className="sm:hidden">Merge ({selectedOrders.length})</span>
              </button>
              {/* <button
              onClick={handleExportOrders}
              className="flex items-center space-x-2 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
            >
              Export
            </button> */}
            </div>
          )}
          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            {/* 1. Select Ngành hàng */}
            <select
              value={importIndustryId}
              onChange={(e) => setImportIndustryId(e.target.value)}
              className="px-3 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white text-sm focus:ring-2 focus:ring-green-500 outline-none"
            >
              <option value="">-- Chọn ngành nhập Excel --</option>
              {/* Map danh sách categories của bạn */}
              {categories.map((cat: any) => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>

            {/* 2. Input File ẩn */}
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleImportOrders}
              accept=".csv,.txt,.xlsx"
              className="hidden"
            />

            {/* 3. Nút bấm kích hoạt */}
            <button
              onClick={() => {
                if (!importIndustryId) {
                  toast.error("Vui lòng chọn Ngành hàng trước!");
                  return;
                }
                fileInputRef.current?.click();
              }}
              className="flex items-center space-x-2 px-4 py-2 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-lg transition-all shadow-lg hover:shadow-green-500/30"
            >
              <Upload className="w-4 h-4" />
              <span>Import Excel</span>
            </button>
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setPage(1);
              }}
              className="px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
            >
              {/*  Option mặc định "All" thủ công */}
              <option value="all">All Status</option>

              {/*  Map dữ liệu từ API */}
              {allStatuses.map(status => (
                <option
                  key={status.ID}
                  value={status.Type} 
                >
                  {status.Name} 
                </option>
              ))}
            </select>


          </div>
        </div>
      </div>
      {/* Orders Table */}

      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl overflow-hidden overflow-x-auto">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[800px]">

            <thead className="bg-gray-800/50 border-b border-gray-700/50">
              <tr>

                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm w-12">
                  {showCheckbox && eligibleOrders.length > 0 && (
                    <input
                      type="checkbox"
                      checked={isHeaderChecked}
                      onChange={handleSelectAll}
                      className="flex items-center gap-2 form-checkbox text-blue-500 h-6 w-6 rounded bg-gray-700 border-gray-600 focus:ring-blue-500"
                    />
                  )}


                </th>

                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Order</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Supplier</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Items</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Total</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Status</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Date</th>
                <th className="text-left p-2 sm:p-4 text-gray-300 font-medium text-xs sm:text-sm">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredOrders.map((order) => {
                return (
                  <tr key={order.id} className="border-b border-gray-700/30 hover:bg-gray-800/30 transition-colors">
                    <td className="p-2 sm:p-4">
                      {showCheckbox && Number(order.status) === 7 && (
                        <input
                          type="checkbox"
                          checked={selectedOrders.includes(order.id)}
                          onChange={() => toggleOrderSelection(order.id)}
                          className="form-checkbox text-blue-500 h-6 w-6"
                        />
                      )}

                    </td>
                    <td className="p-2 sm:p-4">
                      <div className="flex items-center gap-2">

                        <div>
                          <p className="text-white font-medium text-xs sm:text-sm">{order.orderNumber}</p>
                        </div>
                      </div>
                    </td>

                    <td className="p-2 sm:p-4">
                      <div>
                        <p className="text-white text-xs sm:text-sm">{order.supplier_name}</p>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4">
                      <div>
                        <p className="text-white text-xs sm:text-sm">{order.items.length} item(s)</p>
                        <p className="text-gray-400 text-xs">
                          {order.items[0]?.productName}
                          {order.items.length > 1 && ` +${order.items.length - 1} more`}
                        </p>
                      </div>
                    </td>
                    <td className="p-2 sm:p-4 text-white font-semibold text-xs sm:text-sm">{order.total} VNĐ</td>
                    <td className="p-2 sm:p-4">
                      <div className={`flex items-center space-x-2 px-3 py-1 rounded-full text-xs font-medium border w-fit ${getStatusColor(order.status)}`}>
                        {getStatusIcon(order.status)}
                        <span>{order.status_name.toUpperCase()}</span>
                      </div>
                    </td>
                   
                    <td className="p-2 sm:p-4 text-gray-300 text-xs sm:text-sm">{order.orderDate ? new Date(order.orderDate).toLocaleDateString('vi-VN') : ''}</td>
                    <td className="p-2 sm:p-4">
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleEditOrder(order)}
                          className="p-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10 rounded-lg transition-colors"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        {/* <button
                          onClick={() => handleDeleteOrder(order)}
                          className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button> */}

                        <button
                          onClick={() => handleEditOrder(order, true)} // 👈 Xem chi tiết
                          className="p-2 text-gray-400 hover:text-gray-300 hover:bg-gray-500/10 rounded-lg transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
        {filteredOrders.length === 0 && (
          <div className="text-center py-12">
            <Package className="h-8 w-8 sm:h-12 sm:w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-400">No orders found matching your criteria</p>
          </div>
        )}
        {lastPage > 1 && (
          <div className="flex flex-col sm:flex-row justify-center items-center gap-4 py-6">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-3 py-1 rounded text-sm bg-gray-800/50 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >Prev</button>
              {renderPagination()}
              <button
                onClick={() => setPage(p => Math.min(lastPage, p + 1))}
                disabled={page === lastPage}
                className="px-3 py-1 rounded text-sm bg-gray-800/50 text-gray-300 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed"
              >Next</button>
            </div>
          </div>
        )}

      </div>

      {selectedMonths.length > 0 && (
        <button
          onClick={handleExportSelectedMonths}
          className="mb-4 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Xuất {selectedMonths.length} tháng đã chọn</span>
          <span className="sm:hidden">Export ({selectedMonths.length})</span>
        </button>
      )}

      {selectedYears.length > 0 && (
        <button
          onClick={handleExportSelectedYears}
          className="mb-4 px-3 sm:px-6 py-2 sm:py-3 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium rounded-xl transition-all duration-300 transform hover:scale-105 text-sm sm:text-base"
        >
          <span className="hidden sm:inline">Xuất {selectedYears.length} năm đã chọn</span>
          <span className="sm:hidden">Export ({selectedYears.length})</span>
        </button>
      )}

      {mode === 'monthly' && (
        <div className="mt-6 space-y-6">
          {monthlyOrders.map((group: any) => (
            <div key={group.month} className="bg-gray-800/40 rounded-xl p-3 sm:p-4 border border-gray-600/30">
              <div className="flex items-center justify-between mb-2">
                <h2 className="text-white text-base sm:text-lg font-semibold">Tháng {group.month}</h2>
                <input
                  type="checkbox"
                  checked={selectedMonths.includes(group.month)}
                  onChange={() => toggleMonthSelection(group.month)}
                  className="form-checkbox text-green-500 h-5 w-5"
                />
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left min-w-[500px]">
                  <thead>
                    <tr>
                      <th className="p-2 text-gray-300 text-xs sm:text-sm">Sản phẩm</th>
                      <th className="p-2 text-gray-300 text-xs sm:text-sm">Tổng số lượng</th>
                      <th className="p-2 text-gray-300 text-xs sm:text-sm">Giá</th>
                      <th className="p-2 text-gray-300 text-xs sm:text-sm">Thành tiền</th>
                    </tr>
                  </thead>
                  <tbody>
                    {group.items.map((item: any) => (
                      <tr key={item.product_id} className="border-t border-gray-700/40">
                        <td className="p-2 text-white text-xs sm:text-sm">{item.product_name}</td>
                        <td className="p-2 text-white text-xs sm:text-sm">{item.total_quantity}</td>
                        <td className="p-2 text-white text-xs sm:text-sm">${item.price}</td>
                        <td className="p-2 text-white text-xs sm:text-sm">${(item.price * item.total_quantity).toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}

        </div>
      )}

      {mode === 'yearly' && (
        <div className="mt-6 space-y-6">
          {yearlyOrders.map((group: any) => (
            <div key={group.year} className="bg-gray-800/40 rounded-xl p-3 sm:p-6 border border-gray-600/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:space-x-4">
                  <h2 className="text-white text-lg sm:text-xl font-bold">Năm {group.year}</h2>
                  <span className="text-green-400 font-semibold text-sm sm:text-base">
                    Tổng doanh thu: ${group.total_revenue?.toLocaleString() || 0}
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={selectedYears.includes(group.year)}
                  onChange={() => toggleYearSelection(group.year)}
                  className="form-checkbox text-green-500 h-5 w-5"
                />
              </div>
              {/* Yearly Summary */}
              <div className="mb-6">
                <h3 className="text-white text-base sm:text-lg font-semibold mb-3">Tổng kết năm</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left bg-gray-900/50 rounded-lg min-w-[600px]">
                    <thead>
                      <tr className="border-b border-gray-700/50">
                        <th className="p-2 sm:p-3 text-gray-300 text-xs sm:text-sm">Mã SP</th>
                        <th className="p-2 sm:p-3 text-gray-300 text-xs sm:text-sm">Tên sản phẩm</th>
                        <th className="p-2 sm:p-3 text-gray-300 text-xs sm:text-sm">Tổng số lượng</th>
                        <th className="p-2 sm:p-3 text-gray-300 text-xs sm:text-sm">Giá</th>
                        <th className="p-2 sm:p-3 text-gray-300 text-xs sm:text-sm">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody>
                      {group.total_items?.map((item: any) => (
                        <tr key={item.product_id} className="border-t border-gray-700/40">
                          <td className="p-2 sm:p-3 text-white font-mono text-xs sm:text-sm">{item.product_code}</td>
                          <td className="p-2 sm:p-3 text-white text-xs sm:text-sm">{item.product_name}</td>
                          <td className="p-2 sm:p-3 text-white font-semibold text-xs sm:text-sm">{item.total_quantity}</td>
                          <td className="p-2 sm:p-3 text-white text-xs sm:text-sm">${item.price}</td>
                          <td className="p-2 sm:p-3 text-green-400 font-semibold text-xs sm:text-sm">
                            ${(item.price * item.total_quantity).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Monthly Breakdown */}
              <div>
                <h3 className="text-white text-base sm:text-lg font-semibold mb-3">Chi tiết theo tháng</h3>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {group.monthly_breakdown?.map((monthData: any) => (
                    <div key={monthData.month} className="bg-gray-900/30 rounded-lg p-3 sm:p-4">
                      <h4 className="text-blue-400 font-semibold mb-2 text-sm sm:text-base">
                        {monthData.month_name} {group.year}
                      </h4>
                      <div className="space-y-2">
                        {monthData.items?.slice(0, 3).map((item: any) => (
                          <div key={item.product_id} className="flex justify-between text-xs sm:text-sm">
                            <span className="text-gray-300 truncate flex-1 mr-2">{item.product_name}</span>
                            <span className="text-white font-medium whitespace-nowrap">{item.total_quantity} units</span>
                          </div>
                        ))}
                        {monthData.items?.length > 3 && (
                          <div className="text-gray-400 text-xs">
                            +{monthData.items.length - 3} sản phẩm khác
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Order Modal */}
      {showModal && (
        <OrderModal
          order={editingOrder}
          onSave={handleSaveOrder}
          onClose={() => setShowModal(false)}
          readOnly={readOnlyMode}
          currentUser={currentUser} 
        />
      )}
    </div>
  );
};

export default OrdersPage;

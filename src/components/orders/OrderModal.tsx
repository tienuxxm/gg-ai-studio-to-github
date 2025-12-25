import React, { useState, useEffect } from 'react';
import { X, Plus, Trash2, Package } from 'lucide-react';
import api from '../../services/api';
import toast from 'react-hot-toast';
import { getCurrentUser } from '../../utils/auth';
import MySwal from '../../utils/swal';

interface OrderItem {
  id?: string | number;
  productId: string;
  productCode: string;
  productName: string;
  quantity: number;
  quantityOld:number;
  price: number;
  color: string;
}
interface StatusOption {
  ID: number;
  Name: string;
  Type: number;
}
interface Product {
  id: string;
  code: string;
  name: string;
  price: number;
  barcode: string;
  color: string;
  status: string;
  categoryId: string | number;
}
// Trong OrderModal.tsx hoặc file types.ts nếu tách riêng
export interface OrderPayload {
  orderDate: string;
  intended_use: string;
  industry_id: number | string;
  supplier_name: string;
  items: { productCode: string; quantity: number,quantityOld:number, variant: string ,productName :string,price:number}[];
  status: number;
  status_name: string;
  estimated_delivery: string;
  shipping: number;
  notes: string;
}

export interface OrderFromAPI {
  id: string;
  orderNumber: string;
  supplierName?: string;
  subtotal: number;
  tax: number;
  shipping: number;
  total: number;
  status: number;
  status_name: string;
  intendedUse: string;
  orderDate: string;
  estimatedDelivery: string;
  notes: string;
  industry_id: number;
  items: {
    id: number;
    product: {
      id: string;
      code: string;
      name: string;
      price: number;
      categoryId?: string | number;
      color: string;
    };
    quantity: number;
    quantityOld:number;
    price: number;
    variant: string;
  }[];
}
interface OrderModalProps {
  order: OrderFromAPI | null;
  onSave: (order: OrderPayload) => void | Promise<void>;
  onClose: () => void;
  currentUser: any; // Hoặc User type nếu bạn đã có
  readOnly?: boolean;
}
const OrderModal: React.FC<OrderModalProps> = ({ order, onSave, onClose, readOnly = false }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [allStatuses, setAllStatuses] = useState<StatusOption[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [currentUser, setCurrentUser] = useState(getCurrentUser());
  const [formData, setFormData] = useState({
    orderNumber: '',
    supplier_name: '',
    items: [] as OrderItem[],
    subtotal: 0,
    tax: 0,
    shipping: 0,
    total: 0,
    status: 1,
    statusName: '',
    intendedUse: '',
    orderDate: new Date().toISOString().split('T')[0],
    estimatedDelivery: '',
    notes: ''
  });
  const [categories, setCategories] = useState<{ id: number, name: string }[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | number>('');

  // 1. Fetch danh sách Category khi Modal mở
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        // Giả sử API lấy danh mục là /categories
        const res = await api.get('/categories');
        // Map dữ liệu tùy API của bạn (ví dụ: res.data.categories)
        setCategories(res.data.categories || []);
      } catch (e) {
        console.error("Lỗi tải danh mục", e);
      }
    };
    fetchCategories();
  }, []);
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
    if (readOnly) return;
    const fetchProducts = async () => {
      // Nếu chưa chọn danh mục thì không tải gì cả (để nhẹ máy)
      if (!selectedCategoryId) {
        setProducts([]);
        return;
      }

      setLoadingProducts(true);
      try {
        // ✅ GỌI API LỌC THEO CATEGORY (Thêm tham số category_id)
        const res = await api.get(`/products?per_page=2000&status=active&category_id=${selectedCategoryId}`);
        let availableProducts = res.data.products || [];

        if (order && order.items) {
          const loadedIds = new Set(availableProducts.map((p: any) => String(p.id)));
          const missingProducts = order.items
            .filter((item) => item.product && !loadedIds.has(String(item.product.id)))
            .map((item) => ({
              id: item.product.id,
              code: item.product.code,
              name: item.product.name,
              price: item.product.price,
              categoryId: item.product.categoryId, // Lưu ý map thêm cái này
              status: 'inactive',
              barcode: '',
              color: item.product.color
            }));

          if (missingProducts.length > 0) {
            availableProducts = [...missingProducts, ...availableProducts];
          }
        }

        setProducts(availableProducts);
      } catch (e) {
        console.error('❌ Failed to load products', e);
        toast.error("Lỗi tải sản phẩm");
      } finally {
        setLoadingProducts(false);
      }
    };

    fetchProducts();
  }, [order, readOnly, selectedCategoryId]);

  // Thay thế đoạn useEffect map data trong OrderModal.tsx

  useEffect(() => {
    if (order) {

      const detectedCategory = order.industry_id
        ? String(order.industry_id)
        : (order.items.length > 0 ? String(order.items[0].product.categoryId) : '');

      setSelectedCategoryId(detectedCategory || '');

      setFormData({
        orderNumber: order.orderNumber,
        supplier_name: order.supplierName ?? '',

        items: order.items.map((it: any) => {
          return {
            id: it.id, 
            productId: it.product.id,
            productCode: it.product.code,
            productName: it.product.name,
            quantity: it.quantity,
            quantityOld:it.quantityOld,
            price: it.product.price,
            color: it.product.color
          };
        }),
        subtotal: order.subtotal,
        tax: order.tax,
        shipping: order.shipping,
        total: order.total,
        status: Number(order.status),
        statusName: order.status_name,
        intendedUse: order.intendedUse,
        orderDate: order.orderDate ? order.orderDate.split('T')[0] : '',
        estimatedDelivery: order.estimatedDelivery ? order.estimatedDelivery.split('T')[0] : '',
        notes: order.notes ?? ''
      });

    } else {
      setSelectedCategoryId('');
      setProducts([]);
      setFormData({
        orderNumber: '',
        supplier_name: '',
        items: [],
        subtotal: 0,
        tax: 0,
        shipping: 0,
        total: 0,
        status: 1,
        statusName: '',
        intendedUse: '',
        orderDate: new Date().toISOString().split('T')[0],
        estimatedDelivery: '',
        notes: ''
      });
    }
  }, [order]);


  useEffect(() => {
    const subtotal = formData.items.reduce(
      (sum, item) => sum + (Number(item.quantity) * Number(item.price)), 0
    );
    const tax = 0;
    const shipping = 0;
    const total = subtotal;
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total,
      shipping
    }));
  }, [formData.items]);


  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const orderDate = new Date(formData.orderDate);
    const deliveryDate = new Date(formData.estimatedDelivery);
    // Kiểm tra ngày hợp lệ
    if (deliveryDate <= orderDate) {
      toast.error("Ngày giao hàng phải sau ngày đặt hàng.");
      return;
    }
    if (!selectedCategoryId) {
      toast.error("Vui lòng chọn Ngành hàng (Category)!");
      return;
    }
    // Chỉ lấy các trường cần gửi cho BE
    const payload: OrderPayload = {
      industry_id: selectedCategoryId,
      orderDate: formData.orderDate,
      intended_use: formData.intendedUse,
      supplier_name: formData.supplier_name, // Đổi từ supplierName sang supplier_name
      items: formData.items.map(it => ({
        variant: it.color || '',
        productCode: it.productCode || it.productId,
        productName:it.productName,
        quantity: it.quantity,
        quantityOld:it.quantityOld,
        price:it.price
        
      })),
      status_name: formData.statusName,
      status: formData.status, // Mặc định là 'draft' nếu không có
      estimated_delivery: formData.estimatedDelivery,
      shipping: formData.shipping,
      notes: formData.notes
    };
    onSave(payload);
  };


  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: name === 'shipping' ? parseFloat(value) || 0 : value
    }));
  };

  const addItem = () => {
    // Logic sinh mã cho ngành 18
    let nextCode = '';
    const isManual = String(selectedCategoryId) === '18';

    if (isManual) {
      // Lấy index tiếp theo dựa trên số lượng item hiện có
      const nextIndex = formData.items.length + 1;
      // Format: 18 + 0000 + 0001 (4 số đuôi)
      nextCode = `180000${String(nextIndex).padStart(4, '0')}`;
    }

    const newItem: OrderItem = {
      productId: isManual ? `MANUAL_${Date.now()}` : '', // ID giả để React làm key
      productCode: nextCode,
      productName: '',
      quantity: 1,
      quantityOld:1,
      price: 0,
      color: isManual ? '000' : '', // Mặc định màu 000
      // Thêm unit nếu cần
      // unit: 'Cái' 
    };

    setFormData(prev => ({
      ...prev,
      items: [...prev.items, newItem]
    }));
  };


  // ✅ LOGIC MỚI: REMOVE ITEM VỚI SWEETALERT2
  const removeItem = async (index: number) => {
    const itemToRemove = formData.items[index];

    // Điều kiện kiểm tra (Giữ nguyên)
    const isMergeOrder = formData.orderNumber?.startsWith('MP');
    const isDraft = Number(formData.status) === 8;
    // Fallback: Tìm ID từ item hoặc từ logic khác nếu cần
    const realId = itemToRemove.id;
    const hasRealId = realId && !String(realId).startsWith('temp');

    if (isMergeOrder && isDraft && hasRealId) {
      // 👇 THAY THẾ WINDOW.CONFIRM BẰNG MYSWAL
      const result = await MySwal.fire({
        title: '📦 Tách Đơn Hàng?',
        html: `
                <div class="text-left text-sm">
                    <p class="mb-2">Bạn đang xóa sản phẩm: <span class="font-bold text-yellow-400">${itemToRemove.productName}</span></p>
                    <p>Hệ thống sẽ <b>TỰ ĐỘNG TÁCH</b> dòng này sang một đơn gộp mới (Nháp) để xử lý sau thay vì xóa vĩnh viễn.</p>
                </div>
            `,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Đồng ý, Tách ngay',
        cancelButtonText: 'Hủy bỏ',
        reverseButtons: true // Đảo vị trí nút cho thuận tay
      });

      // 👇 Kiểm tra kết quả bấm nút
      if (result.isConfirmed) {
        try {
          // Hiển thị loading khi đang gọi API
          MySwal.fire({
            title: 'Đang xử lý...',
            text: 'Vui lòng chờ trong giây lát',
            allowOutsideClick: false,
            didOpen: () => {
              MySwal.showLoading();
            }
          });

          // Gọi API Split
          await api.post('/orders/split', {
            merge_id: formData.orderNumber,
            line_ids: [realId]
          });

          // Tắt loading và thông báo thành công
          await MySwal.fire({
            icon: 'success',
            title: 'Thành công!',
            text: 'Sản phẩm đã được tách sang đơn mới.',
            timer: 2000,
            showConfirmButton: false
          });

          // Cập nhật giao diện: Xóa dòng đó đi
          setFormData(prev => ({
            ...prev,
            items: prev.items.filter((_, i) => i !== index)
          }));

        } catch (error: any) {
          console.error("Lỗi tách đơn:", error);

          // Thông báo lỗi đẹp
          MySwal.fire({
            icon: 'error',
            title: 'Lỗi',
            text: error.response?.data?.message || "Không thể tách đơn. Vui lòng thử lại."
          });
        }
      }
      return; // Dừng, không chạy logic xóa thường bên dưới
    }

    // --- Logic xóa thường (cho đơn PO hoặc item mới thêm) ---
    // Có thể thêm confirm nhẹ cho xóa thường nếu muốn
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const updateItem = (index: number, field: keyof OrderItem, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.map((item, i) => {
        if (i === index) {
          if (field === 'productId') {
            const product = products.find(p => p.id === value);
            return {
              ...item,
              productId: value as string,
              productCode: product?.code || '',
              productName: product?.name || '',
              price: product?.price || 0,
              color: product?.color || ''
            };
          }
          return { ...item, [field]: value };
        }
        return item;
      })
    }));

  };
  useEffect(() => {
    if (products.length === 0 || formData.items.length === 0) return;

  }, [products, formData.items]);
  // Thêm hàm này vào trong OrderModal component
  // Trong OrderModal.tsx

  const getAvailableStatuses = () => {
    // Nếu tạo mới -> Chỉ có 1 trạng thái là "Mới"
    if (!allStatuses || allStatuses.length === 0) return [];
    if (!order) return allStatuses.filter(s => s.Type === 1);
    const currentStatus = Number(order.status);
    const role = currentUser?.role?.name_role;
    const dept = currentUser?.department?.name_department;

    if (role === 'Administrator') {
      return allStatuses;
    }
    let allowedTypes: number[] = [currentStatus]; // Luôn giữ trạng thái hiện tại

    // --- A. KINH DOANH (Sales) & IT ---
    if (role === 'Sales') {
      if (currentStatus === 1 || currentStatus === 10 || currentStatus === 9) {
        console.log('debug', allowedTypes)
        allowedTypes.push(1); // Gửi lại (Mới)
      }
    }

    // --- B. CUNG ỨNG / HÀNH CHÍNH / IT ---
    else if (dept === 'Cung ứng' || dept === 'Hành chính - Miền Nam'|| role === 'Supply') {
      // B1. Nhận đơn Mới (1)
      if (currentStatus === 1) {
        allowedTypes.push(7); // Chốt
        allowedTypes.push(10); // Trả về
      }
      // B2. Đã Chốt (13)
      else if (currentStatus === 8) {
        allowedTypes.push(2);  // Gửi duyệt
      }
      // B3. Sếp đã duyệt (3)
      else if (currentStatus === 3) {
        allowedTypes.push(4);  // Đang đặt hàng
      }
      // B4. Đang đặt (4)
      else if (currentStatus === 4) {
        allowedTypes.push(11); // Hoàn thành
      }
    }

    // --- C. GIÁM ĐỐC (CEO) ---
    else if (role === 'Leader') {
      if (currentStatus === 2) {
        allowedTypes.push(3); // Duyệt
        allowedTypes.push(5); // Từ chối
      }
    }

    // Lọc danh sách trạng thái
    const uniqueTypes = Array.from(new Set(allowedTypes));
    const result = allStatuses.filter(s => uniqueTypes.includes(s.Type));
    return result;
  };
  // const isKinhDoanh = currentUser.department?.name_department === 'KINH_DOANH';
  const canEditDetails = !readOnly && (!order || [1, 10].includes(Number(order.status)));





  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
          <h2 className="text-lg sm:text-2xl font-bold text-white">
            {readOnly ? 'View Order' : (order ? 'Edit Order' : 'Create New Order')}
          </h2>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-white hover:bg-gray-700/50 rounded-lg transition-colors"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* Order Details */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {!!order && (
              <div>
                <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Order Number</label>
                <input
                  type="text"
                  name="orderNumber"
                  value={formData.orderNumber}
                  onChange={handleChange}
                  required
                  disabled
                  className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
                  placeholder="Enter order number"
                />
              </div>
            )}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Order Date</label>
              <input
                type="date"
                name="orderDate"
                value={formData.orderDate}
                onChange={handleChange}
                required
                disabled // Không cho sửa nếu là đơn đã có
                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Customer Information */}
          <div className="space-y-4">
            <h3 className="text-base sm:text-lg font-semibold text-white">Supplier Information</h3>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Supplier Name</label>
              <input
                type="text"
                name="supplier_name"
                value={formData.supplier_name}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter supplier name"
                disabled={!!order}

              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Intended Use</label>
              <input
                type="text"
                name="intendedUse"
                value={formData.intendedUse}
                onChange={handleChange}
                required
                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter Intened Use"
                disabled={!!order}

              />
            </div>
          </div>

          {/* Dropdown Category */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">Ngành hàng</label>
            <select
              value={selectedCategoryId}
              onChange={(e) => {
                const newVal = e.target.value;
                setSelectedCategoryId(newVal);
                setFormData(prev => ({ ...prev, items: [] })); // Reset items nếu đổi ngành
              }}
              // 👇 QUAN TRỌNG: Khóa cứng nếu đang Sửa đơn hàng (có order)
              disabled={!!order}
              className={`w-full px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white 
                ${!!order ? 'opacity-60 cursor-not-allowed' : ''}`} 
                >
              <option value="">-- Chọn ngành hàng --</option>
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
          </div>
          {/* Order Items */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base sm:text-lg font-semibold text-white">Order Items</h3>
              {
                !readOnly && canEditDetails &&(
                  <button
                    type="button"
                    onClick={addItem}
                    disabled={!selectedCategoryId}
                    className={`flex items-center px-4 py-2 rounded-lg transition-colors ${!selectedCategoryId
                      ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                      }`}
                  >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Add Item</span>
                    <span className="sm:hidden">Add</span>
                  </button>
                )
              }
            </div>
            {formData.items.map((item, index) => {
              const fallbackProduct = products.find(p => p.code === item.productCode);
              const currentValue = item.productId || fallbackProduct?.id || '';         
              return (
                <div key={index} className="bg-gray-800/30 rounded-xl p-3 sm:p-4">
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-end">
                    <div className="sm:col-span-5 ">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Product</label>
                      {String(selectedCategoryId) === '18' ? (
                        <input
                          type="text"
                          placeholder="Nhập tên sản phẩm..."
                          value={item.productName}
                          disabled={readOnly||!canEditDetails}
                          onChange={(e) => updateItem(index, 'productName', e.target.value)}
                          className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-yellow-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-yellow-500/50 text-sm"
                        />
                      ) : (
                        readOnly ?  (
                          <div 
                          className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base">
                            {item.productName}
                          </div>
                        ) : (
                          <select
                            value={currentValue}
                            disabled={!canEditDetails}
                            onChange={(e) => updateItem(index, 'productId', e.target.value)}
                            className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
                          >
                            <option value="">Select a product</option>
                            {products.map(product => (
                              <option key={product.id} value={product.id}>
                                [{product.code}] - {product.name} {product.color ? `(${product.color})` : ''}
                              </option>
                            )
                            )}
                          </select>
                        ))}
                    </div>
                    {/* Các phần Quantity, Price, Delete */}
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Quantity</label>
                      <input
                        value={item.quantity}
                        onChange={(e) => updateItem(index, 'quantity', parseInt(e.target.value)||1 )}
                        disabled={!canEditDetails}
                        className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">QuantityOld</label>
                      <input
                        value={item.quantityOld}
                        onChange={(e) => updateItem(index, 'quantityOld', parseInt(e.target.value)||1 )}
                        disabled={!canEditDetails}
                        className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Price</label>
                      <input
                        value={item.price}
                        disabled={String(selectedCategoryId) !== '18'||!canEditDetails}
                        onChange={(e) => updateItem(index, 'price', parseFloat(e.target.value) || 0)}
                        className={`w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base
                        ${String(selectedCategoryId) === '18' ? 'border-yellow-600/50' : ''} `}
                      />
                    </div>
                    <div className="sm:col-span-2">
                      <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Color</label>
                      <input
                        value={item.color}
                        disabled
                        onChange={(e) => updateItem(index, 'color', parseFloat(e.target.value))}
                        className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
                      />
                    </div>
                    {!readOnly && (
                    <div className="flex justify-center sm:col-span-1">
                      <button
                        type="button"
                        onClick={() => removeItem(index)}
                        className="p-2 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Order Summary */}
          <div className="bg-gray-800/30 rounded-xl p-4">
            <h3 className="text-base sm:text-lg font-semibold text-white mb-4">Order Summary</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-gray-300 text-sm sm:text-base">
                <span>Subtotal:</span>
                <span>{formData.subtotal.toFixed(2)} VNĐ</span>
              </div>
      
              <hr className="border-gray-700" />
              <div className="flex justify-between text-white font-semibold text-base sm:text-lg">
                <span>Total:</span>
                <span>{Number(formData.total).toFixed(2)} VNĐ</span>
              </div>
            </div>
          </div>

          {/* Status and Additional Info */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Order Status</label>
              <select
                name="status"
                value={formData.status}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setFormData(prev => ({ ...prev, status: val }));

                  // Gợi ý User nhập Note nếu chọn Hủy hoặc Trả về
                  if (val === 5 || val === 17) {
                    toast('Vui lòng nhập lý do vào ô Ghi chú', { icon: '📝' });
                  }
                }}
                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"

              >/

                {getAvailableStatuses().map(status => {
                  return (
                    <option key={status.ID} value={status.Type}>{status.Name.toUpperCase()}</option>

                  );
                })}
              </select>
            </div>

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Estimated Delivery</label>
              <input
                type="date"
                name="estimatedDelivery"
                value={formData.estimatedDelivery}
                min={formData.orderDate}
                disabled={!canEditDetails}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Order Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleChange}
              rows={3}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none text-sm sm:text-base"
              placeholder="Enter any special instructions or notes"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
            >
              Cancel
            </button>
            {!readOnly && (
              <button
                type="submit"
                className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 text-sm sm:text-base"
              >
                {order ? 'Update Order' : 'Create Order'}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default OrderModal;

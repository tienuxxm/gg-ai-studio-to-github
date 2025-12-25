import React, { useState, useEffect } from 'react';
import { X, Upload, Package } from 'lucide-react';

type Category = {id: number; name: string};

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  category_id: number|'';
  price: number|'';
  status: 'active' | 'inactive' | 'out_of_stock';
  image: string;
  description: string;
  createdAt: string;
  color: string;
  barcode: string;
  unit: string; 
}

type ProductInput = Omit<Product, 'id' | 'createdAt' | 'sales'|'category'>;


interface ProductModalProps {
  product: Product | null;
  onSave: (data: FormData) => void;
  onClose: () => void;
  categories: Category[]; 
  readOnly?:boolean;
  role: 'nhan_vien' | 'pho_phong' | 'truong_phong';   
}


const ProductModal: React.FC<ProductModalProps> = ({ product, onSave, onClose,categories,role,readOnly }) => {
  const isManager = role === 'pho_phong' || role === 'truong_phong';
  const [formData, setFormData] = useState<ProductInput>({
    name: '',
    sku: '',
    category_id: '',
    price: '',
    color: '',
    status: 'active' ,
    image: '',
    description: '',
    barcode: '', 
    unit:'',
  });


  useEffect(() => {
    if (product) {
      setFormData({
        name: product.name,
        sku: product.sku,
        category_id: product.category_id,
        price: product.price,
        status: product.status,
        image: product.image,
        description: product.description,
        color: product.color,
        barcode: product.barcode, 
        unit:product.unit,
      });
    }
  }, [product]);

  const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  const form = new FormData();

  form.append('name', formData.name);
  form.append('sku', formData.sku);

  // Chỉ append khi chắc chắn category_id là số hợp lệ
  if (formData.category_id !== '' && !isNaN(Number(formData.category_id))) {
    form.append('category_id', String(formData.category_id));
  }

  if (formData.price !== '') form.append('price', String(formData.price));
  if (formData.status) form.append('status', formData.status);
  if (formData.color) form.append('color', formData.color);
  if (formData.barcode) form.append('barcode', formData.barcode); // Thêm barcode vào form
  if (formData.description) form.append('description', formData.description);
  if (imageFile) {form.append('image', imageFile);

  }

  await onSave(form);
};


  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: ['price', 'stock', 'min_stock', 'category_id'].includes(name)
        ? Number(value)
        : value
    }));
  };

  // Thêm state cho file
const [imageFile, setImageFile] = useState<File | null>(null);

const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
  if (e.target.files && e.target.files[0]) {
    setImageFile(e.target.files[0]);
  }
};


  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900/95 backdrop-blur-xl border border-gray-700/50 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto mx-4">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 border-b border-gray-700/50">
          <h2 className="text-lg sm:text-2xl font-bold text-white">
            {readOnly ? 'View Product':(product ? 'Edit Product' : 'Add New Product')}
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
          {/* Product Image */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">
              Product Image
            </label>

            <div className="flex items-center space-x-4">
              {/* ảnh preview */}
              <img
                src={imageFile ? URL.createObjectURL(imageFile) : formData.image}
                alt="Product preview"
                className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover border border-gray-700"
              />

              {/* ---- URL + ChooseFile trong cùng 1 khung bo tròn ---- */}
              <div className="flex w-full overflow-hidden rounded-xl border border-gray-700">
                {/* input URL */}
                <input
                  type="url"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  disabled={readOnly}
                  placeholder="Enter image URL"
                  className="flex-1 px-3 sm:px-4 py-2 bg-gray-800/50 text-white placeholder-gray-400
                            focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm sm:text-base"
                />

                {/* input file ẩn */}
                <input
                  id="imageFileInput"
                  type="file"
                  accept="image/*"
                  onChange={handleFileChange}
                  disabled={readOnly}

                  className="hidden"
                />

                {/* nút label đẹp */}
                <label
                  htmlFor="imageFileInput"
                  className="px-3 sm:px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600
                            hover:from-blue-700 hover:to-cyan-700 text-white text-sm
                            cursor-pointer select-none transition-all duration-200
                            flex items-center justify-center"
                >
                  <span className="hidden sm:inline">Choose File</span>
                  <span className="sm:hidden">Choose</span>
                </label>
              </div>
            </div>

            <p className="text-gray-400 text-xs sm:text-sm mt-1">
              Enter a valid image URL or choose a file
            </p>
          </div>



          {/* Product Name */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              disabled={readOnly}

              onChange={handleChange}
              required
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
              placeholder="Enter product name"
            />
          </div>

          {/* Min Stock and Category and Barcode */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
           
          {/* <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Min Stock</label>
            <input
              type="number"
              name="min_stock"
              value={formData.min_stock}
              onChange={handleChange}
              min="0"
              required
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
              placeholder="0"
          />
          </div> */}

            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Category</label>
              <select
                name="category_id"
                value={formData.category_id}
                onChange={handleChange}
                disabled={readOnly}

                required
                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
              >
                {categories.map(category => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            {/* <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Barcode</label>
              <input
                type="text"
                name="barcode"
                value={formData.barcode}
                onChange={handleChange}
                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Enter product barcode"
              />
            </div> */}
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Price ($)</label>
              <input
                type="number"
                name="price"
                value={formData.price}
                disabled={readOnly}

                onChange={handleChange}
                min="0"
                required
                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
                placeholder="0"
              />
            </div>
            <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Color</label>
              <input
                type="text"
                name="color"
                value={formData.color}
                onChange={handleChange}
                disabled={readOnly}

                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
                placeholder="Color"
              />
            </div>
          </div>

          {/* Price and Stock */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            
            {/* <div>
              <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Stock Quantity</label>
              <input
                type="number"
                name="stock"
                value={formData.stock}
                onChange={handleChange}
                min="0"
                required
                className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
                placeholder="0"
              />
            </div> */}
            

          </div>

                   
          {/* Status */}
          {isManager && (
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 text-sm sm:text-base"
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          )}
          {/* Description */}
          <div>
            <label className="block text-xs sm:text-sm font-medium text-gray-300 mb-2">Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              disabled={readOnly}

              rows={4}
              className="w-full px-3 sm:px-4 py-2 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 resize-none text-sm sm:text-base"
              placeholder="Enter product description"
            />
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-end space-y-2 sm:space-y-0 sm:space-x-4 pt-4 border-t border-gray-700/50">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 sm:px-6 py-2 text-gray-400 hover:text-white transition-colors text-sm sm:text-base"
            >
              {readOnly ? 'Close':'Cancel'}

            </button>
            {!readOnly && (
              <button
              type="submit"
              className="w-full sm:w-auto px-4 sm:px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-xl transition-all duration-300 text-sm sm:text-base"
            >
              {product ? 'Update Product' : 'Create Product'}
            </button>
            )

            }
            
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductModal;
import React, { useMemo } from 'react';
import { TrendingUp } from 'lucide-react';

interface TopProductsProps {
  products: Array<{
    id: string;
    name: string;
    quantity: number;
    revenue: number;
  }>;
}

interface ProductWithChange {
  name: string;
  quantity: number;
  revenue: number;
  change: number;
}

const TopProducts: React.FC<TopProductsProps> = ({ products }) => {
  const formattedProducts: ProductWithChange[] = useMemo(() => {
    return products.slice(0, 5).map((product) => ({
      name: product.name,
      quantity: product.quantity,
      revenue: product.revenue,
      change: Math.random() * 30 - 10 // Mock change percentage (-10% to +20%)
    }));
  }, [products]);

  if (!products || products.length === 0) {
    return (
      <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-xl font-semibold text-white">Top Products</h3>
          <TrendingUp className="h-5 w-5 text-green-400" />
        </div>
        <div className="flex items-center justify-center h-32 text-gray-400">
          <p>No product data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-900/40 backdrop-blur-xl border border-gray-700/50 rounded-2xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-white">Top Products</h3>
        <TrendingUp className="h-5 w-5 text-green-400" />
      </div>

      <div className="space-y-4">
        {formattedProducts.map((product, index) => (
          <div key={index} className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-br from-blue-500/20 to-cyan-500/20 border border-blue-500/30 rounded-lg flex items-center justify-center">
                <span className="text-blue-400 text-sm font-bold">{index + 1}</span>
              </div>
              <div>
                <p className="text-white text-sm font-medium">{product.name}</p>
                <p className="text-gray-400 text-xs">{product.quantity} sold</p>
              </div>
            </div>

            <div className="text-right">
              <p className="text-white text-sm font-semibold">${product.revenue.toFixed(2)}</p>
              <div className={`flex items-center space-x-1 text-xs ${
                product.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                <TrendingUp className={`h-3 w-3 ${product.change < 0 ? 'rotate-180' : ''}`} />
                <span>{Math.abs(product.change).toFixed(1)}%</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-700/50">
        <button className="w-full text-blue-400 hover:text-blue-300 text-sm font-medium transition-colors">
          View All Products
        </button>
      </div>
    </div>
  );
};

export default TopProducts;
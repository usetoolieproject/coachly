import React from 'react';
import { Star, Plus, Minus, Check } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  image: string;
  price: number;
  rating: number;
  isSelected?: boolean;
}

interface ProductSectionProps {
  title?: string;
  subtitle?: string;
  discountText?: string;
  discountPercent?: number;
  countdown?: {
    days: number;
    hours: number;
    minutes: number;
  };
  products?: Product[];
  onProductToggle?: (productId: string) => void;
  onQuantityChange?: (productId: string, quantity: number) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  title = "Limited-Time Bundle, Save 15%",
  subtitle = "Buy Together & Save",
  discountText = "Get 20% OFF",
  discountPercent = 15,
  countdown = { days: 0, hours: 0, minutes: 0 },
  products = [
    {
      id: '1',
      name: 'Performance Tire Set',
      image: '/products/tire.jpg',
      price: 299,
      rating: 4.8,
      isSelected: false
    },
    {
      id: '2', 
      name: 'Bronze Alloy Wheels',
      image: '/products/wheel.jpg',
      price: 450,
      rating: 4.9,
      isSelected: true
    },
    {
      id: '3',
      name: 'Red Brake Calipers',
      image: '/products/brake.jpg', 
      price: 180,
      rating: 4.7,
      isSelected: false
    }
  ],
  onProductToggle,
  onQuantityChange
}) => {
  return (
    <div className="bg-white py-12">
      <div className="max-w-6xl mx-auto px-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            {title.split(',')[0]},{' '}
            <span className="text-red-600 underline">
              Save {discountPercent}%
            </span>
          </h2>
          <p className="text-gray-600 text-lg">{subtitle}</p>
        </div>

        {/* Countdown Timer */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-4">
            {Object.entries(countdown).map(([unit, value]) => (
              <div key={unit} className="text-center">
                <div className="bg-gray-900 text-white text-2xl font-bold px-4 py-3 rounded-lg min-w-[60px]">
                  {value.toString().padStart(2, '0')}
                </div>
                <div className="text-sm text-gray-600 mt-2 capitalize">{unit}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Products Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {products.map((product) => (
            <div key={product.id} className="bg-gray-50 rounded-xl p-6 border border-gray-200">
              {/* Product Image */}
              <div className="aspect-square bg-gray-200 rounded-lg mb-4 flex items-center justify-center">
                <div className="w-16 h-16 bg-gray-300 rounded-full"></div>
              </div>

              {/* Product Info */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <input
                      type="checkbox"
                      checked={product.isSelected}
                      onChange={() => onProductToggle?.(product.id)}
                      className="w-4 h-4 text-blue-600 rounded"
                    />
                    <h3 className="font-semibold text-gray-900">{product.name}</h3>
                  </div>
                  
                  <div className="flex items-center space-x-1 mb-2">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        className={`w-4 h-4 ${i < Math.floor(product.rating) ? 'text-yellow-400 fill-current' : 'text-gray-300'}`} 
                      />
                    ))}
                    <span className="text-sm text-gray-600">({product.rating})</span>
                  </div>
                  
                  <div className="text-2xl font-bold text-gray-900">${product.price}</div>
                </div>
              </div>

              {/* Quantity Selector */}
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Minus className="w-4 h-4" />
                  </button>
                  <span className="w-8 text-center">1</span>
                  <button className="p-1 hover:bg-gray-200 rounded">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                
                {product.isSelected && (
                  <div className="flex items-center space-x-1 text-green-600">
                    <Check className="w-4 h-4" />
                    <span className="text-sm font-medium">Selected</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Discount Banner */}
        <div className="mt-8 text-center">
          <div className="inline-block bg-red-600 text-white px-6 py-2 rounded-lg font-semibold">
            {discountText}
          </div>
        </div>
      </div>
    </div>
  );
};

import { Button } from "@/components/ui/button";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@shared/schema";
import { Minus, Plus, Trash2 } from "lucide-react";

interface CartItemProps {
  product: Product;
  quantity: number;
}

export default function CartItem({ product, quantity }: CartItemProps) {
  const { updateQuantity, removeItem } = useCart();

  const handleQuantityChange = (newQuantity: number) => {
    if (newQuantity === 0) {
      removeItem(product.id);
    } else {
      updateQuantity(product.id, newQuantity);
    }
  };

  const itemTotal = parseFloat(product.price!) * quantity;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-3 sm:space-y-0">
      {/* Product Info */}
      <div className="flex items-center space-x-3 flex-1">
        <img
          src={product.imageUrl ? `${product.imageUrl}&auto=format&fit=crop&w=60&h=60` : "https://images.unsplash.com/photo-1542838132-92c53300491e?w=60&h=60&fit=crop&crop=center&q=80"}
          alt={product.name}
          className="h-12 w-12 sm:h-16 sm:w-16 rounded-lg object-cover flex-shrink-0"
          onError={(e) => {
            e.currentTarget.src = "https://images.unsplash.com/photo-1542838132-92c53300491e?w=60&h=60&fit=crop&crop=center&q=80";
          }}
        />
        <div className="flex-1 min-w-0">
          <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base truncate">
            {product.name}
          </p>
          <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
            {product.unit} • {formatCurrency(parseFloat(product.price!))} / unité
          </p>
        </div>
      </div>

      {/* Controls and Price */}
      <div className="flex items-center justify-between sm:justify-end sm:space-x-4">
        {/* Quantity Controls */}
        <div className="flex items-center space-x-1 sm:space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="px-2 sm:px-3 py-1 bg-white dark:bg-gray-700 border rounded text-center min-w-[35px] sm:min-w-[40px] text-sm">
            {quantity}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-7 w-7 sm:h-8 sm:w-8"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Price */}
        <span className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
          {formatCurrency(itemTotal)}
        </span>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7 sm:h-8 sm:w-8 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => removeItem(product.id)}
        >
          <Trash2 className="h-3 w-3 sm:h-4 sm:w-4" />
        </Button>
      </div>
    </div>
  );
}

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
    <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
      <div className="flex items-center space-x-3">
        <img
          src={`${product.imageUrl}&auto=format&fit=crop&w=60&h=60`}
          alt={product.name}
          className="h-12 w-12 rounded-lg object-cover"
        />
        <div>
          <p className="font-medium text-gray-900 dark:text-white">
            {product.name}
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {product.unit}
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        {/* Quantity Controls */}
        <div className="flex items-center space-x-2">
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(quantity - 1)}
            disabled={quantity <= 1}
          >
            <Minus className="h-3 w-3" />
          </Button>
          
          <span className="px-3 py-1 bg-white dark:bg-gray-700 border rounded text-center min-w-[40px]">
            {quantity}
          </span>
          
          <Button
            variant="outline"
            size="icon"
            className="h-8 w-8"
            onClick={() => handleQuantityChange(quantity + 1)}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {/* Price */}
        <span className="font-medium text-gray-900 dark:text-white w-20 text-right">
          {formatCurrency(itemTotal)}
        </span>

        {/* Remove Button */}
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-red-600 hover:text-red-800 hover:bg-red-50 dark:hover:bg-red-900/20"
          onClick={() => removeItem(product.id)}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

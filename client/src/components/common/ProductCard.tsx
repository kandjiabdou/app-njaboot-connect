import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { Product } from "@shared/schema";
import { Heart, Star, Plus, Check } from "lucide-react";

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addItem } = useCart();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const handleAddToCart = () => {
    addItem(product);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1000);
  };

  const toggleFavorite = () => {
    setIsFavorite(!isFavorite);
  };

  return (
    <Card className="group overflow-hidden hover:shadow-lg transition-shadow duration-200">
      <div className="relative">
        <img
          src={`${product.imageUrl}&auto=format&fit=crop&w=400&h=300`}
          alt={product.name}
          className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-200"
        />
        
        {/* Favorite Button */}
        <Button
          variant="secondary"
          size="icon"
          className="absolute top-3 right-3 h-8 w-8 rounded-full shadow-md"
          onClick={toggleFavorite}
        >
          <Heart 
            className={`h-4 w-4 ${isFavorite ? 'fill-red-500 text-red-500' : 'text-gray-600'}`} 
          />
        </Button>

        {/* Promotion Badge */}
        {Math.random() > 0.7 && (
          <Badge className="absolute top-3 left-3 bg-green-600 hover:bg-green-600">
            -15%
          </Badge>
        )}
      </div>

      <CardContent className="p-4">
        <div className="space-y-2">
          <h3 className="font-semibold text-gray-900 dark:text-white line-clamp-1">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
            {product.description}
          </p>
          
          <div className="flex items-center space-x-2">
            <span className="text-lg font-bold text-gray-900 dark:text-white">
              {formatCurrency(product.price!)}
            </span>
            {Math.random() > 0.7 && (
              <span className="text-sm text-gray-500 line-through">
                {formatCurrency(parseFloat(product.price!) * 1.15)}
              </span>
            )}
          </div>

          <div className="flex items-center justify-between">
            {/* Rating */}
            <div className="flex items-center space-x-1">
              <div className="flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <Star 
                    key={i} 
                    className={`h-4 w-4 ${i < 4 ? 'fill-current' : ''}`} 
                  />
                ))}
              </div>
              <span className="text-xs text-gray-600 dark:text-gray-400">
                ({Math.floor(Math.random() * 50) + 5})
              </span>
            </div>

            {/* Add to Cart Button */}
            {showAddToCart && (
              <Button
                size="sm"
                onClick={handleAddToCart}
                disabled={isAdded}
                className="min-w-[80px]"
              >
                {isAdded ? (
                  <>
                    <Check className="h-4 w-4 mr-1" />
                    Ajouté
                  </>
                ) : (
                  <>
                    <Plus className="h-4 w-4 mr-1" />
                    Ajouter
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

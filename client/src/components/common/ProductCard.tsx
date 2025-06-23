import { Link } from "wouter";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { ShoppingCart } from "lucide-react";
import type { Product } from "@shared/schema";

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
  compact?: boolean;
}

export default function ProductCard({ product, showAddToCart = true, compact = false }: ProductCardProps) {
  const { addItem } = useCart();

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  if (compact) {
    return (
      <Link href={`/product/${product.id}`}>
        <Card className="group hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-3">
            <div className="flex space-x-3">
              <div className="w-16 h-16 bg-gray-100 rounded-lg flex-shrink-0 overflow-hidden">
                <img
                  src="/api/placeholder/80/80"
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
                  {product.name}
                </h3>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-primary">
                    {formatCurrency(product.price)}
                  </span>
                  {showAddToCart && (
                    <Button size="sm" variant="outline" onClick={handleAddToCart}>
                      <ShoppingCart className="h-3 w-3" />
                    </Button>
                  )}
                </div>
                <Badge variant="secondary" className="text-xs mt-1">{product.unit}</Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </Link>
    );
  }

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="h-full flex flex-col group hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-4">
          <div className="aspect-square bg-gray-100 rounded-lg mb-3 overflow-hidden">
            <img
              src="/api/placeholder/200/200"
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
            />
          </div>
          <h3 className="font-medium text-base line-clamp-2 mb-2 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-sm text-gray-600 line-clamp-2 mb-3">{product.description}</p>
          
          <div className="flex items-center justify-between mb-3">
            <span className="text-xl font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            <Badge variant="secondary">{product.unit}</Badge>
          </div>
          
          <div className="flex items-center justify-between text-sm text-gray-600 mb-3">
            <span className="text-green-600 font-medium">En stock</span>
            <span>45 disponibles</span>
          </div>
          
          {showAddToCart && (
            <Button onClick={handleAddToCart} className="w-full" size="sm">
              <ShoppingCart className="mr-2 h-4 w-4" />
              Ajouter au panier
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

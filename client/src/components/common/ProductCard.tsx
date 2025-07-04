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
                  src={(() => {
                    const name = product.name.toLowerCase();
                    if (name.includes('riz')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=80&h=80&fit=crop';
                    if (name.includes('huile')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=80&h=80&fit=crop';
                    if (name.includes('sucre')) return 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=80&h=80&fit=crop';
                    if (name.includes('farine')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=80&h=80&fit=crop';
                    if (name.includes('lait')) return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=80&h=80&fit=crop';
                    if (name.includes('pain')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=80&h=80&fit=crop';
                    if (name.includes('tomate')) return 'https://images.unsplash.com/photo-1546470427-e1357b94edff?w=80&h=80&fit=crop';
                    if (name.includes('pomme')) return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=80&h=80&fit=crop';
                    if (name.includes('banane')) return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=80&h=80&fit=crop';
                    if (name.includes('poisson')) return 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=80&h=80&fit=crop';
                    if (name.includes('viande')) return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=80&h=80&fit=crop';
                    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=80&h=80&fit=crop';
                  })()}
                  alt={product.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  onError={(e) => {
                    e.currentTarget.src = '/api/placeholder/80/80';
                  }}
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

  // Déterminer l'image en fonction du produit
  const getProductImage = (productName: string) => {
    const name = productName.toLowerCase();
    if (name.includes('riz')) return 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=300&h=300&fit=crop';
    if (name.includes('huile')) return 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=300&h=300&fit=crop';
    if (name.includes('sucre')) return 'https://images.unsplash.com/photo-1559827260-dc66d52bef19?w=300&h=300&fit=crop';
    if (name.includes('farine')) return 'https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?w=300&h=300&fit=crop';
    if (name.includes('lait')) return 'https://images.unsplash.com/photo-1550583724-b2692b85b150?w=300&h=300&fit=crop';
    if (name.includes('pain')) return 'https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&h=300&fit=crop';
    if (name.includes('tomate')) return 'https://images.unsplash.com/photo-1546470427-e1357b94edff?w=300&h=300&fit=crop';
    if (name.includes('pomme')) return 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?w=300&h=300&fit=crop';
    if (name.includes('banane')) return 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?w=300&h=300&fit=crop';
    if (name.includes('poisson')) return 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=300&h=300&fit=crop';
    if (name.includes('viande')) return 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?w=300&h=300&fit=crop';
    // Image par défaut pour les autres produits
    return 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=300&h=300&fit=crop';
  };

  return (
    <Link href={`/product/${product.id}`}>
      <Card className="h-full flex flex-col group hover:shadow-lg transition-shadow cursor-pointer">
        <CardContent className="p-3">
          <div className="aspect-square bg-gray-100 rounded-lg mb-2 overflow-hidden">
            <img
              src={getProductImage(product.name)}
              alt={product.name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform"
              onError={(e) => {
                e.currentTarget.src = '/api/placeholder/200/200';
              }}
            />
          </div>
          <h3 className="font-medium text-sm line-clamp-2 mb-1 group-hover:text-primary transition-colors">
            {product.name}
          </h3>
          <p className="text-xs text-gray-600 line-clamp-1 mb-2">{product.description}</p>
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-base font-bold text-primary">
              {formatCurrency(product.price)}
            </span>
            <Badge variant="secondary" className="text-xs">{product.unit}</Badge>
          </div>
          
          <div className="flex items-center justify-between text-xs text-gray-600 mb-2">
            <span className="text-green-600 font-medium">En stock</span>
          </div>
          
          {showAddToCart && (
            <Button onClick={handleAddToCart} className="w-full" size="sm">
              <ShoppingCart className="mr-1 h-3 w-3" />
              <span className="text-xs">Ajouter</span>
            </Button>
          )}
        </CardContent>
      </Card>
    </Link>
  );
}

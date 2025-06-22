import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/common/ProductCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { debounce } from "@/lib/utils";
import { Search, Grid3X3, List, Filter, SlidersHorizontal } from "lucide-react";

export default function CustomerProducts() {
  const { user } = useAuth();
  const [location] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  
  // Get category from URL params
  const urlParams = new URLSearchParams(location.split('?')[1] || '');
  const categoryParam = urlParams.get('category');
  
  // Set initial category filter from URL
  useState(() => {
    if (categoryParam && categoryParam !== categoryFilter) {
      setCategoryFilter(categoryParam);
    }
  });

  // Fetch categories
  const { data: categories } = useQuery({
    queryKey: [`/api/categories`],
  });

  // Fetch products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/products`, categoryFilter !== "all" ? `?categoryId=${categoryFilter}` : ""],
  });

  // Filter and sort products
  const filteredProducts = products?.filter((product: any) => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a: any, b: any) => {
    switch (sortBy) {
      case "price_asc":
        return parseFloat(a.price) - parseFloat(b.price);
      case "price_desc":
        return parseFloat(b.price) - parseFloat(a.price);
      case "name":
        return a.name.localeCompare(b.name);
      default:
        return 0;
    }
  }) || [];

  const debouncedSearch = debounce((value: string) => {
    setSearchTerm(value);
  }, 300);

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Veuillez vous connecter pour voir les produits
              </p>
              <Button asChild>
                <a href="/login">Se connecter</a>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Nos Produits
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Découvrez notre sélection de produits locaux
          </p>
        </div>

        {/* Filters */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              <div className="flex flex-1 gap-4 w-full lg:w-auto">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Rechercher des produits..."
                    onChange={(e) => debouncedSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                
                {/* Category Filter */}
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Toutes les catégories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Toutes les catégories</SelectItem>
                    {categories?.map((category: any) => (
                      <SelectItem key={category.id} value={category.id.toString()}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {/* Sort */}
                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="name">Trier par nom</SelectItem>
                    <SelectItem value="price_asc">Prix croissant</SelectItem>
                    <SelectItem value="price_desc">Prix décroissant</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* View Toggle */}
              <div className="flex items-center space-x-2">
                <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                  <Button
                    variant={viewMode === "grid" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                  >
                    <Grid3X3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "default" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            {/* Active Filters */}
            <div className="flex flex-wrap gap-2 mt-4">
              {categoryFilter !== "all" && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  {categories?.find((c: any) => c.id.toString() === categoryFilter)?.name}
                  <button
                    onClick={() => setCategoryFilter("all")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
              {searchTerm && (
                <Badge variant="secondary" className="flex items-center gap-1">
                  "{searchTerm}"
                  <button
                    onClick={() => setSearchTerm("")}
                    className="ml-1 hover:text-destructive"
                  >
                    ×
                  </button>
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Results Info */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-gray-600 dark:text-gray-400">
            {filteredProducts.length} produit(s) trouvé(s)
          </p>
        </div>

        {/* Products Grid/List */}
        {productsLoading ? (
          <LoadingSpinner size="lg" className="min-h-[400px]" />
        ) : (
          <>
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {filteredProducts.map((product: any) => (
                  <Card key={product.id} className="hover:shadow-md transition-shadow">
                    <CardContent className="p-6">
                      <div className="flex items-center space-x-4">
                        <img
                          src={`${product.imageUrl}&auto=format&fit=crop&w=120&h=120`}
                          alt={product.name}
                          className="w-24 h-24 object-cover rounded-lg"
                        />
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg text-gray-900 dark:text-white">
                            {product.name}
                          </h3>
                          <p className="text-gray-600 dark:text-gray-400 mt-1">
                            {product.description}
                          </p>
                          <div className="flex items-center justify-between mt-4">
                            <span className="text-xl font-bold text-gray-900 dark:text-white">
                              {new Intl.NumberFormat("fr-FR", {
                                style: "currency",
                                currency: "XOF",
                                minimumFractionDigits: 0,
                              }).format(parseFloat(product.price)).replace("XOF", "FCFA")}
                            </span>
                            <Button>Ajouter au panier</Button>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {filteredProducts.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <div className="h-12 w-12 text-gray-400 mx-auto mb-4">
                    <Search className="h-full w-full" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                    Aucun produit trouvé
                  </h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Essayez de modifier vos critères de recherche
                  </p>
                </CardContent>
              </Card>
            )}
          </>
        )}
      </main>
    </div>
  );
}

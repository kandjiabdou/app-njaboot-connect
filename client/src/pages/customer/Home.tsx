import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import Navbar from "@/components/layout/Navbar";
import ProductCard from "@/components/common/ProductCard";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { useAuth } from "@/hooks/use-auth";
import { Search, Wheat, Apple, Carrot, Milk, Beef, Fish, Star, ArrowRight } from "lucide-react";

const categoryIcons = {
  1: Wheat,   // Céréales
  2: Carrot,  // Légumes
  3: Apple,   // Fruits
  4: Beef,    // Viandes
  5: Fish,    // Poissons
  6: Milk,    // Laitiers
};

const categoryColors = {
  1: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20",
  2: "bg-green-100 text-green-600 dark:bg-green-900/20",
  3: "bg-orange-100 text-orange-600 dark:bg-orange-900/20",
  4: "bg-red-100 text-red-600 dark:bg-red-900/20",
  5: "bg-blue-100 text-blue-600 dark:bg-blue-900/20",
  6: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20",
};

export default function CustomerHome() {
  const { user } = useAuth();

  // Fetch categories
  const { data: categories, isLoading: categoriesLoading } = useQuery({
    queryKey: [`/api/categories`],
  });

  // Fetch featured products
  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: [`/api/products`],
  });

  const featuredProducts = products?.slice(0, 8) || [];

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <main>
          {/* Hero Section */}
          <div 
            className="relative h-96 bg-cover bg-center"
            style={{
              backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`
            }}
          >
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center text-white">
                <h1 className="text-4xl md:text-6xl font-bold mb-4">Njaboot Connect</h1>
                <p className="text-xl md:text-2xl mb-8">Produits locaux, fraîcheur garantie</p>
                <div className="space-y-4">
                  <Link href="/login">
                    <Button size="lg" className="mr-4">
                      Se connecter
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button variant="outline" size="lg">
                      S'inscrire
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          </div>

          {/* Features */}
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
                Pourquoi choisir Njaboot Connect ?
              </h2>
              <p className="text-gray-600 dark:text-gray-400 max-w-2xl mx-auto">
                Découvrez notre plateforme de franchise alimentaire locale avec boutique en ligne intégrée
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Wheat className="h-8 w-8 text-primary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Produits Locaux</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Découvrez une sélection de produits frais et locaux de qualité supérieure
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-secondary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Star className="h-8 w-8 text-secondary" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Qualité Garantie</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Tous nos produits sont sélectionnés avec soin pour vous offrir le meilleur
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6 text-center">
                  <div className="h-16 w-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ArrowRight className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="text-xl font-semibold mb-2">Livraison Rapide</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Livraison à domicile ou retrait en magasin selon vos préférences
                  </p>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <main>
        {/* Hero Section */}
        <div 
          className="relative h-96 bg-cover bg-center"
          style={{
            backgroundImage: `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.4)), url('https://images.unsplash.com/photo-1578662996442-48f60103fc96?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&h=600')`
          }}
        >
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center text-white">
              <h1 className="text-4xl md:text-6xl font-bold mb-4">Produits Locaux</h1>
              <p className="text-xl md:text-2xl mb-8">Fraîcheur et qualité garanties</p>
              <div className="max-w-md mx-auto">
                <div className="relative">
                  <Input
                    placeholder="Rechercher des produits..."
                    className="w-full pl-12 pr-4 py-3 text-gray-900"
                  />
                  <Search className="absolute left-4 top-3.5 h-5 w-5 text-gray-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Categories */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Catégories</h2>
            {categoriesLoading ? (
              <LoadingSpinner className="h-32" />
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                {categories?.map((category: any) => {
                  const IconComponent = categoryIcons[category.id as keyof typeof categoryIcons] || Wheat;
                  const colorClass = categoryColors[category.id as keyof typeof categoryColors] || categoryColors[1];
                  
                  return (
                    <Link key={category.id} href={`/products?category=${category.id}`}>
                      <Card className="text-center p-4 hover:shadow-md transition-shadow cursor-pointer">
                        <CardContent className="p-0">
                          <div className={`h-16 w-16 rounded-full flex items-center justify-center mx-auto mb-3 ${colorClass}`}>
                            <IconComponent className="h-8 w-8" />
                          </div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {category.name}
                          </p>
                        </CardContent>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Featured Products */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Produits Vedettes</h2>
              <Link href="/products">
                <Button variant="outline">
                  Voir tout
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
            </div>

            {productsLoading ? (
              <LoadingSpinner className="h-64" />
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {featuredProducts.map((product: any) => (
                  <ProductCard key={product.id} product={product} />
                ))}
              </div>
            )}
          </div>

          {/* Promotional Banner */}
          <Card className="gradient-brand text-white mb-8">
            <CardContent className="p-8">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold mb-2">Offre Spéciale</h3>
                  <p className="text-lg mb-4">Livraison gratuite pour toute commande supérieure à 50 000 FCFA</p>
                  <Button variant="secondary">
                    Profiter de l'offre
                  </Button>
                </div>
                <div className="hidden md:block">
                  <img
                    src="https://images.unsplash.com/photo-1558618666-fcd25c85cd64?ixlib=rb-4.0.3&auto=format&fit=crop&w=200&h=150"
                    alt="Livraison"
                    className="w-32 h-24 object-cover rounded-lg"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}

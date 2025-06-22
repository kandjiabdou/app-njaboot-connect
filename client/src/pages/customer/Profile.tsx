import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusClassName, getLoyaltyLevel } from "@/lib/utils";
import { User, MapPin, Phone, Mail, Crown, Gift, ShoppingBag, Star } from "lucide-react";

export default function CustomerProfile() {
  const { user } = useAuth();

  // Redirect managers to their specific profile page
  if (user && user.role === "manager") {
    window.location.href = "/manager/profile";
    return null;
  }

  // Fetch customer orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/orders?customerId=${user?.id}`],
    enabled: !!user && user.role === "customer",
  });

  // Fetch loyalty points
  const { data: loyaltyData, isLoading: loyaltyLoading } = useQuery({
    queryKey: [`/api/loyalty/${user?.id}`],
    enabled: !!user && user.role === "customer",
  });

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Veuillez vous connecter pour voir votre profil
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

  const loyaltyInfo = loyaltyData ? getLoyaltyLevel(loyaltyData.points) : null;
  const progressPercentage = loyaltyInfo ? 
    ((loyaltyData.points % (loyaltyInfo.nextLevel ? (loyaltyInfo.nextLevel === "Argent" ? 2000 : 5000) : 5000)) / 
    (loyaltyInfo.nextLevel === "Argent" ? 2000 : loyaltyInfo.nextLevel === "Or" ? 5000 : 2000)) * 100 : 0;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mon Profil
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gérez votre compte et suivez vos commandes
          </p>
        </div>

        {/* Profile Overview */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <User className="h-5 w-5" />
                <span>Informations personnelles</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="font-medium text-gray-900 dark:text-white">
                  {user.firstName} {user.lastName}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
                  <Mail className="h-4 w-4 mr-1" />
                  {user.email}
                </p>
              </div>
              
              {user.phone && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <Phone className="h-4 w-4 mr-1" />
                  {user.phone}
                </div>
              )}
              
              {user.address && (
                <div className="flex items-center text-sm text-gray-600 dark:text-gray-400">
                  <MapPin className="h-4 w-4 mr-1" />
                  {user.address}
                </div>
              )}

              <Button variant="outline" className="w-full">
                Modifier le profil
              </Button>
            </CardContent>
          </Card>

          {/* Loyalty Program */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Crown className="h-5 w-5" />
                <span>Programme de Fidélité</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {loyaltyLoading ? (
                <LoadingSpinner />
              ) : loyaltyData && loyaltyInfo ? (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="inline-flex items-center justify-center h-16 w-16 bg-gradient-to-br from-primary to-accent rounded-full mb-3">
                      <Crown className="h-8 w-8 text-white" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Membre {loyaltyInfo.level}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {loyaltyData.points} points disponibles
                    </p>
                  </div>

                  {loyaltyInfo.nextLevel && (
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-gray-900 dark:text-white">
                          Progression vers {loyaltyInfo.nextLevel}
                        </span>
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {Math.round(progressPercentage)}%
                        </span>
                      </div>
                      <Progress value={progressPercentage} className="h-2" />
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                        Plus que {loyaltyInfo.pointsToNext} points
                      </p>
                    </div>
                  )}

                  <div>
                    <h4 className="font-medium text-gray-900 dark:text-white mb-2">Avantages</h4>
                    <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                      {loyaltyInfo.benefits.map((benefit, index) => (
                        <li key={index} className="flex items-center">
                          <Star className="h-3 w-3 mr-1 text-yellow-500" />
                          {benefit}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              ) : (
                <p className="text-gray-600 dark:text-gray-400">
                  Aucune donnée de fidélité disponible
                </p>
              )}
            </CardContent>
          </Card>

          {/* Quick Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <ShoppingBag className="h-5 w-5" />
                <span>Statistiques</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Commandes totales</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {orders?.length || 0}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Montant total</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {formatCurrency(
                    orders?.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount), 0) || 0
                  )}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600 dark:text-gray-400">Commandes livrées</span>
                <span className="font-medium text-gray-900 dark:text-white">
                  {orders?.filter((order: any) => order.status === "delivered").length || 0}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="orders">Mes Commandes</TabsTrigger>
            <TabsTrigger value="favorites">Favoris</TabsTrigger>
            <TabsTrigger value="rewards">Récompenses</TabsTrigger>
          </TabsList>

          {/* Orders Tab */}
          <TabsContent value="orders">
            <Card>
              <CardHeader>
                <CardTitle>Historique des Commandes</CardTitle>
              </CardHeader>
              <CardContent>
                {ordersLoading ? (
                  <LoadingSpinner />
                ) : orders && orders.length > 0 ? (
                  <div className="space-y-4">
                    {orders.map((order: any) => (
                      <div
                        key={order.id}
                        className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                      >
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <span className="font-medium text-gray-900 dark:text-white">
                              #CMD-{order.id.toString().padStart(3, "0")}
                            </span>
                            <Badge className={getOrderStatusClassName(order.status)}>
                              {getOrderStatusLabel(order.status)}
                            </Badge>
                          </div>
                          <span className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(order.totalAmount)}
                          </span>
                        </div>
                        
                        <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                          <p>Commandé le {formatDateTime(order.createdAt)}</p>
                          <p>
                            Mode: {order.type === "delivery" ? "Livraison à domicile" : "Retrait en magasin"}
                          </p>
                          {order.deliveredAt && (
                            <p>Livré le {formatDateTime(order.deliveredAt)}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <p className="text-gray-600 dark:text-gray-400">
                      Aucune commande trouvée
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Favorites Tab */}
          <TabsContent value="favorites">
            <Card>
              <CardHeader>
                <CardTitle>Mes Favoris</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-12">
                  <Star className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucun produit favori pour le moment
                  </p>
                  <Button variant="outline" className="mt-4">
                    Découvrir les produits
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Rewards Tab */}
          <TabsContent value="rewards">
            <Card>
              <CardHeader>
                <CardTitle>Récompenses Disponibles</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Gift className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Réduction 5%
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          500 points requis
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!loyaltyData || loyaltyData.points < 500}
                    >
                      Échanger
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Gift className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Livraison Gratuite
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          300 points requis
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!loyaltyData || loyaltyData.points < 300}
                    >
                      Échanger
                    </Button>
                  </div>

                  <div className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <Gift className="h-8 w-8 text-primary" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          Produit Gratuit
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          1000 points requis
                        </p>
                      </div>
                    </div>
                    <Button 
                      size="sm" 
                      disabled={!loyaltyData || loyaltyData.points < 1000}
                    >
                      Échanger
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  Users, Search, Star, Crown, ShoppingBag, Phone, 
  Mail, MapPin, TrendingUp, Calendar
} from "lucide-react";
import { formatCurrency, formatDate, getLoyaltyLevel } from "@/lib/utils";

export default function ManagerCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");

  // Fetch customers data
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/users", { role: "customer" }],
  });

  // Fetch loyalty data
  const { data: loyaltyData } = useQuery({
    queryKey: ["/api/loyalty"],
  });

  // Fetch orders for customer stats
  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  const filteredCustomers = customers?.filter((customer: any) =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  ) || [];

  const getCustomerStats = (customerId: number) => {
    const customerOrders = orders?.filter((order: any) => order.customerId === customerId) || [];
    const totalSpent = customerOrders.reduce((sum: number, order: any) => sum + parseFloat(order.totalAmount), 0);
    const loyalty = loyaltyData?.find((lp: any) => lp.customerId === customerId);
    
    return {
      totalOrders: customerOrders.length,
      totalSpent,
      loyalty: loyalty ? getLoyaltyLevel(loyalty.points) : null,
      lastOrder: customerOrders.length > 0 ? new Date(Math.max(...customerOrders.map((o: any) => new Date(o.createdAt).getTime()))) : null
    };
  };

  const topCustomers = filteredCustomers
    .map((customer: any) => ({ ...customer, stats: getCustomerStats(customer.id) }))
    .sort((a: any, b: any) => b.stats.totalSpent - a.stats.totalSpent)
    .slice(0, 10);

  const recentCustomers = filteredCustomers
    .sort((a: any, b: any) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez et gérez votre base clients
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button className="whitespace-nowrap">
            <Users className="h-4 w-4 mr-2" />
            Ajouter Client
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredCustomers.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {topCustomers.filter(c => c.stats.loyalty?.level !== "Bronze").length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clients VIP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {recentCustomers.filter(c => 
                    new Date(c.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
                  ).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nouveaux (30j)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    topCustomers.reduce((sum, c) => sum + c.stats.totalSpent, 0)
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">CA Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="all">Tous les Clients</TabsTrigger>
          <TabsTrigger value="top">Top Clients</TabsTrigger>
          <TabsTrigger value="recent">Récents</TabsTrigger>
        </TabsList>

        <TabsContent value="all">
          <Card>
            <CardHeader>
              <CardTitle>Liste des Clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredCustomers.map((customer: any) => {
                  const stats = getCustomerStats(customer.id);
                  return (
                    <div
                      key={customer.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4 mb-3 md:mb-0">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {customer.firstName[0]}{customer.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {customer.firstName} {customer.lastName}
                            </h3>
                            {stats.loyalty && (
                              <Badge 
                                variant="outline"
                                className={`text-xs ${
                                  stats.loyalty.level === "Or" ? "border-yellow-500 text-yellow-600" :
                                  stats.loyalty.level === "Argent" ? "border-gray-400 text-gray-600" :
                                  "border-amber-600 text-amber-700"
                                }`}
                              >
                                <Crown className="h-3 w-3 mr-1" />
                                {stats.loyalty.level}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </span>
                            {customer.phone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {customer.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {stats.totalOrders}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">Commandes</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(stats.totalSpent)}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">Total dépensé</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {stats.lastOrder ? formatDate(stats.lastOrder) : "Jamais"}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">Dernière commande</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Top Clients par Chiffre d'Affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer: any, index: number) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {customer.firstName[0]}{customer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {customer.stats.totalOrders} commandes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {formatCurrency(customer.stats.totalSpent)}
                      </p>
                      {customer.stats.loyalty && (
                        <Badge variant="outline" className="text-xs">
                          {customer.stats.loyalty.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Clients Récents</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentCustomers.map((customer: any) => (
                  <div
                    key={customer.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4 mb-3 md:mb-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {customer.firstName[0]}{customer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Inscrit le {formatDate(customer.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Voir Profil
                      </Button>
                      <Button size="sm">
                        Contacter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
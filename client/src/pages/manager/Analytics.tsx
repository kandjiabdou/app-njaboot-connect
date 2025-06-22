import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import ManagerLayout from "@/components/layout/ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  TrendingUp, TrendingDown, Users, ShoppingCart, 
  Package, AlertTriangle, BarChart3, PieChart,
  Target, Calendar, DollarSign
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  BarChart, Bar, PieChart as RechartsPieChart, Cell, Area, AreaChart 
} from "recharts";

export default function ManagerAnalytics() {
  const { user } = useAuth();
  const [timeRange, setTimeRange] = useState("30");
  const [activeMetric, setActiveMetric] = useState("revenue");

  // Fetch store data
  const { data: store } = useQuery({
    queryKey: [`/api/stores/${user?.id}`],
    enabled: !!user && user.role === "manager",
  });

  // Fetch analytics data
  const { data: analytics, isLoading } = useQuery({
    queryKey: [`/api/analytics/dashboard/${store?.id}`],
    enabled: !!store,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mock comprehensive analytics data
  const salesTrend = [
    { period: "Jan", revenue: 245000, orders: 120, customers: 89, products: 245 },
    { period: "Feb", revenue: 287000, orders: 145, customers: 102, products: 287 },
    { period: "Mar", revenue: 321000, orders: 189, customers: 134, products: 321 },
    { period: "Apr", revenue: 356000, orders: 201, customers: 156, products: 356 },
    { period: "Mai", revenue: 398000, orders: 234, customers: 178, products: 398 },
    { period: "Jun", revenue: 445000, orders: 267, customers: 201, products: 445 },
  ];

  const customerSegments = [
    { name: "Nouveaux", value: 35, color: "#8884d8", count: 45 },
    { name: "Réguliers", value: 45, color: "#82ca9d", count: 78 },
    { name: "VIP", value: 20, color: "#ffc658", count: 23 },
  ];

  const productPerformance = [
    { category: "Céréales", sales: 125000, margin: 23, growth: 12.5 },
    { category: "Légumes", sales: 89000, margin: 28, growth: 8.3 },
    { category: "Viandes", sales: 156000, margin: 18, growth: 15.7 },
    { category: "Poissons", sales: 134000, margin: 22, growth: 9.8 },
    { category: "Fruits", sales: 67000, margin: 35, growth: 6.2 },
    { category: "Laitiers", sales: 45000, margin: 25, growth: -2.1 },
  ];

  const hourlyTraffic = [
    { hour: "8h", visitors: 12, sales: 8 },
    { hour: "9h", visitors: 25, sales: 15 },
    { hour: "10h", visitors: 45, sales: 28 },
    { hour: "11h", visitors: 67, sales: 42 },
    { hour: "12h", visitors: 89, sales: 56 },
    { hour: "13h", visitors: 123, sales: 78 },
    { hour: "14h", visitors: 98, sales: 62 },
    { hour: "15h", visitors: 87, sales: 54 },
    { hour: "16h", visitors: 76, sales: 47 },
    { hour: "17h", visitors: 92, sales: 58 },
    { hour: "18h", visitors: 108, sales: 68 },
    { hour: "19h", visitors: 78, sales: 49 },
  ];

  const conversionMetrics = {
    visitorToCustomer: 23.5,
    cartToOrder: 67.8,
    averageOrderValue: 8750,
    repeatCustomerRate: 45.2,
    customerLifetimeValue: 125000,
  };

  const topPerformers = [
    { name: "Riz Parfumé Premium", revenue: 89000, quantity: 1200, growth: 15.2 },
    { name: "Poisson Thiof Frais", revenue: 67000, quantity: 340, growth: 12.8 },
    { name: "Viande de Bœuf", revenue: 78000, quantity: 280, growth: 18.4 },
    { name: "Mangues de Casamance", revenue: 45000, quantity: 890, growth: 9.7 },
    { name: "Farine de Mil Bio", revenue: 34000, quantity: 560, growth: 6.3 },
  ];

  const riskAlerts = [
    { type: "stock", message: "3 produits en rupture de stock", severity: "high" },
    { type: "performance", message: "Baisse des ventes de 5% cette semaine", severity: "medium" },
    { type: "customer", message: "Taux de fidélisation en baisse", severity: "low" },
  ];

  return (
    <ManagerLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Tableau de Bord Analytique
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Analyses détaillées de votre performance commerciale
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Période" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">7 derniers jours</SelectItem>
              <SelectItem value="30">30 derniers jours</SelectItem>
              <SelectItem value="90">3 derniers mois</SelectItem>
              <SelectItem value="365">12 derniers mois</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Target className="h-4 w-4 mr-2" />
            Objectifs
          </Button>
        </div>
      </div>

      {/* Risk Alerts */}
      {riskAlerts.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {riskAlerts.map((alert, index) => (
            <Card key={index} className={`border-l-4 ${
              alert.severity === "high" ? "border-l-red-500" :
              alert.severity === "medium" ? "border-l-yellow-500" : "border-l-blue-500"
            }`}>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className={`h-5 w-5 ${
                    alert.severity === "high" ? "text-red-500" :
                    alert.severity === "medium" ? "text-yellow-500" : "text-blue-500"
                  }`} />
                  <p className="text-sm font-medium text-gray-900 dark:text-white">
                    {alert.message}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Taux de Conversion</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {conversionMetrics.visitorToCustomer}%
                </p>
              </div>
              <Target className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">+2.3%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Panier → Commande</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {conversionMetrics.cartToOrder}%
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingDown className="h-3 w-3 text-red-500 mr-1" />
              <span className="text-red-600">-1.2%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Valeur Moyenne</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(conversionMetrics.averageOrderValue)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">+5.8%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clients Fidèles</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {conversionMetrics.repeatCustomerRate}%
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">+3.4%</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400">LTV Client</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(conversionMetrics.customerLifetimeValue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-pink-600" />
            </div>
            <div className="mt-2 flex items-center text-sm">
              <TrendingUp className="h-3 w-3 text-green-500 mr-1" />
              <span className="text-green-600">+8.9%</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics */}
      <Tabs defaultValue="trends" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="trends">Tendances</TabsTrigger>
          <TabsTrigger value="customers">Clients</TabsTrigger>
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle>Évolution du Chiffre d'Affaires</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), "Chiffre d'Affaires"]} />
                      <Area 
                        type="monotone" 
                        dataKey="revenue" 
                        stroke="#8884d8" 
                        fill="#8884d8"
                        fillOpacity={0.3}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Hourly Traffic */}
            <Card>
              <CardHeader>
                <CardTitle>Trafic par Heure</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={hourlyTraffic}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="hour" />
                      <YAxis />
                      <Tooltip />
                      <Bar dataKey="visitors" fill="#8884d8" name="Visiteurs" />
                      <Bar dataKey="sales" fill="#82ca9d" name="Ventes" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Customer Segments */}
            <Card>
              <CardHeader>
                <CardTitle>Segments de Clientèle</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <RechartsPieChart>
                      <Tooltip formatter={(value, name) => [`${value}%`, name]} />
                      <RechartsPieChart data={customerSegments} dataKey="value">
                        {customerSegments.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </RechartsPieChart>
                    </RechartsPieChart>
                  </ResponsiveContainer>
                </div>
                <div className="mt-4 space-y-2">
                  {customerSegments.map((segment, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div 
                          className="w-3 h-3 rounded-full mr-2"
                          style={{ backgroundColor: segment.color }}
                        />
                        <span className="text-sm text-gray-600 dark:text-gray-400">
                          {segment.name}
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{segment.count} clients</span>
                        <span className="text-xs text-gray-500 ml-2">({segment.value}%)</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="customers" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Acquisition de Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={salesTrend}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="period" />
                      <YAxis />
                      <Tooltip />
                      <Line 
                        type="monotone" 
                        dataKey="customers" 
                        stroke="#82ca9d" 
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Comportement Client</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Fréquence de visite moyenne</span>
                  <span className="text-lg font-bold">2.3 fois/mois</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Temps moyen en magasin</span>
                  <span className="text-lg font-bold">18 minutes</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Taux de satisfaction</span>
                  <span className="text-lg font-bold">4.6/5</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <span className="text-sm font-medium">Recommandations</span>
                  <span className="text-lg font-bold">78%</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance par Catégorie</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {productPerformance.map((category, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="font-medium text-gray-900 dark:text-white">
                          {category.category}
                        </h3>
                        <Badge variant={category.growth > 0 ? "default" : "destructive"}>
                          {category.growth > 0 ? "+" : ""}{category.growth}%
                        </Badge>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Ventes</p>
                          <p className="font-medium">{formatCurrency(category.sales)}</p>
                        </div>
                        <div>
                          <p className="text-gray-600 dark:text-gray-400">Marge</p>
                          <p className="font-medium">{category.margin}%</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top Produits</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topPerformers.map((product, index) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white text-sm">
                            {product.name}
                          </p>
                          <p className="text-xs text-gray-600 dark:text-gray-400">
                            {product.quantity} unités
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-medium text-sm">{formatCurrency(product.revenue)}</p>
                        <p className="text-xs text-green-600">+{product.growth}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs vs Réalisé</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Chiffre d'Affaires</span>
                    <span className="text-sm">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Nouveaux Clients</span>
                    <span className="text-sm">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                </div>
                <div>
                  <div className="flex justify-between mb-1">
                    <span className="text-sm">Satisfaction Client</span>
                    <span className="text-sm">78%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "78%" }}></div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Efficacité Opérationnelle</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Taux de rotation stock</span>
                  <span className="font-medium">4.2x</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Coût d'acquisition client</span>
                  <span className="font-medium">2,500 FCFA</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Marge brute moyenne</span>
                  <span className="font-medium">24.8%</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Temps de service moyen</span>
                  <span className="font-medium">3.2 min</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recommandations</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm font-medium text-blue-900 dark:text-blue-100">
                    Optimiser le stock de céréales
                  </p>
                  <p className="text-xs text-blue-700 dark:text-blue-300">
                    Forte demande détectée
                  </p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-sm font-medium text-green-900 dark:text-green-100">
                    Promouvoir les produits laitiers
                  </p>
                  <p className="text-xs text-green-700 dark:text-green-300">
                    Marge élevée, ventes faibles
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <p className="text-sm font-medium text-yellow-900 dark:text-yellow-100">
                    Fidéliser les nouveaux clients
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-300">
                    Taux de rétention perfectible
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ManagerLayout>
  );
}
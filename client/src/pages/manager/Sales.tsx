import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { 
  TrendingUp, DollarSign, ShoppingCart, Calendar,
  Download, Filter, BarChart3, PieChart
} from "lucide-react";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell } from "recharts";

export default function ManagerSales() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("7");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Fetch store data
  const { data: store } = useQuery({
    queryKey: [`/api/stores/${user?.id}`],
    enabled: !!user && user.role === "manager",
  });

  // Fetch sales data
  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: [`/api/sales/${store?.id}`, dateRange],
    enabled: !!store,
  });

  // Fetch orders for detailed analysis
  const { data: orders } = useQuery({
    queryKey: [`/api/orders?storeId=${store?.id}`],
    enabled: !!store,
  });

  if (salesLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  // Mock sales data for charts (replace with real data from API)
  const salesChartData = [
    { date: "Lun", sales: 87450, orders: 12 },
    { date: "Mar", sales: 92300, orders: 15 },
    { date: "Mer", sales: 78900, orders: 10 },
    { date: "Jeu", sales: 105600, orders: 18 },
    { date: "Ven", sales: 94200, orders: 14 },
    { date: "Sam", sales: 112800, orders: 20 },
    { date: "Dim", sales: 87450, orders: 13 },
  ];

  const paymentMethodData = [
    { name: "Espèces", value: 45, color: "#8884d8" },
    { name: "Carte", value: 30, color: "#82ca9d" },
    { name: "Mobile Money", value: 25, color: "#ffc658" },
  ];

  const topProducts = [
    { name: "Riz Parfumé Premium", sales: 25000, quantity: 50 },
    { name: "Poisson Thiof Frais", sales: 22500, quantity: 15 },
    { name: "Viande de Bœuf", sales: 19500, quantity: 12 },
    { name: "Mangues de Casamance", sales: 14400, quantity: 30 },
    { name: "Farine de Mil Bio", sales: 12000, quantity: 40 },
  ];

  const totalSales = salesChartData.reduce((sum, day) => sum + day.sales, 0);
  const totalOrders = salesChartData.reduce((sum, day) => sum + day.orders, 0);
  const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Analyse des Ventes
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez les performances de vos ventes
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <Select value={dateRange} onValueChange={setDateRange}>
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
          
          <Button variant="outline" className="whitespace-nowrap">
            <Download className="h-4 w-4 mr-2" />
            Exporter
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chiffre d'Affaires
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalSales)}
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+12.5%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Nombre de Ventes
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {totalOrders}
                </p>
              </div>
              <ShoppingCart className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+8.3%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Panier Moyen
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(averageOrder)}
                </p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600">+3.7%</span>
              <span className="text-gray-600 dark:text-gray-400 ml-2">vs période précédente</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Ventes Aujourd'hui
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(87450)}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-orange-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">
                13 commandes aujourd'hui
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts and Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Évolution des Ventes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip 
                    formatter={(value, name) => [
                      name === "sales" ? formatCurrency(value as number) : value,
                      name === "sales" ? "Ventes" : "Commandes"
                    ]}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#8884d8" 
                    strokeWidth={2}
                    name="sales"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="orders" 
                    stroke="#82ca9d" 
                    strokeWidth={2}
                    name="orders"
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Payment Methods */}
        <Card>
          <CardHeader>
            <CardTitle>Méthodes de Paiement</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Tooltip formatter={(value) => [`${value}%`, "Pourcentage"]} />
                  <RechartsPieChart data={paymentMethodData} dataKey="value">
                    {paymentMethodData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </RechartsPieChart>
                </RechartsPieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-4 space-y-2">
              {paymentMethodData.map((method, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center">
                    <div 
                      className="w-3 h-3 rounded-full mr-2"
                      style={{ backgroundColor: method.color }}
                    />
                    <span className="text-sm text-gray-600 dark:text-gray-400">
                      {method.name}
                    </span>
                  </div>
                  <span className="text-sm font-medium">
                    {method.value}%
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Top Products */}
        <Card>
          <CardHeader>
            <CardTitle>Produits les Plus Vendus</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topProducts.map((product, index) => (
                <div key={index} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-bold">
                      {index + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white text-sm">
                        {product.name}
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {product.quantity} unités vendues
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-gray-900 dark:text-white text-sm">
                      {formatCurrency(product.sales)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sales Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Ventes Récentes</CardTitle>
          <div className="flex gap-2">
            <Select value={paymentFilter} onValueChange={setPaymentFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrer" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="cash">Espèces</SelectItem>
                <SelectItem value="card">Carte</SelectItem>
                <SelectItem value="mobile">Mobile Money</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">
                    Date & Heure
                  </th>
                  <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">
                    Montant
                  </th>
                  <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">
                    Paiement
                  </th>
                  <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">
                    Produits
                  </th>
                  <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  {
                    id: 1,
                    date: new Date(),
                    amount: 4500,
                    payment: "mobile",
                    products: ["Thiof Frais"],
                  },
                  {
                    id: 2,
                    date: new Date(Date.now() - 1000 * 60 * 30),
                    amount: 15000,
                    payment: "cash",
                    products: ["Riz Premium", "Huile"],
                  },
                  {
                    id: 3,
                    date: new Date(Date.now() - 1000 * 60 * 60),
                    amount: 2500,
                    payment: "card",
                    products: ["Légumes Frais"],
                  },
                ].map((sale) => (
                  <tr key={sale.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="p-2">
                      <div className="text-sm">
                        <p className="font-medium text-gray-900 dark:text-white">
                          {formatDateTime(sale.date)}
                        </p>
                      </div>
                    </td>
                    <td className="p-2">
                      <span className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(sale.amount)}
                      </span>
                    </td>
                    <td className="p-2">
                      <Badge variant="outline">
                        {sale.payment === "mobile" ? "Mobile Money" : 
                         sale.payment === "card" ? "Carte" : "Espèces"}
                      </Badge>
                    </td>
                    <td className="p-2">
                      <div className="text-sm text-gray-600 dark:text-gray-400">
                        {sale.products.join(", ")}
                      </div>
                    </td>
                    <td className="p-2 text-right">
                      <Button variant="ghost" size="sm">
                        Détails
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
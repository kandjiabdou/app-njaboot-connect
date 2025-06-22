import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import KPICard from "@/components/manager/KPICard";
import SalesChart from "@/components/manager/SalesChart";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, getOrderStatusLabel, getOrderStatusClassName } from "@/lib/utils";
import {
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Users,
  Package,
  Plus,
  PackagePlus,
  BarChart3,
  Settings,
  AlertCircle,
} from "lucide-react";

export default function ManagerDashboard() {
  const { user } = useAuth();

  // Fetch dashboard analytics
  const { data: analytics, isLoading: analyticsLoading } = useQuery({
    queryKey: [`/api/analytics/dashboard/1`], // Store ID 1 for demo
    enabled: !!user && user.role === "manager",
  });

  // Fetch recent orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/orders?storeId=1`],
    enabled: !!user && user.role === "manager",
  });

  // Mock sales data for chart
  const salesData = [
    { date: "Lun", sales: 87450, orders: 12 },
    { date: "Mar", sales: 92300, orders: 15 },
    { date: "Mer", sales: 78900, orders: 10 },
    { date: "Jeu", sales: 105600, orders: 18 },
    { date: "Ven", sales: 94200, orders: 14 },
    { date: "Sam", sales: 112800, orders: 20 },
    { date: "Dim", sales: 87450, orders: 13 },
  ];

  if (analyticsLoading || ordersLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="flex">
          <Sidebar userRole="manager" className="border-r bg-white dark:bg-gray-800" />
          <main className="flex-1 p-8">
            <LoadingSpinner size="lg" className="min-h-[400px]" />
          </main>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar />
      <div className="flex">
        <Sidebar userRole="manager" className="border-r bg-white dark:bg-gray-800" />
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Tableau de Bord
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez votre boutique Njaboot Connect
            </p>
          </div>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="CA Aujourd'hui"
              value={analytics?.todayRevenue || 87450}
              trendValue="+12% vs hier"
              trend="up"
              icon={TrendingUp}
              iconColor="text-green-600"
            />
            <KPICard
              title="Commandes"
              value={analytics?.totalOrders || 23}
              subtitle={`${analytics?.activeOrders || 8} en cours`}
              icon={ShoppingCart}
              iconColor="text-blue-600"
            />
            <KPICard
              title="Stock Critique"
              value={analytics?.lowStockCount || 5}
              subtitle="Produits en rupture"
              icon={AlertTriangle}
              iconColor="text-red-600"
            />
            <KPICard
              title="Clients Actifs"
              value={analytics?.totalCustomers || 156}
              trendValue="+8 nouveaux"
              trend="up"
              icon={Users}
              iconColor="text-purple-600"
            />
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>Commandes Récentes</CardTitle>
                    <Button variant="ghost" size="sm">
                      Voir tout
                    </Button>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {orders?.slice(0, 4).map((order: any) => (
                      <div
                        key={order.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 bg-primary/10 rounded-lg flex items-center justify-center">
                            <Package className="h-5 w-5 text-primary" />
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              #CMD-{order.id.toString().padStart(3, "0")}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {order.customer.firstName} {order.customer.lastName}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(order.totalAmount)}
                          </p>
                          <Badge
                            variant="secondary"
                            className={getOrderStatusClassName(order.status)}
                          >
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Quick Actions & Alerts */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle>Actions Rapides</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button variant="ghost" className="w-full justify-start">
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle Vente
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <PackagePlus className="mr-2 h-4 w-4" />
                    Ajouter Produit
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <BarChart3 className="mr-2 h-4 w-4" />
                    Rapport de Vente
                  </Button>
                  <Button variant="ghost" className="w-full justify-start">
                    <Settings className="mr-2 h-4 w-4" />
                    Paramètres
                  </Button>
                </CardContent>
              </Card>

              {/* Stock Alerts */}
              <Card>
                <CardHeader>
                  <CardTitle>Alertes Stock</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {analytics?.lowStockItems?.slice(0, 3).map((item: any) => (
                    <div
                      key={item.id}
                      className={`flex items-center space-x-3 p-3 rounded-lg ${
                        item.quantity === 0 ? "bg-red-50 dark:bg-red-900/20" : "bg-yellow-50 dark:bg-yellow-900/20"
                      }`}
                    >
                      <AlertCircle
                        className={`h-4 w-4 ${
                          item.quantity === 0 ? "text-red-600" : "text-yellow-600"
                        }`}
                      />
                      <div className="flex-1">
                        <p className={`text-sm font-medium ${
                          item.quantity === 0 ? "text-red-900 dark:text-red-100" : "text-yellow-900 dark:text-yellow-100"
                        }`}>
                          {item.name}
                        </p>
                        <p className={`text-xs ${
                          item.quantity === 0 ? "text-red-600" : "text-yellow-600"
                        }`}>
                          {item.quantity === 0 ? "Stock épuisé" : `${item.quantity} unités restantes`}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Sales Chart */}
          <div className="mt-8">
            <SalesChart data={salesData} />
          </div>
        </main>
      </div>
    </div>
  );
}

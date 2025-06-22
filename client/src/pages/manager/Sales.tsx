import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import SalesChart from "@/components/manager/SalesChart";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { Receipt, Plus, CreditCard, Banknote, Smartphone, TrendingUp } from "lucide-react";
import { subDays, format } from "date-fns";
import { fr } from "date-fns/locale";

export default function ManagerSales() {
  const { user } = useAuth();
  const [dateRange, setDateRange] = useState("7days");
  const [paymentFilter, setPaymentFilter] = useState("all");

  // Calculate date range
  const getDateRange = () => {
    const end = new Date();
    let start = new Date();
    
    switch (dateRange) {
      case "today":
        start = new Date(end.getFullYear(), end.getMonth(), end.getDate());
        break;
      case "7days":
        start = subDays(end, 7);
        break;
      case "30days":
        start = subDays(end, 30);
        break;
      default:
        start = subDays(end, 7);
    }
    
    return { start, end };
  };

  const { start, end } = getDateRange();

  // Fetch sales data
  const { data: sales, isLoading: salesLoading } = useQuery({
    queryKey: [`/api/sales/1`, start.toISOString(), end.toISOString()],
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

  // Calculate totals
  const totalSales = sales?.reduce((sum: number, sale: any) => sum + parseFloat(sale.totalAmount), 0) || 0;
  const totalTransactions = sales?.length || 0;
  const averageTicket = totalTransactions > 0 ? totalSales / totalTransactions : 0;

  // Filter sales by payment method
  const filteredSales = sales?.filter((sale: any) => 
    paymentFilter === "all" || sale.paymentMethod === paymentFilter
  ) || [];

  const getPaymentIcon = (method: string) => {
    switch (method) {
      case "cash":
        return <Banknote className="h-4 w-4" />;
      case "card":
        return <CreditCard className="h-4 w-4" />;
      case "mobile":
        return <Smartphone className="h-4 w-4" />;
      default:
        return <Receipt className="h-4 w-4" />;
    }
  };

  const getPaymentLabel = (method: string) => {
    switch (method) {
      case "cash":
        return "Espèces";
      case "card":
        return "Carte";
      case "mobile":
        return "Mobile";
      default:
        return method;
    }
  };

  if (salesLoading) {
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
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                  Gestion des Ventes
                </h1>
                <p className="text-gray-600 dark:text-gray-400">
                  Suivez vos performances de vente
                </p>
              </div>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouvelle Vente
              </Button>
            </div>
          </div>

          {/* Filters */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Select value={dateRange} onValueChange={setDateRange}>
                  <SelectTrigger className="w-48">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="today">Aujourd'hui</SelectItem>
                    <SelectItem value="7days">7 derniers jours</SelectItem>
                    <SelectItem value="30days">30 derniers jours</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={paymentFilter} onValueChange={setPaymentFilter}>
                  <SelectTrigger className="w-48">
                    <SelectValue placeholder="Mode de paiement" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Tous les paiements</SelectItem>
                    <SelectItem value="cash">Espèces</SelectItem>
                    <SelectItem value="card">Carte</SelectItem>
                    <SelectItem value="mobile">Mobile Money</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
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
                    <p className="text-sm text-green-600">
                      +12% vs période précédente
                    </p>
                  </div>
                  <div className="p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                    <TrendingUp className="h-6 w-6 text-green-600" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                      Transactions
                    </p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {totalTransactions}
                    </p>
                    <p className="text-sm text-blue-600">
                      Ventes directes
                    </p>
                  </div>
                  <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
                    <Receipt className="h-6 w-6 text-blue-600" />
                  </div>
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
                      {formatCurrency(averageTicket)}
                    </p>
                    <p className="text-sm text-purple-600">
                      Par transaction
                    </p>
                  </div>
                  <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <Receipt className="h-6 w-6 text-purple-600" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Sales Chart */}
            <div className="lg:col-span-2">
              <SalesChart data={salesData} type="bar" />
            </div>

            {/* Recent Sales */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Ventes Récentes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {filteredSales.slice(0, 10).map((sale: any) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            {getPaymentIcon(sale.paymentMethod)}
                          </div>
                          <div>
                            <p className="font-medium text-gray-900 dark:text-white">
                              Vente #{sale.id.toString().padStart(4, "0")}
                            </p>
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {formatDateTime(sale.createdAt)} - {getPaymentLabel(sale.paymentMethod)}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="font-medium text-gray-900 dark:text-white">
                            {formatCurrency(sale.totalAmount)}
                          </p>
                          {sale.items && (
                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              {Array.isArray(sale.items) ? sale.items.length : 0} article(s)
                            </p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  {filteredSales.length === 0 && (
                    <div className="text-center py-12">
                      <Receipt className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">
                        Aucune vente trouvée pour cette période
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

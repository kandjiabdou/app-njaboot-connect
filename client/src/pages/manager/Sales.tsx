import { useState } from 'react';
import ManagerLayout from '@/components/layout/ManagerLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { DollarSign, ShoppingCart, Package, TrendingUp, Download, Calendar, ArrowUpRight } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { Line, LineChart, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Sale {
  id: number;
  date: string;
  amount: number;
  orderId: string;
  customer: string;
  payment: 'cash' | 'card' | 'mobile';
  products: string[];
}

export default function ManagerSales() {
  const [dateRange, setDateRange] = useState('30');

  const { data: user } = useQuery({
    queryKey: ['/api/auth/me']
  });

  const { data: storeData } = useQuery({
    queryKey: ['/api/stores/manager', user?.id],
    enabled: !!user?.id
  });

  const { data: salesData } = useQuery({
    queryKey: ['/api/sales', storeData?.id],
    enabled: !!storeData?.id
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', {
      style: 'currency',
      currency: 'XOF'
    }).format(amount);
  };

  // Données des ventes pour le graphique
  const salesChartData = [
    { date: '01/01', sales: 12500, orders: 45 },
    { date: '02/01', sales: 15200, orders: 52 },
    { date: '03/01', sales: 18300, orders: 61 },
    { date: '04/01', sales: 14800, orders: 48 },
    { date: '05/01', sales: 22100, orders: 72 },
    { date: '06/01', sales: 19400, orders: 65 },
    { date: '07/01', sales: 25600, orders: 83 },
  ];

  // Données des ventes récentes
  const recentSales: Sale[] = [
    {
      id: 1,
      date: '07/01/2025 14:30',
      amount: 18500,
      orderId: 'CMD-2025-001',
      customer: 'Aminata Diallo',
      payment: 'mobile',
      products: ['Riz parfumé', 'Huile de palme', 'Tomates']
    },
    {
      id: 2,
      date: '07/01/2025 12:15',
      amount: 12750,
      orderId: 'CMD-2025-002',
      customer: 'Moussa Kane',
      payment: 'cash',
      products: ['Pain de mie', 'Lait en poudre', 'Café']
    },
    {
      id: 3,
      date: '07/01/2025 10:45',
      amount: 35200,
      orderId: 'CMD-2025-003',
      customer: 'Fatou Sarr',
      payment: 'card',
      products: ['Fruits de mer', 'Légumes frais', 'Épices']
    },
  ];

  // Calcul des métriques
  const totalSales = salesChartData.reduce((sum, day) => sum + day.sales, 0);
  const totalOrders = salesChartData.reduce((sum, day) => sum + day.orders, 0);
  const averageOrder = totalOrders > 0 ? totalSales / totalOrders : 0;

  return (
    <ManagerLayout>
      <div className="space-y-8 p-6">
        {/* En-tête moderne iOS */}
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
            <div className="space-y-2">
              <h1 className="text-3xl font-bold tracking-tight">
                Analyse des Ventes
              </h1>
              <p className="text-lg text-gray-600 dark:text-gray-400">
                Suivez les performances de vos ventes
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-3">
              <Select value={dateRange} onValueChange={setDateRange}>
                <SelectTrigger className="w-full sm:w-48 rounded-2xl border-0 shadow-md bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm">
                  <Calendar className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent className="rounded-2xl border-0 shadow-xl backdrop-blur-md">
                  <SelectItem value="7">7 derniers jours</SelectItem>
                  <SelectItem value="30">30 derniers jours</SelectItem>
                  <SelectItem value="90">3 derniers mois</SelectItem>
                  <SelectItem value="365">12 derniers mois</SelectItem>
                </SelectContent>
              </Select>
              
              <Button className="rounded-2xl border-0 shadow-md px-6 py-3 bg-amber-500 hover:bg-amber-600 text-black hover:shadow-lg transition-all duration-300 hover:scale-105">
                <Download className="h-4 w-4 mr-2" />
                Exporter
              </Button>
            </div>
          </div>
        </div>

        {/* Cartes KPI modernes */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Chiffre d'Affaires */}
          <Card className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-green-50 dark:bg-green-900/20">
                  <DollarSign className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-green-500" />
                  <span className="text-green-600 font-medium">+12.5%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Chiffre d'Affaires
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(totalSales)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  vs période précédente
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Nombre de Commandes */}
          <Card className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-900/20">
                  <ShoppingCart className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-blue-500" />
                  <span className="text-blue-600 font-medium">+8.2%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Commandes
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {totalOrders}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  ce mois-ci
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Panier Moyen */}
          <Card className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-amber-50 dark:bg-amber-900/20">
                  <Package className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-amber-500" />
                  <span className="text-amber-600 font-medium">+4.3%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Panier Moyen
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(averageOrder)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  par commande
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Croissance */}
          <Card className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/50 backdrop-blur-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-3 rounded-2xl bg-purple-50 dark:bg-purple-900/20">
                  <TrendingUp className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="flex items-center gap-1 text-sm">
                  <ArrowUpRight className="h-4 w-4 text-purple-500" />
                  <span className="text-purple-600 font-medium">+15.8%</span>
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Croissance
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  +15.8%
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  vs mois dernier
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Graphique des ventes */}
        <Card className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-semibold">Évolution des Ventes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
                  <XAxis 
                    dataKey="date" 
                    stroke="#666"
                    fontSize={12}
                  />
                  <YAxis 
                    stroke="#666"
                    fontSize={12}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: '#fff',
                      border: 'none',
                      borderRadius: '12px',
                      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
                    }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="sales" 
                    stroke="#fbbf24" 
                    strokeWidth={3}
                    dot={{ fill: '#fbbf24', strokeWidth: 2, r: 6 }}
                    activeDot={{ r: 8, stroke: '#fbbf24', strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Ventes récentes */}
        <Card className="rounded-2xl border-0 shadow-lg bg-white dark:bg-gray-800/50 backdrop-blur-sm">
          <CardHeader className="p-6">
            <CardTitle className="text-xl font-semibold">Ventes Récentes</CardTitle>
          </CardHeader>
          <CardContent className="p-6 pt-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200 dark:border-gray-700">
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Date</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">N° Commande</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Client</th>
                    <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400">Montant</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Paiement</th>
                    <th className="text-left p-2 font-medium text-gray-600 dark:text-gray-400">Produits</th>
                    <th className="text-right p-2 font-medium text-gray-600 dark:text-gray-400"></th>
                  </tr>
                </thead>
                <tbody>
                  {recentSales.map((sale) => (
                    <tr key={sale.id} className="border-b border-gray-100 dark:border-gray-800">
                      <td className="p-2 text-sm text-gray-900 dark:text-white">
                        {sale.date}
                      </td>
                      <td className="p-2">
                        <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
                          {sale.orderId}
                        </span>
                      </td>
                      <td className="p-2 text-sm text-gray-900 dark:text-white">
                        {sale.customer}
                      </td>
                      <td className="p-2 text-right">
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
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
    </ManagerLayout>
  );
}
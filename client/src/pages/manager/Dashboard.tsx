import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ManagerLayout from "@/components/layout/ManagerLayout";
import KPICard from "@/components/manager/KPICard";
import SalesChart from "@/components/manager/SalesChart";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { useThemeClasses } from "@/lib/theme";
import { formatCurrency, getOrderStatusLabel, getOrderStatusClassName } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
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
  DollarSign,
} from "lucide-react";

const newSaleSchema = z.object({
  totalAmount: z.string().min(1, "Le montant est requis"),
  paymentMethod: z.string().min(1, "La méthode de paiement est requise"),
  items: z.string().min(1, "Les articles sont requis"),
});

type NewSaleForm = z.infer<typeof newSaleSchema>;

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const { page } = useThemeClasses('manager');

  const form = useForm<NewSaleForm>({
    resolver: zodResolver(newSaleSchema),
    defaultValues: {
      totalAmount: "",
      paymentMethod: "",
      items: "",
    },
  });

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

  // New sale mutation
  const newSaleMutation = useMutation({
    mutationFn: async (data: NewSaleForm) => {
      return apiRequest("/api/sales", {
        method: "POST",
        body: JSON.stringify({
          managerId: user?.id,
          storeId: 1, // Demo store ID
          totalAmount: data.totalAmount,
          paymentMethod: data.paymentMethod,
          items: JSON.parse(data.items),
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Vente enregistrée",
        description: "La nouvelle vente a été ajoutée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard/1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/1"] });
      setNewSaleOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer la vente.",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: NewSaleForm) => {
    newSaleMutation.mutate(data);
  };

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
      <ManagerLayout>
        <LoadingSpinner size="lg" className="min-h-[400px]" />
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      {/* Header */}
      <div className={`mb-6 md:mb-8 p-6 rounded-lg ${page.pageHeader}`}>
        <h1 className="text-2xl md:text-3xl font-bold">
          Tableau de Bord
        </h1>
        <p className="opacity-90">
          Gérez votre boutique Njaboot Connect
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6 mb-6 md:mb-8">
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
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
        {/* Recent Orders */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Commandes Récentes</span>
                <Badge variant="secondary">{orders?.length || 0} commandes</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {orders?.slice(0, 5).map((order: any) => (
                  <div key={order.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <span className="font-medium">#{order.id}</span>
                        <Badge 
                          variant="outline" 
                          className={getOrderStatusClassName(order.status)}
                        >
                          {getOrderStatusLabel(order.status)}
                        </Badge>
                      </div>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Client #{order.customerId} • {formatCurrency(order.totalAmount)}
                      </p>
                    </div>
                    <Button variant="ghost" size="sm">
                      <AlertCircle className="h-4 w-4" />
                    </Button>
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
            <CardContent className="grid grid-cols-1 gap-3">
              <Dialog open={newSaleOpen} onOpenChange={setNewSaleOpen}>
                <DialogTrigger asChild>
                  <Button className={`w-full justify-start ${page.buttonPrimary}`}>
                    <DollarSign className="mr-2 h-4 w-4" />
                    Nouvelle Vente
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <DialogHeader>
                    <DialogTitle>Enregistrer une Nouvelle Vente</DialogTitle>
                    <DialogDescription>
                      Ajoutez une nouvelle vente au système.
                    </DialogDescription>
                  </DialogHeader>
                  <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                      <FormField
                        control={form.control}
                        name="totalAmount"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Montant Total (FCFA)</FormLabel>
                            <FormControl>
                              <Input 
                                placeholder="25000" 
                                type="number" 
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="paymentMethod"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Méthode de Paiement</FormLabel>
                            <Select onValueChange={field.onChange} defaultValue={field.value}>
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Sélectionnez une méthode" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="cash">Espèces</SelectItem>
                                <SelectItem value="card">Carte Bancaire</SelectItem>
                                <SelectItem value="mobile">Mobile Money</SelectItem>
                                <SelectItem value="credit">Crédit</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="items"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Articles (JSON)</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder='[{"productId": 1, "quantity": 2, "price": "12500"}]'
                                className="min-h-[80px]"
                                {...field} 
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <div className="flex justify-end space-x-2">
                        <Button 
                          type="button" 
                          variant="outline" 
                          onClick={() => setNewSaleOpen(false)}
                        >
                          Annuler
                        </Button>
                        <Button 
                          type="submit" 
                          disabled={newSaleMutation.isPending}
                        >
                          {newSaleMutation.isPending ? "Enregistrement..." : "Enregistrer"}
                        </Button>
                      </div>
                    </form>
                  </Form>
                </DialogContent>
              </Dialog>
              
              <Button variant="outline" className="w-full justify-start">
                <PackagePlus className="mr-2 h-4 w-4" />
                Ajouter Produit
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <BarChart3 className="mr-2 h-4 w-4" />
                Voir Rapports
              </Button>
              <Button variant="outline" className="w-full justify-start">
                <Settings className="mr-2 h-4 w-4" />
                Paramètres
              </Button>
            </CardContent>
          </Card>

          {/* Alerts */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertTriangle className="h-5 w-5 text-red-500" />
                Alertes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="p-3 bg-red-50 dark:bg-red-900/20 rounded-lg border border-red-200 dark:border-red-800">
                  <p className="text-sm font-medium text-red-800 dark:text-red-200">
                    5 produits en rupture de stock
                  </p>
                  <p className="text-xs text-red-600 dark:text-red-300">
                    Réapprovisionnement requis
                  </p>
                </div>
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                  <p className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    8 commandes en attente
                  </p>
                  <p className="text-xs text-yellow-600 dark:text-yellow-300">
                    Nécessitent votre attention
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Sales Chart */}
      <div className="mt-6 md:mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Évolution des Ventes (7 derniers jours)</CardTitle>
          </CardHeader>
          <CardContent>
            <SalesChart data={salesData} />
          </CardContent>
        </Card>
      </div>
    </ManagerLayout>
  );
}
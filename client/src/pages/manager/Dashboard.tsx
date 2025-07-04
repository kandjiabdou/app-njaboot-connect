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
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
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
  Minus,
  X,
  Search,
  User,
  CreditCard,
  Banknote,
  Smartphone,
} from "lucide-react";

// Interface pour les articles du panier
interface SaleItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  imageUrl?: string;
  unit: string;
}

const newSaleSchema = z.object({
  customerId: z.number().optional(),
  paymentMethod: z.string().min(1, "La méthode de paiement est requise"),
  notes: z.string().optional(),
});

type NewSaleForm = z.infer<typeof newSaleSchema>;

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  const [cartItems, setCartItems] = useState<SaleItem[]>([]);
  const { page } = useThemeClasses('manager');

  const form = useForm<NewSaleForm>({
    resolver: zodResolver(newSaleSchema),
    defaultValues: {
      paymentMethod: "",
      notes: "",
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

  // Fetch products data
  const { data: products } = useQuery({
    queryKey: ["/api/products"],
    enabled: !!user && user.role === "manager",
  });

  // Fetch customers data  
  const { data: customers } = useQuery({
    queryKey: ["/api/users", { role: "customer" }],
    enabled: !!user && user.role === "manager",
  });

  // Données des produits avec images pour la démonstration
  const mockProducts = [
    { id: 1, name: "Riz Jasmin", price: 1500, unit: "kg", imageUrl: "🌾", category: "Céréales" },
    { id: 2, name: "Huile de Palme", price: 800, unit: "L", imageUrl: "🫒", category: "Huiles" },
    { id: 3, name: "Tomates", price: 500, unit: "kg", imageUrl: "🍅", category: "Légumes" },
    { id: 4, name: "Oignons", price: 400, unit: "kg", imageUrl: "🧅", category: "Légumes" },
    { id: 5, name: "Pommes de Terre", price: 300, unit: "kg", imageUrl: "🥔", category: "Légumes" },
    { id: 6, name: "Lait en Poudre", price: 2500, unit: "boîte", imageUrl: "🥛", category: "Laitier" },
    { id: 7, name: "Sucre", price: 600, unit: "kg", imageUrl: "🍬", category: "Épicerie" },
    { id: 8, name: "Café", price: 1200, unit: "paquet", imageUrl: "☕", category: "Boissons" },
    { id: 9, name: "Thé", price: 800, unit: "boîte", imageUrl: "🍵", category: "Boissons" },
    { id: 10, name: "Savon", price: 250, unit: "pièce", imageUrl: "🧼", category: "Hygiène" },
    { id: 11, name: "Dentifrice", price: 1000, unit: "tube", imageUrl: "🦷", category: "Hygiène" },
    { id: 12, name: "Pâtes", price: 450, unit: "paquet", imageUrl: "🍝", category: "Céréales" }
  ];

  // Fonction pour ajouter un produit au panier
  const addToCart = (product: any) => {
    const existingItem = cartItems.find(item => item.id === product.id);
    if (existingItem) {
      setCartItems(cartItems.map(item => 
        item.id === product.id 
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCartItems([...cartItems, { 
        id: product.id, 
        name: product.name, 
        price: product.price, 
        quantity: 1,
        unit: product.unit,
        imageUrl: product.imageUrl 
      }]);
    }
  };

  // Fonction pour retirer un produit du panier
  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

  // Fonction pour modifier la quantité
  const updateQuantity = (productId: number, newQuantity: number) => {
    if (newQuantity <= 0) {
      removeFromCart(productId);
    } else {
      setCartItems(cartItems.map(item => 
        item.id === productId 
          ? { ...item, quantity: newQuantity }
          : item
      ));
    }
  };

  // Calculer le total
  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  // Produits filtrés par recherche
  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // New sale mutation
  const newSaleMutation = useMutation({
    mutationFn: async (data: NewSaleForm) => {
      const saleData = {
        managerId: user?.id,
        storeId: 1, // Demo store ID
        totalAmount: getTotal().toString(),
        paymentMethod: data.paymentMethod,
        customerId: data.customerId,
        notes: data.notes,
        items: cartItems.map(item => ({
          productId: item.id,
          quantity: item.quantity,
          price: item.price.toString()
        }))
      };
      
      return apiRequest("POST", "/api/sales", saleData);
    },
    onSuccess: () => {
      toast({
        title: "Vente enregistrée",
        description: "La nouvelle vente a été ajoutée avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/dashboard/1"] });
      queryClient.invalidateQueries({ queryKey: ["/api/sales/1"] });
      setNewSaleOpen(false);
      setCartItems([]);
      setSelectedCustomer(null);
      setSearchTerm("");
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
                <DialogContent className="max-w-6xl h-[80vh]">
                  <DialogHeader>
                    <DialogTitle className="text-xl font-bold">Point de Vente</DialogTitle>
                    <DialogDescription>
                      Sélectionnez les produits et finalisez la vente
                    </DialogDescription>
                  </DialogHeader>
                  
                  <div className="flex h-full gap-4">
                    {/* Section Produits - Gauche */}
                    <div className="flex-1 flex flex-col">
                      {/* Barre de recherche */}
                      <div className="mb-4">
                        <div className="relative">
                          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                          <Input
                            placeholder="Rechercher un produit..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-10"
                          />
                        </div>
                      </div>

                      {/* Grille des produits */}
                      <ScrollArea className="flex-1">
                        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                          {filteredProducts.map((product) => (
                            <Card 
                              key={product.id} 
                              className="cursor-pointer hover:shadow-md transition-all duration-200 hover:scale-105"
                              onClick={() => addToCart(product)}
                            >
                              <CardContent className="p-3 text-center">
                                <div className="text-3xl mb-2">{product.imageUrl}</div>
                                <div className="text-xs font-medium text-gray-900 dark:text-white mb-1 line-clamp-2">
                                  {product.name}
                                </div>
                                <div className="text-xs text-gray-500 mb-1">
                                  {formatCurrency(product.price)}/{product.unit}
                                </div>
                                <Badge variant="outline" className="text-xs">
                                  {product.category}
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </ScrollArea>
                    </div>

                    {/* Section Panier - Droite */}
                    <div className="w-80 flex flex-col bg-gray-50 dark:bg-gray-800 rounded-lg p-4">
                      {/* En-tête du panier */}
                      <div className="mb-4">
                        <h3 className="font-semibold text-lg mb-2">Panier</h3>
                        
                        {/* Sélection client */}
                        <div className="mb-4">
                          <Select onValueChange={(value) => setSelectedCustomer(value)}>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Sélectionner un client (optionnel)" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="anonymous">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  Client Anonyme
                                </div>
                              </SelectItem>
                              {customers?.slice(0, 5).map((customer: any) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  {customer.firstName} {customer.lastName}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Articles du panier */}
                      <ScrollArea className="flex-1 mb-4">
                        {cartItems.length === 0 ? (
                          <div className="text-center text-gray-500 py-8">
                            <ShoppingCart className="h-12 w-12 mx-auto mb-2 opacity-50" />
                            <p>Panier vide</p>
                            <p className="text-xs">Cliquez sur un produit pour l'ajouter</p>
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {cartItems.map((item) => (
                              <div key={item.id} className="flex items-center gap-2 p-2 bg-white dark:bg-gray-700 rounded">
                                <div className="text-lg">{item.imageUrl}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium truncate">{item.name}</div>
                                  <div className="text-xs text-gray-500">
                                    {formatCurrency(item.price)}/{item.unit}
                                  </div>
                                </div>
                                <div className="flex items-center gap-1">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0"
                                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                  >
                                    <Minus className="h-3 w-3" />
                                  </Button>
                                  <span className="w-8 text-center text-sm">{item.quantity}</span>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 w-6 p-0"
                                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                  >
                                    <Plus className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="ghost"
                                    className="h-6 w-6 p-0 text-red-500"
                                    onClick={() => removeFromCart(item.id)}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </ScrollArea>

                      {/* Total et paiement */}
                      {cartItems.length > 0 && (
                        <div className="space-y-4">
                          <Separator />
                          
                          {/* Total */}
                          <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                              {formatCurrency(getTotal())}
                            </div>
                            <div className="text-xs text-gray-500">
                              {cartItems.reduce((sum, item) => sum + item.quantity, 0)} article(s)
                            </div>
                          </div>

                          {/* Méthode de paiement */}
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => newSaleMutation.mutate(data))} className="space-y-3">
                              <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Méthode de Paiement</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger>
                                          <SelectValue placeholder="Sélectionnez" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="cash">
                                          <div className="flex items-center gap-2">
                                            <Banknote className="h-4 w-4" />
                                            Espèces
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="card">
                                          <div className="flex items-center gap-2">
                                            <CreditCard className="h-4 w-4" />
                                            Carte Bancaire
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="mobile">
                                          <div className="flex items-center gap-2">
                                            <Smartphone className="h-4 w-4" />
                                            Mobile Money
                                          </div>
                                        </SelectItem>
                                      </SelectContent>
                                    </Select>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name="notes"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Notes (optionnel)</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Commentaires sur la vente..."
                                        className="min-h-[60px]"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex gap-2">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => {
                                    setNewSaleOpen(false);
                                    setCartItems([]);
                                    setSearchTerm("");
                                    setSelectedCustomer(null);
                                  }}
                                  className="flex-1"
                                >
                                  Annuler
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={newSaleMutation.isPending}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  {newSaleMutation.isPending ? "..." : "Régler"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </div>
                      )}
                    </div>
                  </div>
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
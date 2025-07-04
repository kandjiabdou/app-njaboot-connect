import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import { useThemeClasses } from "@/lib/theme";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";

// UI Components
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

// Icons
import { 
  DollarSign, 
  Search, 
  ShoppingCart, 
  User, 
  Plus, 
  Minus, 
  X,
  Banknote,
  CreditCard,
  Smartphone,
  TrendingUp,
  Users,
  AlertTriangle,
  AlertCircle
} from "lucide-react";

// Layout
import ManagerLayout from "@/components/layout/ManagerLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";

const newSaleSchema = z.object({
  paymentMethod: z.string().min(1, "Méthode de paiement requise"),
  customerId: z.number().optional(),
  notes: z.string().optional(),
});

type NewSaleForm = z.infer<typeof newSaleSchema>;

interface SaleItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  unit: string;
  imageUrl: string;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF',
    minimumFractionDigits: 0,
  }).format(amount);
};

const KPICard = ({ title, value, subtitle, trendValue, trend, icon: Icon, iconColor }: any) => (
  <Card>
    <CardContent className="p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold">{typeof value === 'number' ? formatCurrency(value) : value}</p>
          {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          {trendValue && (
            <p className={`text-xs ${trend === 'up' ? 'text-green-600' : 'text-red-600'}`}>
              {trendValue}
            </p>
          )}
        </div>
        <Icon className={`h-8 w-8 ${iconColor}`} />
      </div>
    </CardContent>
  </Card>
);

export default function ManagerDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [newSaleOpen, setNewSaleOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [customerSearchTerm, setCustomerSearchTerm] = useState("");
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
    queryKey: [`/api/analytics/dashboard/1`],
    enabled: !!user && user.role === "manager",
  });

  // Fetch recent orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/orders?storeId=1`],
    enabled: !!user && user.role === "manager",
  });

  // Fetch customers data  
  const { data: customers } = useQuery({
    queryKey: ["/api/users", { role: "customer" }],
    enabled: !!user && user.role === "manager",
  });

  // Mock products with emojis
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

  // Functions for cart management
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

  const removeFromCart = (productId: number) => {
    setCartItems(cartItems.filter(item => item.id !== productId));
  };

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

  const getTotal = () => {
    return cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const filteredProducts = mockProducts.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    product.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // New sale mutation
  const newSaleMutation = useMutation({
    mutationFn: async (data: NewSaleForm) => {
      const saleData = {
        managerId: user?.id,
        storeId: 1,
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

  if (analyticsLoading || ordersLoading) {
    return (
      <ManagerLayout>
        <LoadingSpinner size="lg" className="min-h-[400px]" />
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      {/* Header avec bouton Nouvelle Vente */}
      <div className={`mb-6 md:mb-8 p-6 rounded-lg ${page.pageHeader}`}>
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold">
              Tableau de Bord
            </h1>
            <p className="opacity-90">
              Gérez votre boutique Njaboot Connect
            </p>
          </div>
          
          <Dialog open={newSaleOpen} onOpenChange={setNewSaleOpen}>
            <DialogTrigger asChild>
              <Button className={`${page.buttonPrimary} px-6 py-3 text-base font-medium shadow-lg hover:shadow-xl transition-all duration-200`}>
                <DollarSign className="mr-2 h-5 w-5" />
                Nouvelle Vente
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-7xl max-h-[95vh] p-0 overflow-hidden flex flex-col">
              <DialogHeader className="flex-shrink-0 p-4 md:p-6 pb-3 md:pb-4 border-b">
                <DialogTitle className="text-xl font-bold">Point de Vente</DialogTitle>
                <DialogDescription>
                  Sélectionnez les produits et finalisez la vente
                </DialogDescription>
              </DialogHeader>
              
              {/* Contenu avec un seul scroll global */}
              <div className="flex-1 overflow-y-auto">
                <div className="flex flex-col lg:flex-row min-h-full">
                  {/* Section Produits - Gauche */}
                  <div className="flex-1 p-4 md:p-6">
                    {/* Barre de recherche */}
                    <div className="mb-6">
                      <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                        <Input
                          placeholder="Rechercher un produit..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          className="pl-10 h-12 text-base"
                        />
                      </div>
                    </div>

                    {/* Grille des produits */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6 mb-6">
                      {filteredProducts.map((product) => (
                        <Card 
                          key={product.id} 
                          className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-105 border-2 hover:border-primary/50"
                          onClick={() => addToCart(product)}
                        >
                          <CardContent className="p-4 text-center">
                            <div className="text-3xl md:text-4xl mb-3">{product.imageUrl}</div>
                            <div className="text-sm md:text-base font-medium text-gray-900 dark:text-white mb-2 line-clamp-2 min-h-[2.5rem]">
                              {product.name}
                            </div>
                            <div className="text-xs md:text-sm text-gray-500 mb-2">
                              {formatCurrency(product.price)}/{product.unit}
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {product.category}
                            </Badge>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  </div>

                  {/* Section Panier - Droite */}
                  <div className="w-full lg:w-96 bg-gray-50 dark:bg-gray-900 border-t lg:border-t-0 lg:border-l">
                    <div className="p-4 md:p-6">
                      {/* En-tête du panier */}
                      <div className="mb-6">
                        <h3 className="font-semibold text-lg mb-4">Panier</h3>
                        
                        {/* Sélection client */}
                        <div className="mb-6">
                          <label className="block text-sm font-medium mb-3">Client</label>
                          <Select onValueChange={(value) => setSelectedCustomer(value)}>
                            <SelectTrigger className="w-full h-12">
                              <SelectValue placeholder="Sélectionner un client..." />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="anonymous">
                                <div className="flex items-center gap-2">
                                  <User className="h-4 w-4" />
                                  <span>Client Anonyme</span>
                                </div>
                              </SelectItem>
                              {customers?.slice(0, 10).map((customer: any) => (
                                <SelectItem key={customer.id} value={customer.id.toString()}>
                                  <div className="flex items-center gap-2">
                                    <User className="h-4 w-4" />
                                    <span>{customer.firstName} {customer.lastName}</span>
                                    <span className="text-xs text-gray-500">({customer.email})</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      {/* Articles du panier */}
                      <div className="mb-6">
                        {cartItems.length === 0 ? (
                          <div className="text-center text-gray-500 py-12">
                            <ShoppingCart className="h-16 w-16 mx-auto mb-4 opacity-50" />
                            <p className="font-medium mb-2">Panier vide</p>
                            <p className="text-sm">Cliquez sur un produit pour l'ajouter</p>
                          </div>
                        ) : (
                          <div className="space-y-4">
                            {cartItems.map((item) => (
                              <div key={item.id} className="flex items-start gap-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow-sm border">
                                <div className="text-2xl flex-shrink-0 mt-1">{item.imageUrl}</div>
                                <div className="flex-1 min-w-0">
                                  <div className="text-sm font-medium mb-1 text-gray-900 dark:text-white">
                                    {item.name}
                                  </div>
                                  <div className="text-xs text-gray-500 mb-3">
                                    {formatCurrency(item.price)}/{item.unit}
                                  </div>
                                  <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 w-9 p-0"
                                        onClick={() => updateQuantity(item.id, item.quantity - 1)}
                                      >
                                        <Minus className="h-4 w-4" />
                                      </Button>
                                      <span className="w-8 text-center text-sm font-medium">{item.quantity}</span>
                                      <Button
                                        size="sm"
                                        variant="outline"
                                        className="h-9 w-9 p-0"
                                        onClick={() => updateQuantity(item.id, item.quantity + 1)}
                                      >
                                        <Plus className="h-4 w-4" />
                                      </Button>
                                    </div>
                                    <Button
                                      size="sm"
                                      variant="ghost"
                                      className="h-9 w-9 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                      onClick={() => removeFromCart(item.id)}
                                    >
                                      <X className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Total et paiement */}
                      {cartItems.length > 0 && (
                        <div className="border-t bg-white dark:bg-gray-800 -mx-6 px-6 py-6">
                          {/* Total */}
                          <div className="mb-6">
                            <div className="text-center bg-gray-50 dark:bg-gray-700 p-6 rounded-lg">
                              <div className="text-3xl font-bold text-green-600 mb-2">
                                {formatCurrency(getTotal())}
                              </div>
                              <div className="text-sm text-gray-500">
                                {cartItems.reduce((sum, item) => sum + item.quantity, 0)} article(s)
                              </div>
                            </div>
                          </div>

                          {/* Formulaire de paiement */}
                          <Form {...form}>
                            <form onSubmit={form.handleSubmit((data) => newSaleMutation.mutate(data))} className="space-y-6">
                              <FormField
                                control={form.control}
                                name="paymentMethod"
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel className="text-base font-medium">Méthode de Paiement</FormLabel>
                                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                                      <FormControl>
                                        <SelectTrigger className="h-14 text-base">
                                          <SelectValue placeholder="Sélectionnez une méthode" />
                                        </SelectTrigger>
                                      </FormControl>
                                      <SelectContent>
                                        <SelectItem value="cash">
                                          <div className="flex items-center gap-3 py-2">
                                            <Banknote className="h-5 w-5 text-green-600" />
                                            <div>
                                              <div className="font-medium">Espèces</div>
                                              <div className="text-xs text-gray-500">Paiement en cash</div>
                                            </div>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="card">
                                          <div className="flex items-center gap-3 py-2">
                                            <CreditCard className="h-5 w-5 text-blue-600" />
                                            <div>
                                              <div className="font-medium">Carte Bancaire</div>
                                              <div className="text-xs text-gray-500">Visa, Mastercard</div>
                                            </div>
                                          </div>
                                        </SelectItem>
                                        <SelectItem value="mobile">
                                          <div className="flex items-center gap-3 py-2">
                                            <Smartphone className="h-5 w-5 text-orange-600" />
                                            <div>
                                              <div className="font-medium">Mobile Money</div>
                                              <div className="text-xs text-gray-500">Orange Money, Wave</div>
                                            </div>
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
                                    <FormLabel className="text-base font-medium">Notes (optionnel)</FormLabel>
                                    <FormControl>
                                      <Textarea 
                                        placeholder="Commentaires sur la vente..."
                                        className="min-h-[100px] text-base resize-none"
                                        {...field} 
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <div className="flex gap-4 pt-4">
                                <Button 
                                  type="button" 
                                  variant="outline" 
                                  onClick={() => {
                                    setNewSaleOpen(false);
                                    setCartItems([]);
                                    setSearchTerm("");
                                    setSelectedCustomer(null);
                                  }}
                                  className="flex-1 h-14 text-base"
                                >
                                  Annuler
                                </Button>
                                <Button 
                                  type="submit" 
                                  disabled={newSaleMutation.isPending}
                                  className="flex-1 h-14 bg-green-600 hover:bg-green-700 text-white font-medium text-base"
                                >
                                  {newSaleMutation.isPending ? "Traitement..." : "Finaliser la Vente"}
                                </Button>
                              </div>
                            </form>
                          </Form>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
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

      {/* Recent Orders */}
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
                    <Badge variant="outline">
                      {order.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Client #{order.customerId} • {formatCurrency(parseInt(order.totalAmount))}
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
    </ManagerLayout>
  );
}
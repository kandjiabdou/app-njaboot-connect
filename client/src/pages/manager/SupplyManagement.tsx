import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDateTime } from "@/lib/utils";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ManagerLayout from "@/components/layout/ManagerLayout";
import { 
  Package, 
  Truck, 
  ShoppingCart, 
  FileText, 
  Download, 
  Plus,
  Search,
  Building2,
  Clock,
  CheckCircle,
  AlertCircle,
  XCircle,
  Eye
} from "lucide-react";

export default function SupplyManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedCenter, setSelectedCenter] = useState<number | null>(null);
  const [isNewOrderOpen, setIsNewOrderOpen] = useState(false);
  const [orderItems, setOrderItems] = useState<Array<{productId: number, quantity: number, unitPrice: number}>>([]);



  // Fetch store data
  const { data: store } = useQuery({
    queryKey: [`/api/stores/manager/${user?.id}`],
    enabled: !!user && user.role === "manager",
  });

  // Fetch supply orders
  const { data: supplyOrders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/supply-orders/${store?.id}`],
    enabled: !!store,
  });

  // Fetch purchasing centers
  const { data: purchasingCenters } = useQuery({
    queryKey: ["/api/purchasing-centers"],
  });

  // Fetch center products when a center is selected
  const { data: centerProducts } = useQuery({
    queryKey: [`/api/center-products/${selectedCenter}`],
    enabled: !!selectedCenter,
  });

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: (orderData: any) => apiRequest(`/api/supply-orders`, {
      method: "POST",
      body: JSON.stringify(orderData),
    }),
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Commande créée avec succès",
      });
      setIsNewOrderOpen(false);
      setOrderItems([]);
      setSelectedCenter(null);
      queryClient.invalidateQueries({ queryKey: [`/api/supply-orders/${store?.id}`] });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de créer la commande",
        variant: "destructive",
      });
    },
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: ({ orderId, status }: { orderId: number; status: string }) => 
      apiRequest(`/api/supply-orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      }),
    onSuccess: () => {
      toast({
        title: "Succès",
        description: "Statut de la commande mis à jour",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/supply-orders/${store?.id}`] });
    },
  });

  const getOrderStatusBadge = (status: string) => {
    const statusConfig = {
      pending: { label: "En attente", variant: "secondary" as const, icon: Clock },
      confirmed: { label: "Confirmée", variant: "default" as const, icon: CheckCircle },
      shipped: { label: "Expédiée", variant: "secondary" as const, icon: Truck },
      delivered: { label: "Livrée", variant: "default" as const, icon: CheckCircle },
      cancelled: { label: "Annulée", variant: "destructive" as const, icon: XCircle },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.pending;
    const Icon = config.icon;
    
    return (
      <Badge variant={config.variant} className="flex items-center gap-1">
        <Icon className="h-3 w-3" />
        {config.label}
      </Badge>
    );
  };

  const handleCreateOrder = () => {
    if (!selectedCenter || orderItems.length === 0) {
      toast({
        title: "Erreur",
        description: "Veuillez sélectionner une centrale et ajouter des produits",
        variant: "destructive",
      });
      return;
    }

    const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);

    createOrderMutation.mutate({
      storeId: store?.id,
      centerId: selectedCenter,
      totalAmount,
      items: orderItems,
    });
  };

  const addProductToOrder = (product: any, quantity: number) => {
    const existingItem = orderItems.find(item => item.productId === product.productId);
    
    if (existingItem) {
      setOrderItems(orderItems.map(item => 
        item.productId === product.productId 
          ? { ...item, quantity: item.quantity + quantity }
          : item
      ));
    } else {
      setOrderItems([...orderItems, {
        productId: product.productId,
        quantity,
        unitPrice: parseFloat(product.unitPrice)
      }]);
    }
  };

  if (!user || user.role !== "manager") {
    return <div>Accès non autorisé</div>;
  }

  return (
    <ManagerLayout>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 max-w-7xl">
        <div className="space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                Approvisionnement
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-1">
                Gestion des commandes et des centrales d'achat
              </p>
            </div>
            <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
              <DialogTrigger asChild>
                <Button className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Nouvelle Commande
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle commande d'approvisionnement</DialogTitle>
                </DialogHeader>
                <div className="space-y-6">
                  {/* Selection de la centrale */}
                  <div>
                    <Label htmlFor="center-select">Centrale d'achat</Label>
                    <Select onValueChange={(value) => setSelectedCenter(Number(value))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner une centrale d'achat" />
                      </SelectTrigger>
                      <SelectContent>
                        {purchasingCenters?.map((center: any) => (
                          <SelectItem key={center.id} value={center.id.toString()}>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4" />
                              <span>{center.name}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Produits disponibles */}
                  {selectedCenter && centerProducts && (
                    <div>
                      <Label>Produits disponibles</Label>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-h-60 overflow-y-auto">
                        {centerProducts.map((item: any) => (
                          <Card key={item.id} className="p-4">
                            <div className="flex justify-between items-start mb-2">
                              <div>
                                <h4 className="font-medium">{item.product?.name}</h4>
                                <p className="text-sm text-gray-600">{formatCurrency(item.unitPrice)}/unité</p>
                                <p className="text-xs text-gray-500">Stock: {item.availableQuantity}</p>
                              </div>
                            </div>
                            <div className="flex gap-2">
                              <Input
                                type="number"
                                placeholder="Quantité"
                                min="1"
                                max={item.availableQuantity}
                                className="flex-1"
                                onKeyPress={(e) => {
                                  if (e.key === 'Enter') {
                                    const quantity = parseInt((e.target as HTMLInputElement).value);
                                    if (quantity > 0 && quantity <= item.availableQuantity) {
                                      addProductToOrder(item, quantity);
                                      (e.target as HTMLInputElement).value = '';
                                    }
                                  }
                                }}
                              />
                              <Button
                                size="sm"
                                onClick={() => {
                                  const input = document.querySelector(`input[type="number"]`) as HTMLInputElement;
                                  const quantity = parseInt(input?.value || '1');
                                  if (quantity > 0 && quantity <= item.availableQuantity) {
                                    addProductToOrder(item, quantity);
                                    if (input) input.value = '';
                                  }
                                }}
                              >
                                <Plus className="h-3 w-3" />
                              </Button>
                            </div>
                          </Card>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Résumé de la commande */}
                  {orderItems.length > 0 && (
                    <Card>
                      <CardHeader>
                        <CardTitle>Résumé de la commande</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {orderItems.map((item, index) => (
                            <div key={index} className="flex justify-between items-center">
                              <span>Produit #{item.productId}</span>
                              <span>{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                              <span className="font-medium">
                                {formatCurrency(item.quantity * item.unitPrice)}
                              </span>
                            </div>
                          ))}
                          <hr />
                          <div className="flex justify-between items-center font-bold">
                            <span>Total</span>
                            <span>
                              {formatCurrency(orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )}

                  <Button 
                    onClick={handleCreateOrder} 
                    disabled={createOrderMutation.isPending || orderItems.length === 0}
                    className="w-full"
                  >
                    {createOrderMutation.isPending ? "Création..." : "Créer la commande"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Contenu principal */}
          <Tabs defaultValue="orders" className="space-y-6">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="orders" className="flex items-center gap-2">
                <ShoppingCart className="h-4 w-4" />
                Commandes
              </TabsTrigger>
              <TabsTrigger value="centers" className="flex items-center gap-2">
                <Building2 className="h-4 w-4" />
                Centrales
              </TabsTrigger>
              <TabsTrigger value="history" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Historique
              </TabsTrigger>
            </TabsList>

            <TabsContent value="orders" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <ShoppingCart className="h-5 w-5" />
                    Commandes d'approvisionnement
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {ordersLoading ? (
                    <div className="flex justify-center py-8">
                      <div className="text-gray-500">Chargement des commandes...</div>
                    </div>
                  ) : supplyOrders?.length > 0 ? (
                    <div className="space-y-4">
                      {supplyOrders.map((order: any) => (
                        <Card key={order.id} className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/50">
                          <CardContent className="p-5">
                            {/* Header avec numéro et statut */}
                            <div className="flex items-center justify-between mb-4">
                              <div className="flex items-center gap-3">
                                <div className="p-2.5 bg-gradient-to-br from-blue-400 to-blue-500 rounded-xl shadow-md">
                                  <Package className="h-5 w-5 text-white" />
                                </div>
                                <div>
                                  <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                    #{order.orderNumber}
                                  </h3>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    {formatDateTime(order.createdAt)}
                                  </p>
                                </div>
                              </div>
                              {getOrderStatusBadge(order.status)}
                            </div>

                            {/* Informations centrale */}
                            <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                                    <Building2 className="h-4 w-4 text-green-600" />
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900 dark:text-white">
                                      {order.center?.name || 'Centrale inconnue'}
                                    </p>
                                    <p className="text-sm text-gray-500 dark:text-gray-400">
                                      📦 {order.items?.length || 0} produit(s)
                                    </p>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <p className="font-bold text-xl text-gray-900 dark:text-white">
                                    {formatCurrency(order.totalAmount)}
                                  </p>
                                  <p className="text-sm text-gray-500 dark:text-gray-400">
                                    Total HT
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="flex flex-col sm:flex-row gap-3">
                              <Button 
                                variant="outline" 
                                className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50"
                                onClick={() => updateOrderMutation.mutate({ 
                                  orderId: order.id, 
                                  status: order.status === 'pending' ? 'confirmed' : order.status 
                                })}
                                disabled={order.status === 'delivered' || order.status === 'cancelled'}
                              >
                                <Eye className="h-4 w-4 mr-2" />
                                Voir détails
                              </Button>
                              
                              {order.status !== 'delivered' && order.status !== 'cancelled' && (
                                <Button 
                                  className="flex-1 rounded-xl"
                                  onClick={() => updateOrderMutation.mutate({ 
                                    orderId: order.id, 
                                    status: order.status === 'pending' ? 'confirmed' : 
                                           order.status === 'confirmed' ? 'shipped' : 'delivered'
                                  })}
                                >
                                  {order.status === 'pending' && 'Confirmer'}
                                  {order.status === 'confirmed' && 'Marquer expédiée'}
                                  {order.status === 'shipped' && 'Marquer reçue'}
                                </Button>
                              )}
                              
                              {order.invoiceUrl && (
                                <Button 
                                  variant="outline" 
                                  className="flex-1 sm:flex-none rounded-xl"
                                  onClick={() => window.open(order.invoiceUrl, '_blank')}
                                >
                                  <Download className="h-4 w-4 mr-2" />
                                  <span className="hidden sm:inline">Facture</span>
                                  <span className="sm:hidden">PDF</span>
                                </Button>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      Aucune commande d'approvisionnement trouvée
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="centers" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building2 className="h-5 w-5" />
                    Centrales d'achat partenaires
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {purchasingCenters?.map((center: any) => (
                      <Card key={center.id} className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/50">
                        <CardContent className="p-5">
                          {/* Header avec icône et ville */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-start gap-3">
                              <div className="p-3 bg-gradient-to-br from-green-400 to-green-500 rounded-xl shadow-md">
                                <Building2 className="h-6 w-6 text-white" />
                              </div>
                              <div>
                                <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                                  {center.name}
                                </h3>
                                <p className="text-sm font-medium text-green-600 dark:text-green-400">
                                  📍 {center.city}
                                </p>
                              </div>
                            </div>
                          </div>

                          {/* Description */}
                          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                            <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                              Centrale d'approvisionnement de {center.city}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {center.specialties?.map((specialty: string, index: number) => (
                                <Badge key={index} variant="secondary" className="text-xs rounded-lg">
                                  {specialty}
                                </Badge>
                              ))}
                            </div>
                          </div>

                          {/* Contact et adresse */}
                          <div className="space-y-2 mb-4">
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>📍</span>
                              <span className="line-clamp-1">{center.address}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>📧</span>
                              <span>{center.email}</span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                              <span>📞</span>
                              <span>{center.phone}</span>
                            </div>
                          </div>

                          {/* Actions */}
                          <div className="flex flex-col sm:flex-row gap-2">
                            <Button 
                              variant="outline" 
                              className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50 text-sm"
                              onClick={() => setSelectedCenter(center.id)}
                            >
                              <Package className="h-4 w-4 mr-1" />
                              <span className="truncate">Voir produits</span>
                            </Button>
                            <Button 
                              className="flex-1 rounded-xl bg-green-600 hover:bg-green-700 text-sm"
                              onClick={() => {
                                setSelectedCenter(center.id);
                                setIsNewOrderOpen(true);
                              }}
                            >
                              <Plus className="h-4 w-4 mr-1" />
                              <span className="truncate">Commander</span>
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="history" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <FileText className="h-5 w-5" />
                    Historique des approvisionnements
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-gray-500">
                    Fonctionnalité d'historique en cours de développement
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {/* Dialog pour nouvelle commande */}
      <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Plus className="h-5 w-5" />
              Nouvelle commande d'approvisionnement
            </DialogTitle>
          </DialogHeader>

          {!selectedCenter ? (
            // Étape 1: Sélection de la centrale
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Choisissez une centrale d'achat</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {purchasingCenters?.map((center: any) => (
                  <Card 
                    key={center.id} 
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 border-2 hover:border-green-500"
                    onClick={() => setSelectedCenter(center.id)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <div className="p-2.5 bg-gradient-to-br from-green-400 to-green-500 rounded-xl">
                          <Building2 className="h-5 w-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h4 className="font-bold text-lg text-gray-900">{center.name}</h4>
                          <p className="text-sm text-green-600 font-medium">📍 {center.city}</p>
                          <p className="text-sm text-gray-600 mt-2">{center.description}</p>
                          
                          <div className="flex flex-wrap gap-1 mt-3">
                            {center.specialties?.slice(0, 3).map((specialty: string, index: number) => (
                              <Badge key={index} variant="secondary" className="text-xs">
                                {specialty}
                              </Badge>
                            ))}
                            {center.specialties?.length > 3 && (
                              <Badge variant="secondary" className="text-xs">
                                +{center.specialties.length - 3}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ) : (
            // Étape 2: Sélection des produits
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold">Sélectionnez les produits</h3>
                  <p className="text-sm text-gray-600">
                    Centrale: {purchasingCenters?.find((c: any) => c.id === selectedCenter)?.name}
                  </p>
                </div>
                <Button 
                  variant="outline" 
                  onClick={() => setSelectedCenter(null)}
                  className="rounded-xl"
                >
                  ← Changer de centrale
                </Button>
              </div>

              {centerProducts?.length > 0 ? (
                <div className="space-y-3">
                  {centerProducts.map((item: any) => {
                    const currentItem = orderItems.find(oi => oi.productId === item.product.id);
                    return (
                      <Card key={item.id} className="rounded-xl">
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-gray-600">{item.product.description}</p>
                              <p className="text-sm font-semibold text-green-600">
                                {formatCurrency(item.unitPrice)} / {item.product.unit}
                              </p>
                            </div>
                            <div className="flex items-center gap-3">
                              <Input
                                type="number"
                                placeholder="Quantité"
                                min="0"
                                className="w-24 rounded-lg"
                                value={currentItem?.quantity || ''}
                                onChange={(e) => {
                                  const quantity = parseInt(e.target.value) || 0;
                                  if (quantity > 0) {
                                    setOrderItems(prev => {
                                      const existing = prev.find(oi => oi.productId === item.product.id);
                                      if (existing) {
                                        return prev.map(oi => 
                                          oi.productId === item.product.id 
                                            ? { ...oi, quantity }
                                            : oi
                                        );
                                      } else {
                                        return [...prev, {
                                          productId: item.product.id,
                                          quantity,
                                          unitPrice: parseFloat(item.unitPrice)
                                        }];
                                      }
                                    });
                                  } else {
                                    setOrderItems(prev => prev.filter(oi => oi.productId !== item.product.id));
                                  }
                                }}
                              />
                              <Button
                                variant="outline"
                                size="sm"
                                className="rounded-lg"
                                onClick={() => {
                                  const currentQuantity = currentItem?.quantity || 0;
                                  const newQuantity = currentQuantity + 1;
                                  setOrderItems(prev => {
                                    const existing = prev.find(oi => oi.productId === item.product.id);
                                    if (existing) {
                                      return prev.map(oi => 
                                        oi.productId === item.product.id 
                                          ? { ...oi, quantity: newQuantity }
                                          : oi
                                      );
                                    } else {
                                      return [...prev, {
                                        productId: item.product.id,
                                        quantity: newQuantity,
                                        unitPrice: parseFloat(item.unitPrice)
                                      }];
                                    }
                                  });
                                }}
                              >
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  Aucun produit disponible pour cette centrale
                </div>
              )}

              {orderItems.length > 0 && (
                <div className="bg-gray-50 rounded-xl p-4 space-y-3">
                  <h4 className="font-semibold">Résumé de la commande</h4>
                  <div className="space-y-2">
                    {orderItems.map((item) => {
                      const product = centerProducts?.find((cp: any) => cp.product.id === item.productId);
                      return (
                        <div key={item.productId} className="flex justify-between text-sm">
                          <span>{product?.product.name} x {item.quantity}</span>
                          <span className="font-medium">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                  <div className="border-t pt-2 flex justify-between font-bold">
                    <span>Total</span>
                    <span>
                      {formatCurrency(
                        orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0)
                      )}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex gap-3 pt-4">
                <Button 
                  variant="outline" 
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    setIsNewOrderOpen(false);
                    setSelectedCenter(null);
                    setOrderItems([]);
                  }}
                >
                  Annuler
                </Button>
                <Button 
                  className="flex-1 rounded-xl"
                  disabled={orderItems.length === 0 || createOrderMutation.isPending}
                  onClick={() => {
                    if (selectedCenter && store?.id && orderItems.length > 0) {
                      const totalAmount = orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
                      createOrderMutation.mutate({
                        storeId: store.id,
                        centerId: selectedCenter,
                        totalAmount,
                        items: orderItems
                      });
                    }
                  }}
                >
                  {createOrderMutation.isPending ? "Création..." : "Créer la commande"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </ManagerLayout>
  );
}
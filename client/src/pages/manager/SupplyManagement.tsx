import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  XCircle
} from "lucide-react";

export default function SupplyManagement() {
  const { user } = useAuth();
  const { toast } = useToast();
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
  const { data: purchasingCenters, isLoading: centersLoading } = useQuery({
    queryKey: ["/api/purchasing-centers"],
  });

  // Fetch center products when center is selected
  const { data: centerProducts } = useQuery({
    queryKey: [`/api/center-products/${selectedCenter}`],
    enabled: !!selectedCenter,
  });

  // Create supply order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("/api/supply-orders", {
        method: "POST",
        body: JSON.stringify(orderData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/supply-orders/${store?.id}`] });
      setIsNewOrderOpen(false);
      setOrderItems([]);
      setSelectedCenter(null);
      toast({
        title: "Commande créée",
        description: "Votre commande d'approvisionnement a été créée avec succès",
      });
    },
  });

  // Update order status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest(`/api/supply-orders/${orderId}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/supply-orders/${store?.id}`] });
      toast({
        title: "Statut mis à jour",
        description: "Le statut de la commande a été mis à jour",
      });
    },
  });

  const getStatusBadge = (status: string) => {
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
      storeId: store.id,
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

  const downloadInvoice = (invoiceUrl: string, orderNumber: string) => {
    // Simulate invoice download
    toast({
      title: "Téléchargement",
      description: `Facture ${orderNumber} téléchargée`,
    });
  };

  if (!user || user.role !== "manager") {
    return <div>Accès non autorisé</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Approvisionnement</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Gestion des commandes et des centrales d'achat
          </p>
        </div>
        <Dialog open={isNewOrderOpen} onOpenChange={setIsNewOrderOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Nouvelle Commande
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Créer une nouvelle commande</DialogTitle>
            </DialogHeader>
            <div className="space-y-6">
              {/* Selection de la centrale */}
              <div>
                <Label>Centrale d'achat</Label>
                <Select onValueChange={(value) => setSelectedCenter(Number(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une centrale" />
                  </SelectTrigger>
                  <SelectContent>
                    {purchasingCenters?.map((center: any) => (
                      <SelectItem key={center.id} value={center.id.toString()}>
                        <div className="flex items-center gap-2">
                          <Building2 className="h-4 w-4" />
                          <div>
                            <div className="font-medium">{center.name}</div>
                            <div className="text-sm text-gray-500">{center.city}</div>
                          </div>
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
                  <div className="grid gap-4 mt-2">
                    {centerProducts.map((item: any) => (
                      <Card key={item.id}>
                        <CardContent className="p-4">
                          <div className="flex justify-between items-center">
                            <div>
                              <h4 className="font-medium">{item.product.name}</h4>
                              <p className="text-sm text-gray-500">
                                Prix: {formatCurrency(item.unitPrice)} | 
                                Min: {item.minOrderQuantity} | 
                                Stock: {item.stockQuantity} | 
                                Livraison: {item.deliveryTime} jours
                              </p>
                            </div>
                            <div className="flex items-center gap-2">
                              <Input
                                type="number"
                                placeholder="Qté"
                                className="w-20"
                                min={item.minOrderQuantity}
                                max={item.stockQuantity}
                                onChange={(e) => {
                                  const quantity = parseInt(e.target.value);
                                  if (quantity >= item.minOrderQuantity) {
                                    addProductToOrder(item, quantity);
                                  }
                                }}
                              />
                              <Button size="sm">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* Récapitulatif de la commande */}
              {orderItems.length > 0 && (
                <div>
                  <Label>Récapitulatif de la commande</Label>
                  <Card className="mt-2">
                    <CardContent className="p-4">
                      {orderItems.map((item, index) => (
                        <div key={index} className="flex justify-between items-center py-2">
                          <span>Produit #{item.productId}</span>
                          <span>{item.quantity} × {formatCurrency(item.unitPrice)}</span>
                          <span className="font-medium">
                            {formatCurrency(item.quantity * item.unitPrice)}
                          </span>
                        </div>
                      ))}
                      <div className="border-t pt-2 mt-2">
                        <div className="flex justify-between font-bold">
                          <span>Total</span>
                          <span>
                            {formatCurrency(orderItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0))}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )}

              <Button 
                onClick={handleCreateOrder} 
                disabled={createOrderMutation.isPending}
                className="w-full"
              >
                {createOrderMutation.isPending ? "Création..." : "Créer la commande"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="orders" className="space-y-4">
        <TabsList>
          <TabsTrigger value="orders">Mes Commandes</TabsTrigger>
          <TabsTrigger value="centers">Centrales d'Achat</TabsTrigger>
          <TabsTrigger value="invoices">Facturation</TabsTrigger>
        </TabsList>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4">
            {ordersLoading ? (
              <div>Chargement des commandes...</div>
            ) : supplyOrders?.length === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune commande</h3>
                  <p className="text-gray-500 mb-4">
                    Vous n'avez pas encore passé de commande d'approvisionnement
                  </p>
                  <Button onClick={() => setIsNewOrderOpen(true)}>
                    Créer ma première commande
                  </Button>
                </CardContent>
              </Card>
            ) : (
              supplyOrders?.map((order: any) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{order.orderNumber}</CardTitle>
                        <p className="text-sm text-gray-500">
                          {order.center.name} • {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        {getStatusBadge(order.status)}
                        <span className="font-bold text-lg">
                          {formatCurrency(order.totalAmount)}
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <div className="space-y-1">
                        {order.deliveryDate && (
                          <p className="text-sm">
                            <strong>Livraison prévue:</strong> {formatDateTime(order.deliveryDate)}
                          </p>
                        )}
                        {order.trackingNumber && (
                          <p className="text-sm">
                            <strong>Suivi:</strong> {order.trackingNumber}
                          </p>
                        )}
                        {order.notes && (
                          <p className="text-sm">
                            <strong>Notes:</strong> {order.notes}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2">
                        {order.invoiceUrl && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => downloadInvoice(order.invoiceUrl, order.orderNumber)}
                          >
                            <Download className="mr-2 h-4 w-4" />
                            Facture
                          </Button>
                        )}
                        {order.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => updateStatusMutation.mutate({ orderId: order.id, status: "cancelled" })}
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="centers" className="space-y-4">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {centersLoading ? (
              <div>Chargement des centrales...</div>
            ) : (
              purchasingCenters?.map((center: any) => (
                <Card key={center.id}>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Building2 className="h-5 w-5" />
                      {center.name}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <p className="text-sm">
                        <strong>Ville:</strong> {center.city}
                      </p>
                      <p className="text-sm">
                        <strong>Téléphone:</strong> {center.phone}
                      </p>
                      <p className="text-sm">
                        <strong>Email:</strong> {center.email}
                      </p>
                      <div>
                        <p className="text-sm font-medium">Spécialités:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {center.specialties?.map((specialty: string, index: number) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {specialty}
                            </Badge>
                          ))}
                        </div>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Zones de livraison:</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {center.deliveryZones?.map((zone: string, index: number) => (
                            <Badge key={index} variant="outline" className="text-xs">
                              {zone}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="invoices" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Facturation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {supplyOrders?.filter((order: any) => order.invoiceUrl).map((order: any) => (
                  <div key={order.id} className="flex justify-between items-center p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{order.orderNumber}</h4>
                      <p className="text-sm text-gray-500">
                        {order.center.name} • {formatDateTime(order.createdAt)}
                      </p>
                      <p className="font-bold">{formatCurrency(order.totalAmount)}</p>
                    </div>
                    <Button 
                      variant="outline"
                      onClick={() => downloadInvoice(order.invoiceUrl, order.orderNumber)}
                    >
                      <Download className="mr-2 h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                ))}
                
                {(!supplyOrders || supplyOrders.filter((order: any) => order.invoiceUrl).length === 0) && (
                  <div className="text-center py-8">
                    <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune facture</h3>
                    <p className="text-gray-500">
                      Les factures apparaîtront ici une fois vos commandes confirmées
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import ManagerLayout from "@/components/layout/ManagerLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDateTime, getOrderStatusLabel, getOrderStatusClassName } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Package, Truck, Clock, CheckCircle, XCircle, Eye, ShoppingBag, User } from "lucide-react";

export default function ManagerOrders() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

  // Fetch orders
  const { data: orders, isLoading: ordersLoading } = useQuery({
    queryKey: [`/api/orders?storeId=1`],
    enabled: !!user && user.role === "manager",
  });

  // Update order status mutation
  const updateOrderMutation = useMutation({
    mutationFn: async ({ orderId, status }: { orderId: number; status: string }) => {
      return apiRequest("PUT", `/api/orders/${orderId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/orders`] });
      toast({
        title: "Commande mise à jour",
        description: "Le statut de la commande a été modifié avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour la commande.",
        variant: "destructive",
      });
    },
  });

  const handleStatusUpdate = (orderId: number, newStatus: string) => {
    updateOrderMutation.mutate({ orderId, status: newStatus });
  };

  // Filter orders based on status
  const filteredOrders = orders?.filter((order: any) => {
    if (statusFilter === "all") return true;
    return order.status === statusFilter;
  }) || [];

  const getStatusIcon = (status: string) => {
    const iconClass = "h-5 w-5 text-white";
    switch (status) {
      case "pending":
        return <Clock className={iconClass} />;
      case "preparing":
        return <Package className={iconClass} />;
      case "ready":
        return <CheckCircle className={iconClass} />;
      case "delivered":
        return <Truck className={iconClass} />;
      case "cancelled":
        return <XCircle className={iconClass} />;
      default:
        return <Clock className={iconClass} />;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    const statusFlow = {
      pending: "preparing",
      preparing: "ready",
      ready: "delivered",
    };
    return statusFlow[currentStatus as keyof typeof statusFlow] || null;
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const labels = {
      pending: "Commencer préparation",
      preparing: "Marquer comme prête",
      ready: "Marquer comme livrée",
    };
    return labels[currentStatus as keyof typeof labels] || "";
  };

  if (ordersLoading) {
    return (
      <ManagerLayout>
        <div className="flex items-center justify-center min-h-[400px]">
          <LoadingSpinner size="lg" />
        </div>
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      <main className="space-y-6">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Gestion des Commandes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Suivez et gérez toutes vos commandes
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Clock className="h-5 w-5 text-orange-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {orders?.filter((o: any) => o.status === "pending").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En préparation</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {orders?.filter((o: any) => o.status === "preparing").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Prêtes</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {orders?.filter((o: any) => o.status === "ready").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-2xl border-0 shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2">
                <Truck className="h-5 w-5 text-purple-600" />
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Livrées</p>
                  <p className="text-lg font-bold text-gray-900 dark:text-white">
                    {orders?.filter((o: any) => o.status === "delivered").length || 0}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="rounded-2xl border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex gap-4">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-full sm:w-48 rounded-xl">
                  <SelectValue placeholder="Filtrer par statut" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les commandes</SelectItem>
                  <SelectItem value="pending">En attente</SelectItem>
                  <SelectItem value="preparing">En préparation</SelectItem>
                  <SelectItem value="ready">Prêtes</SelectItem>
                  <SelectItem value="delivered">Livrées</SelectItem>
                  <SelectItem value="cancelled">Annulées</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Orders List - iOS Design */}
        <div className="space-y-4">
          {filteredOrders.length === 0 ? (
            <Card className="rounded-2xl border-0 shadow-lg">
              <CardContent className="p-8 text-center">
                <ShoppingBag className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">Aucune commande trouvée</p>
              </CardContent>
            </Card>
          ) : (
            filteredOrders.map((order: any) => (
              <Card key={order.id} className="rounded-2xl border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white dark:bg-gray-800/50">
                <CardContent className="p-5">
                  {/* Header avec numéro et statut */}
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 bg-gradient-to-br from-yellow-400 to-yellow-500 rounded-xl shadow-md">
                        {getStatusIcon(order.status)}
                      </div>
                      <div>
                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">
                          #CMD-{order.id.toString().padStart(3, "0")}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          {formatDateTime(order.createdAt)}
                        </p>
                      </div>
                    </div>
                    <Badge className={`${getOrderStatusClassName(order.status)} rounded-xl px-3 py-1 font-medium`} variant="secondary">
                      {getOrderStatusLabel(order.status)}
                    </Badge>
                  </div>

                  {/* Informations client */}
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <User className="h-4 w-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">
                            {order.customer.firstName} {order.customer.lastName}
                          </p>
                          <p className="text-sm text-gray-500 dark:text-gray-400">
                            {order.type === "delivery" ? "🚚 Livraison" : "🏪 Retrait"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-gray-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Total
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="flex-1 rounded-xl border-gray-200 hover:bg-gray-50">
                          <Eye className="h-4 w-4 mr-2" />
                          Voir détails
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl">
                        <DialogHeader>
                          <DialogTitle>
                            Détails de la commande #CMD-{order.id.toString().padStart(3, "0")}
                          </DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <h4 className="font-medium mb-2">Client</h4>
                              <p>{order.customer.firstName} {order.customer.lastName}</p>
                              <p className="text-sm text-gray-600">{order.customer.email}</p>
                              <p className="text-sm text-gray-600">{order.customer.phone}</p>
                            </div>
                            <div>
                              <h4 className="font-medium mb-2">Livraison</h4>
                              <p>{order.type === "delivery" ? "Livraison à domicile" : "Retrait en magasin"}</p>
                              {order.deliveryAddress && (
                                <p className="text-sm text-gray-600">{order.deliveryAddress}</p>
                              )}
                            </div>
                          </div>
                          
                          {order.notes && (
                            <div>
                              <h4 className="font-medium mb-2">Notes</h4>
                              <p className="text-sm text-gray-600">{order.notes}</p>
                            </div>
                          )}

                          <div className="flex justify-between items-center pt-4 border-t">
                            <span className="font-medium">Total</span>
                            <span className="font-bold text-lg">{formatCurrency(order.totalAmount)}</span>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>

                    {getNextStatus(order.status) && (
                      <Button
                        onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                        disabled={updateOrderMutation.isPending}
                        className="flex-1 rounded-xl"
                      >
                        {getNextStatusLabel(order.status)}
                      </Button>
                    )}

                    {order.status !== "delivered" && order.status !== "cancelled" && (
                      <Button
                        variant="outline"
                        onClick={() => handleStatusUpdate(order.id, "cancelled")}
                        disabled={updateOrderMutation.isPending}
                        className="flex-1 sm:flex-none rounded-xl"
                      >
                        Annuler
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </ManagerLayout>
  );
}
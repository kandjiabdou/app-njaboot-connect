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
import { Package, Truck, Clock, CheckCircle, XCircle, Eye } from "lucide-react";

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
        description: "Le statut de la commande a été modifié.",
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

  const filteredOrders = orders?.filter((order: any) => 
    statusFilter === "all" || order.status === statusFilter
  ) || [];

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "pending":
        return <Clock className="h-4 w-4" />;
      case "preparing":
        return <Package className="h-4 w-4" />;
      case "ready":
        return <CheckCircle className="h-4 w-4" />;
      case "delivered":
        return <Truck className="h-4 w-4" />;
      case "cancelled":
        return <XCircle className="h-4 w-4" />;
      default:
        return <Package className="h-4 w-4" />;
    }
  };

  const getNextStatus = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return "preparing";
      case "preparing":
        return "ready";
      case "ready":
        return "delivered";
      default:
        return null;
    }
  };

  const getNextStatusLabel = (currentStatus: string) => {
    const nextStatus = getNextStatus(currentStatus);
    return nextStatus ? getOrderStatusLabel(nextStatus) : null;
  };

  if (ordersLoading) {
    return (
      <ManagerLayout>
        <LoadingSpinner size="lg" className="min-h-[400px]" />
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
        
        <main className="flex-1 p-8">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestion des Commandes
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Suivez et gérez les commandes de vos clients
            </p>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">En attente</p>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {orders?.filter((o: any) => o.status === "pending").length || 0}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
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

            <Card>
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

            <Card>
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
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex gap-4">
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className="w-48">
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

          {/* Orders List - Responsive */}
          <Card>
            <CardHeader>
              <CardTitle>Commandes ({filteredOrders.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredOrders.map((order: any) => (
                  <div
                    key={order.id}
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between p-4 sm:p-6 bg-gray-50 dark:bg-gray-800 rounded-xl"
                  >
                    {/* Info principale - Mobile d'abord */}
                    <div className="flex items-start space-x-3 mb-4 sm:mb-0 sm:flex-1">
                      <div className="p-3 bg-white dark:bg-gray-700 rounded-xl shadow-sm flex-shrink-0">
                        {getStatusIcon(order.status)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                          #CMD-{order.id.toString().padStart(3, "0")}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400 truncate">
                          {order.customer.firstName} {order.customer.lastName}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                          {formatDateTime(order.createdAt)}
                        </p>
                        <div className="flex items-center gap-2 mt-1">
                          <Badge className={getOrderStatusClassName(order.status)} variant="secondary">
                            {getOrderStatusLabel(order.status)}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {order.type === "delivery" ? "Livraison" : "Retrait"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Prix et actions */}
                    <div className="flex items-center justify-between sm:justify-end space-x-3">
                      <div className="text-left sm:text-right">
                        <p className="font-bold text-lg text-gray-900 dark:text-white">
                          {formatCurrency(order.totalAmount)}
                        </p>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="outline" size="icon" className="rounded-xl">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
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
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, getNextStatus(order.status)!)}
                            disabled={updateOrderMutation.isPending}
                            className="rounded-xl hidden sm:block"
                          >
                            {getNextStatusLabel(order.status)}
                          </Button>
                        )}

                        {order.status !== "delivered" && order.status !== "cancelled" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleStatusUpdate(order.id, "cancelled")}
                            disabled={updateOrderMutation.isPending}
                            className="rounded-xl hidden sm:block"
                          >
                            Annuler
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Actions mobiles */}
                    <div className="flex gap-2 mt-3 sm:hidden">
                      {getNextStatus(order.status) && (
                        <Button
                          size="sm"
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
                          size="sm"
                          onClick={() => handleStatusUpdate(order.id, "cancelled")}
                          disabled={updateOrderMutation.isPending}
                          className="flex-1 rounded-xl"
                        >
                          Annuler
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {filteredOrders.length === 0 && (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Aucune commande trouvée
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </main>
    </ManagerLayout>
  );
}

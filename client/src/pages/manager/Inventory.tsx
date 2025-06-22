import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import ManagerLayout from "@/components/layout/ManagerLayout";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { formatCurrency, getStockStatus, debounce } from "@/lib/utils";
import { Package, AlertTriangle, TrendingUp, TrendingDown, Search, Edit2 } from "lucide-react";

export default function ManagerInventory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState("");

  // Fetch inventory for manager's store
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: [`/api/inventory/1`], // Assuming store ID 1 for simplicity
    enabled: !!user && user.role === "manager",
  });

  // Fetch categories for filter
  const { data: categories } = useQuery({
    queryKey: [`/api/categories`],
    enabled: !!user && user.role === "manager",
  });

  // Update inventory mutation
  const updateInventoryMutation = useMutation({
    mutationFn: async ({ productId, quantity }: { productId: number; quantity: number }) => {
      return apiRequest("PUT", `/api/inventory/${productId}/1`, { quantity });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/inventory/1`] });
      toast({
        title: "Stock mis à jour",
        description: "La quantité a été modifiée avec succès.",
      });
      setEditingItem(null);
    },
    onError: (error: any) => {
      toast({
        title: "Erreur",
        description: error.message || "Impossible de mettre à jour le stock",
        variant: "destructive",
      });
    },
  });

  const handleStockUpdate = () => {
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer une quantité valide",
        variant: "destructive",
      });
      return;
    }

    updateInventoryMutation.mutate({
      productId: editingItem.product.id,
      quantity,
    });
  };

  const filteredInventory = inventory?.filter((item: any) => {
    const matchesSearch = item.product.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.product.categoryId.toString() === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const lowStockItems = inventory?.filter((item: any) => item.quantity <= item.minStock) || [];

  if (inventoryLoading) {
    return (
      <ManagerLayout>
        <LoadingSpinner size="lg" className="min-h-[400px]" />
      </ManagerLayout>
    );
  }

  return (
    <ManagerLayout>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Gestion de l'Inventaire
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos stocks et surveillez les niveaux d'inventaire
        </p>
      </div>

      {/* Stock Alerts */}
      {lowStockItems.length > 0 && (
        <Card className="mb-6 border-orange-200 dark:border-orange-800 bg-orange-50 dark:bg-orange-950">
          <CardHeader>
            <CardTitle className="flex items-center text-orange-700 dark:text-orange-300">
              <AlertTriangle className="h-5 w-5 mr-2" />
              Alertes de Stock Faible
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid gap-2">
              {lowStockItems.map((item: any) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-white dark:bg-gray-800 rounded-lg">
                  <div>
                    <span className="font-medium">{item.product.name}</span>
                    <span className="text-sm text-gray-600 dark:text-gray-400 ml-2">
                      Stock: {item.quantity} / Minimum: {item.minStock}
                    </span>
                  </div>
                  <Badge variant="destructive">Stock faible</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Filters */}
      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
            <div className="flex flex-1 gap-4 w-full lg:w-auto">
              {/* Search */}
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Rechercher des produits..."
                  onChange={(e) => debounce(() => setSearchTerm(e.target.value), 300)()}
                  className="pl-10"
                />
              </div>
              
              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-48">
                  <SelectValue placeholder="Toutes les catégories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les catégories</SelectItem>
                  {categories?.map((category: any) => (
                    <SelectItem key={category.id} value={category.id.toString()}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Inventory Table */}
      <Card>
        <CardHeader>
          <CardTitle>Inventaire des Produits</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4">Produit</th>
                  <th className="text-left p-4">Catégorie</th>
                  <th className="text-left p-4">Prix</th>
                  <th className="text-left p-4">Stock</th>
                  <th className="text-left p-4">Statut</th>
                  <th className="text-left p-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredInventory?.map((item: any) => {
                  const stockStatus = getStockStatus(item.quantity, item.minStock);
                  return (
                    <tr key={item.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="p-4">
                        <div className="flex items-center space-x-3">
                          <div className="h-10 w-10 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center">
                            <Package className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                          </div>
                          <div>
                            <div className="font-medium">{item.product.name}</div>
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {item.product.unit}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge variant="outline">
                          {categories?.find((c: any) => c.id === item.product.categoryId)?.name || "N/A"}
                        </Badge>
                      </td>
                      <td className="p-4 font-medium">
                        {formatCurrency(item.product.price)}
                      </td>
                      <td className="p-4">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">{item.quantity}</span>
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            (min: {item.minStock})
                          </span>
                        </div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={stockStatus.variant as any}
                          className={stockStatus.className}
                        >
                          {stockStatus.icon}
                          {stockStatus.label}
                        </Badge>
                      </td>
                      <td className="p-4">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setEditingItem(item);
                                setNewQuantity(item.quantity.toString());
                              }}
                            >
                              <Edit2 className="h-4 w-4 mr-2" />
                              Modifier
                            </Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Modifier le Stock</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div>
                                <label className="text-sm font-medium">Produit</label>
                                <p className="text-lg">{editingItem?.product.name}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Stock actuel</label>
                                <p className="text-lg font-bold">{editingItem?.quantity}</p>
                              </div>
                              <div>
                                <label className="text-sm font-medium">Nouvelle quantité</label>
                                <Input
                                  type="number"
                                  value={newQuantity}
                                  onChange={(e) => setNewQuantity(e.target.value)}
                                  placeholder="Entrez la nouvelle quantité"
                                />
                              </div>
                              <div className="flex justify-end space-x-2">
                                <Button
                                  variant="outline"
                                  onClick={() => setEditingItem(null)}
                                >
                                  Annuler
                                </Button>
                                <Button
                                  onClick={handleStockUpdate}
                                  disabled={updateInventoryMutation.isPending}
                                >
                                  {updateInventoryMutation.isPending ? "Mise à jour..." : "Mettre à jour"}
                                </Button>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {filteredInventory?.length === 0 && (
            <div className="text-center py-12">
              <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-400">
                Aucun produit trouvé
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </ManagerLayout>
  );
}
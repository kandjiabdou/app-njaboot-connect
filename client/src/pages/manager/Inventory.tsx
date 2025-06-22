import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import Navbar from "@/components/layout/Navbar";
import Sidebar from "@/components/layout/Sidebar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, getStockStatus, debounce } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { Search, Plus, Edit, AlertTriangle, Package } from "lucide-react";

export default function ManagerInventory() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [editingItem, setEditingItem] = useState<any>(null);
  const [newQuantity, setNewQuantity] = useState("");

  // Fetch inventory data
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: [`/api/inventory/1`], // Store ID 1 for demo
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
      setNewQuantity("");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le stock.",
        variant: "destructive",
      });
    },
  });

  const handleUpdateStock = () => {
    if (!editingItem || !newQuantity) return;
    
    const quantity = parseInt(newQuantity);
    if (isNaN(quantity) || quantity < 0) {
      toast({
        title: "Quantité invalide",
        description: "Veuillez entrer une quantité valide.",
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
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              Gestion des Stocks
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez l'inventaire de votre boutique
            </p>
          </div>

          {/* Alerts */}
          {lowStockItems.length > 0 && (
            <Card className="mb-6 border-red-200 bg-red-50 dark:bg-red-900/20">
              <CardContent className="p-4">
                <div className="flex items-center space-x-2">
                  <AlertTriangle className="h-5 w-5 text-red-600" />
                  <span className="font-medium text-red-900 dark:text-red-100">
                    {lowStockItems.length} produit(s) en stock critique
                  </span>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Filters and Search */}
          <Card className="mb-6">
            <CardContent className="p-6">
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="flex flex-1 gap-4">
                  <div className="relative flex-1 max-w-md">
                    <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
                    <Input
                      placeholder="Rechercher un produit..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
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

                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Ajouter Produit
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Inventory Table */}
          <Card>
            <CardHeader>
              <CardTitle>Inventaire</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Produit
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Catégorie
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Stock
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Prix
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Statut
                      </th>
                      <th className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                    {filteredInventory?.map((item: any) => {
                      const stockStatus = getStockStatus(item.quantity, item.minStock);
                      return (
                        <tr key={item.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="py-4 px-4">
                            <div className="flex items-center space-x-3">
                              <img
                                src={`${item.product.imageUrl}&auto=format&fit=crop&w=60&h=60`}
                                alt={item.product.name}
                                className="h-12 w-12 rounded-lg object-cover"
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-white">
                                  {item.product.name}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {item.product.unit}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4 text-gray-600 dark:text-gray-400">
                            {categories?.find((c: any) => c.id === item.product.categoryId)?.name}
                          </td>
                          <td className="py-4 px-4">
                            <span className={`font-medium ${stockStatus.className}`}>
                              {item.quantity}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-medium text-gray-900 dark:text-white">
                            {formatCurrency(item.product.price)}
                          </td>
                          <td className="py-4 px-4">
                            <Badge
                              variant={stockStatus.status === "out" ? "destructive" : 
                                     stockStatus.status === "low" ? "secondary" : "default"}
                            >
                              {stockStatus.label}
                            </Badge>
                          </td>
                          <td className="py-4 px-4">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => {
                                    setEditingItem(item);
                                    setNewQuantity(item.quantity.toString());
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Modifier le Stock</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <Label>Produit</Label>
                                    <p className="font-medium">{editingItem?.product.name}</p>
                                  </div>
                                  <div>
                                    <Label htmlFor="quantity">Nouvelle Quantité</Label>
                                    <Input
                                      id="quantity"
                                      type="number"
                                      min="0"
                                      value={newQuantity}
                                      onChange={(e) => setNewQuantity(e.target.value)}
                                      className="mt-1"
                                    />
                                  </div>
                                  <div className="flex justify-end space-x-2">
                                    <Button variant="outline" onClick={() => setEditingItem(null)}>
                                      Annuler
                                    </Button>
                                    <Button
                                      onClick={handleUpdateStock}
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
        </main>
      </div>
    </div>
  );
}

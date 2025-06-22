import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";

import CartItem from "@/components/customer/CartItem";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useCart } from "@/hooks/use-cart";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import { ShoppingCart, Truck, Store, CreditCard, Smartphone, Banknote } from "lucide-react";

export default function CustomerCart() {
  const { user } = useAuth();
  const { items, totalAmount, clearCart } = useCart();
  const { toast } = useToast();
  const [, setLocation] = useLocation();
  const [deliveryType, setDeliveryType] = useState<"pickup" | "delivery">("pickup");
  const [paymentMethod, setPaymentMethod] = useState("cash");
  const [notes, setNotes] = useState("");

  const deliveryFee = deliveryType === "delivery" ? 1500 : 0;
  const finalTotal = totalAmount + deliveryFee;

  // Create order mutation
  const createOrderMutation = useMutation({
    mutationFn: async (orderData: any) => {
      return apiRequest("POST", "/api/orders", orderData);
    },
    onSuccess: () => {
      clearCart();
      toast({
        title: "Commande passée",
        description: "Votre commande a été enregistrée avec succès.",
      });
      setLocation("/profile");
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de passer la commande.",
        variant: "destructive",
      });
    },
  });

  const handleCheckout = () => {
    if (!user) {
      setLocation("/login");
      return;
    }

    if (items.length === 0) {
      toast({
        title: "Panier vide",
        description: "Ajoutez des produits à votre panier avant de commander.",
        variant: "destructive",
      });
      return;
    }

    const orderData = {
      customerId: user.id,
      storeId: 1, // Default store
      status: "pending",
      type: deliveryType,
      totalAmount: finalTotal.toString(),
      deliveryAddress: deliveryType === "delivery" ? user.address : null,
      notes,
      items: items.map(item => ({
        productId: item.product.id,
        quantity: item.quantity,
        unitPrice: item.product.price,
      })),
    };

    createOrderMutation.mutate(orderData);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <Card>
            <CardContent className="p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Connexion requise</h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Veuillez vous connecter pour voir votre panier
              </p>
              <Button onClick={() => setLocation("/login")}>
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Mon Panier
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {items.length} article(s) dans votre panier
          </p>
        </div>

        {items.length === 0 ? (
          <Card>
            <CardContent className="p-12 text-center">
              <ShoppingCart className="h-16 w-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
                Votre panier est vide
              </h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                Commencez vos achats en parcourant nos produits
              </p>
              <Button onClick={() => setLocation("/products")}>
                Découvrir nos produits
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Cart Items */}
            <div className="lg:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Articles dans votre panier</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {items.map((item) => (
                      <CartItem
                        key={item.product.id}
                        product={item.product}
                        quantity={item.quantity}
                      />
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Order Summary */}
            <div>
              <Card className="sticky top-6">
                <CardHeader>
                  <CardTitle>Récapitulatif</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {/* Delivery Options */}
                  <div>
                    <Label className="text-base font-medium">Mode de récupération</Label>
                    <RadioGroup value={deliveryType} onValueChange={setDeliveryType} className="mt-2">
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="pickup" id="pickup" />
                        <Label htmlFor="pickup" className="flex items-center space-x-2 cursor-pointer">
                          <Store className="h-4 w-4" />
                          <span>Retrait en magasin (Gratuit)</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="delivery" id="delivery" />
                        <Label htmlFor="delivery" className="flex items-center space-x-2 cursor-pointer">
                          <Truck className="h-4 w-4" />
                          <span>Livraison à domicile (+{formatCurrency(1500)})</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Payment Methods */}
                  <div>
                    <Label className="text-base font-medium">Mode de paiement</Label>
                    <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="mt-2">
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="cash" id="cash" />
                        <Label htmlFor="cash" className="flex items-center space-x-2 cursor-pointer">
                          <Banknote className="h-4 w-4" />
                          <span>Espèces</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="card" id="card" />
                        <Label htmlFor="card" className="flex items-center space-x-2 cursor-pointer">
                          <CreditCard className="h-4 w-4" />
                          <span>Carte bancaire</span>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 border rounded-lg">
                        <RadioGroupItem value="mobile" id="mobile" />
                        <Label htmlFor="mobile" className="flex items-center space-x-2 cursor-pointer">
                          <Smartphone className="h-4 w-4" />
                          <span>Mobile Money</span>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Notes */}
                  <div>
                    <Label htmlFor="notes" className="text-base font-medium">
                      Notes (optionnel)
                    </Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Instructions spéciales pour votre commande..."
                      className="mt-2"
                    />
                  </div>

                  {/* Order Total */}
                  <div className="space-y-2 pt-4 border-t">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600 dark:text-gray-400">Sous-total</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(totalAmount)}
                      </span>
                    </div>
                    {deliveryFee > 0 && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600 dark:text-gray-400">Livraison</span>
                        <span className="text-gray-900 dark:text-white">
                          {formatCurrency(deliveryFee)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-lg font-semibold border-t pt-2">
                      <span className="text-gray-900 dark:text-white">Total</span>
                      <span className="text-gray-900 dark:text-white">
                        {formatCurrency(finalTotal)}
                      </span>
                    </div>
                  </div>

                  {/* Checkout Button */}
                  <Button
                    className="w-full"
                    size="lg"
                    onClick={handleCheckout}
                    disabled={createOrderMutation.isPending}
                  >
                    {createOrderMutation.isPending ? "Commande en cours..." : "Passer la commande"}
                  </Button>

                  {/* Continue Shopping */}
                  <Button
                    variant="outline"
                    className="w-full"
                    onClick={() => setLocation("/products")}
                  >
                    Continuer mes achats
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

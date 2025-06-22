import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ManagerLayout from "@/components/layout/ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { 
  Store, User, Bell, Shield, Palette, 
  Database, Wifi, Printer, CreditCard,
  Mail, Phone, MapPin, Clock, Save
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function ManagerSettings() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [activeTab, setActiveTab] = useState("store");
  const [storeSettings, setStoreSettings] = useState({
    name: "",
    address: "",
    phone: "",
    email: "",
    description: "",
    openingHours: {
      monday: { open: "08:00", close: "20:00", closed: false },
      tuesday: { open: "08:00", close: "20:00", closed: false },
      wednesday: { open: "08:00", close: "20:00", closed: false },
      thursday: { open: "08:00", close: "20:00", closed: false },
      friday: { open: "08:00", close: "20:00", closed: false },
      saturday: { open: "09:00", close: "18:00", closed: false },
      sunday: { open: "10:00", close: "16:00", closed: false },
    }
  });

  const [notificationSettings, setNotificationSettings] = useState({
    newOrders: true,
    lowStock: true,
    customerMessages: true,
    dailyReports: true,
    promotions: false,
    systemUpdates: true,
    emailNotifications: true,
    smsNotifications: false,
    pushNotifications: true,
  });

  const [paymentSettings, setPaymentSettings] = useState({
    acceptCash: true,
    acceptCard: true,
    acceptMobileMoney: true,
    minimumOrderAmount: "1000",
    deliveryFee: "500",
    freeDeliveryThreshold: "10000",
  });

  // Fetch store data
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: [`/api/stores/${user?.id}`],
    enabled: !!user && user.role === "manager",
    onSuccess: (data) => {
      if (data) {
        setStoreSettings(prev => ({
          ...prev,
          name: data.name || "",
          address: data.address || "",
          phone: data.phone || "",
        }));
      }
    }
  });

  // Update store mutation
  const updateStoreMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/stores/${store?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/stores/${user?.id}`] });
      toast({
        title: "Paramètres mis à jour",
        description: "Les paramètres du magasin ont été sauvegardés avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de sauvegarder les paramètres.",
        variant: "destructive",
      });
    }
  });

  const handleSaveStore = () => {
    updateStoreMutation.mutate(storeSettings);
  };

  const handleSaveNotifications = () => {
    // Mock save notifications
    toast({
      title: "Notifications mises à jour",
      description: "Vos préférences de notification ont été sauvegardées.",
    });
  };

  const handleSavePayments = () => {
    // Mock save payment settings
    toast({
      title: "Paiements mis à jour",
      description: "Les paramètres de paiement ont été sauvegardés.",
    });
  };

  if (storeLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <ManagerLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Paramètres
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Configurez votre magasin et vos préférences
          </p>
        </div>
      </div>

      {/* Settings Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="store" className="flex items-center gap-2">
            <Store className="h-4 w-4" />
            <span className="hidden sm:inline">Magasin</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="payments" className="flex items-center gap-2">
            <CreditCard className="h-4 w-4" />
            <span className="hidden sm:inline">Paiements</span>
          </TabsTrigger>
          <TabsTrigger value="system" className="flex items-center gap-2">
            <Database className="h-4 w-4" />
            <span className="hidden sm:inline">Système</span>
          </TabsTrigger>
        </TabsList>

        {/* Store Settings */}
        <TabsContent value="store" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations du Magasin</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="storeName">Nom du magasin</Label>
                  <Input
                    id="storeName"
                    value={storeSettings.name}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Nom de votre magasin"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeAddress">Adresse</Label>
                  <Textarea
                    id="storeAddress"
                    value={storeSettings.address}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, address: e.target.value }))}
                    placeholder="Adresse complète du magasin"
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="storePhone">Téléphone</Label>
                    <Input
                      id="storePhone"
                      value={storeSettings.phone}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="+221 XX XXX XXXX"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="storeEmail">Email</Label>
                    <Input
                      id="storeEmail"
                      type="email"
                      value={storeSettings.email}
                      onChange={(e) => setStoreSettings(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="contact@magasin.com"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="storeDescription">Description</Label>
                  <Textarea
                    id="storeDescription"
                    value={storeSettings.description}
                    onChange={(e) => setStoreSettings(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Description de votre magasin"
                    rows={3}
                  />
                </div>

                <Button onClick={handleSaveStore} disabled={updateStoreMutation.isPending}>
                  <Save className="h-4 w-4 mr-2" />
                  {updateStoreMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Horaires d'Ouverture</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {Object.entries(storeSettings.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex flex-col md:flex-row md:items-center gap-2 md:gap-4">
                    <div className="w-20">
                      <Label className="capitalize text-sm font-medium">
                        {day === "monday" ? "Lun" :
                         day === "tuesday" ? "Mar" :
                         day === "wednesday" ? "Mer" :
                         day === "thursday" ? "Jeu" :
                         day === "friday" ? "Ven" :
                         day === "saturday" ? "Sam" : "Dim"}
                      </Label>
                    </div>
                    
                    <div className="flex items-center gap-2 flex-1">
                      <Switch
                        checked={!hours.closed}
                        onCheckedChange={(checked) =>
                          setStoreSettings(prev => ({
                            ...prev,
                            openingHours: {
                              ...prev.openingHours,
                              [day]: { ...hours, closed: !checked }
                            }
                          }))
                        }
                      />
                      
                      {!hours.closed && (
                        <>
                          <Input
                            type="time"
                            value={hours.open}
                            onChange={(e) =>
                              setStoreSettings(prev => ({
                                ...prev,
                                openingHours: {
                                  ...prev.openingHours,
                                  [day]: { ...hours, open: e.target.value }
                                }
                              }))
                            }
                            className="w-32"
                          />
                          <span className="text-gray-500">-</span>
                          <Input
                            type="time"
                            value={hours.close}
                            onChange={(e) =>
                              setStoreSettings(prev => ({
                                ...prev,
                                openingHours: {
                                  ...prev.openingHours,
                                  [day]: { ...hours, close: e.target.value }
                                }
                              }))
                            }
                            className="w-32"
                          />
                        </>
                      )}
                      
                      {hours.closed && (
                        <span className="text-gray-500 text-sm">Fermé</span>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Alertes Métier</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "newOrders", label: "Nouvelles commandes", description: "Recevoir une notification pour chaque nouvelle commande" },
                  { key: "lowStock", label: "Stock faible", description: "Alerte quand un produit atteint le seuil minimum" },
                  { key: "customerMessages", label: "Messages clients", description: "Notifications des messages et demandes clients" },
                  { key: "dailyReports", label: "Rapports quotidiens", description: "Résumé quotidien des ventes et activités" },
                ].map((setting) => (
                  <div key={setting.key} className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{setting.label}</Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{setting.description}</p>
                    </div>
                    <Switch
                      checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, [setting.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Canaux de Notification</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "emailNotifications", label: "Notifications par email", icon: Mail },
                  { key: "smsNotifications", label: "Notifications par SMS", icon: Phone },
                  { key: "pushNotifications", label: "Notifications push", icon: Bell },
                ].map((channel) => (
                  <div key={channel.key} className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-3">
                      <channel.icon className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <Label className="text-sm font-medium">{channel.label}</Label>
                    </div>
                    <Switch
                      checked={notificationSettings[channel.key as keyof typeof notificationSettings] as boolean}
                      onCheckedChange={(checked) =>
                        setNotificationSettings(prev => ({ ...prev, [channel.key]: checked }))
                      }
                    />
                  </div>
                ))}

                <Separator />

                <div className="space-y-4">
                  <h4 className="text-sm font-medium">Autres Notifications</h4>
                  {[
                    { key: "promotions", label: "Promotions et nouveautés", description: "Recevoir les infos sur les nouvelles fonctionnalités" },
                    { key: "systemUpdates", label: "Mises à jour système", description: "Notifications des maintenances et mises à jour" },
                  ].map((setting) => (
                    <div key={setting.key} className="flex items-center justify-between space-x-2">
                      <div className="flex-1">
                        <Label className="text-sm font-medium">{setting.label}</Label>
                        <p className="text-xs text-gray-600 dark:text-gray-400">{setting.description}</p>
                      </div>
                      <Switch
                        checked={notificationSettings[setting.key as keyof typeof notificationSettings] as boolean}
                        onCheckedChange={(checked) =>
                          setNotificationSettings(prev => ({ ...prev, [setting.key]: checked }))
                        }
                      />
                    </div>
                  ))}
                </div>

                <Button onClick={handleSaveNotifications} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les Notifications
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Payment Settings */}
        <TabsContent value="payments" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Méthodes de Paiement</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {[
                  { key: "acceptCash", label: "Espèces", description: "Accepter les paiements en liquide" },
                  { key: "acceptCard", label: "Carte bancaire", description: "Accepter les paiements par carte" },
                  { key: "acceptMobileMoney", label: "Mobile Money", description: "Orange Money, Wave, Free Money" },
                ].map((method) => (
                  <div key={method.key} className="flex items-center justify-between space-x-2">
                    <div className="flex-1">
                      <Label className="text-sm font-medium">{method.label}</Label>
                      <p className="text-xs text-gray-600 dark:text-gray-400">{method.description}</p>
                    </div>
                    <Switch
                      checked={paymentSettings[method.key as keyof typeof paymentSettings] as boolean}
                      onCheckedChange={(checked) =>
                        setPaymentSettings(prev => ({ ...prev, [method.key]: checked }))
                      }
                    />
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Paramètres de Livraison</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="minimumOrder">Montant minimum de commande (FCFA)</Label>
                  <Input
                    id="minimumOrder"
                    type="number"
                    value={paymentSettings.minimumOrderAmount}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, minimumOrderAmount: e.target.value }))}
                    placeholder="1000"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="deliveryFee">Frais de livraison (FCFA)</Label>
                  <Input
                    id="deliveryFee"
                    type="number"
                    value={paymentSettings.deliveryFee}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, deliveryFee: e.target.value }))}
                    placeholder="500"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="freeDelivery">Livraison gratuite à partir de (FCFA)</Label>
                  <Input
                    id="freeDelivery"
                    type="number"
                    value={paymentSettings.freeDeliveryThreshold}
                    onChange={(e) => setPaymentSettings(prev => ({ ...prev, freeDeliveryThreshold: e.target.value }))}
                    placeholder="10000"
                  />
                </div>

                <Button onClick={handleSavePayments} className="w-full">
                  <Save className="h-4 w-4 mr-2" />
                  Sauvegarder les Paiements
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Système</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Version</Label>
                    <p className="font-medium">v2.1.0</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Statut</Label>
                    <Badge variant="default" className="bg-green-100 text-green-800">
                      <Wifi className="h-3 w-3 mr-1" />
                      En ligne
                    </Badge>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Dernière sauvegarde</Label>
                    <p className="font-medium">Il y a 2 heures</p>
                  </div>
                  <div>
                    <Label className="text-sm text-gray-600 dark:text-gray-400">Stockage utilisé</Label>
                    <p className="font-medium">2.3 GB / 10 GB</p>
                  </div>
                </div>

                <Separator />

                <div className="space-y-3">
                  <h4 className="text-sm font-medium">Actions Système</h4>
                  <div className="grid grid-cols-1 gap-2">
                    <Button variant="outline" className="justify-start">
                      <Database className="h-4 w-4 mr-2" />
                      Sauvegarder les données
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Printer className="h-4 w-4 mr-2" />
                      Tester l'imprimante
                    </Button>
                    <Button variant="outline" className="justify-start">
                      <Shield className="h-4 w-4 mr-2" />
                      Vérifier la sécurité
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Support & Assistance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <h4 className="font-medium text-blue-900 dark:text-blue-100">
                      Centre d'aide
                    </h4>
                    <p className="text-sm text-blue-700 dark:text-blue-300">
                      Consultez notre documentation complète
                    </p>
                  </div>

                  <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                    <h4 className="font-medium text-green-900 dark:text-green-100">
                      Support technique
                    </h4>
                    <p className="text-sm text-green-700 dark:text-green-300">
                      Contactez notre équipe technique
                    </p>
                    <p className="text-sm text-green-700 dark:text-green-300 mt-1">
                      📞 +221 33 XXX XXXX
                    </p>
                  </div>

                  <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                    <h4 className="font-medium text-yellow-900 dark:text-yellow-100">
                      Formation
                    </h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-300">
                      Planifiez une session de formation
                    </p>
                  </div>
                </div>

                <Separator />

                <div className="text-center text-sm text-gray-600 dark:text-gray-400">
                  <p>Njaboot Connect v2.1.0</p>
                  <p>© 2024 Tous droits réservés</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ManagerLayout>
  );
}
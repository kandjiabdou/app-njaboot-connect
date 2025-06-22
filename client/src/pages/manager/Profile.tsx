import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ManagerLayout from "@/components/layout/ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { 
  User, Store, Building2, Phone, Mail, MapPin, 
  Calendar, Shield, Key, Bell, Briefcase,
  TrendingUp, Users, ShoppingBag, Save
} from "lucide-react";
import { formatCurrency, formatDate } from "@/lib/utils";
import { useAuth } from "@/hooks/use-auth";
import { apiRequest } from "@/lib/queryClient";

export default function ManagerProfile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [isEditing, setIsEditing] = useState(false);
  const [profileData, setProfileData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    phone: user?.phone || "",
    address: user?.address || "",
  });

  // Fetch store data
  const { data: store } = useQuery({
    queryKey: [`/api/stores/${user?.id}`],
    enabled: !!user && user.role === "manager",
  });

  // Fetch analytics for manager stats
  const { data: analytics } = useQuery({
    queryKey: [`/api/analytics/dashboard/${store?.id}`],
    enabled: !!store,
  });

  // Fetch orders for activity tracking
  const { data: orders } = useQuery({
    queryKey: [`/api/orders?storeId=${store?.id}`],
    enabled: !!store,
  });

  // Update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest("PUT", `/api/users/${user?.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${user?.id}`] });
      setIsEditing(false);
      toast({
        title: "Profil mis à jour",
        description: "Vos informations ont été sauvegardées avec succès.",
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
        variant: "destructive",
      });
    }
  });

  const handleSaveProfile = () => {
    updateProfileMutation.mutate(profileData);
  };

  if (!user) {
    return (
      <ManagerLayout>
        <LoadingSpinner size="lg" className="min-h-[400px]" />
      </ManagerLayout>
    );
  }

  // Manager-specific stats
  const managerStats = {
    totalRevenue: analytics?.todayRevenue || 0,
    totalOrders: orders?.length || 0,
    activeProducts: analytics?.lowStockCount || 0,
    storeRating: 4.7,
    managementSince: user.createdAt,
  };

  return (
    <ManagerLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <Avatar className="h-16 w-16">
            <AvatarFallback className="text-lg font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              {user.firstName} {user.lastName}
            </h1>
            <div className="flex items-center space-x-2">
              <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                <Briefcase className="h-3 w-3 mr-1" />
                Gérant de Magasin
              </Badge>
              {store && (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  <Store className="h-3 w-3 mr-1" />
                  {store.name}
                </Badge>
              )}
            </div>
          </div>
        </div>
        
        <Button 
          onClick={() => isEditing ? handleSaveProfile() : setIsEditing(true)}
          disabled={updateProfileMutation.isPending}
        >
          {isEditing ? (
            <>
              <Save className="h-4 w-4 mr-2" />
              {updateProfileMutation.isPending ? "Sauvegarde..." : "Sauvegarder"}
            </>
          ) : (
            <>
              <User className="h-4 w-4 mr-2" />
              Modifier le profil
            </>
          )}
        </Button>
      </div>

      {/* Manager Performance Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  CA Total
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(managerStats.totalRevenue)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-green-600">Performance mensuelle</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Commandes Gérées
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {managerStats.totalOrders}
                </p>
              </div>
              <ShoppingBag className="h-8 w-8 text-blue-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Ce mois-ci</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Note du Magasin
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {managerStats.storeRating}/5
                </p>
              </div>
              <Building2 className="h-8 w-8 text-yellow-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-yellow-600">Excellent service</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Expérience
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Math.floor((Date.now() - new Date(managerStats.managementSince).getTime()) / (1000 * 60 * 60 * 24 * 30))} mois
                </p>
              </div>
              <Calendar className="h-8 w-8 text-purple-600" />
            </div>
            <div className="mt-4 flex items-center text-sm">
              <span className="text-gray-600 dark:text-gray-400">Depuis {formatDate(managerStats.managementSince)}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="personal" className="space-y-6">
        <TabsList className="grid w-full grid-cols-2 md:grid-cols-4">
          <TabsTrigger value="personal">Personnel</TabsTrigger>
          <TabsTrigger value="store">Mon Magasin</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        {/* Personal Information */}
        <TabsContent value="personal">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={profileData.firstName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, firstName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={profileData.lastName}
                      onChange={(e) => setProfileData(prev => ({ ...prev, lastName: e.target.value }))}
                      disabled={!isEditing}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData(prev => ({ ...prev, phone: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="+221 XX XXX XXXX"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="address">Adresse</Label>
                  <Textarea
                    id="address"
                    value={profileData.address}
                    onChange={(e) => setProfileData(prev => ({ ...prev, address: e.target.value }))}
                    disabled={!isEditing}
                    placeholder="Votre adresse complète"
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Informations Professionnelles</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center space-x-3">
                    <Briefcase className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Poste</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">Gérant de Magasin</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Building2 className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Magasin</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {store?.name || "Non assigné"}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Date de début</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Statut</p>
                      <Badge variant="default" className="mt-1">
                        Actif
                      </Badge>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Users className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">Équipe</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">3 employés</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Store Information */}
        <TabsContent value="store">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {store && (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Détails du Magasin</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-3">
                        <Store className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Nom</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{store.name}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <MapPin className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Adresse</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">{store.address}</p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Phone className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                        <div>
                          <p className="font-medium text-gray-900 dark:text-white">Téléphone</p>
                          <p className="text-sm text-gray-600 dark:text-gray-400">
                            {store.phone || "Non renseigné"}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <Badge 
                          variant={store.isActive ? "default" : "destructive"}
                          className="mt-2"
                        >
                          {store.isActive ? "Actif" : "Inactif"}
                        </Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Statistiques du Magasin</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">{managerStats.totalOrders}</p>
                        <p className="text-sm text-blue-700 dark:text-blue-300">Commandes</p>
                      </div>
                      <div className="text-center p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">{formatCurrency(managerStats.totalRevenue)}</p>
                        <p className="text-sm text-green-700 dark:text-green-300">Chiffre d'affaires</p>
                      </div>
                      <div className="text-center p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">{managerStats.storeRating}</p>
                        <p className="text-sm text-yellow-700 dark:text-yellow-300">Note moyenne</p>
                      </div>
                      <div className="text-center p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">24/7</p>
                        <p className="text-sm text-purple-700 dark:text-purple-300">Disponibilité</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </>
            )}
          </div>
        </TabsContent>

        {/* Performance */}
        <TabsContent value="performance">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Objectifs Mensuels</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Chiffre d'Affaires</span>
                    <span className="text-sm">85%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-green-600 h-2 rounded-full" style={{ width: "85%" }}></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {formatCurrency(managerStats.totalRevenue)} / {formatCurrency(1000000)}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Commandes</span>
                    <span className="text-sm">92%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-blue-600 h-2 rounded-full" style={{ width: "92%" }}></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {managerStats.totalOrders} / 200 commandes
                  </p>
                </div>

                <div>
                  <div className="flex justify-between mb-2">
                    <span className="text-sm font-medium">Satisfaction Client</span>
                    <span className="text-sm">94%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div className="bg-yellow-600 h-2 rounded-full" style={{ width: "94%" }}></div>
                  </div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                    {managerStats.storeRating}/5.0 étoiles
                  </p>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Reconnaissance</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">🏆</span>
                    </div>
                    <div>
                      <p className="font-medium text-yellow-900 dark:text-yellow-100">
                        Manager du Mois
                      </p>
                      <p className="text-xs text-yellow-700 dark:text-yellow-300">
                        Performance exceptionnelle
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">⭐</span>
                    </div>
                    <div>
                      <p className="font-medium text-blue-900 dark:text-blue-100">
                        Excellence Service
                      </p>
                      <p className="text-xs text-blue-700 dark:text-blue-300">
                        Note client supérieure à 4.5
                      </p>
                    </div>
                  </div>
                </div>

                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-xs font-bold">📈</span>
                    </div>
                    <div>
                      <p className="font-medium text-green-900 dark:text-green-100">
                        Croissance Continue
                      </p>
                      <p className="text-xs text-green-700 dark:text-green-300">
                        3 mois de croissance consécutive
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Security */}
        <TabsContent value="security">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Sécurité du Compte</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Key className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Mot de passe</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Dernière modification il y a 2 mois
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Modifier
                  </Button>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Bell className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Notifications</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Alertes de sécurité activées
                      </p>
                    </div>
                  </div>
                  <Badge variant="default">Actif</Badge>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <Shield className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                    <div>
                      <p className="font-medium">Authentification à deux facteurs</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Sécurité renforcée recommandée
                      </p>
                    </div>
                  </div>
                  <Button variant="outline" size="sm">
                    Configurer
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Activité Récente</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-900 dark:text-white">Connexion réussie</span>
                    <span className="text-gray-500 ml-auto">Il y a 2h</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span className="text-gray-900 dark:text-white">Profil mis à jour</span>
                    <span className="text-gray-500 ml-auto">Hier</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <span className="text-gray-900 dark:text-white">Paramètres modifiés</span>
                    <span className="text-gray-500 ml-auto">Il y a 3 jours</span>
                  </div>
                  <div className="flex items-center space-x-3 text-sm">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-gray-900 dark:text-white">Connexion réussie</span>
                    <span className="text-gray-500 ml-auto">Il y a 5 jours</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </ManagerLayout>
  );
}
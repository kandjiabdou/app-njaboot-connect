import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import ManagerLayout from "@/components/layout/ManagerLayout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Users, Search, Star, Crown, ShoppingBag, Phone, 
  Mail, MapPin, TrendingUp, Calendar, Plus, UserPlus
} from "lucide-react";

// Fonction utilitaire pour formater la devise
const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'XOF'
  }).format(amount);
};

// Fonction utilitaire pour formater la date
const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('fr-FR');
};

// Fonction pour déterminer le niveau de fidélité
const getLoyaltyLevel = (points: number) => {
  if (points >= 1000) return "Platine";
  if (points >= 500) return "Or";
  if (points >= 200) return "Argent";
  return "Bronze";
};

export default function ManagerCustomers() {
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    dateOfBirth: ""
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Données des clients avec toutes les propriétés nécessaires
  const fakeCustomers = [
    {
      id: 101,
      firstName: "Aminata",
      lastName: "Diallo",
      email: "aminata.diallo@gmail.com",
      phone: "+221 77 123 4567",
      address: "Plateau, Dakar",
      dateOfBirth: "1985-03-15",
      createdAt: "2024-12-01T10:00:00Z",
      totalSpent: 450000,
      totalOrders: 25,
      lastOrder: "2024-12-30",
      loyaltyPoints: 1250
    },
    {
      id: 102,
      firstName: "Ousmane",
      lastName: "Sow",
      email: "ousmane.sow@hotmail.com",
      phone: "+221 78 234 5678",
      address: "Almadies, Dakar",
      dateOfBirth: "1990-07-22",
      createdAt: "2024-11-15T14:30:00Z",
      totalSpent: 320000,
      totalOrders: 18,
      lastOrder: "2024-12-28",
      loyaltyPoints: 890
    },
    {
      id: 103,
      firstName: "Fatou",
      lastName: "Ba",
      email: "fatou.ba@yahoo.fr",
      phone: "+221 76 345 6789",
      address: "Mermoz, Dakar",
      dateOfBirth: "1987-11-08",
      createdAt: "2024-10-20T09:15:00Z",
      totalSpent: 280000,
      totalOrders: 15,
      lastOrder: "2024-12-25",
      loyaltyPoints: 750
    },
    {
      id: 104,
      firstName: "Mamadou",
      lastName: "Fall",
      email: "mamadou.fall@gmail.com",
      phone: "+221 77 456 7890",
      address: "Parcelles Assainies, Dakar",
      dateOfBirth: "1992-05-18",
      createdAt: "2024-09-10T16:45:00Z",
      totalSpent: 520000,
      totalOrders: 32,
      lastOrder: "2024-12-29",
      loyaltyPoints: 1680
    },
    {
      id: 105,
      firstName: "Aissatou",
      lastName: "Ndiaye",
      email: "aissatou.ndiaye@orange.sn",
      phone: "+221 76 567 8901",
      address: "Grand Yoff, Dakar",
      dateOfBirth: "1988-12-03",
      createdAt: "2024-08-22T11:20:00Z",
      totalSpent: 190000,
      totalOrders: 12,
      lastOrder: "2024-12-26",
      loyaltyPoints: 580
    },
    {
      id: 106,
      firstName: "Cheikh",
      lastName: "Mbaye",
      email: "cheikh.mbaye@gmail.com",
      phone: "+221 77 678 9012",
      address: "Sicap Liberté, Dakar",
      dateOfBirth: "1980-09-14",
      createdAt: "2024-07-05T08:30:00Z",
      totalSpent: 350000,
      totalOrders: 21,
      lastOrder: "2024-12-27",
      loyaltyPoints: 920
    }
  ];

  // Fonction pour calculer les statistiques d'un client
  const getCustomerStats = (customerId: number) => {
    const customer = fakeCustomers.find(c => c.id === customerId);
    if (!customer) return { totalSpent: 0, totalOrders: 0, loyaltyPoints: 0, level: 'Bronze' };
    
    return {
      totalSpent: customer.totalSpent,
      totalOrders: customer.totalOrders,
      loyaltyPoints: customer.loyaltyPoints,
      level: getLoyaltyLevel(customer.loyaltyPoints)
    };
  };

  // Ajouter un nouveau client
  const addCustomerMutation = useMutation({
    mutationFn: async (customerData: any) => {
      return apiRequest("POST", "/api/users", {
        ...customerData,
        role: "customer",
        username: customerData.email,
        password: "defaultPassword123"
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/users"] });
      toast({
        title: "Client ajouté",
        description: "Le nouveau client a été ajouté avec succès.",
      });
      setIsAddDialogOpen(false);
      setNewCustomer({
        firstName: "",
        lastName: "",
        email: "",
        phone: "",
        address: "",
        dateOfBirth: ""
      });
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'ajouter le client.",
        variant: "destructive",
      });
    },
  });

  // Utiliser les données fake pour la démonstration
  const allCustomers = fakeCustomers;

  const filteredCustomers = allCustomers.filter((customer: any) =>
    customer.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topCustomers = [...fakeCustomers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  const recentCustomers = [...fakeCustomers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const handleAddCustomer = () => {
    addCustomerMutation.mutate(newCustomer);
  };

  const renderCustomerCard = (customer: any) => {
    const stats = getCustomerStats(customer.id);
    return (
      <div
        key={customer.id}
        className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
      >
        <div className="flex items-center space-x-4 mb-3 md:mb-0">
          <Avatar className="h-12 w-12">
            <AvatarFallback>
              {customer.firstName.charAt(0)}{customer.lastName.charAt(0)}
            </AvatarFallback>
          </Avatar>
          <div>
            <div className="font-semibold text-gray-900 dark:text-white">
              {customer.firstName} {customer.lastName}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
              <Mail className="h-4 w-4 mr-1" />
              {customer.email}
            </div>
            <div className="text-sm text-gray-600 dark:text-gray-400 flex items-center mt-1">
              <Phone className="h-4 w-4 mr-1" />
              {customer.phone}
            </div>
          </div>
        </div>

        <div className="flex flex-col md:flex-row md:items-center md:space-x-6">
          <div className="mb-3 md:mb-0">
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formatCurrency(stats.totalSpent)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stats.totalOrders} commandes
            </div>
          </div>

          <div className="mb-3 md:mb-0">
            <Badge 
              variant={stats.level === "Platine" ? "default" : 
                      stats.level === "Or" ? "secondary" : 
                      stats.level === "Argent" ? "outline" : "outline"}
              className="mb-1"
            >
              {stats.level === "Platine" && <Crown className="h-3 w-3 mr-1" />}
              {stats.level === "Or" && <Star className="h-3 w-3 mr-1" />}
              {stats.level}
            </Badge>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {stats.loyaltyPoints} points
            </div>
          </div>

          <div className="text-right">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Dernier achat: {customer.lastOrder || "Jamais"}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              Client depuis: {formatDate(customer.createdAt)}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <ManagerLayout>
      <div className="space-y-6">
        {/* En-tête */}
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
              Gestion des Clients
            </h1>
            <p className="text-gray-600 dark:text-gray-400">
              Gérez vos relations client et analysez leurs comportements d'achat
            </p>
          </div>
          
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="mt-4 md:mt-0">
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter un Client
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Ajouter un Nouveau Client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="firstName">Prénom</Label>
                    <Input
                      id="firstName"
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom</Label>
                    <Input
                      id="lastName"
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newCustomer.dateOfBirth}
                    onChange={(e) => setNewCustomer({...newCustomer, dateOfBirth: e.target.value})}
                  />
                </div>
                <Button 
                  onClick={handleAddCustomer} 
                  className="w-full"
                  disabled={addCustomerMutation.isPending}
                >
                  {addCustomerMutation.isPending ? "Ajout..." : "Ajouter le Client"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Statistiques rapides */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Users className="h-8 w-8 text-blue-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Total Clients
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allCustomers.length}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <ShoppingBag className="h-8 w-8 text-green-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Commandes Totales
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allCustomers.reduce((sum, customer) => sum + customer.totalOrders, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <TrendingUp className="h-8 w-8 text-purple-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    CA Total
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {formatCurrency(allCustomers.reduce((sum, customer) => sum + customer.totalSpent, 0))}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <Star className="h-8 w-8 text-yellow-600" />
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                    Points Fidélité
                  </p>
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">
                    {allCustomers.reduce((sum, customer) => sum + customer.loyaltyPoints, 0)}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Barre de recherche */}
        <div className="flex items-center space-x-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Onglets */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="all">Tous les Clients</TabsTrigger>
            <TabsTrigger value="top">Top Clients</TabsTrigger>
            <TabsTrigger value="recent">Récents</TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            <Card>
              <CardHeader>
                <CardTitle>Liste des Clients</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredCustomers.map(renderCustomerCard)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="top">
            <Card>
              <CardHeader>
                <CardTitle>Top Clients par CA</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topCustomers.map(renderCustomerCard)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="recent">
            <Card>
              <CardHeader>
                <CardTitle>Clients Récents</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCustomers.map(renderCustomerCard)}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </ManagerLayout>
  );
}
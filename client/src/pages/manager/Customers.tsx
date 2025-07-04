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
import { formatCurrency, formatDate, getLoyaltyLevel } from "@/lib/utils";

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

  // Données fake des clients
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
      address: "Sacré-Cœur, Dakar",
      dateOfBirth: "1992-05-12",
      createdAt: "2024-12-20T16:45:00Z",
      totalSpent: 125000,
      totalOrders: 8,
      lastOrder: "2024-12-29",
      loyaltyPoints: 340
    },
    {
      id: 105,
      firstName: "Aïcha",
      lastName: "Ndiaye",
      email: "aicha.ndiaye@outlook.com",
      phone: "+221 78 567 8901",
      address: "Point E, Dakar",
      dateOfBirth: "1989-09-30",
      createdAt: "2024-12-25T11:20:00Z",
      totalSpent: 95000,
      totalOrders: 6,
      lastOrder: "2024-12-31",
      loyaltyPoints: 280
    },
    {
      id: 106,
      firstName: "Ibrahima",
      lastName: "Sarr",
      email: "ibrahima.sarr@gmail.com",
      phone: "+221 76 678 9012",
      address: "Fann, Dakar",
      dateOfBirth: "1994-01-18",
      createdAt: "2024-12-28T08:30:00Z",
      totalSpent: 65000,
      totalOrders: 4,
      lastOrder: "2024-12-30",
      loyaltyPoints: 180
    }
  ];

  // Fetch customers data
  const { data: customers, isLoading } = useQuery({
    queryKey: ["/api/users", { role: "customer" }],
  });

  // Fetch loyalty data
  const { data: loyaltyData } = useQuery({
    queryKey: ["/api/loyalty"],
  });

  // Fetch orders for customer stats
  const { data: orders } = useQuery({
    queryKey: ["/api/orders"],
  });

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

  // Utiliser les données fake au lieu des vraies données pour la démonstration
  const allCustomers = [...fakeCustomers, ...(customers || [])];

  const filteredCustomers = allCustomers.filter((customer: any) =>
    customer.firstName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.lastName.toLowerCase().toLowerCase().includes(searchTerm.toLowerCase()) ||
    customer.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const topCustomers = [...fakeCustomers]
    .sort((a, b) => b.totalSpent - a.totalSpent)
    .slice(0, 10);

  const recentCustomers = [...fakeCustomers]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 10);

  const handleAddCustomer = () => {
    if (!newCustomer.firstName || !newCustomer.lastName || !newCustomer.email) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires.",
        variant: "destructive",
      });
      return;
    }
    addCustomerMutation.mutate(newCustomer);
  };

  return (
    <ManagerLayout>
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6 md:mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
            Gestion des Clients
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Suivez et gérez votre base clients
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1 sm:w-80">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher un client..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button className="whitespace-nowrap rounded-xl">
                <UserPlus className="h-4 w-4 mr-2" />
                Ajouter Client
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Ajouter un nouveau client</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="firstName">Prénom *</Label>
                    <Input
                      id="firstName"
                      placeholder="Prénom"
                      value={newCustomer.firstName}
                      onChange={(e) => setNewCustomer({...newCustomer, firstName: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Nom *</Label>
                    <Input
                      id="lastName"
                      placeholder="Nom"
                      value={newCustomer.lastName}
                      onChange={(e) => setNewCustomer({...newCustomer, lastName: e.target.value})}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="email@exemple.com"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({...newCustomer, email: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    placeholder="+221 77 123 4567"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({...newCustomer, phone: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="address">Adresse</Label>
                  <Input
                    id="address"
                    placeholder="Adresse complète"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({...newCustomer, address: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div>
                  <Label htmlFor="dateOfBirth">Date de naissance</Label>
                  <Input
                    id="dateOfBirth"
                    type="date"
                    value={newCustomer.dateOfBirth}
                    onChange={(e) => setNewCustomer({...newCustomer, dateOfBirth: e.target.value})}
                    className="rounded-xl"
                  />
                </div>
                <div className="flex gap-3 pt-4">
                  <Button
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="flex-1 rounded-xl"
                  >
                    Annuler
                  </Button>
                  <Button
                    onClick={handleAddCustomer}
                    disabled={addCustomerMutation.isPending}
                    className="flex-1 rounded-xl"
                  >
                    {addCustomerMutation.isPending ? "Ajout..." : "Ajouter"}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-2xl font-bold">{filteredCustomers.length}</p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Total Clients</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Crown className="h-8 w-8 text-yellow-600" />
              <div>
                <p className="text-2xl font-bold">
                  {fakeCustomers.filter(c => c.loyaltyPoints > 500).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Clients VIP</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <TrendingUp className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-2xl font-bold">
                  {fakeCustomers.filter(c => 
                    new Date(c.createdAt).getTime() > Date.now() - 30 * 24 * 60 * 60 * 1000
                  ).length}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">Nouveaux (30j)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingBag className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-2xl font-bold">
                  {formatCurrency(
                    fakeCustomers.reduce((sum, c) => sum + c.totalSpent, 0)
                  )}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-400">CA Total</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
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
                {filteredCustomers.map((customer: any) => {
                  const stats = getCustomerStats(customer.id);
                  return (
                    <div
                      key={customer.id}
                      className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <div className="flex items-center space-x-4 mb-3 md:mb-0">
                        <Avatar className="h-12 w-12">
                          <AvatarFallback>
                            {customer.firstName[0]}{customer.lastName[0]}
                          </AvatarFallback>
                        </Avatar>
                        
                        <div className="flex-1">
                          <div className="flex flex-col md:flex-row md:items-center gap-2">
                            <h3 className="font-semibold text-gray-900 dark:text-white">
                              {customer.firstName} {customer.lastName}
                            </h3>
                            {stats.loyalty && (
                              <Badge 
                                variant="outline"
                                className={`text-xs ${
                                  stats.loyalty.level === "Or" ? "border-yellow-500 text-yellow-600" :
                                  stats.loyalty.level === "Argent" ? "border-gray-400 text-gray-600" :
                                  "border-amber-600 text-amber-700"
                                }`}
                              >
                                <Crown className="h-3 w-3 mr-1" />
                                {stats.loyalty.level}
                              </Badge>
                            )}
                          </div>
                          
                          <div className="flex flex-col md:flex-row md:items-center gap-1 md:gap-4 text-sm text-gray-600 dark:text-gray-400 mt-1">
                            <span className="flex items-center">
                              <Mail className="h-3 w-3 mr-1" />
                              {customer.email}
                            </span>
                            {customer.phone && (
                              <span className="flex items-center">
                                <Phone className="h-3 w-3 mr-1" />
                                {customer.phone}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col md:flex-row gap-4 text-sm">
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {stats.totalOrders}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">Commandes</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {formatCurrency(stats.totalSpent)}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">Total dépensé</p>
                        </div>
                        <div className="text-center">
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {stats.lastOrder ? formatDate(stats.lastOrder) : "Jamais"}
                          </p>
                          <p className="text-gray-600 dark:text-gray-400">Dernière commande</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="top">
          <Card>
            <CardHeader>
              <CardTitle>Top Clients par Chiffre d'Affaires</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {topCustomers.map((customer: any, index: number) => (
                  <div
                    key={customer.id}
                    className="flex items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary text-white text-sm font-bold">
                        {index + 1}
                      </div>
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {customer.firstName[0]}{customer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {customer.stats.totalOrders} commandes
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg text-gray-900 dark:text-white">
                        {formatCurrency(customer.stats.totalSpent)}
                      </p>
                      {customer.stats.loyalty && (
                        <Badge variant="outline" className="text-xs">
                          {customer.stats.loyalty.level}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
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
                {recentCustomers.map((customer: any) => (
                  <div
                    key={customer.id}
                    className="flex flex-col md:flex-row md:items-center justify-between p-4 border rounded-lg"
                  >
                    <div className="flex items-center space-x-4 mb-3 md:mb-0">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback>
                          {customer.firstName[0]}{customer.lastName[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white">
                          {customer.firstName} {customer.lastName}
                        </h3>
                        <p className="text-sm text-gray-600 dark:text-gray-400 flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          Inscrit le {formatDate(customer.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="outline" size="sm">
                        Voir Profil
                      </Button>
                      <Button size="sm">
                        Contacter
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </ManagerLayout>
  );
}
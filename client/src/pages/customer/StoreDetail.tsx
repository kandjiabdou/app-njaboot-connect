import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import ProductCard from "@/components/common/ProductCard";
import { formatCurrency } from "@/lib/utils";
import { 
  MapPin, 
  Phone, 
  Clock, 
  Truck, 
  Package, 
  Star,
  ExternalLink,
  Store as StoreIcon,
  CheckCircle,
  XCircle,
  Navigation,
  Calendar,
  Tag,
  TrendingUp,
  Heart
} from "lucide-react";

export default function StoreDetail() {
  const [, params] = useRoute("/store/:id");

  // Fetch store details
  const { data: store, isLoading: storeLoading } = useQuery({
    queryKey: [`/api/stores/${params?.id}`],
    enabled: !!params?.id,
  });

  // Fetch store inventory (products)
  const { data: inventory, isLoading: inventoryLoading } = useQuery({
    queryKey: [`/api/inventory/${params?.id}`],
    enabled: !!params?.id,
  });

  // Mock store detailed data (in real app, this would come from API)
  const storeDetails = {
    description: "Boutique partenaire Njaboot dans le quartier Plateau, ouverte depuis 2023. Spécialisée dans les produits frais et l'épicerie locale.",
    imageUrl: "/api/placeholder/600/300",
    status: "open", // open, closed, temporarily_closed
    rating: 4.3,
    reviewCount: 127,
    openingHours: {
      "Lundi": "08h00 - 20h00",
      "Mardi": "08h00 - 20h00", 
      "Mercredi": "08h00 - 20h00",
      "Jeudi": "08h00 - 20h00",
      "Vendredi": "08h00 - 20h00",
      "Samedi": "08h00 - 22h00",
      "Dimanche": "10h00 - 18h00"
    },
    services: {
      clickAndCollect: true,
      homeDelivery: true,
      deliveryZones: ["Plateau", "Cocody", "Marcory", "Treichville"],
      deliveryFee: "1000 CFA (gratuit > 10 000 CFA)"
    },
    categories: ["Céréales", "Légumes", "Fruits", "Produits laitiers", "Viandes"],
    promotions: [
      {
        id: 1,
        title: "Promo Weekend",
        description: "10% de réduction sur tous les fruits et légumes",
        validUntil: "2024-12-31",
        discount: "10%"
      },
      {
        id: 2,
        title: "Fidélité +",
        description: "Achetez 3 produits laitiers, le 4ème est offert",
        validUntil: "2024-12-25",
        discount: "3+1"
      }
    ]
  };

  const getCurrentStatus = () => {
    const now = new Date();
    const currentHour = now.getHours();
    const currentDay = now.toLocaleDateString('fr-FR', { weekday: 'long' });
    
    // Simplified logic - in real app, parse actual opening hours
    if (currentDay === "Dimanche" && (currentHour < 10 || currentHour >= 18)) {
      return { status: "closed", text: "Fermé" };
    } else if (currentHour < 8 || currentHour >= 20) {
      return { status: "closed", text: "Fermé" };
    } else {
      return { status: "open", text: "Ouvert" };
    }
  };

  const currentStatus = getCurrentStatus();

  if (storeLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/3"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="h-32 bg-gray-200 rounded"></div>
            <div className="h-32 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!store) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Boutique non trouvée</h2>
        <p className="text-gray-600">La boutique que vous recherchez n'existe pas.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header avec image et infos principales */}
      <div className="mb-8">
        <div className="relative h-64 md:h-80 rounded-lg overflow-hidden mb-6">
          <img
            src={storeDetails.imageUrl}
            alt={store.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black bg-opacity-40 flex items-end">
            <div className="p-6 text-white">
              <h1 className="text-3xl font-bold mb-2">{store.name}</h1>
              <p className="text-lg opacity-90">{storeDetails.description}</p>
            </div>
          </div>
        </div>

        {/* Statut et infos rapides */}
        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <div className={`h-3 w-3 rounded-full ${currentStatus.status === 'open' ? 'bg-green-500' : 'bg-red-500'}`}></div>
                <div>
                  <p className="font-medium">{currentStatus.text}</p>
                  <p className="text-sm text-gray-600">Aujourd'hui jusqu'à 20h00</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Star className="h-5 w-5 text-yellow-400 fill-current" />
                <div>
                  <p className="font-medium">{storeDetails.rating}/5</p>
                  <p className="text-sm text-gray-600">{storeDetails.reviewCount} avis</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center space-x-3">
                <Truck className="h-5 w-5 text-blue-500" />
                <div>
                  <p className="font-medium">Livraison disponible</p>
                  <p className="text-sm text-gray-600">{storeDetails.services.deliveryFee}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Onglets détaillés */}
      <Tabs defaultValue="products" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="products">Produits</TabsTrigger>
          <TabsTrigger value="info">Informations</TabsTrigger>
          <TabsTrigger value="hours">Horaires</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="promotions">Promotions</TabsTrigger>
        </TabsList>

        <TabsContent value="products" className="space-y-4">
          <div className="grid md:grid-cols-4 gap-6">
            {/* Catégories en avant */}
            <div className="md:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Catégories</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {storeDetails.categories.map((category, index) => (
                    <Button key={index} variant="outline" className="w-full justify-start">
                      <Package className="mr-2 h-4 w-4" />
                      {category}
                    </Button>
                  ))}
                </CardContent>
              </Card>
            </div>

            {/* Produits disponibles */}
            <div className="md:col-span-3">
              <div className="mb-4">
                <h3 className="text-xl font-bold mb-2">Produits disponibles</h3>
                <p className="text-gray-600">
                  {inventory?.length || 0} produits en stock
                </p>
              </div>
              
              {inventoryLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="bg-gray-200 h-20 rounded-lg mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {inventory?.map((item: any) => (
                    <ProductCard key={item.id} product={item.product} compact />
                  ))}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="info" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <MapPin className="mr-2 h-5 w-5" />
                  Localisation
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Adresse</p>
                  <p className="text-gray-600">{store.address}</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Navigation className="mr-2 h-4 w-4" />
                  Ouvrir dans Google Maps
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Phone className="mr-2 h-5 w-5" />
                  Contact
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="font-medium">Téléphone</p>
                  <p className="text-gray-600">{store.phone || "+225 XX XX XX XX"}</p>
                </div>
                <Button variant="outline" className="w-full">
                  <Phone className="mr-2 h-4 w-4" />
                  Appeler la boutique
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="hours" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5" />
                Horaires d'ouverture
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(storeDetails.openingHours).map(([day, hours]) => (
                  <div key={day} className="flex justify-between items-center py-2 border-b last:border-b-0">
                    <span className="font-medium">{day}</span>
                    <span className="text-gray-600">{hours}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="services" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Options de commande</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Package className="h-4 w-4" />
                    <span>Click & Collect</span>
                  </div>
                  {storeDetails.services.clickAndCollect ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Truck className="h-4 w-4" />
                    <span>Livraison à domicile</span>
                  </div>
                  {storeDetails.services.homeDelivery ? (
                    <CheckCircle className="h-5 w-5 text-green-500" />
                  ) : (
                    <XCircle className="h-5 w-5 text-red-500" />
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Zones de livraison</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {storeDetails.services.deliveryZones.map((zone, index) => (
                    <Badge key={index} variant="secondary" className="mr-2 mb-2">
                      {zone}
                    </Badge>
                  ))}
                </div>
                <Separator className="my-4" />
                <div>
                  <p className="font-medium mb-2">Frais de livraison</p>
                  <p className="text-gray-600">{storeDetails.services.deliveryFee}</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="promotions" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {storeDetails.promotions.map((promo) => (
              <Card key={promo.id} className="border-l-4 border-l-primary">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center">
                      <Tag className="mr-2 h-5 w-5" />
                      {promo.title}
                    </span>
                    <Badge variant="destructive">{promo.discount}</Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 mb-3">{promo.description}</p>
                  <div className="flex items-center text-sm text-gray-500">
                    <Calendar className="mr-1 h-4 w-4" />
                    Valable jusqu'au {new Date(promo.validUntil).toLocaleDateString('fr-FR')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
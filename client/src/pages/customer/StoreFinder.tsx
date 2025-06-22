import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import {
  MapPin,
  Search,
  Phone,
  Clock,
  Navigation,
  List,
  Map,
  Star,
  Filter,
} from "lucide-react";

interface Store {
  id: number;
  name: string;
  address: string;
  phone: string | null;
  isActive: boolean | null;
  distance?: number;
  rating?: number;
  hours?: string;
  coordinates?: { lat: number; lng: number };
}

export default function StoreFinder() {
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState<"list" | "map">("list");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  // Fetch all stores
  const { data: stores, isLoading } = useQuery<Store[]>({
    queryKey: ["/api/stores"],
  });

  // Mock store data with coordinates for demonstration
  const mockStores: Store[] = [
    {
      id: 1,
      name: "Njaboot Connect Dakar Centre",
      address: "Avenue Léopold Sédar Senghor, Dakar",
      phone: "+221 33 123 45 67",
      isActive: true,
      distance: 0.8,
      rating: 4.5,
      hours: "8h00 - 20h00",
      coordinates: { lat: 14.6937, lng: -17.4441 },
    },
    {
      id: 2,
      name: "Njaboot Connect Almadies",
      address: "Route des Almadies, Dakar",
      phone: "+221 33 234 56 78",
      isActive: true,
      distance: 2.3,
      rating: 4.3,
      hours: "9h00 - 19h00",
      coordinates: { lat: 14.7167, lng: -17.4833 },
    },
    {
      id: 3,
      name: "Njaboot Connect Pikine",
      address: "Avenue Cheikh Ahmadou Bamba, Pikine",
      phone: "+221 33 345 67 89",
      isActive: true,
      distance: 5.1,
      rating: 4.1,
      hours: "8h30 - 19h30",
      coordinates: { lat: 14.7547, lng: -17.3906 },
    },
    {
      id: 4,
      name: "Njaboot Connect Guédiawaye",
      address: "Route de Rufisque, Guédiawaye",
      phone: "+221 33 456 78 90",
      isActive: true,
      distance: 7.2,
      rating: 4.0,
      hours: "8h00 - 18h00",
      coordinates: { lat: 14.7692, lng: -17.4019 },
    },
    {
      id: 5,
      name: "Njaboot Connect Thiès",
      address: "Avenue Général de Gaulle, Thiès",
      phone: "+221 33 567 89 01",
      isActive: true,
      distance: 67.5,
      rating: 4.2,
      hours: "8h00 - 19h00",
      coordinates: { lat: 14.7886, lng: -16.9355 },
    },
  ];

  const displayStores = stores?.length ? stores : mockStores;

  // Filter stores based on search query
  const filteredStores = displayStores.filter(
    (store) =>
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.address.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Sort by distance (closest first)
  const sortedStores = filteredStores.sort((a, b) => (a.distance || 0) - (b.distance || 0));

  const handleGetDirections = (store: Store) => {
    if (store.coordinates) {
      const url = `https://www.google.com/maps/dir/?api=1&destination=${store.coordinates.lat},${store.coordinates.lng}`;
      window.open(url, "_blank");
    }
  };

  const handleLocationRequest = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        (error) => {
          console.error("Erreur de géolocalisation:", error);
        }
      );
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <LoadingSpinner size="lg" className="min-h-[400px]" />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6 md:py-8 space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white">
          Trouvez Votre Boutique
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Localisez la boutique Njaboot Connect la plus proche de vous
        </p>
      </div>

      {/* Search and Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Rechercher par nom ou adresse..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={handleLocationRequest}
            className="whitespace-nowrap"
          >
            <Navigation className="h-4 w-4 mr-2" />
            Ma Position
          </Button>
          
          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as "list" | "map")}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="list" className="flex items-center gap-2">
                <List className="h-4 w-4" />
                Liste
              </TabsTrigger>
              <TabsTrigger value="map" className="flex items-center gap-2">
                <Map className="h-4 w-4" />
                Carte
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          {sortedStores.length} boutique{sortedStores.length !== 1 ? "s" : ""} trouvée{sortedStores.length !== 1 ? "s" : ""}
        </p>
        {userLocation && (
          <Badge variant="secondary" className="flex items-center gap-1">
            <Navigation className="h-3 w-3" />
            Position activée
          </Badge>
        )}
      </div>

      {/* View Content */}
      <Tabs value={viewMode} className="space-y-4">
        {/* List View */}
        <TabsContent value="list" className="space-y-4">
          {sortedStores.map((store) => (
            <Card key={store.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4 md:p-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                  <div className="flex-1 space-y-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {store.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          {store.rating && (
                            <div className="flex items-center gap-1">
                              <Star className="h-4 w-4 text-yellow-500 fill-current" />
                              <span className="text-sm text-gray-600 dark:text-gray-400">
                                {store.rating}
                              </span>
                            </div>
                          )}
                          {store.distance !== undefined && (
                            <Badge variant="outline" className="text-xs">
                              {store.distance < 1 
                                ? `${(store.distance * 1000).toFixed(0)}m`
                                : `${store.distance.toFixed(1)}km`
                              }
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2 text-sm text-gray-600 dark:text-gray-400">
                      <div className="flex items-start gap-2">
                        <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0" />
                        <span>{store.address}</span>
                      </div>
                      
                      {store.phone && (
                        <div className="flex items-center gap-2">
                          <Phone className="h-4 w-4 flex-shrink-0" />
                          <span>{store.phone}</span>
                        </div>
                      )}
                      
                      {store.hours && (
                        <div className="flex items-center gap-2">
                          <Clock className="h-4 w-4 flex-shrink-0" />
                          <span>{store.hours}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleGetDirections(store)}
                      className="whitespace-nowrap"
                    >
                      <Navigation className="h-4 w-4 mr-2" />
                      Itinéraire
                    </Button>
                    <Button size="sm" className="whitespace-nowrap">
                      Voir Détails
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {/* Map View */}
        <TabsContent value="map">
          <Card className="h-96 md:h-[500px]">
            <CardContent className="p-0 h-full">
              <div className="h-full bg-gray-100 dark:bg-gray-800 rounded-lg flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Map className="h-12 w-12 text-gray-400 mx-auto" />
                  <p className="text-gray-600 dark:text-gray-400">
                    Intégration carte interactive à venir
                  </p>
                  <p className="text-sm text-gray-500 dark:text-gray-500">
                    Utilisez la vue liste pour voir toutes les boutiques
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* No Results */}
      {sortedStores.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <MapPin className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
              Aucune boutique trouvée
            </h3>
            <p className="text-gray-600 dark:text-gray-400">
              Essayez de modifier votre recherche ou votre localisation.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
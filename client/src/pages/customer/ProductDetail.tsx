import { useState } from "react";
import { useRoute } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { useCart } from "@/hooks/use-cart";
import { formatCurrency } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";
import { 
  Star, 
  ShoppingCart, 
  Heart, 
  Share2, 
  MapPin, 
  Package, 
  Shield, 
  Leaf,
  Clock,
  Thermometer,
  Weight,
  Ruler,
  ChefHat,
  AlertTriangle,
  Award,
  TrendingUp,
  Plus,
  Minus
} from "lucide-react";

export default function ProductDetail() {
  const [, params] = useRoute("/product/:id");
  const { addItem } = useCart();
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selectedImage, setSelectedImage] = useState(0);

  // Fetch product details
  const { data: product, isLoading } = useQuery({
    queryKey: [`/api/products/${params?.id}`],
    enabled: !!params?.id,
  });

  // Fetch stores that have this product
  const { data: stores } = useQuery({
    queryKey: [`/api/stores/product/${params?.id}`],
    enabled: !!params?.id,
  });

  // Mock product images (in real app, these would come from the API)
  const productImages = [
    "/api/placeholder/400/400",
    "/api/placeholder/400/400",
    "/api/placeholder/400/400"
  ];

  // Mock detailed product data (in real app, this would be in the API response)
  const productDetails = {
    shortDescription: "Riz parfumé de qualité premium, idéal pour tous vos plats",
    longDescription: "Ce riz parfumé premium est cultivé dans les meilleures rizières d'Afrique de l'Ouest. Grain long et parfumé, il se distingue par sa texture moelleuse et son arôme délicat. Parfait pour accompagner vos plats traditionnels ou vos créations culinaires modernes.",
    category: "Céréales",
    subCategory: "Riz",
    unitPrice: 500,
    promoPrice: null,
    unit: "kg",
    stock: 45,
    status: "En stock",
    weight: "1 kg",
    volume: null,
    dimensions: "25cm x 15cm x 5cm",
    perishable: false,
    expiryDate: "12 mois à partir de la date de production",
    origin: "Côte d'Ivoire - Région de Bouaké",
    ingredients: ["Riz long grain 100%"],
    allergens: ["Peut contenir des traces de gluten"],
    certifications: ["Agriculture Locale", "Sans OGM"],
    nutritionalValues: {
      energy: "350 kcal",
      lipids: "0.7g",
      carbohydrates: "77g",
      proteins: "7.1g",
      fiber: "1.3g",
      sodium: "0.005g"
    },
    usageAdvice: "Rincer avant cuisson. Cuire dans de l'eau bouillante salée pendant 18-20 minutes.",
    conservationAdvice: "À conserver dans un endroit sec et frais, à l'abri de la lumière.",
    rating: 4.5,
    reviewCount: 89
  };

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      toast({
        title: "Produit ajouté",
        description: `${quantity} ${product.name} ajouté au panier`,
      });
    }
  };

  const adjustQuantity = (delta: number) => {
    setQuantity(Math.max(1, quantity + delta));
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="space-y-4">
              <div className="aspect-square bg-gray-200 rounded-lg"></div>
              <div className="flex space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-20 h-20 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
            <div className="space-y-4">
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
              <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              <div className="h-12 bg-gray-200 rounded w-1/3"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h2 className="text-2xl font-bold mb-4">Produit non trouvé</h2>
        <p className="text-gray-600">Le produit que vous recherchez n'existe pas.</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Navigation breadcrumb */}
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
        <span>Accueil</span>
        <span>/</span>
        <span>{productDetails.category}</span>
        <span>/</span>
        <span className="text-gray-900 font-medium">{product.name}</span>
      </div>

      <div className="grid md:grid-cols-2 gap-8 mb-8">
        {/* Images du produit */}
        <div className="space-y-4">
          <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
            <img
              src={productImages[selectedImage]}
              alt={product.name}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex space-x-2">
            {productImages.map((image, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`w-20 h-20 rounded border-2 overflow-hidden ${
                  selectedImage === index ? 'border-primary' : 'border-gray-200'
                }`}
              >
                <img src={image} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>
        </div>

        {/* Informations principales */}
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>
            <p className="text-gray-600 mb-4">{productDetails.shortDescription}</p>
            
            {/* Rating */}
            <div className="flex items-center space-x-2 mb-4">
              <div className="flex items-center">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`h-5 w-5 ${
                      star <= productDetails.rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300'
                    }`}
                  />
                ))}
              </div>
              <span className="text-sm text-gray-600">
                {productDetails.rating} ({productDetails.reviewCount} avis)
              </span>
            </div>

            {/* Catégorie */}
            <div className="flex items-center space-x-2 mb-4">
              <Badge variant="secondary">{productDetails.category}</Badge>
              <Badge variant="outline">{productDetails.subCategory}</Badge>
            </div>
          </div>

          {/* Prix */}
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              {productDetails.promoPrice ? (
                <>
                  <span className="text-3xl font-bold text-red-600">
                    {formatCurrency(productDetails.promoPrice)}
                  </span>
                  <span className="text-xl text-gray-500 line-through">
                    {formatCurrency(productDetails.unitPrice)}
                  </span>
                </>
              ) : (
                <span className="text-3xl font-bold">
                  {formatCurrency(productDetails.unitPrice)}
                </span>
              )}
              <span className="text-gray-600">/ {productDetails.unit}</span>
            </div>
          </div>

          {/* Stock */}
          <div className="flex items-center space-x-2">
            <Package className="h-5 w-5 text-green-600" />
            <span className="text-green-600 font-medium">{productDetails.status}</span>
            <span className="text-gray-600">({productDetails.stock} disponibles)</span>
          </div>

          {/* Sélection quantité */}
          <div className="space-y-4">
            <div className="flex items-center space-x-4">
              <span className="font-medium">Quantité:</span>
              <div className="flex items-center border rounded-lg">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => adjustQuantity(-1)}
                  disabled={quantity <= 1}
                >
                  <Minus className="h-4 w-4" />
                </Button>
                <span className="px-4 py-2 font-medium">{quantity}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => adjustQuantity(1)}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex space-x-4">
              <Button onClick={handleAddToCart} className="flex-1">
                <ShoppingCart className="mr-2 h-4 w-4" />
                Ajouter au panier
              </Button>
              <Button variant="outline" size="icon">
                <Heart className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon">
                <Share2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {/* Certifications */}
          {productDetails.certifications.length > 0 && (
            <div className="flex items-center space-x-2">
              <Award className="h-5 w-5 text-blue-600" />
              <div className="flex space-x-2">
                {productDetails.certifications.map((cert, index) => (
                  <Badge key={index} variant="secondary">{cert}</Badge>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Onglets détaillés */}
      <Tabs defaultValue="description" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="description">Description</TabsTrigger>
          <TabsTrigger value="nutrition">Nutrition</TabsTrigger>
          <TabsTrigger value="logistics">Logistique</TabsTrigger>
          <TabsTrigger value="stores">Boutiques</TabsTrigger>
          <TabsTrigger value="reviews">Avis</TabsTrigger>
        </TabsList>

        <TabsContent value="description" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                <div>
                  <h3 className="font-semibold mb-2">Description complète</h3>
                  <p className="text-gray-700">{productDetails.longDescription}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <ChefHat className="mr-2 h-4 w-4" />
                    Conseils d'utilisation
                  </h3>
                  <p className="text-gray-700">{productDetails.usageAdvice}</p>
                </div>
                <div>
                  <h3 className="font-semibold mb-2 flex items-center">
                    <Thermometer className="mr-2 h-4 w-4" />
                    Conservation
                  </h3>
                  <p className="text-gray-700">{productDetails.conservationAdvice}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="nutrition" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-6">
                <div>
                  <h3 className="font-semibold mb-4">Ingrédients</h3>
                  <p className="text-gray-700">{productDetails.ingredients.join(", ")}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-4 flex items-center">
                    <AlertTriangle className="mr-2 h-4 w-4 text-orange-500" />
                    Allergènes
                  </h3>
                  <p className="text-gray-700">{productDetails.allergens.join(", ")}</p>
                </div>
                <Separator />
                <div>
                  <h3 className="font-semibold mb-4">Valeurs nutritionnelles (pour 100g)</h3>
                  <div className="grid grid-cols-2 gap-4">
                    {Object.entries(productDetails.nutritionalValues).map(([key, value]) => (
                      <div key={key} className="flex justify-between">
                        <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').toLowerCase()}:</span>
                        <span className="font-medium">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logistics" className="space-y-4">
          <Card>
            <CardContent className="pt-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Weight className="mr-2 h-4 w-4" />
                      <span>Poids</span>
                    </div>
                    <span className="font-medium">{productDetails.weight}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Ruler className="mr-2 h-4 w-4" />
                      <span>Dimensions</span>
                    </div>
                    <span className="font-medium">{productDetails.dimensions}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <Clock className="mr-2 h-4 w-4" />
                      <span>Périssable</span>
                    </div>
                    <span className="font-medium">{productDetails.perishable ? "Oui" : "Non"}</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center mb-2">
                      <MapPin className="mr-2 h-4 w-4" />
                      <span className="font-medium">Origine</span>
                    </div>
                    <p className="text-gray-700">{productDetails.origin}</p>
                  </div>
                  <div>
                    <div className="flex items-center mb-2">
                      <Shield className="mr-2 h-4 w-4" />
                      <span className="font-medium">Conservation</span>
                    </div>
                    <p className="text-gray-700">{productDetails.expiryDate}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="stores" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Boutiques proposant ce produit</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {stores?.map((store: any) => (
                  <div key={store.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <h4 className="font-medium">{store.name}</h4>
                      <p className="text-sm text-gray-600">{store.address}</p>
                    </div>
                    <Badge variant="outline">Disponible</Badge>
                  </div>
                )) || (
                  <p className="text-gray-500">Chargement des boutiques...</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reviews" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Avis clients</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Bientôt disponible</h3>
                <p className="text-gray-500">
                  Les avis clients seront bientôt disponibles pour ce produit
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
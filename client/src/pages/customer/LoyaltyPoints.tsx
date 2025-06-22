import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useAuth } from "@/hooks/use-auth";
import { formatCurrency, formatDate, getLoyaltyLevel } from "@/lib/utils";
import {
  Star,
  Crown,
  Gift,
  TrendingUp,
  Calendar,
  ShoppingBag,
  Award,
  Zap,
  Target,
} from "lucide-react";

interface LoyaltyTransaction {
  id: number;
  type: "earned" | "redeemed";
  points: number;
  description: string;
  orderId?: number;
  createdAt: string;
}

interface LoyaltyReward {
  id: number;
  title: string;
  description: string;
  pointsCost: number;
  category: string;
  available: boolean;
  imageUrl?: string;
}

export default function LoyaltyPoints() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch user loyalty points
  const { data: loyaltyData, isLoading } = useQuery({
    queryKey: [`/api/loyalty/${user?.id}`],
    enabled: !!user,
  });

  // Mock loyalty data for demonstration
  const mockLoyaltyData = {
    currentPoints: 2450,
    totalEarned: 8750,
    totalRedeemed: 6300,
    level: "Gold",
    nextLevelPoints: 500,
    monthlyEarned: 340,
    memberSince: "2023-01-15",
  };

  const mockTransactions: LoyaltyTransaction[] = [
    {
      id: 1,
      type: "earned",
      points: 50,
      description: "Achat - Commande #1234",
      orderId: 1234,
      createdAt: "2024-01-20T10:30:00Z",
    },
    {
      id: 2,
      type: "earned",
      points: 25,
      description: "Bonus de fidélité mensuel",
      createdAt: "2024-01-15T09:00:00Z",
    },
    {
      id: 3,
      type: "redeemed",
      points: -100,
      description: "Réduction 10% - Commande #1230",
      orderId: 1230,
      createdAt: "2024-01-10T14:22:00Z",
    },
    {
      id: 4,
      type: "earned",
      points: 75,
      description: "Achat - Commande #1228",
      orderId: 1228,
      createdAt: "2024-01-08T16:45:00Z",
    },
  ];

  const mockRewards: LoyaltyReward[] = [
    {
      id: 1,
      title: "Réduction 5%",
      description: "Réduction de 5% sur votre prochaine commande",
      pointsCost: 200,
      category: "discount",
      available: true,
    },
    {
      id: 2,
      title: "Réduction 10%",
      description: "Réduction de 10% sur votre prochaine commande",
      pointsCost: 500,
      category: "discount",
      available: true,
    },
    {
      id: 3,
      title: "Livraison Gratuite",
      description: "Livraison gratuite pour votre prochaine commande",
      pointsCost: 300,
      category: "shipping",
      available: true,
    },
    {
      id: 4,
      title: "Produit Gratuit",
      description: "Un sac de riz parfumé 1kg offert",
      pointsCost: 800,
      category: "product",
      available: true,
    },
    {
      id: 5,
      title: "Réduction 15%",
      description: "Réduction de 15% sur votre prochaine commande",
      pointsCost: 1000,
      category: "discount",
      available: false,
    },
  ];

  const displayData = loyaltyData || mockLoyaltyData;
  const loyaltyLevel = getLoyaltyLevel(displayData.currentPoints);

  const handleRedeemReward = (reward: LoyaltyReward) => {
    if (displayData.currentPoints >= reward.pointsCost) {
      // Implementation for redeeming rewards
      console.log("Redeeming reward:", reward.title);
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
          Programme de Fidélité
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gagnez des points et débloquez des récompenses exclusives
        </p>
      </div>

      {/* Loyalty Status Card */}
      <Card className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 opacity-10"></div>
        <CardContent className="p-6 relative">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 mb-2">
                <Crown className={`h-6 w-6 ${loyaltyLevel.color}`} />
                <Badge variant="secondary" className="text-sm font-medium">
                  Niveau {loyaltyLevel.level}
                </Badge>
              </div>
              <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-1">
                {displayData.currentPoints.toLocaleString()} points
              </h2>
              <p className="text-gray-600 dark:text-gray-400">
                Membre depuis {formatDate(displayData.memberSince)}
              </p>
            </div>

            <div className="text-center space-y-3 min-w-[200px]">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Progression vers {loyaltyLevel.nextLevel}
                </p>
                <Progress
                  value={(displayData.currentPoints % 1000) / 10}
                  className="h-2"
                />
                <p className="text-xs text-gray-500 dark:text-gray-500 mt-1">
                  {displayData.nextLevelPoints} points restants
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayData.totalEarned.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Points gagnés au total
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Gift className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayData.totalRedeemed.toLocaleString()}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Points utilisés
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Calendar className="h-8 w-8 text-blue-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {displayData.monthlyEarned}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Points ce mois-ci
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Récompenses</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Rewards Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockRewards.map((reward) => (
              <Card key={reward.id} className={`relative ${!reward.available ? "opacity-60" : ""}`}>
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-2">
                      {reward.category === "discount" && <Target className="h-5 w-5 text-green-600" />}
                      {reward.category === "shipping" && <Zap className="h-5 w-5 text-blue-600" />}
                      {reward.category === "product" && <Gift className="h-5 w-5 text-purple-600" />}
                      <CardTitle className="text-lg">{reward.title}</CardTitle>
                    </div>
                    <Badge variant={reward.available ? "default" : "secondary"} className="text-xs">
                      {reward.pointsCost} pts
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    {reward.description}
                  </p>
                  
                  <Button
                    className="w-full"
                    disabled={!reward.available || displayData.currentPoints < reward.pointsCost}
                    onClick={() => handleRedeemReward(reward)}
                  >
                    {displayData.currentPoints < reward.pointsCost ? "Points insuffisants" : "Échanger"}
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique des Points</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {mockTransactions.map((transaction) => (
                  <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      {transaction.type === "earned" ? (
                        <TrendingUp className="h-5 w-5 text-green-600" />
                      ) : (
                        <Gift className="h-5 w-5 text-purple-600" />
                      )}
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {transaction.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(transaction.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`font-medium ${
                        transaction.type === "earned" ? "text-green-600" : "text-purple-600"
                      }`}>
                        {transaction.type === "earned" ? "+" : ""}{transaction.points} pts
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
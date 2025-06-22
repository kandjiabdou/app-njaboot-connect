import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import LoadingSpinner from "@/components/common/LoadingSpinner";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { formatCurrency, formatDate } from "@/lib/utils";
import { apiRequest } from "@/lib/queryClient";
import {
  CreditCard,
  AlertCircle,
  CheckCircle,
  Clock,
  TrendingDown,
  TrendingUp,
  Calendar,
  DollarSign,
  Plus,
  FileText,
} from "lucide-react";

interface DebtRecord {
  id: number;
  amount: string;
  description: string;
  status: "pending" | "partial" | "paid";
  createdAt: string;
  dueDate?: string;
  paidAmount?: string;
  lastPayment?: string;
  orderId?: number;
}

interface PaymentRecord {
  id: number;
  debtId: number;
  amount: string;
  paymentMethod: string;
  createdAt: string;
  reference?: string;
}

const paymentSchema = z.object({
  amount: z.string().min(1, "Le montant est requis"),
  paymentMethod: z.string().min(1, "La méthode de paiement est requise"),
  reference: z.string().optional(),
});

type PaymentForm = z.infer<typeof paymentSchema>;

export default function DebtTracking() {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("overview");
  const [selectedDebt, setSelectedDebt] = useState<DebtRecord | null>(null);
  const [paymentDialogOpen, setPaymentDialogOpen] = useState(false);

  const form = useForm<PaymentForm>({
    resolver: zodResolver(paymentSchema),
    defaultValues: {
      amount: "",
      paymentMethod: "",
      reference: "",
    },
  });

  // Fetch user debt records
  const { data: debtData, isLoading } = useQuery({
    queryKey: [`/api/debt/${user?.id}`],
    enabled: !!user,
  });

  // Mock debt data for demonstration
  const mockDebtRecords: DebtRecord[] = [
    {
      id: 1,
      amount: "45000",
      description: "Commande alimentaire familiale",
      status: "pending",
      createdAt: "2024-01-15T10:30:00Z",
      dueDate: "2024-02-15T00:00:00Z",
      orderId: 1234,
    },
    {
      id: 2,
      amount: "25000",
      description: "Achat produits ménagers",
      status: "partial",
      createdAt: "2024-01-10T14:22:00Z",
      dueDate: "2024-02-10T00:00:00Z",
      paidAmount: "15000",
      lastPayment: "2024-01-20T09:15:00Z",
      orderId: 1230,
    },
    {
      id: 3,
      amount: "18000",
      description: "Légumes et fruits frais",
      status: "paid",
      createdAt: "2024-01-05T16:45:00Z",
      paidAmount: "18000",
      lastPayment: "2024-01-12T11:30:00Z",
      orderId: 1225,
    },
  ];

  const mockPayments: PaymentRecord[] = [
    {
      id: 1,
      debtId: 2,
      amount: "15000",
      paymentMethod: "mobile",
      createdAt: "2024-01-20T09:15:00Z",
      reference: "MM20240120001",
    },
    {
      id: 2,
      debtId: 3,
      amount: "18000",
      paymentMethod: "cash",
      createdAt: "2024-01-12T11:30:00Z",
    },
  ];

  const displayRecords = debtData?.records || mockDebtRecords;
  
  // Calculate totals
  const totalDebt = displayRecords
    .filter(record => record.status !== "paid")
    .reduce((sum, record) => sum + parseFloat(record.amount) - parseFloat(record.paidAmount || "0"), 0);

  const totalPaid = displayRecords
    .reduce((sum, record) => sum + parseFloat(record.paidAmount || "0"), 0);

  const overdueCount = displayRecords
    .filter(record => record.status !== "paid" && record.dueDate && new Date(record.dueDate) < new Date())
    .length;

  // Payment mutation
  const paymentMutation = useMutation({
    mutationFn: async (data: PaymentForm & { debtId: number }) => {
      return apiRequest(`/api/debt/${data.debtId}/payment`, {
        method: "POST",
        body: JSON.stringify({
          amount: data.amount,
          paymentMethod: data.paymentMethod,
          reference: data.reference,
        }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Paiement enregistré",
        description: "Votre paiement a été enregistré avec succès.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/debt/${user?.id}`] });
      setPaymentDialogOpen(false);
      form.reset();
      setSelectedDebt(null);
    },
    onError: () => {
      toast({
        title: "Erreur",
        description: "Impossible d'enregistrer le paiement.",
        variant: "destructive",
      });
    },
  });

  const handlePayment = (data: PaymentForm) => {
    if (selectedDebt) {
      paymentMutation.mutate({ ...data, debtId: selectedDebt.id });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "text-orange-600 bg-orange-100 dark:bg-orange-900/20";
      case "partial":
        return "text-blue-600 bg-blue-100 dark:bg-blue-900/20";
      case "paid":
        return "text-green-600 bg-green-100 dark:bg-green-900/20";
      default:
        return "text-gray-600 bg-gray-100 dark:bg-gray-900/20";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "pending":
        return "En attente";
      case "partial":
        return "Partiellement payé";
      case "paid":
        return "Payé";
      default:
        return status;
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
          Suivi des Crédits
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Gérez vos achats à crédit et vos paiements
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <CreditCard className="h-8 w-8 text-red-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalDebt)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Solde dû
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatCurrency(totalPaid)}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Total payé
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <AlertCircle className="h-8 w-8 text-orange-600 mx-auto mb-2" />
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {overdueCount}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Échéances dépassées
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs Content */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview">Crédits Actifs</TabsTrigger>
          <TabsTrigger value="history">Historique</TabsTrigger>
        </TabsList>

        {/* Active Debts Tab */}
        <TabsContent value="overview" className="space-y-4">
          {displayRecords
            .filter(record => record.status !== "paid")
            .map((record) => {
              const remainingAmount = parseFloat(record.amount) - parseFloat(record.paidAmount || "0");
              const isOverdue = record.dueDate && new Date(record.dueDate) < new Date();
              
              return (
                <Card key={record.id} className={`${isOverdue ? "border-red-200 dark:border-red-800" : ""}`}>
                  <CardContent className="p-4 md:p-6">
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                              {record.description}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                              <Badge className={getStatusColor(record.status)}>
                                {getStatusLabel(record.status)}
                              </Badge>
                              {record.orderId && (
                                <Badge variant="outline" className="text-xs">
                                  Commande #{record.orderId}
                                </Badge>
                              )}
                              {isOverdue && (
                                <Badge variant="destructive" className="text-xs">
                                  En retard
                                </Badge>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Montant total</p>
                            <p className="font-medium text-gray-900 dark:text-white">
                              {formatCurrency(parseFloat(record.amount))}
                            </p>
                          </div>
                          
                          {record.paidAmount && (
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Déjà payé</p>
                              <p className="font-medium text-green-600">
                                {formatCurrency(parseFloat(record.paidAmount))}
                              </p>
                            </div>
                          )}
                          
                          <div>
                            <p className="text-gray-600 dark:text-gray-400">Reste à payer</p>
                            <p className="font-medium text-red-600">
                              {formatCurrency(remainingAmount)}
                            </p>
                          </div>

                          {record.dueDate && (
                            <div>
                              <p className="text-gray-600 dark:text-gray-400">Échéance</p>
                              <p className={`font-medium ${isOverdue ? "text-red-600" : "text-gray-900 dark:text-white"}`}>
                                {formatDate(record.dueDate)}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-col sm:flex-row gap-2">
                        <Dialog open={paymentDialogOpen} onOpenChange={setPaymentDialogOpen}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              onClick={() => setSelectedDebt(record)}
                              className="whitespace-nowrap"
                            >
                              <DollarSign className="h-4 w-4 mr-2" />
                              Effectuer un paiement
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle>Effectuer un Paiement</DialogTitle>
                              <DialogDescription>
                                Paiement pour: {selectedDebt?.description}
                              </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                              <form onSubmit={form.handleSubmit(handlePayment)} className="space-y-4">
                                <FormField
                                  control={form.control}
                                  name="amount"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Montant à payer (FCFA)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="25000" 
                                          type="number" 
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="paymentMethod"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Méthode de Paiement</FormLabel>
                                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                                        <FormControl>
                                          <SelectTrigger>
                                            <SelectValue placeholder="Sélectionnez une méthode" />
                                          </SelectTrigger>
                                        </FormControl>
                                        <SelectContent>
                                          <SelectItem value="cash">Espèces</SelectItem>
                                          <SelectItem value="mobile">Mobile Money</SelectItem>
                                          <SelectItem value="card">Carte Bancaire</SelectItem>
                                          <SelectItem value="transfer">Virement</SelectItem>
                                        </SelectContent>
                                      </Select>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <FormField
                                  control={form.control}
                                  name="reference"
                                  render={({ field }) => (
                                    <FormItem>
                                      <FormLabel>Référence (optionnel)</FormLabel>
                                      <FormControl>
                                        <Input 
                                          placeholder="Numéro de transaction"
                                          {...field} 
                                        />
                                      </FormControl>
                                      <FormMessage />
                                    </FormItem>
                                  )}
                                />
                                <div className="flex justify-end space-x-2">
                                  <Button 
                                    type="button" 
                                    variant="outline" 
                                    onClick={() => setPaymentDialogOpen(false)}
                                  >
                                    Annuler
                                  </Button>
                                  <Button 
                                    type="submit" 
                                    disabled={paymentMutation.isPending}
                                  >
                                    {paymentMutation.isPending ? "Traitement..." : "Confirmer le paiement"}
                                  </Button>
                                </div>
                              </form>
                            </Form>
                          </DialogContent>
                        </Dialog>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}

          {displayRecords.filter(record => record.status !== "paid").length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  Aucun crédit en cours
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Vous n'avez actuellement aucun crédit en attente de paiement.
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* History Tab */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Historique Complet</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayRecords.map((record) => (
                  <div key={record.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <div className="flex items-center gap-3">
                      <FileText className="h-5 w-5 text-gray-600 dark:text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900 dark:text-white">
                          {record.description}
                        </p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">
                          {formatDate(record.createdAt)}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        {formatCurrency(parseFloat(record.amount))}
                      </p>
                      <Badge className={`${getStatusColor(record.status)} text-xs`}>
                        {getStatusLabel(record.status)}
                      </Badge>
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
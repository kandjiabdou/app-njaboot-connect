import { 
  Category, Product, User, Store, Order, OrderItem, 
  Sale, LoyaltyPoints, Notification, Inventory 
} from "@shared/schema";

// Categories
export const mockCategories: Category[] = [
  { id: 1, name: "Céréales", description: "Riz, mil, blé et autres céréales" },
  { id: 2, name: "Légumes", description: "Légumes frais du marché local" },
  { id: 3, name: "Fruits", description: "Fruits de saison" },
  { id: 4, name: "Viandes", description: "Viandes fraîches" },
  { id: 5, name: "Poissons", description: "Poissons frais de la côte" },
  { id: 6, name: "Laitiers", description: "Produits laitiers" },
];

// Products
export const mockProducts: Product[] = [
  {
    id: 1,
    name: "Riz Parfumé Premium",
    description: "Riz parfumé de qualité supérieure, sac de 25kg",
    price: "15000.00",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1586201375761-83865001e31c?ixlib=rb-4.0.3",
    unit: "sac",
    isActive: true,
  },
  {
    id: 2,
    name: "Farine de Mil Bio",
    description: "Farine de mil biologique, production locale, 1kg",
    price: "1200.00",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?ixlib=rb-4.0.3",
    unit: "kg",
    isActive: true,
  },
  {
    id: 3,
    name: "Légumes Frais du Jour",
    description: "Assortiment de légumes frais du marché, 2kg",
    price: "2500.00",
    categoryId: 2,
    imageUrl: "https://images.unsplash.com/photo-1540420773420-3366772f4999?ixlib=rb-4.0.3",
    unit: "kg",
    isActive: true,
  },
  {
    id: 4,
    name: "Poisson Thiof Frais",
    description: "Thiof frais de la côte, 1kg",
    price: "4500.00",
    categoryId: 5,
    imageUrl: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?ixlib=rb-4.0.3",
    unit: "kg",
    isActive: true,
  },
  {
    id: 5,
    name: "Mangues de Casamance",
    description: "Mangues sucrées de Casamance, 1kg",
    price: "1800.00",
    categoryId: 3,
    imageUrl: "https://images.unsplash.com/photo-1563829251991-be32a2a8f740?ixlib=rb-4.0.3",
    unit: "kg",
    isActive: true,
  },
  {
    id: 6,
    name: "Viande de Bœuf",
    description: "Viande de bœuf fraîche, qualité supérieure, 1kg",
    price: "6500.00",
    categoryId: 4,
    imageUrl: "https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?ixlib=rb-4.0.3",
    unit: "kg",
    isActive: true,
  },
  {
    id: 7,
    name: "Lait Frais Local",
    description: "Lait frais de vaches locales, 1 litre",
    price: "800.00",
    categoryId: 6,
    imageUrl: "https://images.unsplash.com/photo-1550583724-b2692b85b150?ixlib=rb-4.0.3",
    unit: "litre",
    isActive: true,
  },
  {
    id: 8,
    name: "Huile d'Arachide",
    description: "Huile d'arachide pure, production locale, 1 litre",
    price: "1500.00",
    categoryId: 1,
    imageUrl: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?ixlib=rb-4.0.3",
    unit: "litre",
    isActive: true,
  },
];

// Users
export const mockUsers: User[] = [
  {
    id: 1,
    username: "marie.dubois",
    email: "marie.dubois@njaboot.com",
    password: "hashed_password",
    firstName: "Marie",
    lastName: "Dubois",
    role: "manager",
    phone: "+221 77 123 4567",
    address: "Dakar, Sénégal",
    createdAt: new Date(),
  },
  {
    id: 2,
    username: "amadou.diallo",
    email: "amadou.diallo@email.com",
    password: "hashed_password",
    firstName: "Amadou",
    lastName: "Diallo",
    role: "customer",
    phone: "+221 76 987 6543",
    address: "Plateau, Dakar",
    createdAt: new Date(),
  },
  {
    id: 3,
    username: "fatou.sow",
    email: "fatou.sow@email.com",
    password: "hashed_password",
    firstName: "Fatou",
    lastName: "Sow",
    role: "customer",
    phone: "+221 78 456 7890",
    address: "Almadies, Dakar",
    createdAt: new Date(),
  },
  {
    id: 4,
    username: "ibrahim.kane",
    email: "ibrahim.kane@email.com",
    password: "hashed_password",
    firstName: "Ibrahim",
    lastName: "Kane",
    role: "customer",
    phone: "+221 77 234 5678",
    address: "Ouakam, Dakar",
    createdAt: new Date(),
  },
];

// Stores
export const mockStores: Store[] = [
  {
    id: 1,
    name: "Njaboot Connect Plateau",
    address: "Avenue Léopold Sédar Senghor, Plateau, Dakar",
    managerId: 1,
    phone: "+221 33 123 4567",
    isActive: true,
  },
];

// Sample analytics data
export const mockAnalytics = {
  todayRevenue: 87450,
  totalOrders: 23,
  activeOrders: 8,
  lowStockCount: 5,
  totalCustomers: 156,
  lowStockItems: [
    { id: 1, name: "Riz Parfumé Premium", quantity: 0, minStock: 5 },
    { id: 2, name: "Farine de Mil Bio", quantity: 8, minStock: 10 },
    { id: 8, name: "Huile d'Arachide", quantity: 5, minStock: 8 },
  ],
};

// Sales data for charts
export const mockSalesData = [
  { date: "Lun", sales: 87450, orders: 12 },
  { date: "Mar", sales: 92300, orders: 15 },
  { date: "Mer", sales: 78900, orders: 10 },
  { date: "Jeu", sales: 105600, orders: 18 },
  { date: "Ven", sales: 94200, orders: 14 },
  { date: "Sam", sales: 112800, orders: 20 },
  { date: "Dim", sales: 87450, orders: 13 },
];

// Loyalty points data
export const mockLoyaltyPoints: LoyaltyPoints[] = [
  { id: 1, customerId: 2, points: 1250, level: "bronze" },
  { id: 2, customerId: 3, points: 850, level: "bronze" },
  { id: 3, customerId: 4, points: 2150, level: "silver" },
];

// Sample notifications
export const mockNotifications: Notification[] = [
  {
    id: 1,
    userId: 1,
    title: "Stock faible",
    message: "Le riz parfumé est en rupture de stock",
    type: "warning",
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: 2,
    userId: 1,
    title: "Nouvelle commande",
    message: "Commande #CMD-001 reçue",
    type: "info",
    isRead: false,
    createdAt: new Date(),
  },
  {
    id: 3,
    userId: 2,
    title: "Commande livrée",
    message: "Votre commande #CMD-001 a été livrée",
    type: "success",
    isRead: true,
    createdAt: new Date(),
  },
];

// Order status options
export const orderStatuses = [
  { value: "pending", label: "En attente", color: "yellow" },
  { value: "preparing", label: "En préparation", color: "blue" },
  { value: "ready", label: "Prêt", color: "green" },
  { value: "delivered", label: "Livré", color: "gray" },
  { value: "cancelled", label: "Annulé", color: "red" },
];

// Payment methods
export const paymentMethods = [
  { value: "cash", label: "Espèces", icon: "banknote" },
  { value: "card", label: "Carte bancaire", icon: "credit-card" },
  { value: "mobile", label: "Mobile Money", icon: "smartphone" },
];

// Delivery types
export const deliveryTypes = [
  { value: "pickup", label: "Retrait en magasin", icon: "store" },
  { value: "delivery", label: "Livraison à domicile", icon: "truck" },
];

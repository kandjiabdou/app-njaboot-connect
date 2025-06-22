import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { 
  insertUserSchema, insertOrderSchema, insertOrderItemSchema, 
  insertSaleSchema, insertProductSchema, insertInventorySchema 
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const { email, password } = req.body;
      
      const user = await storage.getUserByEmail(email);
      if (!user) {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }
      
      // In a real app, you'd verify the password hash
      if (password !== "password123") {
        return res.status(401).json({ message: "Email ou mot de passe incorrect" });
      }
      
      // Don't send password in response
      const { password: _, ...userWithoutPassword } = user;
      res.json({ user: userWithoutPassword });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse(req.body);
      
      // Check if user already exists
      const existingUser = await storage.getUserByEmail(userData.email);
      if (existingUser) {
        return res.status(400).json({ message: "Un utilisateur avec cet email existe déjà" });
      }
      
      const user = await storage.createUser(userData);
      
      // Initialize loyalty points for customers
      if (user.role === "customer") {
        await storage.updateLoyaltyPoints(user.id, 0);
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.status(201).json({ user: userWithoutPassword });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // User routes
  app.get("/api/users/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ message: "Utilisateur non trouvé" });
      }
      
      const { password: _, ...userWithoutPassword } = user;
      res.json(userWithoutPassword);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Store routes
  app.get("/api/stores/:managerId", async (req, res) => {
    try {
      const managerId = parseInt(req.params.managerId);
      const store = await storage.getStoreByManagerId(managerId);
      
      if (!store) {
        return res.status(404).json({ message: "Boutique non trouvée" });
      }
      
      res.json(store);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Category routes
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Product routes
  app.get("/api/products", async (req, res) => {
    try {
      const categoryId = req.query.categoryId ? parseInt(req.query.categoryId as string) : undefined;
      
      let products;
      if (categoryId) {
        products = await storage.getProductsByCategory(categoryId);
      } else {
        products = await storage.getProducts();
      }
      
      res.json(products);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/products/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const product = await storage.getProduct(id);
      
      if (!product) {
        return res.status(404).json({ message: "Produit non trouvé" });
      }
      
      res.json(product);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/products", async (req, res) => {
    try {
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct(productData);
      res.status(201).json(product);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Inventory routes
  app.get("/api/inventory/:storeId", async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const inventory = await storage.getInventoryByStore(storeId);
      res.json(inventory);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.put("/api/inventory/:productId/:storeId", async (req, res) => {
    try {
      const productId = parseInt(req.params.productId);
      const storeId = parseInt(req.params.storeId);
      const { quantity } = req.body;
      
      if (typeof quantity !== "number" || quantity < 0) {
        return res.status(400).json({ message: "Quantité invalide" });
      }
      
      const item = await storage.updateInventory(productId, storeId, quantity);
      if (!item) {
        return res.status(404).json({ message: "Article d'inventaire non trouvé" });
      }
      
      res.json(item);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Order routes
  app.get("/api/orders", async (req, res) => {
    try {
      const storeId = req.query.storeId ? parseInt(req.query.storeId as string) : undefined;
      const customerId = req.query.customerId ? parseInt(req.query.customerId as string) : undefined;
      
      let orders;
      if (storeId) {
        orders = await storage.getOrdersByStore(storeId);
      } else if (customerId) {
        orders = await storage.getOrdersByCustomer(customerId);
      } else {
        orders = await storage.getOrders();
      }
      
      res.json(orders);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.get("/api/orders/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const order = await storage.getOrder(id);
      
      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/orders", async (req, res) => {
    try {
      const orderData = insertOrderSchema.parse(req.body);
      const order = await storage.createOrder(orderData);
      
      // Add order items
      const { items } = req.body;
      if (Array.isArray(items)) {
        for (const item of items) {
          const orderItemData = insertOrderItemSchema.parse({
            ...item,
            orderId: order.id
          });
          await storage.createOrderItem(orderItemData);
        }
      }
      
      res.status(201).json(order);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.put("/api/orders/:id/status", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      const validStatuses = ["pending", "preparing", "ready", "delivered", "cancelled"];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: "Statut invalide" });
      }
      
      const order = await storage.updateOrderStatus(id, status);
      if (!order) {
        return res.status(404).json({ message: "Commande non trouvée" });
      }
      
      res.json(order);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Sales routes
  app.get("/api/sales/:storeId", async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      const startDate = req.query.startDate ? new Date(req.query.startDate as string) : undefined;
      const endDate = req.query.endDate ? new Date(req.query.endDate as string) : undefined;
      
      let sales;
      if (startDate && endDate) {
        sales = await storage.getSalesForPeriod(storeId, startDate, endDate);
      } else {
        sales = await storage.getSalesByStore(storeId);
      }
      
      res.json(sales);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.post("/api/sales", async (req, res) => {
    try {
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale(saleData);
      res.status(201).json(sale);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Données invalides", errors: error.errors });
      }
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/dashboard/:storeId", async (req, res) => {
    try {
      const storeId = parseInt(req.params.storeId);
      
      // Get today's sales
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(todayStart.getTime() + 86400000);
      
      const todaySales = await storage.getSalesForPeriod(storeId, todayStart, todayEnd);
      const todayRevenue = todaySales.reduce((sum, sale) => sum + parseFloat(sale.totalAmount!), 0);
      
      // Get orders count
      const orders = await storage.getOrdersByStore(storeId);
      const activeOrders = orders.filter(order => 
        order.status === "pending" || order.status === "preparing"
      ).length;
      
      // Get inventory alerts
      const inventory = await storage.getInventoryByStore(storeId);
      const lowStockItems = inventory.filter(item => item.quantity <= item.minStock!);
      
      // Get total customers (mock)
      const totalCustomers = 156;
      
      res.json({
        todayRevenue,
        totalOrders: orders.length,
        activeOrders,
        lowStockCount: lowStockItems.length,
        totalCustomers,
        lowStockItems: lowStockItems.map(item => ({
          id: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          minStock: item.minStock
        }))
      });
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Loyalty points routes
  app.get("/api/loyalty/:customerId", async (req, res) => {
    try {
      const customerId = parseInt(req.params.customerId);
      const loyalty = await storage.getLoyaltyPoints(customerId);
      
      if (!loyalty) {
        return res.status(404).json({ message: "Points de fidélité non trouvés" });
      }
      
      res.json(loyalty);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  // Notifications routes
  app.get("/api/notifications/:userId", async (req, res) => {
    try {
      const userId = parseInt(req.params.userId);
      const notifications = await storage.getNotificationsByUser(userId);
      res.json(notifications);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  app.put("/api/notifications/:id/read", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const notification = await storage.markNotificationAsRead(id);
      
      if (!notification) {
        return res.status(404).json({ message: "Notification non trouvée" });
      }
      
      res.json(notification);
    } catch (error) {
      res.status(500).json({ message: "Erreur serveur" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

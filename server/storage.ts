import { 
  users, stores, categories, products, inventory, orders, orderItems, 
  sales, loyaltyPoints, notifications, purchasingCenters, centerProducts,
  supplyOrders, supplyOrderItems,
  type User, type InsertUser, type Store, type InsertStore,
  type Category, type InsertCategory, type Product, type InsertProduct,
  type Inventory, type InsertInventory, type Order, type InsertOrder,
  type OrderItem, type InsertOrderItem, type Sale, type InsertSale,
  type LoyaltyPoints, type InsertLoyaltyPoints,
  type Notification, type InsertNotification,
  type PurchasingCenter, type InsertPurchasingCenter,
  type CenterProduct, type InsertCenterProduct,
  type SupplyOrder, type InsertSupplyOrder,
  type SupplyOrderItem, type InsertSupplyOrderItem
} from "@shared/schema";

export interface IStorage {
  // Users
  getUser(id: number): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, user: Partial<InsertUser>): Promise<User | undefined>;
  
  // Stores
  getStore(id: number): Promise<Store | undefined>;
  getStoreByManagerId(managerId: number): Promise<Store | undefined>;
  createStore(store: InsertStore): Promise<Store>;
  getStoresByProduct(productId: number): Promise<Store[]>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  
  // Products
  getProducts(): Promise<Product[]>;
  getProduct(id: number): Promise<Product | undefined>;
  getProductsByCategory(categoryId: number): Promise<Product[]>;
  createProduct(product: InsertProduct): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>): Promise<Product | undefined>;
  
  // Inventory
  getInventoryByStore(storeId: number): Promise<(Inventory & { product: Product })[]>;
  getInventoryItem(productId: number, storeId: number): Promise<Inventory | undefined>;
  updateInventory(productId: number, storeId: number, quantity: number): Promise<Inventory | undefined>;
  createInventoryItem(item: InsertInventory): Promise<Inventory>;
  
  // Orders
  getOrders(): Promise<(Order & { customer: User; store: Store })[]>;
  getOrdersByStore(storeId: number): Promise<(Order & { customer: User })[]>;
  getOrdersByCustomer(customerId: number): Promise<(Order & { store: Store })[]>;
  getOrder(id: number): Promise<(Order & { customer: User; store: Store; items: (OrderItem & { product: Product })[] }) | undefined>;
  createOrder(order: InsertOrder): Promise<Order>;
  updateOrderStatus(id: number, status: string): Promise<Order | undefined>;
  
  // Order Items
  getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]>;
  createOrderItem(item: InsertOrderItem): Promise<OrderItem>;
  
  // Sales
  getSalesByStore(storeId: number): Promise<Sale[]>;
  getSalesForPeriod(storeId: number, startDate: Date, endDate: Date): Promise<Sale[]>;
  createSale(sale: InsertSale): Promise<Sale>;
  
  // Loyalty Points
  getLoyaltyPoints(customerId: number): Promise<LoyaltyPoints | undefined>;
  updateLoyaltyPoints(customerId: number, points: number): Promise<LoyaltyPoints>;
  
  // Notifications
  getNotificationsByUser(userId: number): Promise<Notification[]>;
  createNotification(notification: InsertNotification): Promise<Notification>;
  markNotificationAsRead(id: number): Promise<Notification | undefined>;

  // Purchasing Centers
  getPurchasingCenters(): Promise<PurchasingCenter[]>;
  getPurchasingCenter(id: number): Promise<PurchasingCenter | undefined>;
  createPurchasingCenter(center: InsertPurchasingCenter): Promise<PurchasingCenter>;

  // Center Products
  getCenterProducts(centerId: number): Promise<(CenterProduct & { product: Product })[]>;
  getCenterProduct(centerId: number, productId: number): Promise<CenterProduct | undefined>;
  createCenterProduct(centerProduct: InsertCenterProduct): Promise<CenterProduct>;
  updateCenterProduct(id: number, updates: Partial<InsertCenterProduct>): Promise<CenterProduct | undefined>;

  // Supply Orders
  getSupplyOrders(storeId: number): Promise<(SupplyOrder & { center: PurchasingCenter })[]>;
  getSupplyOrder(id: number): Promise<(SupplyOrder & { center: PurchasingCenter; items: (SupplyOrderItem & { product: Product })[] }) | undefined>;
  createSupplyOrder(order: InsertSupplyOrder): Promise<SupplyOrder>;
  updateSupplyOrderStatus(id: number, status: string, updates?: Partial<InsertSupplyOrder>): Promise<SupplyOrder | undefined>;

  // Supply Order Items
  createSupplyOrderItem(item: InsertSupplyOrderItem): Promise<SupplyOrderItem>;
  getSupplyOrderItems(orderId: number): Promise<(SupplyOrderItem & { product: Product })[]>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User> = new Map();
  private stores: Map<number, Store> = new Map();
  private categories: Map<number, Category> = new Map();
  private products: Map<number, Product> = new Map();
  private inventory: Map<string, Inventory> = new Map(); // key: `${productId}-${storeId}`
  private orders: Map<number, Order> = new Map();
  private orderItems: Map<number, OrderItem[]> = new Map(); // key: orderId
  private sales: Map<number, Sale> = new Map();
  private loyaltyPoints: Map<number, LoyaltyPoints> = new Map(); // key: customerId
  private notifications: Map<number, Notification> = new Map();
  private purchasingCenters: Map<number, PurchasingCenter> = new Map();
  private centerProducts: Map<number, CenterProduct> = new Map();
  private supplyOrders: Map<number, SupplyOrder> = new Map();
  private supplyOrderItems: Map<number, SupplyOrderItem[]> = new Map(); // key: orderId
  
  private currentUserId = 1;
  private currentStoreId = 1;
  private currentCategoryId = 1;
  private currentProductId = 1;
  private currentInventoryId = 1;
  private currentOrderId = 1;
  private currentOrderItemId = 1;
  private currentSaleId = 1;
  private currentLoyaltyId = 1;
  private currentNotificationId = 1;
  private currentPurchasingCenterId = 1;
  private currentCenterProductId = 1;
  private currentSupplyOrderId = 1;
  private currentSupplyOrderItemId = 1;

  constructor() {
    this.initializeData();
  }

  private initializeData() {
    // Initialize with mock data
    this.initializePurchasingCenters();
    
    // Categories
    const categories = [
      { id: 1, name: "Céréales", description: "Riz, mil, blé et autres céréales" },
      { id: 2, name: "Légumes", description: "Légumes frais du marché local" },
      { id: 3, name: "Fruits", description: "Fruits de saison" },
      { id: 4, name: "Viandes", description: "Viandes fraîches" },
      { id: 5, name: "Poissons", description: "Poissons frais de la côte" },
      { id: 6, name: "Laitiers", description: "Produits laitiers" },
    ];
    categories.forEach(cat => this.categories.set(cat.id, cat));
    this.currentCategoryId = 7;

    // Users
    const users = [
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
    ];
    users.forEach(user => this.users.set(user.id, user));
    this.currentUserId = 4;

    // Stores
    const stores = [
      {
        id: 1,
        name: "Njaboot Connect Plateau",
        address: "Avenue Léopold Sédar Senghor, Plateau, Dakar",
        managerId: 1,
        phone: "+221 33 123 4567",
        isActive: true,
      },
    ];
    stores.forEach(store => this.stores.set(store.id, store));
    this.currentStoreId = 2;

    // Products
    const products = [
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
    ];
    products.forEach(product => this.products.set(product.id, product));
    this.currentProductId = 5;

    // Inventory
    const inventoryItems = [
      { productId: 1, storeId: 1, quantity: 0, minStock: 5 },
      { productId: 2, storeId: 1, quantity: 8, minStock: 10 },
      { productId: 3, storeId: 1, quantity: 45, minStock: 20 },
      { productId: 4, storeId: 1, quantity: 12, minStock: 5 },
    ];
    inventoryItems.forEach(item => {
      const key = `${item.productId}-${item.storeId}`;
      this.inventory.set(key, {
        id: this.currentInventoryId++,
        ...item,
        lastUpdated: new Date(),
      });
    });

    // Loyalty Points
    this.loyaltyPoints.set(2, { id: 1, customerId: 2, points: 1250, level: "bronze" });
    this.loyaltyPoints.set(3, { id: 2, customerId: 3, points: 850, level: "bronze" });
    this.currentLoyaltyId = 3;

    // Sample orders
    const sampleOrders = [
      {
        id: 1,
        customerId: 2,
        storeId: 1,
        status: "delivered",
        type: "delivery",
        totalAmount: "15750.00",
        deliveryAddress: "Plateau, Dakar",
        notes: "",
        createdAt: new Date(Date.now() - 86400000), // yesterday
        deliveredAt: new Date(Date.now() - 3600000), // 1 hour ago
      },
      {
        id: 2,
        customerId: 3,
        storeId: 1,
        status: "preparing",
        type: "pickup",
        totalAmount: "8200.00",
        deliveryAddress: null,
        notes: "Appeler à l'arrivée",
        createdAt: new Date(Date.now() - 1800000), // 30 minutes ago
        deliveredAt: null,
      },
    ];
    sampleOrders.forEach(order => this.orders.set(order.id, order));
    this.currentOrderId = 3;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { 
      ...insertUser, 
      id, 
      createdAt: new Date(),
      address: insertUser.address ?? null,
      phone: insertUser.phone ?? null
    };
    this.users.set(id, user);
    return user;
  }

  async updateUser(id: number, updates: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser = { ...user, ...updates };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  // Store methods
  async getStore(id: number): Promise<Store | undefined> {
    return this.stores.get(id);
  }

  async getStoreByManagerId(managerId: number): Promise<Store | undefined> {
    return Array.from(this.stores.values()).find(store => store.managerId === managerId);
  }

  async createStore(insertStore: InsertStore): Promise<Store> {
    const id = this.currentStoreId++;
    const store: Store = { 
      ...insertStore, 
      id,
      managerId: insertStore.managerId ?? null,
      phone: insertStore.phone ?? null,
      isActive: insertStore.isActive ?? null
    };
    this.stores.set(id, store);
    return store;
  }

  async getStoresByProduct(productId: number): Promise<Store[]> {
    const storesWithProduct: Store[] = [];
    
    // Find stores that have this product in inventory
    for (const inventory of this.inventory.values()) {
      if (inventory.productId === productId && inventory.quantity > 0) {
        const store = this.stores.get(inventory.storeId);
        if (store && !storesWithProduct.find(s => s.id === store.id)) {
          storesWithProduct.push(store);
        }
      }
    }
    
    return storesWithProduct;
  }

  // Category methods
  async getCategories(): Promise<Category[]> {
    return Array.from(this.categories.values());
  }

  async createCategory(insertCategory: InsertCategory): Promise<Category> {
    const id = this.currentCategoryId++;
    const category: Category = { 
      ...insertCategory, 
      id,
      description: insertCategory.description ?? null
    };
    this.categories.set(id, category);
    return category;
  }

  // Product methods
  async getProducts(): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.isActive);
  }

  async getProduct(id: number): Promise<Product | undefined> {
    return this.products.get(id);
  }

  async getProductsByCategory(categoryId: number): Promise<Product[]> {
    return Array.from(this.products.values()).filter(p => p.categoryId === categoryId && p.isActive);
  }

  async createProduct(insertProduct: InsertProduct): Promise<Product> {
    const id = this.currentProductId++;
    const product: Product = { 
      ...insertProduct, 
      id,
      isActive: insertProduct.isActive ?? null,
      description: insertProduct.description ?? null,
      categoryId: insertProduct.categoryId ?? null,
      imageUrl: insertProduct.imageUrl ?? null
    };
    this.products.set(id, product);
    return product;
  }

  async updateProduct(id: number, updates: Partial<InsertProduct>): Promise<Product | undefined> {
    const product = this.products.get(id);
    if (!product) return undefined;
    
    const updatedProduct = { ...product, ...updates };
    this.products.set(id, updatedProduct);
    return updatedProduct;
  }

  // Inventory methods
  async getInventoryByStore(storeId: number): Promise<(Inventory & { product: Product })[]> {
    const result: (Inventory & { product: Product })[] = [];
    
    for (const [key, item] of Array.from(this.inventory.entries())) {
      if (item.storeId === storeId) {
        const product = this.products.get(item.productId!);
        if (product) {
          result.push({ ...item, product });
        }
      }
    }
    
    return result;
  }

  async getInventoryItem(productId: number, storeId: number): Promise<Inventory | undefined> {
    const key = `${productId}-${storeId}`;
    return this.inventory.get(key);
  }

  async updateInventory(productId: number, storeId: number, quantity: number): Promise<Inventory | undefined> {
    const key = `${productId}-${storeId}`;
    const item = this.inventory.get(key);
    if (!item) return undefined;
    
    const updatedItem = { ...item, quantity, lastUpdated: new Date() };
    this.inventory.set(key, updatedItem);
    return updatedItem;
  }

  async createInventoryItem(insertItem: InsertInventory): Promise<Inventory> {
    const id = this.currentInventoryId++;
    const item: Inventory = { 
      ...insertItem, 
      id,
      lastUpdated: new Date(),
      productId: insertItem.productId ?? null,
      storeId: insertItem.storeId ?? null,
      minStock: insertItem.minStock ?? null
    };
    const key = `${item.productId}-${item.storeId}`;
    this.inventory.set(key, item);
    return item;
  }

  // Order methods
  async getOrders(): Promise<(Order & { customer: User; store: Store })[]> {
    const result: (Order & { customer: User; store: Store })[] = [];
    
    for (const order of Array.from(this.orders.values())) {
      const customer = this.users.get(order.customerId!);
      const store = this.stores.get(order.storeId!);
      if (customer && store) {
        result.push({ ...order, customer, store });
      }
    }
    
    return result.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getOrdersByStore(storeId: number): Promise<(Order & { customer: User })[]> {
    const result: (Order & { customer: User })[] = [];
    
    for (const order of Array.from(this.orders.values())) {
      if (order.storeId === storeId) {
        const customer = this.users.get(order.customerId!);
        if (customer) {
          result.push({ ...order, customer });
        }
      }
    }
    
    return result.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getOrdersByCustomer(customerId: number): Promise<(Order & { store: Store })[]> {
    const result: (Order & { store: Store })[] = [];
    
    for (const order of Array.from(this.orders.values())) {
      if (order.customerId === customerId) {
        const store = this.stores.get(order.storeId!);
        if (store) {
          result.push({ ...order, store });
        }
      }
    }
    
    return result.sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getOrder(id: number): Promise<(Order & { customer: User; store: Store; items: (OrderItem & { product: Product })[] }) | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const customer = this.users.get(order.customerId!);
    const store = this.stores.get(order.storeId!);
    if (!customer || !store) return undefined;
    
    const items = await this.getOrderItems(id);
    
    return { ...order, customer, store, items };
  }

  async createOrder(insertOrder: InsertOrder): Promise<Order> {
    const id = this.currentOrderId++;
    const order: Order = { 
      ...insertOrder, 
      id,
      createdAt: new Date(),
      deliveredAt: null,
      storeId: insertOrder.storeId ?? null,
      customerId: insertOrder.customerId ?? null,
      deliveryAddress: insertOrder.deliveryAddress ?? null,
      notes: insertOrder.notes ?? null
    };
    this.orders.set(id, order);
    return order;
  }

  async updateOrderStatus(id: number, status: string): Promise<Order | undefined> {
    const order = this.orders.get(id);
    if (!order) return undefined;
    
    const updatedOrder = { 
      ...order, 
      status,
      deliveredAt: status === 'delivered' ? new Date() : order.deliveredAt
    };
    this.orders.set(id, updatedOrder);
    return updatedOrder;
  }

  // Order Item methods
  async getOrderItems(orderId: number): Promise<(OrderItem & { product: Product })[]> {
    const items = this.orderItems.get(orderId) || [];
    const result: (OrderItem & { product: Product })[] = [];
    
    for (const item of items) {
      const product = this.products.get(item.productId!);
      if (product) {
        result.push({ ...item, product });
      }
    }
    
    return result;
  }

  async createOrderItem(insertItem: InsertOrderItem): Promise<OrderItem> {
    const id = this.currentOrderItemId++;
    const item: OrderItem = { 
      ...insertItem, 
      id,
      productId: insertItem.productId ?? null,
      orderId: insertItem.orderId ?? null
    };
    
    const existingItems = this.orderItems.get(item.orderId!) || [];
    existingItems.push(item);
    this.orderItems.set(item.orderId!, existingItems);
    
    return item;
  }

  // Sales methods
  async getSalesByStore(storeId: number): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .filter(sale => sale.storeId === storeId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async getSalesForPeriod(storeId: number, startDate: Date, endDate: Date): Promise<Sale[]> {
    return Array.from(this.sales.values())
      .filter(sale => 
        sale.storeId === storeId &&
        sale.createdAt! >= startDate &&
        sale.createdAt! <= endDate
      )
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createSale(insertSale: InsertSale): Promise<Sale> {
    const id = this.currentSaleId++;
    const sale: Sale = { 
      ...insertSale, 
      id,
      createdAt: new Date(),
      managerId: insertSale.managerId ?? null,
      storeId: insertSale.storeId ?? null,
      items: insertSale.items ?? null
    };
    this.sales.set(id, sale);
    return sale;
  }

  // Loyalty Points methods
  async getLoyaltyPoints(customerId: number): Promise<LoyaltyPoints | undefined> {
    return this.loyaltyPoints.get(customerId);
  }

  async updateLoyaltyPoints(customerId: number, points: number): Promise<LoyaltyPoints> {
    const existing = this.loyaltyPoints.get(customerId);
    
    if (existing) {
      const newPoints = existing.points! + points;
      let level = "bronze";
      if (newPoints >= 5000) level = "gold";
      else if (newPoints >= 2000) level = "silver";
      
      const updated = { ...existing, points: newPoints, level };
      this.loyaltyPoints.set(customerId, updated);
      return updated;
    } else {
      const id = this.currentLoyaltyId++;
      const newLoyalty: LoyaltyPoints = {
        id,
        customerId,
        points,
        level: "bronze"
      };
      this.loyaltyPoints.set(customerId, newLoyalty);
      return newLoyalty;
    }
  }

  // Notification methods
  async getNotificationsByUser(userId: number): Promise<Notification[]> {
    return Array.from(this.notifications.values())
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt!.getTime() - a.createdAt!.getTime());
  }

  async createNotification(insertNotification: InsertNotification): Promise<Notification> {
    const id = this.currentNotificationId++;
    const notification: Notification = { 
      ...insertNotification, 
      id,
      createdAt: new Date(),
      userId: insertNotification.userId ?? null,
      isRead: insertNotification.isRead ?? null
    };
    this.notifications.set(id, notification);
    return notification;
  }

  async markNotificationAsRead(id: number): Promise<Notification | undefined> {
    const notification = this.notifications.get(id);
    if (!notification) return undefined;
    
    const updated = { ...notification, read: true };
    this.notifications.set(id, updated);
    return updated;
  }

  // Purchasing Centers
  async getPurchasingCenters(): Promise<PurchasingCenter[]> {
    return Array.from(this.purchasingCenters.values());
  }

  async getPurchasingCenter(id: number): Promise<PurchasingCenter | undefined> {
    return this.purchasingCenters.get(id);
  }

  async createPurchasingCenter(insertCenter: InsertPurchasingCenter): Promise<PurchasingCenter> {
    const center: PurchasingCenter = { 
      id: this.currentPurchasingCenterId++, 
      ...insertCenter,
      createdAt: new Date()
    };
    this.purchasingCenters.set(center.id, center);
    return center;
  }

  // Center Products
  async getCenterProducts(centerId: number): Promise<(CenterProduct & { product: Product })[]> {
    const result: (CenterProduct & { product: Product })[] = [];
    for (const centerProduct of this.centerProducts.values()) {
      if (centerProduct.centerId === centerId) {
        const product = this.products.get(centerProduct.productId);
        if (product) {
          result.push({ ...centerProduct, product });
        }
      }
    }
    return result;
  }

  async getCenterProduct(centerId: number, productId: number): Promise<CenterProduct | undefined> {
    for (const centerProduct of this.centerProducts.values()) {
      if (centerProduct.centerId === centerId && centerProduct.productId === productId) {
        return centerProduct;
      }
    }
    return undefined;
  }

  async createCenterProduct(insertCenterProduct: InsertCenterProduct): Promise<CenterProduct> {
    const centerProduct: CenterProduct = { 
      id: this.currentCenterProductId++, 
      ...insertCenterProduct,
      lastUpdated: new Date()
    };
    this.centerProducts.set(centerProduct.id, centerProduct);
    return centerProduct;
  }

  async updateCenterProduct(id: number, updates: Partial<InsertCenterProduct>): Promise<CenterProduct | undefined> {
    const centerProduct = this.centerProducts.get(id);
    if (!centerProduct) return undefined;
    
    const updated = { ...centerProduct, ...updates, lastUpdated: new Date() };
    this.centerProducts.set(id, updated);
    return updated;
  }

  // Supply Orders
  async getSupplyOrders(storeId: number): Promise<(SupplyOrder & { center: PurchasingCenter })[]> {
    const result: (SupplyOrder & { center: PurchasingCenter })[] = [];
    for (const order of this.supplyOrders.values()) {
      if (order.storeId === storeId) {
        const center = this.purchasingCenters.get(order.centerId);
        if (center) {
          result.push({ ...order, center });
        }
      }
    }
    return result.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  async getSupplyOrder(id: number): Promise<(SupplyOrder & { center: PurchasingCenter; items: (SupplyOrderItem & { product: Product })[] }) | undefined> {
    const order = this.supplyOrders.get(id);
    if (!order) return undefined;

    const center = this.purchasingCenters.get(order.centerId);
    if (!center) return undefined;

    const items = await this.getSupplyOrderItems(id);
    return { ...order, center, items };
  }

  async createSupplyOrder(insertOrder: InsertSupplyOrder): Promise<SupplyOrder> {
    const orderNumber = `SUP-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    const order: SupplyOrder = { 
      id: this.currentSupplyOrderId++,
      orderNumber,
      ...insertOrder,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    this.supplyOrders.set(order.id, order);
    return order;
  }

  async updateSupplyOrderStatus(id: number, status: string, updates?: Partial<InsertSupplyOrder>): Promise<SupplyOrder | undefined> {
    const order = this.supplyOrders.get(id);
    if (!order) return undefined;
    
    const updated = { 
      ...order, 
      status, 
      ...updates,
      updatedAt: new Date() 
    };
    this.supplyOrders.set(id, updated);
    return updated;
  }

  // Supply Order Items
  async createSupplyOrderItem(insertItem: InsertSupplyOrderItem): Promise<SupplyOrderItem> {
    const item: SupplyOrderItem = { 
      id: this.currentSupplyOrderItemId++, 
      ...insertItem,
      createdAt: new Date()
    };
    
    const existingItems = this.supplyOrderItems.get(item.orderId) || [];
    existingItems.push(item);
    this.supplyOrderItems.set(item.orderId, existingItems);
    
    return item;
  }

  async getSupplyOrderItems(orderId: number): Promise<(SupplyOrderItem & { product: Product })[]> {
    const items = this.supplyOrderItems.get(orderId) || [];
    const result: (SupplyOrderItem & { product: Product })[] = [];
    
    for (const item of items) {
      const product = this.products.get(item.productId);
      if (product) {
        result.push({ ...item, product });
      }
    }
    return result;
  }

  private initializePurchasingCenters() {
    // Centrales d'achat
    const centers = [
      {
        id: 1,
        name: "Central D'Achat Plateau",
        address: "Zone Industrielle Plateau, Abidjan",
        city: "Abidjan",
        phone: "+225 20 30 40 50",
        email: "plateau@central-achat.ci",
        specialties: ["Céréales", "Légumes", "Fruits"],
        deliveryZones: ["Plateau", "Cocody", "Marcory"],
        isActive: true,
        createdAt: new Date("2024-01-15")
      },
      {
        id: 2,
        name: "Central D'Achat Treichville",
        address: "Boulevard de Marseille, Treichville",
        city: "Abidjan",
        phone: "+225 21 25 30 35",
        email: "treichville@central-achat.ci",
        specialties: ["Viandes", "Poissons", "Laitiers"],
        deliveryZones: ["Treichville", "Port-Bouët", "Koumassi"],
        isActive: true,
        createdAt: new Date("2024-01-20")
      },
      {
        id: 3,
        name: "Central D'Achat Yopougon",
        address: "Quartier Niangon, Yopougon",
        city: "Abidjan",
        phone: "+225 23 45 67 89",
        email: "yopougon@central-achat.ci",
        specialties: ["Céréales", "Légumes", "Viandes"],
        deliveryZones: ["Yopougon", "Abobo", "Anyama"],
        isActive: true,
        createdAt: new Date("2024-02-01")
      }
    ];
    centers.forEach(center => this.purchasingCenters.set(center.id, center));
    this.currentPurchasingCenterId = 4;

    // Produits des centrales
    const centerProducts = [
      // Central Plateau - Céréales
      { id: 1, centerId: 1, productId: 1, unitPrice: "450.00", minOrderQuantity: 10, stockQuantity: 500, deliveryTime: 2, isAvailable: true, lastUpdated: new Date() },
      // Central Treichville - Riz aussi disponible
      { id: 2, centerId: 2, productId: 1, unitPrice: "470.00", minOrderQuantity: 5, stockQuantity: 200, deliveryTime: 3, isAvailable: true, lastUpdated: new Date() },
      // Central Yopougon - Riz également
      { id: 3, centerId: 3, productId: 1, unitPrice: "440.00", minOrderQuantity: 15, stockQuantity: 800, deliveryTime: 1, isAvailable: true, lastUpdated: new Date() },
    ];
    centerProducts.forEach(cp => this.centerProducts.set(cp.id, cp));
    this.currentCenterProductId = 4;

    // Commandes d'approvisionnement exemple
    const supplyOrders = [
      {
        id: 1,
        orderNumber: "SUP-2024-001",
        storeId: 1,
        centerId: 1,
        status: "delivered",
        totalAmount: "4500.00",
        deliveryDate: new Date("2024-01-25"),
        trackingNumber: "TRK-001-2024",
        notes: "Livraison effectuée avec succès",
        invoiceUrl: "/invoices/SUP-2024-001.pdf",
        createdAt: new Date("2024-01-20"),
        updatedAt: new Date("2024-01-25")
      },
      {
        id: 2,
        orderNumber: "SUP-2024-002",
        storeId: 1,
        centerId: 3,
        status: "shipped",
        totalAmount: "6600.00",
        deliveryDate: new Date("2024-02-05"),
        trackingNumber: "TRK-002-2024",
        notes: "En cours de livraison",
        invoiceUrl: null,
        createdAt: new Date("2024-02-01"),
        updatedAt: new Date("2024-02-03")
      }
    ];
    supplyOrders.forEach(order => this.supplyOrders.set(order.id, order));
    this.currentSupplyOrderId = 3;

    // Articles des commandes
    const orderItems = [
      // Commande 1
      [{ id: 1, orderId: 1, productId: 1, quantity: 10, unitPrice: "450.00", totalPrice: "4500.00", createdAt: new Date("2024-01-20") }],
      // Commande 2
      [{ id: 2, orderId: 2, productId: 1, quantity: 15, unitPrice: "440.00", totalPrice: "6600.00", createdAt: new Date("2024-02-01") }]
    ];
    this.supplyOrderItems.set(1, orderItems[0]);
    this.supplyOrderItems.set(2, orderItems[1]);
    this.currentSupplyOrderItemId = 3;
  }
}

export const storage = new MemStorage();

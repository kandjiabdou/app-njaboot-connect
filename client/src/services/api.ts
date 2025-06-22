import { apiRequest } from "@/lib/queryClient";
import { 
  User, Product, Category, Order, OrderItem, Store, 
  Sale, LoyaltyPoints, Notification, Inventory,
  InsertUser, InsertOrder, InsertProduct, InsertSale 
} from "@shared/schema";

// Auth API
export const authAPI = {
  login: async (email: string, password: string): Promise<{ user: User }> => {
    const response = await apiRequest("POST", "/api/auth/login", { email, password });
    return response.json();
  },

  register: async (userData: InsertUser): Promise<{ user: User }> => {
    const response = await apiRequest("POST", "/api/auth/register", userData);
    return response.json();
  },
};

// Users API
export const usersAPI = {
  getUser: async (id: number): Promise<User> => {
    const response = await apiRequest("GET", `/api/users/${id}`);
    return response.json();
  },

  updateUser: async (id: number, updates: Partial<InsertUser>): Promise<User> => {
    const response = await apiRequest("PUT", `/api/users/${id}`, updates);
    return response.json();
  },
};

// Categories API
export const categoriesAPI = {
  getCategories: async (): Promise<Category[]> => {
    const response = await apiRequest("GET", "/api/categories");
    return response.json();
  },

  createCategory: async (categoryData: { name: string; description?: string }): Promise<Category> => {
    const response = await apiRequest("POST", "/api/categories", categoryData);
    return response.json();
  },
};

// Products API
export const productsAPI = {
  getProducts: async (categoryId?: number): Promise<Product[]> => {
    const url = categoryId ? `/api/products?categoryId=${categoryId}` : "/api/products";
    const response = await apiRequest("GET", url);
    return response.json();
  },

  getProduct: async (id: number): Promise<Product> => {
    const response = await apiRequest("GET", `/api/products/${id}`);
    return response.json();
  },

  createProduct: async (productData: InsertProduct): Promise<Product> => {
    const response = await apiRequest("POST", "/api/products", productData);
    return response.json();
  },

  updateProduct: async (id: number, updates: Partial<InsertProduct>): Promise<Product> => {
    const response = await apiRequest("PUT", `/api/products/${id}`, updates);
    return response.json();
  },
};

// Inventory API
export const inventoryAPI = {
  getInventory: async (storeId: number): Promise<(Inventory & { product: Product })[]> => {
    const response = await apiRequest("GET", `/api/inventory/${storeId}`);
    return response.json();
  },

  updateInventory: async (productId: number, storeId: number, quantity: number): Promise<Inventory> => {
    const response = await apiRequest("PUT", `/api/inventory/${productId}/${storeId}`, { quantity });
    return response.json();
  },
};

// Orders API
export const ordersAPI = {
  getOrders: async (params?: { storeId?: number; customerId?: number }): Promise<Order[]> => {
    let url = "/api/orders";
    if (params?.storeId) {
      url += `?storeId=${params.storeId}`;
    } else if (params?.customerId) {
      url += `?customerId=${params.customerId}`;
    }
    
    const response = await apiRequest("GET", url);
    return response.json();
  },

  getOrder: async (id: number): Promise<Order & { customer: User; store: Store; items: (OrderItem & { product: Product })[] }> => {
    const response = await apiRequest("GET", `/api/orders/${id}`);
    return response.json();
  },

  createOrder: async (orderData: InsertOrder & { items: Omit<OrderItem, 'id' | 'orderId'>[] }): Promise<Order> => {
    const response = await apiRequest("POST", "/api/orders", orderData);
    return response.json();
  },

  updateOrderStatus: async (id: number, status: string): Promise<Order> => {
    const response = await apiRequest("PUT", `/api/orders/${id}/status`, { status });
    return response.json();
  },
};

// Sales API
export const salesAPI = {
  getSales: async (storeId: number, startDate?: Date, endDate?: Date): Promise<Sale[]> => {
    let url = `/api/sales/${storeId}`;
    const params = new URLSearchParams();
    
    if (startDate) params.append("startDate", startDate.toISOString());
    if (endDate) params.append("endDate", endDate.toISOString());
    
    if (params.toString()) {
      url += `?${params.toString()}`;
    }
    
    const response = await apiRequest("GET", url);
    return response.json();
  },

  createSale: async (saleData: InsertSale): Promise<Sale> => {
    const response = await apiRequest("POST", "/api/sales", saleData);
    return response.json();
  },
};

// Analytics API
export const analyticsAPI = {
  getDashboardData: async (storeId: number): Promise<{
    todayRevenue: number;
    totalOrders: number;
    activeOrders: number;
    lowStockCount: number;
    totalCustomers: number;
    lowStockItems: Array<{
      id: number;
      name: string;
      quantity: number;
      minStock: number;
    }>;
  }> => {
    const response = await apiRequest("GET", `/api/analytics/dashboard/${storeId}`);
    return response.json();
  },
};

// Loyalty API
export const loyaltyAPI = {
  getLoyaltyPoints: async (customerId: number): Promise<LoyaltyPoints> => {
    const response = await apiRequest("GET", `/api/loyalty/${customerId}`);
    return response.json();
  },

  updateLoyaltyPoints: async (customerId: number, points: number): Promise<LoyaltyPoints> => {
    const response = await apiRequest("PUT", `/api/loyalty/${customerId}`, { points });
    return response.json();
  },
};

// Notifications API
export const notificationsAPI = {
  getNotifications: async (userId: number): Promise<Notification[]> => {
    const response = await apiRequest("GET", `/api/notifications/${userId}`);
    return response.json();
  },

  markAsRead: async (id: number): Promise<Notification> => {
    const response = await apiRequest("PUT", `/api/notifications/${id}/read`);
    return response.json();
  },

  createNotification: async (notificationData: {
    userId: number;
    title: string;
    message: string;
    type: string;
  }): Promise<Notification> => {
    const response = await apiRequest("POST", "/api/notifications", notificationData);
    return response.json();
  },
};

// Stores API
export const storesAPI = {
  getStore: async (managerId: number): Promise<Store> => {
    const response = await apiRequest("GET", `/api/stores/${managerId}`);
    return response.json();
  },

  getStoreById: async (id: number): Promise<Store> => {
    const response = await apiRequest("GET", `/api/stores/id/${id}`);
    return response.json();
  },

  createStore: async (storeData: {
    name: string;
    address: string;
    managerId: number;
    phone?: string;
  }): Promise<Store> => {
    const response = await apiRequest("POST", "/api/stores", storeData);
    return response.json();
  },
};

// Helper functions for common operations
export const apiHelpers = {
  // Search products by name or description
  searchProducts: async (query: string): Promise<Product[]> => {
    const products = await productsAPI.getProducts();
    return products.filter(product => 
      product.name.toLowerCase().includes(query.toLowerCase()) ||
      product.description?.toLowerCase().includes(query.toLowerCase())
    );
  },

  // Get low stock items for a store
  getLowStockItems: async (storeId: number): Promise<(Inventory & { product: Product })[]> => {
    const inventory = await inventoryAPI.getInventory(storeId);
    return inventory.filter(item => item.quantity <= item.minStock!);
  },

  // Calculate order total
  calculateOrderTotal: (items: Array<{ quantity: number; unitPrice: string }>): number => {
    return items.reduce((total, item) => {
      return total + (item.quantity * parseFloat(item.unitPrice));
    }, 0);
  },

  // Format order for API submission
  formatOrderForSubmission: (orderData: {
    customerId: number;
    storeId: number;
    type: "pickup" | "delivery";
    deliveryAddress?: string;
    notes?: string;
    items: Array<{ productId: number; quantity: number; unitPrice: string }>;
  }) => {
    const total = apiHelpers.calculateOrderTotal(orderData.items);
    
    return {
      customerId: orderData.customerId,
      storeId: orderData.storeId,
      status: "pending",
      type: orderData.type,
      totalAmount: total.toString(),
      deliveryAddress: orderData.deliveryAddress || null,
      notes: orderData.notes || "",
      items: orderData.items,
    };
  },

  // Get order status badge color
  getOrderStatusColor: (status: string): string => {
    const colors: Record<string, string> = {
      pending: "yellow",
      preparing: "blue",
      ready: "green",
      delivered: "gray",
      cancelled: "red",
    };
    return colors[status] || "gray";
  },
};

// Export all APIs as a single object for easier importing
export const API = {
  auth: authAPI,
  users: usersAPI,
  categories: categoriesAPI,
  products: productsAPI,
  inventory: inventoryAPI,
  orders: ordersAPI,
  sales: salesAPI,
  analytics: analyticsAPI,
  loyalty: loyaltyAPI,
  notifications: notificationsAPI,
  stores: storesAPI,
  helpers: apiHelpers,
};

export default API;

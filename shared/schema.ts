import { pgTable, text, varchar, serial, integer, boolean, timestamp, decimal, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  role: text("role").notNull(), // 'manager' | 'customer'
  phone: text("phone"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const stores = pgTable("stores", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  managerId: integer("manager_id").references(() => users.id),
  phone: text("phone"),
  isActive: boolean("is_active").default(true),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
});

export const products = pgTable("products", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  categoryId: integer("category_id").references(() => categories.id),
  imageUrl: text("image_url"),
  unit: text("unit").notNull(), // 'kg', 'piece', 'liter'
  isActive: boolean("is_active").default(true),
});

export const inventory = pgTable("inventory", {
  id: serial("id").primaryKey(),
  productId: integer("product_id").references(() => products.id),
  storeId: integer("store_id").references(() => stores.id),
  quantity: integer("quantity").notNull(),
  minStock: integer("min_stock").default(10),
  lastUpdated: timestamp("last_updated").defaultNow(),
});

export const orders = pgTable("orders", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => users.id),
  storeId: integer("store_id").references(() => stores.id),
  status: text("status").notNull(), // 'pending', 'preparing', 'ready', 'delivered', 'cancelled'
  type: text("type").notNull(), // 'pickup', 'delivery'
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryAddress: text("delivery_address"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
  deliveredAt: timestamp("delivered_at"),
});

export const orderItems = pgTable("order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").references(() => orders.id),
  productId: integer("product_id").references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
});

export const sales = pgTable("sales", {
  id: serial("id").primaryKey(),
  storeId: integer("store_id").references(() => stores.id),
  managerId: integer("manager_id").references(() => users.id),
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method").notNull(), // 'cash', 'card', 'mobile'
  items: json("items"), // JSON array of sale items
  createdAt: timestamp("created_at").defaultNow(),
});

export const loyaltyPoints = pgTable("loyalty_points", {
  id: serial("id").primaryKey(),
  customerId: integer("customer_id").references(() => users.id),
  points: integer("points").default(0),
  level: text("level").default("bronze"), // 'bronze', 'silver', 'gold'
});

export const notifications = pgTable("notifications", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  title: text("title").notNull(),
  message: text("message").notNull(),
  type: text("type").notNull(), // 'info', 'warning', 'error', 'success'
  isRead: boolean("is_read").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertStoreSchema = createInsertSchema(stores).omit({
  id: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertProductSchema = createInsertSchema(products).omit({
  id: true,
});

export const insertInventorySchema = createInsertSchema(inventory).omit({
  id: true,
  lastUpdated: true,
});

export const insertOrderSchema = createInsertSchema(orders).omit({
  id: true,
  createdAt: true,
  deliveredAt: true,
});

export const insertOrderItemSchema = createInsertSchema(orderItems).omit({
  id: true,
});

export const insertSaleSchema = createInsertSchema(sales).omit({
  id: true,
  createdAt: true,
});

export const insertLoyaltyPointsSchema = createInsertSchema(loyaltyPoints).omit({
  id: true,
});

export const insertNotificationSchema = createInsertSchema(notifications).omit({
  id: true,
  createdAt: true,
});

// Centrales d'achat (entrepôts d'approvisionnement)
export const purchasingCenters = pgTable("purchasing_centers", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  address: text("address").notNull(),
  city: varchar("city", { length: 100 }).notNull(),
  phone: varchar("phone", { length: 20 }),
  email: varchar("email", { length: 255 }),
  specialties: text("specialties").array(), // Spécialités produits
  deliveryZones: text("delivery_zones").array(), // Zones de livraison
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Catalogue des produits disponibles par centrale
export const centerProducts = pgTable("center_products", {
  id: serial("id").primaryKey(),
  centerId: integer("center_id").notNull().references(() => purchasingCenters.id),
  productId: integer("product_id").notNull().references(() => products.id),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  minOrderQuantity: integer("min_order_quantity").default(1).notNull(),
  stockQuantity: integer("stock_quantity").default(0).notNull(),
  deliveryTime: integer("delivery_time_days").default(3).notNull(), // en jours
  isAvailable: boolean("is_available").default(true).notNull(),
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Commandes d'approvisionnement
export const supplyOrders = pgTable("supply_orders", {
  id: serial("id").primaryKey(),
  orderNumber: varchar("order_number", { length: 50 }).notNull().unique(),
  storeId: integer("store_id").notNull().references(() => stores.id),
  centerId: integer("center_id").notNull().references(() => purchasingCenters.id),
  status: varchar("status", { length: 50 }).default("pending").notNull(), // pending, confirmed, shipped, delivered, cancelled
  totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
  deliveryDate: timestamp("delivery_date"),
  trackingNumber: varchar("tracking_number", { length: 100 }),
  notes: text("notes"),
  invoiceUrl: varchar("invoice_url", { length: 500 }), // URL de la facture
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Articles des commandes d'approvisionnement
export const supplyOrderItems = pgTable("supply_order_items", {
  id: serial("id").primaryKey(),
  orderId: integer("order_id").notNull().references(() => supplyOrders.id),
  productId: integer("product_id").notNull().references(() => products.id),
  quantity: integer("quantity").notNull(),
  unitPrice: decimal("unit_price", { precision: 10, scale: 2 }).notNull(),
  totalPrice: decimal("total_price", { precision: 10, scale: 2 }).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertPurchasingCenterSchema = createInsertSchema(purchasingCenters).omit({
  id: true,
  createdAt: true,
});

export const insertCenterProductSchema = createInsertSchema(centerProducts).omit({
  id: true,
  lastUpdated: true,
});

export const insertSupplyOrderSchema = createInsertSchema(supplyOrders).omit({
  id: true,
  orderNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSupplyOrderItemSchema = createInsertSchema(supplyOrderItems).omit({
  id: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Store = typeof stores.$inferSelect;
export type InsertStore = z.infer<typeof insertStoreSchema>;
export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Product = typeof products.$inferSelect;
export type InsertProduct = z.infer<typeof insertProductSchema>;
export type Inventory = typeof inventory.$inferSelect;
export type InsertInventory = z.infer<typeof insertInventorySchema>;
export type Order = typeof orders.$inferSelect;
export type InsertOrder = z.infer<typeof insertOrderSchema>;
export type OrderItem = typeof orderItems.$inferSelect;
export type InsertOrderItem = z.infer<typeof insertOrderItemSchema>;
export type Sale = typeof sales.$inferSelect;
export type InsertSale = z.infer<typeof insertSaleSchema>;
export type LoyaltyPoints = typeof loyaltyPoints.$inferSelect;
export type InsertLoyaltyPoints = z.infer<typeof insertLoyaltyPointsSchema>;
export type Notification = typeof notifications.$inferSelect;
export type InsertNotification = z.infer<typeof insertNotificationSchema>;
export type PurchasingCenter = typeof purchasingCenters.$inferSelect;
export type InsertPurchasingCenter = z.infer<typeof insertPurchasingCenterSchema>;
export type CenterProduct = typeof centerProducts.$inferSelect;
export type InsertCenterProduct = z.infer<typeof insertCenterProductSchema>;
export type SupplyOrder = typeof supplyOrders.$inferSelect;
export type InsertSupplyOrder = z.infer<typeof insertSupplyOrderSchema>;
export type SupplyOrderItem = typeof supplyOrderItems.$inferSelect;
export type InsertSupplyOrderItem = z.infer<typeof insertSupplyOrderItemSchema>;

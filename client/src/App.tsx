import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/contexts/AuthContext";
import { CartProvider } from "@/contexts/CartContext";
import NotFound from "@/pages/not-found";
import Login from "@/pages/auth/Login";
import Register from "@/pages/auth/Register";
import ManagerDashboard from "@/pages/manager/Dashboard";
import ManagerInventory from "@/pages/manager/Inventory";
import ManagerSales from "@/pages/manager/Sales";
import ManagerOrders from "@/pages/manager/Orders";
import ManagerCustomers from "@/pages/manager/Customers";
import ManagerAnalytics from "@/pages/manager/Analytics";
import ManagerSettings from "@/pages/manager/Settings";
import ManagerProfile from "@/pages/manager/Profile";
import SupplyManagement from "@/pages/manager/SupplyManagement";
import CustomerHome from "@/pages/customer/Home";
import CustomerProducts from "@/pages/customer/Products";
import CustomerCart from "@/pages/customer/Cart";
import CustomerProfile from "@/pages/customer/Profile";
import ProductDetail from "@/pages/customer/ProductDetail";
import StoreFinder from "@/pages/customer/StoreFinder";
import StoreDetail from "@/pages/customer/StoreDetail";
import LoyaltyPoints from "@/pages/customer/LoyaltyPoints";
import DebtTracking from "@/pages/customer/DebtTracking";
import UnifiedNavbar from "@/components/layout/UnifiedNavbar";

function Router() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <UnifiedNavbar />
      <main>
        <Switch>
          <Route path="/" component={CustomerHome} />
          <Route path="/login" component={Login} />
          <Route path="/register" component={Register} />
      
      {/* Manager routes */}
      <Route path="/manager" component={ManagerDashboard} />
      <Route path="/manager/dashboard" component={ManagerDashboard} />
      <Route path="/manager/inventory" component={ManagerInventory} />
      <Route path="/manager/sales" component={ManagerSales} />
      <Route path="/manager/orders" component={ManagerOrders} />
      <Route path="/manager/customers" component={ManagerCustomers} />
      <Route path="/manager/analytics" component={ManagerAnalytics} />
      <Route path="/manager/settings" component={ManagerSettings} />
      <Route path="/manager/profile" component={ManagerProfile} />
      <Route path="/manager/supply" component={SupplyManagement} />
      
      {/* Customer routes */}
      <Route path="/shop" component={CustomerHome} />
      <Route path="/products" component={CustomerProducts} />
      <Route path="/stores" component={StoreFinder} />
      <Route path="/store/:id" component={StoreDetail} />
      <Route path="/loyalty" component={LoyaltyPoints} />
      <Route path="/debt" component={DebtTracking} />
      <Route path="/cart" component={CustomerCart} />
      <Route path="/profile" component={CustomerProfile} />
      <Route path="/product/:id" component={ProductDetail} />
      
          {/* Fallback to 404 */}
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <CartProvider>
            <Toaster />
            <Router />
          </CartProvider>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

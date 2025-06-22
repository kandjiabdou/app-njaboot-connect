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
import CustomerHome from "@/pages/customer/Home";
import CustomerProducts from "@/pages/customer/Products";
import CustomerCart from "@/pages/customer/Cart";
import CustomerProfile from "@/pages/customer/Profile";

function Router() {
  return (
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
      
      {/* Customer routes */}
      <Route path="/shop" component={CustomerHome} />
      <Route path="/products" component={CustomerProducts} />
      <Route path="/cart" component={CustomerCart} />
      <Route path="/profile" component={CustomerProfile} />
      
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
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

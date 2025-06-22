import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { useCart } from "@/hooks/use-cart";
import { 
  Store, Bell, ShoppingCart, User, LogOut, Settings, Menu,
  BarChart3, Package, Users, TrendingUp, ShoppingBag, Cog
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeView, setActiveView] = useState<"manager" | "customer">(
    user?.role === "manager" ? "manager" : "customer"
  );

  const handleViewSwitch = (view: "manager" | "customer") => {
    setActiveView(view);
    if (view === "manager") {
      setLocation("/manager/dashboard");
    } else {
      setLocation("/");
    }
    setMobileMenuOpen(false);
  };

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const managerLinks = [
    { href: "/manager/dashboard", label: "Tableau de Bord", icon: BarChart3 },
    { href: "/manager/inventory", label: "Inventaire", icon: Package },
    { href: "/manager/orders", label: "Commandes", icon: ShoppingBag },
    { href: "/manager/customers", label: "Clients", icon: Users },
    { href: "/manager/sales", label: "Ventes", icon: TrendingUp },
    { href: "/manager/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/manager/settings", label: "Paramètres", icon: Cog },
  ];

  const customerLinks = [
    { href: "/", label: "Accueil", icon: Store },
    { href: "/products", label: "Produits", icon: Package },
    { href: "/cart", label: "Panier", icon: ShoppingCart },
  ];

  if (!user) {
    return (
      <nav className="bg-white dark:bg-gray-900 shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <Link href="/">
                <div className="flex-shrink-0 flex items-center">
                  <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                    <Store className="h-5 w-5 text-white" />
                  </div>
                  <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                    Njaboot Connect
                  </span>
                </div>
              </Link>
            </div>
            
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost">Connexion</Button>
              </Link>
              <Link href="/register">
                <Button>Inscription</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/">
              <div className="flex-shrink-0 flex items-center">
                <div className="h-8 w-8 bg-primary rounded-lg flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900 dark:text-white">
                  Njaboot Connect
                </span>
              </div>
            </Link>
          </div>
          
          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="h-5 w-5" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="left" className="w-80">
                  <div className="space-y-6">
                    {/* Mobile View Toggle for managers */}
                    {user.role === "manager" && (
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Mode d'affichage</h3>
                        <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                          <Button
                            variant={activeView === "manager" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleViewSwitch("manager")}
                            className="text-xs flex-1"
                          >
                            Gérant
                          </Button>
                          <Button
                            variant={activeView === "customer" ? "default" : "ghost"}
                            size="sm"
                            onClick={() => handleViewSwitch("customer")}
                            className="text-xs flex-1"
                          >
                            Client
                          </Button>
                        </div>
                      </div>
                    )}

                    {/* Mobile Navigation Links */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Navigation</h3>
                      <div className="space-y-1">
                        {activeView === "manager" ? (
                          managerLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.label}
                              </Button>
                            </Link>
                          ))
                        ) : (
                          customerLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                              <Button
                                variant="ghost"
                                className="w-full justify-start"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.label}
                                {link.href === "/cart" && totalItems > 0 && (
                                  <Badge variant="destructive" className="ml-auto">
                                    {totalItems}
                                  </Badge>
                                )}
                              </Button>
                            </Link>
                          ))
                        )}
                      </div>
                    </div>

                    {/* Mobile User Actions */}
                    <div className="space-y-3">
                      <h3 className="text-sm font-medium text-gray-900 dark:text-white">Compte</h3>
                      <div className="space-y-1">
                        <Link href={user.role === "manager" ? "/manager/profile" : "/profile"}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <User className="mr-2 h-4 w-4" />
                            Mon Profil
                          </Button>
                        </Link>
                        <Link href={user.role === "manager" ? "/manager/settings" : "/settings"}>
                          <Button
                            variant="ghost"
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Settings className="mr-2 h-4 w-4" />
                            Paramètres
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          className="w-full justify-start text-red-600"
                          onClick={handleLogout}
                        >
                          <LogOut className="mr-2 h-4 w-4" />
                          Déconnexion
                        </Button>
                      </div>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* Desktop View Toggle for managers */}
            {user.role === "manager" && (
              <div className="hidden md:flex bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
                <Button
                  variant={activeView === "manager" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewSwitch("manager")}
                  className="text-xs"
                >
                  Gérant
                </Button>
                <Button
                  variant={activeView === "customer" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => handleViewSwitch("customer")}
                  className="text-xs"
                >
                  Client
                </Button>
              </div>
            )}
            
            {/* Shopping Cart - only for customer view */}
            {activeView === "customer" && (
              <Link href="/cart">
                <Button variant="ghost" size="icon" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}
            
            {/* Notifications */}
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5" />
              <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
            </Button>
            
            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={`https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=32&h=32&fit=crop&crop=face`} />
                      <AvatarFallback>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      {user.firstName} {user.lastName}
                    </span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "manager" ? "/manager/profile" : "/profile"} className="flex items-center">
                      <User className="mr-2 h-4 w-4" />
                      Mon Profil
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href={user.role === "manager" ? "/manager/settings" : "/settings"} className="flex items-center">
                      <Settings className="mr-2 h-4 w-4" />
                      Paramètres
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Déconnexion
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile User Avatar */}
            <div className="md:hidden">
              <Avatar className="h-8 w-8">
                <AvatarImage src={`https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=32&h=32&fit=crop&crop=face`} />
                <AvatarFallback>
                  {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}

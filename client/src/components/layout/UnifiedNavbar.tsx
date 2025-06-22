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
  BarChart3, Package, Users, TrendingUp, ShoppingBag, Cog, MapPin,
  Star, CreditCard, Home
} from "lucide-react";

export default function UnifiedNavbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const managerLinks = [
    { href: "/manager/dashboard", label: "Tableau de Bord", icon: BarChart3 },
    { href: "/manager/inventory", label: "Inventaire", icon: Package },
    { href: "/manager/sales", label: "Ventes", icon: TrendingUp },
    { href: "/manager/customers", label: "Clients", icon: Users },
    { href: "/manager/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/manager/settings", label: "Paramètres", icon: Cog },
  ];

  const customerLinks = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/products", label: "Produits", icon: Package },
    { href: "/stores", label: "Boutiques", icon: MapPin },
    { href: "/loyalty", label: "Fidélité", icon: Star },
    { href: "/debt", label: "Crédit", icon: CreditCard },
    { href: "/cart", label: "Panier", icon: ShoppingCart },
  ];

  const getCurrentLinks = () => {
    if (!user) return customerLinks;
    
    // Show manager links only when on manager routes
    if (location.startsWith("/manager")) {
      return managerLinks;
    }
    
    // Default to customer links for all other routes
    return customerLinks;
  };

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

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
                <Button variant="ghost">Se connecter</Button>
              </Link>
              <Link href="/register">
                <Button>S'inscrire</Button>
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
          {/* Logo */}
          <div className="flex items-center">
            <Link href={location.startsWith("/manager") ? "/manager/dashboard" : "/"}>
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

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            {getCurrentLinks().map((link) => {
              const Icon = link.icon;
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActiveLink(link.href) ? "default" : "ghost"}
                    size="sm"
                    className="flex items-center gap-2"
                  >
                    <Icon className="h-4 w-4" />
                    {link.label}
                    {link.href === "/cart" && totalItems > 0 && (
                      <Badge variant="secondary" className="ml-1 text-xs">
                        {totalItems}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-4">
            {/* Role Switch Button - Only show for managers */}
            {user.role === "manager" && (
              <div className="hidden md:block">
                {location.startsWith("/manager") ? (
                  <Link href="/">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <ShoppingCart className="h-4 w-4" />
                      Vue Client
                    </Button>
                  </Link>
                ) : (
                  <Link href="/manager/dashboard">
                    <Button variant="outline" size="sm" className="flex items-center gap-2">
                      <BarChart3 className="h-4 w-4" />
                      Vue Gérant
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Cart (desktop only) - Show for all users when not on manager routes */}
            {!location.startsWith("/manager") && (
              <Link href="/cart" className="hidden md:block">
                <Button variant="ghost" size="sm" className="relative">
                  <ShoppingCart className="h-5 w-5" />
                  {totalItems > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="sm">
              <Bell className="h-5 w-5" />
            </Button>

            {/* User menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="" alt={user.firstName} />
                    <AvatarFallback>
                      {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex items-center justify-start gap-2 p-2">
                  <div className="flex flex-col space-y-1 leading-none">
                    <p className="font-medium">{user.firstName} {user.lastName}</p>
                    <p className="w-[200px] truncate text-sm text-muted-foreground">
                      {user.email}
                    </p>
                  </div>
                </div>
                <DropdownMenuSeparator />
                
                {/* Role Switch in Mobile Menu - Only show for managers */}
                {user.role === "manager" && (
                  <div className="md:hidden">
                    {location.startsWith("/manager") ? (
                      <Link href="/">
                        <DropdownMenuItem>
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          <span>Vue Client</span>
                        </DropdownMenuItem>
                      </Link>
                    ) : (
                      <Link href="/manager/dashboard">
                        <DropdownMenuItem>
                          <BarChart3 className="mr-2 h-4 w-4" />
                          <span>Vue Gérant</span>
                        </DropdownMenuItem>
                      </Link>
                    )}
                    <DropdownMenuSeparator />
                  </div>
                )}
                
                <Link href="/profile">
                  <DropdownMenuItem>
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </DropdownMenuItem>
                </Link>
                {location.startsWith("/manager") && (
                  <Link href="/manager/settings">
                    <DropdownMenuItem>
                      <Settings className="mr-2 h-4 w-4" />
                      <span>Paramètres</span>
                    </DropdownMenuItem>
                  </Link>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu button */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80">
                <div className="flex flex-col space-y-4 mt-4">
                  {/* User info */}
                  <div className="flex items-center space-x-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src="" alt={user.firstName} />
                      <AvatarFallback>
                        {user.firstName.charAt(0)}{user.lastName.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <p className="font-medium">{user.firstName} {user.lastName}</p>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {user.role === "manager" ? "Gestionnaire" : "Client"}
                      </p>
                    </div>
                  </div>

                  {/* Navigation links */}
                  <div className="space-y-2">
                    {getCurrentLinks().map((link) => {
                      const Icon = link.icon;
                      return (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant={isActiveLink(link.href) ? "default" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {link.label}
                            {link.href === "/cart" && totalItems > 0 && (
                              <Badge variant="secondary" className="ml-auto">
                                {totalItems}
                              </Badge>
                            )}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>

                  <div className="border-t pt-4 space-y-2">
                    <Link href="/profile">
                      <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Button>
                    </Link>
                    {location.startsWith("/manager") && (
                      <Link href="/manager/settings">
                        <Button variant="ghost" className="w-full justify-start" onClick={() => setMobileMenuOpen(false)}>
                          <Settings className="mr-2 h-4 w-4" />
                          Paramètres
                        </Button>
                      </Link>
                    )}
                    <Button 
                      variant="ghost" 
                      className="w-full justify-start text-red-600 hover:text-red-700" 
                      onClick={handleLogout}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      Se déconnecter
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
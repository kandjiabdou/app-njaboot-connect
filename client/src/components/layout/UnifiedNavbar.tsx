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
import { useThemeClasses } from "@/lib/theme";
import { 
  Store, Bell, ShoppingCart, User, LogOut, Settings, Menu,
  BarChart3, Package, Users, TrendingUp, ShoppingBag, Cog, MapPin,
  Star, CreditCard, Home, Truck
} from "lucide-react";

export default function UnifiedNavbar() {
  const { user, logout } = useAuth();
  const { totalItems } = useCart();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { navbar } = useThemeClasses(user?.role || 'customer');

  const handleLogout = () => {
    logout();
    setLocation("/login");
  };

  const managerLinks = [
    { href: "/manager", label: "Tableau", icon: BarChart3 },
    { href: "/manager/orders", label: "Commandes", icon: ShoppingBag },
    { href: "/manager/inventory", label: "Inventaire", icon: Package },
    { href: "/manager/supply", label: "Appro", icon: Truck },
    { href: "/manager/sales", label: "Ventes", icon: TrendingUp },
    { href: "/manager/customers", label: "Clients", icon: Users },
    { href: "/manager/analytics", label: "Analyses", icon: BarChart3 },
  ];

  const customerLinks = [
    { href: "/", label: "Accueil", icon: Home },
    { href: "/products", label: "Produits", icon: Package },
    { href: "/stores", label: "Boutiques", icon: MapPin },
    { href: "/loyalty", label: "Fidélité", icon: Star },
    { href: "/debt", label: "Crédit", icon: CreditCard },
  ];

  const getCurrentLinks = () => {
    if (!user) return [];
    console.log('Current user:', user, 'Role:', user.role);
    console.log('Is manager?', user.role === "manager");
    console.log('Will show links:', user.role === "manager" ? 'manager' : 'customer');
    return user.role === "manager" ? managerLinks : customerLinks;
  };

  const isActiveLink = (href: string) => {
    if (href === "/" && location === "/") return true;
    if (href !== "/" && location.startsWith(href)) return true;
    return false;
  };

  // Guest navbar
  if (!user) {
    return (
      <nav className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-6 xl:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/">
              <div className="flex items-center">
                <div className="h-8 w-8 bg-[#258C42] rounded-lg flex items-center justify-center">
                  <Store className="h-5 w-5 text-white" />
                </div>
                <span className="ml-2 text-xl font-bold text-gray-900">Njaboot Connect</span>
              </div>
            </Link>
            <div className="flex items-center space-x-4">
              <Link href="/login">
                <Button variant="ghost" className="text-black hover:bg-black/10">Se connecter</Button>
              </Link>
              <Link href="/register">
                <Button className="bg-[#258C42] text-white hover:bg-[#1F7A37]">S'inscrire</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>
    );
  }

  return (
    <nav className={navbar.navbar}>
      <div className="max-w-7xl mx-auto px-2 sm:px-4 lg:px-8">
        <div className="flex justify-between items-center h-16 gap-4">
          {/* Logo */}
          <div className="flex items-center flex-shrink-0">
            <Link href={location.startsWith("/manager") ? "/manager" : "/"}>
              <div className="flex items-center">
                <div className="h-6 w-6 lg:h-8 lg:w-8 bg-[#258C42] rounded-lg flex items-center justify-center">
                  <Store className="h-3 w-3 lg:h-5 lg:w-5 text-white" />
                </div>
                <span className={`ml-1 lg:ml-2 text-sm lg:text-xl font-bold whitespace-nowrap ${navbar.logo}`}>
                  <span className="hidden sm:inline">Njaboot Connect</span>
                  <span className="sm:hidden">Njaboot</span>
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation - Large screens (LG and up) */}
          <div className="hidden lg:flex items-center space-x-2 flex-1 justify-center mx-3">
            {getCurrentLinks().map((link) => {
              const Icon = link.icon;
              const isActive = isActiveLink(link.href);
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center gap-1 lg:gap-2 px-2 lg:px-3 text-xs lg:text-sm whitespace-nowrap ${
                      isActive 
                        ? navbar.navTextActive 
                        : `${navbar.navText} ${navbar.navHover}`
                    }`}
                  >
                    <Icon className="h-3 w-3 lg:h-4 lg:w-4 flex-shrink-0" />
                    <span>{link.label}</span>
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Desktop Navigation - Medium screens (MD to LG) - Icons only */}
          <div className="hidden md:flex lg:hidden items-center space-x-1 flex-1 justify-center mx-2">
            {getCurrentLinks().map((link) => {
              const Icon = link.icon;
              const isActive = isActiveLink(link.href);
              return (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant="ghost"
                    size="sm"
                    className={`flex items-center justify-center p-2 ${
                      isActive 
                        ? navbar.navTextActive 
                        : `${navbar.navText} ${navbar.navHover}`
                    }`}
                    title={link.label}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                  </Button>
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-1 lg:space-x-2 flex-shrink-0">
            {/* Role Switch Button - Only show for managers */}
            {user.role === "manager" && (
              <div className="hidden md:block">
                {location.startsWith("/manager") ? (
                  <Link href="/">
                    <Button variant="outline" size="sm" className={`flex items-center gap-1 px-2 text-xs ${navbar.buttonOutline}`}>
                      <ShoppingCart className="h-3 w-3" />
                      <span className="hidden lg:inline">Vue Client</span>
                    </Button>
                  </Link>
                ) : (
                  <Link href="/manager">
                    <Button variant="outline" size="sm" className={`flex items-center gap-1 px-2 text-xs ${navbar.buttonOutline}`}>
                      <BarChart3 className="h-3 w-3" />
                      <span className="hidden lg:inline">Vue Gérant</span>
                    </Button>
                  </Link>
                )}
              </div>
            )}

            {/* Cart (desktop only) - Show for all users when not on manager routes */}
            {!location.startsWith("/manager") && (
              <Link href="/cart" className="hidden md:block">
                <Button variant="ghost" size="sm" className={`relative p-2 ${navbar.buttonGhost}`}>
                  <ShoppingCart className="h-4 w-4" />
                  {totalItems > 0 && (
                    <Badge 
                      variant="destructive" 
                      className="absolute -top-1 -right-1 h-4 w-4 flex items-center justify-center text-xs"
                    >
                      {totalItems}
                    </Badge>
                  )}
                </Button>
              </Link>
            )}

            {/* Notifications */}
            <Button variant="ghost" size="sm" className={`p-2 hidden md:block ${navbar.buttonGhost}`}>
              <Bell className="h-4 w-4" />
            </Button>

            {/* User Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`relative h-8 w-8 rounded-full ${navbar.buttonGhost}`}>
                  <Avatar className="h-8 w-8">
                    <AvatarImage src="/avatars/01.png" alt="@user" />
                    <AvatarFallback>{user.firstName?.[0] || 'U'}</AvatarFallback>
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
                <DropdownMenuItem asChild>
                  <Link href={user.role === "manager" && location.startsWith("/manager") ? "/manager/profile" : "/profile"} className="w-full">
                    <User className="mr-2 h-4 w-4" />
                    <span>Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/settings" className="w-full">
                    <Cog className="mr-2 h-4 w-4" />
                    <span>Paramètres</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Mobile menu */}
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  className={`inline-flex items-center justify-center p-2 rounded-md md:hidden ${navbar.buttonGhost}`}
                  aria-expanded="false"
                >
                  <span className="sr-only">Ouvrir le menu principal</span>
                  <Menu className="block h-5 w-5" aria-hidden="true" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                <div className="flex flex-col space-y-4 mt-4">
                  {/* Navigation Links */}
                  <div className="space-y-1">
                    {getCurrentLinks().map((link) => {
                      const Icon = link.icon;
                      const isActive = isActiveLink(link.href);
                      // Afficher le nom complet dans le menu mobile
                      const fullLabel = link.href === "/manager" ? "Tableau de bord" : 
                                       link.href === "/manager/supply" ? "Approvisionnement" : 
                                       link.label;
                      return (
                        <Link key={link.href} href={link.href}>
                          <Button
                            variant={isActive ? "secondary" : "ghost"}
                            className="w-full justify-start"
                            onClick={() => setMobileMenuOpen(false)}
                          >
                            <Icon className="mr-2 h-4 w-4" />
                            {fullLabel}
                          </Button>
                        </Link>
                      );
                    })}
                  </div>

                  {/* Role Switch Buttons for Managers */}
                  {user.role === "manager" && (
                    <div className="border-t pt-4 space-y-2">
                      <p className="text-sm font-medium text-gray-600 px-3">Vues</p>
                      <Link href="/">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Vue Client
                        </Button>
                      </Link>
                      <Link href="/manager">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <BarChart3 className="mr-2 h-4 w-4" />
                          Vue Gérant
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* Cart for customers */}
                  {!location.startsWith("/manager") && (
                    <div className="border-t pt-4">
                      <Link href="/cart">
                        <Button
                          variant="outline"
                          className="w-full justify-start"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Panier {totalItems > 0 && `(${totalItems})`}
                        </Button>
                      </Link>
                    </div>
                  )}

                  {/* User Actions */}
                  <div className="border-t pt-4 space-y-1">
                    <Link href={user.role === "manager" && location.startsWith("/manager") ? "/manager/profile" : "/profile"}>
                      <Button
                        variant="ghost"
                        className="w-full justify-start"
                        onClick={() => setMobileMenuOpen(false)}
                      >
                        <User className="mr-2 h-4 w-4" />
                        Profil
                      </Button>
                    </Link>
                    <Button
                      variant="ghost"
                      className="w-full justify-start"
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
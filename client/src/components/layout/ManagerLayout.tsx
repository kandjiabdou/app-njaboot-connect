import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/use-auth";
import { 
  Store, Bell, Menu, User, LogOut, Settings,
  BarChart3, Package, Users, TrendingUp, ShoppingBag, Cog
} from "lucide-react";

interface ManagerLayoutProps {
  children: React.ReactNode;
}

export default function ManagerLayout({ children }: ManagerLayoutProps) {
  const { user, logout } = useAuth();
  const [location, setLocation] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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

  const isActivePath = (href: string) => {
    return location === href || (href !== "/manager/dashboard" && location.startsWith(href));
  };

  if (!user || user.role !== "manager") {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              {/* Mobile menu button */}
              <div className="md:hidden mr-4">
                <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
                  <SheetTrigger asChild>
                    <Button variant="ghost" size="icon">
                      <Menu className="h-5 w-5" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <div className="space-y-6">
                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Navigation Manager</h3>
                        <div className="space-y-1">
                          {managerLinks.map((link) => (
                            <Link key={link.href} href={link.href}>
                              <Button
                                variant={isActivePath(link.href) ? "default" : "ghost"}
                                className="w-full justify-start"
                                onClick={() => setMobileMenuOpen(false)}
                              >
                                <link.icon className="mr-2 h-4 w-4" />
                                {link.label}
                              </Button>
                            </Link>
                          ))}
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="text-sm font-medium text-gray-900 dark:text-white">Compte</h3>
                        <div className="space-y-1">
                          <Link href="/manager/profile">
                            <Button
                              variant="ghost"
                              className="w-full justify-start"
                              onClick={() => setMobileMenuOpen(false)}
                            >
                              <User className="mr-2 h-4 w-4" />
                              Mon Profil
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

              <Link href="/manager/dashboard">
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
              {/* Customer view switch */}
              <Link href="/">
                <Button variant="outline" size="sm" className="hidden md:flex">
                  Vue Client
                </Button>
              </Link>
              
              {/* Notifications */}
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-0 right-0 h-2 w-2 bg-red-500 rounded-full"></span>
              </Button>
              
              {/* User Menu */}
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
                      <Link href="/manager/profile" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Mon Profil
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/manager/settings" className="flex items-center">
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
      </header>

      {/* Desktop Navigation */}
      <div className="hidden md:flex">
        <div className="flex-shrink-0 w-64 bg-white dark:bg-gray-800 shadow-sm">
          <nav className="mt-5 px-2">
            <div className="space-y-1">
              {managerLinks.map((link) => (
                <Link key={link.href} href={link.href}>
                  <Button
                    variant={isActivePath(link.href) ? "default" : "ghost"}
                    className="w-full justify-start"
                  >
                    <link.icon className="mr-2 h-4 w-4" />
                    {link.label}
                  </Button>
                </Link>
              ))}
            </div>
          </nav>
        </div>
        
        {/* Main content area */}
        <div className="flex-1">
          <main className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {children}
            </div>
          </main>
        </div>
      </div>

      {/* Mobile content */}
      <div className="md:hidden">
        <main className="py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
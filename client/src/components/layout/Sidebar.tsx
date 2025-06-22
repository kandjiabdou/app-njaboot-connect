import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  LayoutDashboard,
  Package,
  ShoppingCart,
  Receipt,
  Users,
  BarChart3,
  Settings,
  Store,
  Home,
  Search,
  Heart,
  User,
} from "lucide-react";

interface SidebarProps {
  userRole: "manager" | "customer";
  className?: string;
}

const managerNavItems = [
  {
    title: "Tableau de Bord",
    href: "/manager/dashboard",
    icon: LayoutDashboard,
  },
  {
    title: "Inventaire",
    href: "/manager/inventory",
    icon: Package,
    badge: "5",
  },
  {
    title: "Ventes",
    href: "/manager/sales",
    icon: Receipt,
  },
  {
    title: "Commandes",
    href: "/manager/orders",
    icon: ShoppingCart,
    badge: "8",
  },
  {
    title: "Clients",
    href: "/manager/customers",
    icon: Users,
  },
  {
    title: "Analytics",
    href: "/manager/analytics",
    icon: BarChart3,
  },
  {
    title: "Paramètres",
    href: "/manager/settings",
    icon: Settings,
  },
];

const customerNavItems = [
  {
    title: "Accueil",
    href: "/",
    icon: Home,
  },
  {
    title: "Produits",
    href: "/products",
    icon: Search,
  },
  {
    title: "Mes Commandes",
    href: "/orders",
    icon: ShoppingCart,
  },
  {
    title: "Favoris",
    href: "/favorites",
    icon: Heart,
  },
  {
    title: "Mon Profil",
    href: "/profile",
    icon: User,
  },
  {
    title: "Boutiques",
    href: "/stores",
    icon: Store,
  },
];

export default function Sidebar({ userRole, className }: SidebarProps) {
  const [location] = useLocation();
  const navItems = userRole === "manager" ? managerNavItems : customerNavItems;

  return (
    <div className={cn("pb-12 w-64", className)}>
      <div className="space-y-4 py-4">
        <div className="px-3 py-2">
          <h2 className="mb-2 px-4 text-lg font-semibold tracking-tight">
            {userRole === "manager" ? "Gestion" : "Navigation"}
          </h2>
          <div className="space-y-1">
            {navItems.map((item) => {
              const isActive = location === item.href;
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href}>
                  <Button
                    variant={isActive ? "secondary" : "ghost"}
                    className={cn(
                      "w-full justify-start",
                      isActive && "bg-secondary"
                    )}
                  >
                    <Icon className="mr-2 h-4 w-4" />
                    {item.title}
                    {item.badge && (
                      <Badge 
                        variant={isActive ? "default" : "secondary"} 
                        className="ml-auto"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

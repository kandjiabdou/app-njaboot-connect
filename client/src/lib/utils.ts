import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number | string): string {
  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("fr-FR", {
    style: "currency",
    currency: "XOF",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(numAmount).replace("XOF", "FCFA");
}

export function formatDate(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(dateObj);
}

export function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("fr-FR", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(dateObj);
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + "...";
}

export function getStockStatus(quantity: number, minStock: number): {
  status: "high" | "medium" | "low" | "out";
  label: string;
  className: string;
} {
  if (quantity === 0) {
    return {
      status: "out",
      label: "Rupture",
      className: "stock-out",
    };
  } else if (quantity <= minStock) {
    return {
      status: "low",
      label: "Stock Faible",
      className: "stock-low",
    };
  } else if (quantity <= minStock * 2) {
    return {
      status: "medium",
      label: "Stock Moyen",
      className: "stock-medium",
    };
  } else {
    return {
      status: "high",
      label: "En Stock",
      className: "stock-high",
    };
  }
}

export function getOrderStatusLabel(status: string): string {
  const statusLabels: Record<string, string> = {
    pending: "En attente",
    preparing: "En préparation",
    ready: "Prêt",
    delivered: "Livré",
    cancelled: "Annulé",
  };
  return statusLabels[status] || status;
}

export function getOrderStatusClassName(status: string): string {
  const statusClasses: Record<string, string> = {
    pending: "status-pending",
    preparing: "status-preparing",
    ready: "status-ready",
    delivered: "status-delivered",
    cancelled: "status-cancelled",
  };
  return statusClasses[status] || "";
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout;
  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(null, args), wait);
  };
}

export function generateOrderId(): string {
  return `CMD-${String(Date.now()).slice(-6)}`;
}

export function calculateLoyaltyPoints(amount: number): number {
  // 1 point per 100 FCFA spent
  return Math.floor(amount / 100);
}

export function getLoyaltyLevel(points: number): {
  level: string;
  nextLevel: string | null;
  pointsToNext: number;
  benefits: string[];
} {
  if (points >= 5000) {
    return {
      level: "Or",
      nextLevel: null,
      pointsToNext: 0,
      benefits: ["Livraison gratuite", "Réductions exclusives", "Support prioritaire"],
    };
  } else if (points >= 2000) {
    return {
      level: "Argent",
      nextLevel: "Or",
      pointsToNext: 5000 - points,
      benefits: ["Livraison gratuite", "Réductions spéciales"],
    };
  } else {
    return {
      level: "Bronze",
      nextLevel: "Argent",
      pointsToNext: 2000 - points,
      benefits: ["Points de fidélité", "Offres membres"],
    };
  }
}

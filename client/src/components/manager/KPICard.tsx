import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { formatCurrency } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  iconColor?: string;
}

export default function KPICard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend,
  trendValue,
  iconColor = "text-primary",
}: KPICardProps) {
  const getTrendColor = () => {
    switch (trend) {
      case "up":
        return "text-green-600";
      case "down":
        return "text-red-600";
      default:
        return "text-gray-600";
    }
  };

  const formatValue = (val: string | number) => {
    if (typeof val === "number") {
      // If it looks like a price (large number), format as currency
      if (val > 1000) {
        return formatCurrency(val);
      }
      return val.toString();
    }
    return val;
  };

  return (
    <Card className="hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
              {title}
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">
              {formatValue(value)}
            </p>
            {(subtitle || trendValue) && (
              <p className={`text-sm ${trendValue ? getTrendColor() : "text-gray-600 dark:text-gray-400"}`}>
                {trendValue || subtitle}
              </p>
            )}
          </div>
          <div className={`p-3 rounded-lg ${iconColor.includes("primary") ? "bg-primary/10" : 
            iconColor.includes("green") ? "bg-green-100 dark:bg-green-900/20" :
            iconColor.includes("blue") ? "bg-blue-100 dark:bg-blue-900/20" :
            iconColor.includes("red") ? "bg-red-100 dark:bg-red-900/20" :
            iconColor.includes("purple") ? "bg-purple-100 dark:bg-purple-900/20" :
            "bg-gray-100 dark:bg-gray-800"
          }`}>
            <Icon className={`h-6 w-6 ${iconColor}`} />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  titleNp?: string;
  value: number | string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: "default" | "primary" | "accent";
  className?: string;
}

export function StatCard({
  title,
  titleNp,
  value,
  icon: Icon,
  trend,
  variant = "default",
  className,
}: StatCardProps) {
  return (
    <div
      className={cn(
        "bg-card rounded-xl border border-border p-4 transition-all duration-200 hover:shadow-md group",
        variant === "primary" && "border-primary/20 bg-primary/5",
        variant === "accent" && "border-accent/20 bg-accent/5",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-1">
          {titleNp && (
            <p className="text-sm font-medium text-foreground">{titleNp}</p>
          )}
          <p className="text-xs text-muted-foreground">{title}</p>
        </div>
        <div
          className={cn(
            "rounded-lg p-2.5 transition-colors",
            variant === "default" && "bg-secondary group-hover:bg-primary/10",
            variant === "primary" && "bg-primary/10 group-hover:bg-primary/20",
            variant === "accent" && "bg-accent/10 group-hover:bg-accent/20"
          )}
        >
          <Icon
            className={cn(
              "h-5 w-5",
              variant === "default" && "text-primary",
              variant === "primary" && "text-primary",
              variant === "accent" && "text-accent"
            )}
          />
        </div>
      </div>
      <div className="mt-3">
        <p className="text-3xl font-bold text-foreground">
          {typeof value === "number" ? value.toLocaleString("ne-NP") : value}
        </p>
        {trend && (
          <p
            className={cn(
              "mt-1 text-xs",
              trend.value >= 0 ? "text-green-600" : "text-red-600"
            )}
          >
            {trend.value >= 0 ? "↑" : "↓"} {Math.abs(trend.value)}% {trend.label}
          </p>
        )}
      </div>
    </div>
  );
}

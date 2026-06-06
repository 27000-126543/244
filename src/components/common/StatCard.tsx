import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown } from "lucide-react";
import { cn } from "@/utils/format";

interface StatCardProps {
  title: string;
  value: number;
  suffix?: string;
  isPercentage?: boolean;
  trend?: "up" | "down";
  trendValue?: string;
  icon?: React.ReactNode;
  color?: "primary" | "success" | "warning" | "default";
  className?: string;
}

export function StatCard({
  title,
  value,
  suffix = "",
  isPercentage = false,
  trend,
  trendValue,
  icon,
  color = "default",
  className,
}: StatCardProps) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const duration = 800;
    const startTime = performance.now();
    const startValue = displayValue;
    const diff = value - startValue;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      setDisplayValue(Math.round(startValue + diff * easeProgress));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [value]);

  const colorClasses = {
    primary: "from-primary-50 to-primary-100 text-primary-600 border-primary-200",
    success: "from-success-50 to-success-100 text-success-600 border-success-200",
    warning: "from-warning-50 to-warning-100 text-warning-600 border-warning-200",
    default: "from-gray-50 to-gray-100 text-gray-600 border-gray-200",
  };

  const iconBgClasses = {
    primary: "bg-primary-500/10 text-primary-500",
    success: "bg-success-500/10 text-success-500",
    warning: "bg-warning-500/10 text-warning-500",
    default: "bg-gray-500/10 text-gray-500",
  };

  return (
    <div
      className={cn(
        "bg-gradient-to-br rounded-xl p-5 border transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
        colorClasses[color],
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600 mb-2">{title}</p>
          <div className="flex items-baseline gap-1">
            <span className="text-3xl font-bold text-gray-800 animate-number-roll">
              {isPercentage ? displayValue : displayValue.toLocaleString()}
            </span>
            <span className="text-lg text-gray-500">{suffix}</span>
          </div>
          {trend && trendValue && (
            <div className="flex items-center gap-1 mt-2">
              {trend === "up" ? (
                <TrendingUp className="w-4 h-4 text-success-500" />
              ) : (
                <TrendingDown className="w-4 h-4 text-warning-500" />
              )}
              <span
                className={cn(
                  "text-sm font-medium",
                  trend === "up" ? "text-success-600" : "text-warning-600"
                )}
              >
                {trendValue}
              </span>
            </div>
          )}
        </div>
        {icon && (
          <div
            className={cn(
              "p-3 rounded-xl",
              iconBgClasses[color]
            )}
          >
            {icon}
          </div>
        )}
      </div>
    </div>
  );
}

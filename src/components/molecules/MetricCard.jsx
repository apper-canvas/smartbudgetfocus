import React from "react";
import Card from "@/components/atoms/Card";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const MetricCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendValue,
  color = "primary",
  className 
}) => {
  const colorClasses = {
    primary: "text-primary bg-blue-50",
    success: "text-success bg-green-50",
    error: "text-error bg-red-50",
    warning: "text-warning bg-yellow-50"
  };
  
  return (
    <Card className={cn("p-6", className)}>
      <div className="flex items-start justify-between mb-4">
        <div className={cn("p-3 rounded-lg", colorClasses[color])}>
          <ApperIcon name={icon} size={24} className={cn(colorClasses[color].split(" ")[0])} />
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-sm font-medium",
            trend === "up" ? "text-success" : "text-error"
          )}>
            <ApperIcon 
              name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
              size={16} 
            />
            <span>{trendValue}</span>
          </div>
        )}
      </div>
      <h3 className="text-sm font-medium text-slate-600 mb-2">{title}</h3>
      <p className="text-3xl font-bold text-secondary">{value}</p>
    </Card>
  );
};

export default MetricCard;
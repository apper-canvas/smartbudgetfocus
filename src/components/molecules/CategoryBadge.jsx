import React from "react";
import ApperIcon from "@/components/ApperIcon";
import { cn } from "@/utils/cn";

const CategoryBadge = ({ category, icon, color, size = "md" }) => {
  const sizes = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base"
  };
  
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full font-medium",
        sizes[size]
      )}
      style={{ 
        backgroundColor: `${color}20`,
        color: color
      }}
    >
      <ApperIcon name={icon} size={size === "sm" ? 14 : size === "lg" ? 18 : 16} />
      <span>{category}</span>
    </span>
  );
};

export default CategoryBadge;
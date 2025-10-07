import React from "react";
import { cn } from "@/utils/cn";

const Label = React.forwardRef(({ 
  className,
  children,
  required,
  ...props 
}, ref) => {
  return (
    <label
      ref={ref}
      className={cn(
        "block text-sm font-medium text-secondary mb-1.5",
        className
      )}
      {...props}
    >
      {children}
      {required && <span className="text-error ml-1">*</span>}
    </label>
  );
});

Label.displayName = "Label";

export default Label;
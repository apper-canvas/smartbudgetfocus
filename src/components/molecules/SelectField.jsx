import React from "react";
import Label from "@/components/atoms/Label";
import Select from "@/components/atoms/Select";
import { cn } from "@/utils/cn";

const SelectField = ({ 
  label, 
  error, 
  required,
  children,
  className,
  ...props 
}) => {
  return (
    <div className={cn("space-y-1", className)}>
      {label && <Label required={required}>{label}</Label>}
      <Select error={error} {...props}>
        {children}
      </Select>
      {error && (
        <p className="text-sm text-error mt-1">{error}</p>
      )}
    </div>
  );
};

export default SelectField;
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import SelectField from "@/components/molecules/SelectField";
import { toast } from "react-toastify";
import categoryService from "@/services/api/categoryService";

const AVAILABLE_ICONS = [
  "Briefcase", "Laptop", "TrendingUp", "DollarSign", "Gift", "Award",
  "UtensilsCrossed", "Car", "Bus", "Bike", "Plane", "Train",
  "FileText", "CreditCard", "Zap", "Home", "Building",
  "ShoppingBag", "ShoppingCart", "Package", "Tag",
  "Tv", "Film", "Music", "Gamepad2", "Coffee",
  "Heart", "Activity", "Dumbbell", "Pill",
  "Book", "GraduationCap", "Palette", "Camera",
  "Smartphone", "Wifi", "Cloud", "Database",
  "Wrench", "Settings", "Tool", "Scissors",
  "Shirt", "Watch", "Glasses", "Sparkles"
];

const AVAILABLE_COLORS = [
  { name: "Red", value: "#ef4444" },
  { name: "Orange", value: "#f59e0b" },
  { name: "Yellow", value: "#eab308" },
  { name: "Green", value: "#10b981" },
  { name: "Teal", value: "#14b8a6" },
  { name: "Blue", value: "#3b82f6" },
  { name: "Indigo", value: "#6366f1" },
  { name: "Purple", value: "#8b5cf6" },
  { name: "Pink", value: "#ec4899" },
  { name: "Rose", value: "#f43f5e" },
  { name: "Gray", value: "#64748b" },
  { name: "Slate", value: "#475569" }
];

function CategoryModal({ isOpen, onClose, onSuccess, category }) {
  const [formData, setFormData] = useState({
    name: "",
    type: "expense",
    icon: "Circle",
    color: "#3b82f6"
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (category) {
      setFormData({
        name: category.name,
        type: category.type,
        icon: category.icon,
        color: category.color
      });
    } else {
      setFormData({
        name: "",
        type: "expense",
        icon: "Circle",
        color: "#3b82f6"
      });
    }
    setErrors({});
  }, [category, isOpen]);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) {
      newErrors.name = "Category name is required";
    }
    if (!formData.type) {
      newErrors.type = "Category type is required";
    }
    if (!formData.icon) {
      newErrors.icon = "Please select an icon";
    }
    if (!formData.color) {
      newErrors.color = "Please select a color";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast.error("Please fix the form errors");
      return;
    }

    setLoading(true);
    try {
      if (category) {
        await categoryService.update(category.Id, formData);
        toast.success("Category updated successfully");
      } else {
        await categoryService.create(formData);
        toast.success("Category created successfully");
      }
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save category");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <h2 className="text-2xl font-semibold text-gray-900">
              {category ? "Edit Category" : "Add Category"}
            </h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <ApperIcon name="X" size={24} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Category Name */}
            <FormField
              label="Category Name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Groceries, Rent, Salary"
              error={errors.name}
              required
            />

            {/* Category Type */}
            <SelectField
              label="Type"
              name="type"
              value={formData.type}
              onChange={handleChange}
              error={errors.type}
              required
            >
              <option value="expense">Expense</option>
              <option value="income">Income</option>
            </SelectField>

            {/* Icon Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Icon <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-2 max-h-48 overflow-y-auto p-2 border border-gray-200 rounded-lg">
                {AVAILABLE_ICONS.map((iconName) => (
                  <button
                    key={iconName}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, icon: iconName }));
                      if (errors.icon) setErrors(prev => ({ ...prev, icon: "" }));
                    }}
                    className={`
                      w-12 h-12 flex items-center justify-center rounded-lg border-2 transition-all
                      ${formData.icon === iconName
                        ? "border-primary bg-primary/10"
                        : "border-gray-200 hover:border-gray-300"
                      }
                    `}
                  >
                    <ApperIcon
                      name={iconName}
                      size={20}
                      className={formData.icon === iconName ? "text-primary" : "text-gray-600"}
                    />
                  </button>
                ))}
              </div>
              {errors.icon && (
                <p className="text-red-500 text-sm mt-1">{errors.icon}</p>
              )}
            </div>

            {/* Color Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Color <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-12 gap-2">
                {AVAILABLE_COLORS.map((color) => (
                  <button
                    key={color.value}
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, color: color.value }));
                      if (errors.color) setErrors(prev => ({ ...prev, color: "" }));
                    }}
                    className={`
                      w-10 h-10 rounded-lg border-2 transition-all relative
                      ${formData.color === color.value
                        ? "border-gray-900 scale-110"
                        : "border-gray-200 hover:scale-105"
                      }
                    `}
                    style={{ backgroundColor: color.value }}
                    title={color.name}
                  >
                    {formData.color === color.value && (
                      <ApperIcon
                        name="Check"
                        size={16}
                        className="absolute inset-0 m-auto text-white"
                      />
                    )}
                  </button>
                ))}
              </div>
              {errors.color && (
                <p className="text-red-500 text-sm mt-1">{errors.color}</p>
              )}
            </div>

            {/* Preview */}
            <div className="bg-gray-50 rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Preview</p>
              <div className="flex items-center gap-4">
                <div
                  className="w-16 h-16 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${formData.color}20` }}
                >
                  <ApperIcon
                    name={formData.icon}
                    size={32}
                    style={{ color: formData.color }}
                  />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900">
                    {formData.name || "Category Name"}
                  </h3>
                  <p className="text-sm text-gray-500 capitalize">{formData.type}</p>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={loading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" size={20} className="mr-2 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Check" size={20} className="mr-2" />
                    {category ? "Update" : "Create"}
                  </>
                )}
              </Button>
            </div>
          </form>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default CategoryModal;
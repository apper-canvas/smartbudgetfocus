import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import SelectField from "@/components/molecules/SelectField";
import { toast } from "react-toastify";
import budgetService from "@/services/api/budgetService";
import categoryService from "@/services/api/categoryService";
import { format } from "date-fns";

const BudgetModal = ({ isOpen, onClose, onSuccess, budget = null }) => {
const [formData, setFormData] = useState({
    title: "",
    category: "",
    limit: "",
    month: format(new Date(), "yyyy-MM")
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isOpen) {
      loadCategories();
if (budget) {
        setFormData({
          title: budget.title || budget.Name || "",
          category: budget.category_c || budget.category,
          limit: budget.limit.toString(),
          month: budget.month
        });
      } else {
        setFormData({
title: "",
          category: "",
          limit: "",
          month: format(new Date(), "yyyy-MM")
        });
      }
      setErrors({});
    }
  }, [isOpen, budget]);
  
  const loadCategories = async () => {
    try {
      const data = await categoryService.getByType("expense");
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };
  
const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }
    
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }
    
    if (!formData.limit || parseFloat(formData.limit) <= 0) {
      newErrors.limit = "Please enter a valid budget limit";
    }
    
    if (!formData.month) {
      newErrors.month = "Please select a month";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    
    try {
const budgetData = {
        title: formData.title,
        category: formData.category,
        limit: parseFloat(formData.limit),
        month: formData.month
      };
      
      if (budget) {
        await budgetService.update(budget.Id, budgetData);
        toast.success("Budget updated successfully!");
      } else {
        await budgetService.create(budgetData);
        toast.success("Budget created successfully!");
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save budget");
    } finally {
      setLoading(false);
    }
  };
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }));
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.2 }}
          className="bg-white rounded-xl shadow-2xl w-full max-w-md"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-secondary">
                {budget ? "Edit Budget" : "Set Budget"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
<form onSubmit={handleSubmit} className="space-y-4">
              <FormField
                label="Title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="Enter budget title"
                required
              />
              <SelectField
label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={errors.category}
                required
                disabled={!!budget}
              >
                <option value="">Select a category</option>
                {categories.map(cat => (
                  <option key={cat.Id} value={cat.Id}>
                    {cat.name}
                  </option>
                ))}
              </SelectField>
              
              <FormField
                label="Budget Limit"
                name="limit"
                type="number"
                step="0.01"
                value={formData.limit}
                onChange={handleChange}
                error={errors.limit}
                required
                placeholder="0.00"
              />
              
              <FormField
                label="Month"
                name="month"
                type="month"
                value={formData.month}
                onChange={handleChange}
                error={errors.month}
                required
              />
              
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  className="flex-1"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  variant="primary"
                  disabled={loading}
                  className="flex-1"
                >
                  {loading ? "Saving..." : budget ? "Update Budget" : "Set Budget"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default BudgetModal;
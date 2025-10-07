import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import SelectField from "@/components/molecules/SelectField";
import { toast } from "react-toastify";
import transactionService from "@/services/api/transactionService";
import categoryService from "@/services/api/categoryService";

const TransactionModal = ({ isOpen, onClose, onSuccess, transaction = null }) => {
  const [formData, setFormData] = useState({
amount: "",
    type: "expense",
    category: "",
    date: new Date().toISOString().split("T")[0],
    title: "",
    description: ""
  });
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isOpen) {
      loadCategories();
      if (transaction) {
        setFormData({
amount: transaction.amount.toString(),
          type: transaction.type,
          category: transaction.category,
          date: new Date(transaction.date).toISOString().split("T")[0],
          title: transaction.title || "",
          description: transaction.description || ""
        });
      } else {
setFormData({
          amount: "",
          type: "expense",
          category: "",
          date: new Date().toISOString().split("T")[0],
          title: "",
          description: ""
        });
      }
      setErrors({});
    }
  }, [isOpen, transaction]);
  
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      toast.error("Failed to load categories");
    }
  };
  
  const filteredCategories = categories.filter(c => c.type === formData.type);
  
  const validateForm = () => {
    const newErrors = {};
    
if (!formData.title || formData.title.trim() === "") {
      newErrors.title = "Please enter a title";
    }
    if (!formData.amount || parseFloat(formData.amount) <= 0) {
      newErrors.amount = "Please enter a valid amount";
    }
    
    if (!formData.category) {
      newErrors.category = "Please select a category";
    }
    
    if (!formData.date) {
      newErrors.date = "Please select a date";
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
// Find the category ID from the selected category name
      const selectedCategory = categories.find(cat => cat.name === formData.category);
      
      const transactionData = {
        amount: parseFloat(formData.amount),
        type: formData.type,
        category: formData.category,
        categoryId: selectedCategory?.Id, // Add category ID for lookup field
        date: new Date(formData.date).toISOString(),
        title: formData.title,
        description: formData.description
      };
      
      if (transaction) {
        await transactionService.update(transaction.Id, transactionData);
        toast.success("Transaction updated successfully!");
      } else {
        await transactionService.create(transactionData);
        toast.success("Transaction added successfully!");
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save transaction");
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
          className="bg-white rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto"
        >
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-secondary">
                {transaction ? "Edit Transaction" : "Add Transaction"}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="flex gap-4">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: "expense", category: "" }))}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    formData.type === "expense"
                      ? "bg-gradient-to-r from-error to-red-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <ApperIcon name="TrendingDown" size={18} className="inline mr-2" />
                  Expense
                </button>
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, type: "income", category: "" }))}
                  className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                    formData.type === "income"
                      ? "bg-gradient-to-r from-success to-emerald-600 text-white shadow-md"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  <ApperIcon name="TrendingUp" size={18} className="inline mr-2" />
                  Income
                </button>
              </div>
<FormField
                label="Title"
                name="title"
                type="text"
                value={formData.title}
                onChange={handleChange}
                error={errors.title}
                placeholder="Enter transaction title"
                required
              />
              <FormField
                label="Amount"
                name="amount"
                type="number"
                step="0.01"
                value={formData.amount}
                onChange={handleChange}
                error={errors.amount}
                required
                placeholder="0.00"
              />
              
              <SelectField
                label="Category"
                name="category"
                value={formData.category}
                onChange={handleChange}
                error={errors.category}
                required
              >
                <option value="">Select a category</option>
                {filteredCategories.map(cat => (
                  <option key={cat.Id} value={cat.name}>
                    {cat.name}
                  </option>
                ))}
              </SelectField>
              
              <FormField
                label="Date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                error={errors.date}
                required
              />
              
              <div className="space-y-1">
                <label className="block text-sm font-medium text-secondary mb-1.5">
                  Description (Optional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={3}
                  placeholder="Add a note..."
                  className="w-full px-4 py-2.5 bg-white border border-slate-300 rounded-lg text-secondary placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-200 resize-none"
                />
              </div>
              
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
                  {loading ? "Saving..." : transaction ? "Update" : "Add Transaction"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default TransactionModal;
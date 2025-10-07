import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import FormField from "@/components/molecules/FormField";
import { toast } from "react-toastify";
import savingsGoalService from "@/services/api/savingsGoalService";

const GoalModal = ({ isOpen, onClose, onSuccess, goal = null, mode = "create" }) => {
  const [formData, setFormData] = useState({
    name: "",
    targetAmount: "",
    targetDate: "",
    contribution: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  useEffect(() => {
    if (isOpen) {
      if (mode === "contribute" && goal) {
        setFormData({
          name: goal.name,
          targetAmount: goal.targetAmount.toString(),
          targetDate: new Date(goal.targetDate).toISOString().split("T")[0],
          contribution: ""
        });
      } else if (mode === "edit" && goal) {
        setFormData({
          name: goal.name,
          targetAmount: goal.targetAmount.toString(),
          targetDate: new Date(goal.targetDate).toISOString().split("T")[0],
          contribution: ""
        });
      } else {
        setFormData({
          name: "",
          targetAmount: "",
          targetDate: "",
          contribution: ""
        });
      }
      setErrors({});
    }
  }, [isOpen, goal, mode]);
  
  const validateForm = () => {
    const newErrors = {};
    
    if (mode === "contribute") {
      if (!formData.contribution || parseFloat(formData.contribution) <= 0) {
        newErrors.contribution = "Please enter a valid amount";
      }
    } else {
      if (!formData.name.trim()) {
        newErrors.name = "Please enter a goal name";
      }
      
      if (!formData.targetAmount || parseFloat(formData.targetAmount) <= 0) {
        newErrors.targetAmount = "Please enter a valid target amount";
      }
      
      if (!formData.targetDate) {
        newErrors.targetDate = "Please select a target date";
      }
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
      if (mode === "contribute") {
        await savingsGoalService.addContribution(goal.Id, parseFloat(formData.contribution));
        toast.success("Contribution added successfully!");
      } else {
        const goalData = {
          name: formData.name,
          targetAmount: parseFloat(formData.targetAmount),
          targetDate: new Date(formData.targetDate).toISOString()
        };
        
        if (mode === "edit") {
          await savingsGoalService.update(goal.Id, goalData);
          toast.success("Goal updated successfully!");
        } else {
          await savingsGoalService.create(goalData);
          toast.success("Goal created successfully!");
        }
      }
      
      onSuccess();
      onClose();
    } catch (error) {
      toast.error(error.message || "Failed to save goal");
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
  
  const getModalTitle = () => {
    if (mode === "contribute") return "Add Contribution";
    if (mode === "edit") return "Edit Goal";
    return "Create Savings Goal";
  };
  
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
                {getModalTitle()}
              </h2>
              <button
                onClick={onClose}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition-colors duration-200"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              {mode === "contribute" ? (
                <>
                  <div className="bg-slate-50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-slate-600 mb-1">Goal</p>
                    <p className="text-lg font-semibold text-secondary">{formData.name}</p>
                    <p className="text-sm text-slate-600 mt-2">
                      Target: ${formData.targetAmount}
                    </p>
                  </div>
                  
                  <FormField
                    label="Contribution Amount"
                    name="contribution"
                    type="number"
                    step="0.01"
                    value={formData.contribution}
                    onChange={handleChange}
                    error={errors.contribution}
                    required
                    placeholder="0.00"
                  />
                </>
              ) : (
                <>
                  <FormField
                    label="Goal Name"
                    name="name"
                    type="text"
                    value={formData.name}
                    onChange={handleChange}
                    error={errors.name}
                    required
                    placeholder="e.g., Emergency Fund"
                  />
                  
                  <FormField
                    label="Target Amount"
                    name="targetAmount"
                    type="number"
                    step="0.01"
                    value={formData.targetAmount}
                    onChange={handleChange}
                    error={errors.targetAmount}
                    required
                    placeholder="0.00"
                  />
                  
                  <FormField
                    label="Target Date"
                    name="targetDate"
                    type="date"
                    value={formData.targetDate}
                    onChange={handleChange}
                    error={errors.targetDate}
                    required
                  />
                </>
              )}
              
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
                  {loading ? "Saving..." : mode === "contribute" ? "Add Contribution" : mode === "edit" ? "Update Goal" : "Create Goal"}
                </Button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default GoalModal;
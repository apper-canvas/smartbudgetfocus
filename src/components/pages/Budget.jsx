import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import BudgetModal from "@/components/organisms/BudgetModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";
import budgetService from "@/services/api/budgetService";
import transactionService from "@/services/api/transactionService";
import categoryService from "@/services/api/categoryService";

const Budget = () => {
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedBudget, setSelectedBudget] = useState(null);
  const [currentMonth] = useState(format(new Date(), "yyyy-MM"));
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [budgetData, transData, catData] = await Promise.all([
        budgetService.getByMonth(currentMonth),
        transactionService.getAll(),
        categoryService.getAll()
      ]);
const updatedBudgets = budgetData.map(budget => {
        const spent = transData
          .filter(t => 
            t.type === "expense" && 
            t.category === budget.category &&
            format(new Date(t.date), "yyyy-MM") === currentMonth
          )
          .reduce((sum, t) => sum + t.amount, 0);
        
        return { ...budget, spent };
      });
      
      setBudgets(updatedBudgets);
      setCategories(catData);
      
      // Check budget thresholds and trigger notifications
      checkBudgetNotifications(updatedBudgets);
    } catch (err) {
      setError(err.message || "Failed to load budgets");
    } finally {
      setLoading(false);
    }
  }

  function checkBudgetNotifications(budgetList) {
    budgetList.forEach(budget => {
      const percentage = (budget.spent / budget.limit) * 100;
      
      if (percentage >= 100) {
        toast.error(
          <div className="flex items-center gap-2">
            <ApperIcon name="AlertTriangle" size={20} />
            <div>
              <div className="font-semibold">Budget Exceeded!</div>
              <div className="text-sm">{budget.category}: ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</div>
            </div>
          </div>,
          { autoClose: 5000 }
        );
      } else if (percentage >= 80) {
        toast.warning(
          <div className="flex items-center gap-2">
            <ApperIcon name="Bell" size={20} />
            <div>
              <div className="font-semibold">Budget Alert</div>
              <div className="text-sm">{budget.category}: ${budget.spent.toFixed(2)} / ${budget.limit.toFixed(2)}</div>
            </div>
          </div>,
          { autoClose: 4000 }
        );
      }
    });
  };
  
  const handleEdit = (budget) => {
    setSelectedBudget(budget);
    setShowModal(true);
  };
  
  const handleDelete = async (budget) => {
    if (window.confirm("Are you sure you want to delete this budget?")) {
      try {
        await budgetService.delete(budget.Id);
        toast.success("Budget deleted successfully!");
        loadData();
      } catch (err) {
        toast.error(err.message || "Failed to delete budget");
      }
    }
  };
  
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedBudget(null);
  };
  
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.icon : "Circle";
  };
  
  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : "#64748b";
  };
  
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "bg-error";
    if (percentage >= 80) return "bg-warning";
    return "bg-success";
  };
  
  const getProgressStatus = (percentage) => {
    if (percentage >= 100) return { text: "Over Budget", color: "text-error" };
    if (percentage >= 80) return { text: "Near Limit", color: "text-warning" };
    return { text: "On Track", color: "text-success" };
  };
  
  const calculateTotals = () => {
    const totalBudget = budgets.reduce((sum, b) => sum + b.limit, 0);
    const totalSpent = budgets.reduce((sum, b) => sum + b.spent, 0);
    const totalRemaining = totalBudget - totalSpent;
    
    return { totalBudget, totalSpent, totalRemaining };
  };
  
  if (loading) {
    return <Loading message="Loading budgets..." />;
  }
  
  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }
  
  const totals = calculateTotals();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Budget Manager</h1>
          <p className="text-slate-600 mt-1">Track your spending limits and stay on budget</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedBudget(null);
            setShowModal(true);
          }}
          className="shadow-lg"
        >
          <ApperIcon name="Plus" size={20} className="mr-2" />
          Set Budget
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Budget</p>
              <p className="text-3xl font-bold text-primary">${totals.totalBudget.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-lg">
              <ApperIcon name="Wallet" size={28} className="text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Spent</p>
              <p className="text-3xl font-bold text-error">${totals.totalSpent.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-lg">
              <ApperIcon name="TrendingDown" size={28} className="text-error" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Remaining</p>
              <p className={`text-3xl font-bold ${totals.totalRemaining >= 0 ? "text-success" : "text-error"}`}>
                ${Math.abs(totals.totalRemaining).toFixed(2)}
              </p>
            </div>
            <div className={`flex items-center justify-center w-14 h-14 rounded-lg ${
              totals.totalRemaining >= 0 ? "bg-green-100" : "bg-red-100"
            }`}>
              <ApperIcon 
                name={totals.totalRemaining >= 0 ? "CheckCircle" : "AlertCircle"} 
                size={28} 
                className={totals.totalRemaining >= 0 ? "text-success" : "text-error"}
              />
            </div>
          </div>
        </Card>
      </div>
      
      {budgets.length === 0 ? (
        <Empty
          icon="PiggyBank"
          title="No budgets set"
          message="Create your first budget to start tracking your spending limits"
          actionLabel="Set Budget"
          onAction={() => {
            setSelectedBudget(null);
            setShowModal(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {budgets.map(budget => {
            const percentage = (budget.spent / budget.limit) * 100;
            const remaining = budget.limit - budget.spent;
            const status = getProgressStatus(percentage);
            
            return (
              <Card key={budget.Id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div
                      className="flex items-center justify-center w-12 h-12 rounded-lg"
                      style={{ backgroundColor: `${getCategoryColor(budget.category)}20` }}
                    >
                      <ApperIcon
                        name={getCategoryIcon(budget.category)}
                        size={24}
                        style={{ color: getCategoryColor(budget.category) }}
                      />
                    </div>
                    <div>
<h3 className="text-lg font-bold text-secondary">{budget.title || budget.Name || budget.category}</h3>
                      <p className={`text-sm font-medium ${status.color}`}>{status.text}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(budget)}
                      className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <ApperIcon name="Edit" size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(budget)}
                      className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <ApperIcon name="Trash2" size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <div className="flex items-center justify-between text-sm mb-2">
                      <span className="text-slate-600">
                        ${budget.spent.toFixed(2)} of ${budget.limit.toFixed(2)}
                      </span>
                      <span className={`font-semibold ${status.color}`}>
                        {percentage.toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-3 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${getProgressColor(percentage)}`}
                        style={{ width: `${Math.min(percentage, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-sm text-slate-600">Remaining</span>
                    <span className={`text-lg font-bold ${remaining >= 0 ? "text-success" : "text-error"}`}>
                      ${Math.abs(remaining).toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      <BudgetModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={loadData}
        budget={selectedBudget}
      />
    </div>
  );
};

export default Budget;
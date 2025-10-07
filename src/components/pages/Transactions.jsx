import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import TransactionModal from "@/components/organisms/TransactionModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";
import transactionService from "@/services/api/transactionService";
import categoryService from "@/services/api/categoryService";

const Transactions = () => {
  const [transactions, setTransactions] = useState([]);
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({
    search: "",
    type: "all",
    category: "all"
  });
  
  useEffect(() => {
    loadData();
  }, []);
  
  useEffect(() => {
    applyFilters();
  }, [transactions, filters]);
  
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const [transData, catData] = await Promise.all([
        transactionService.getAll(),
        categoryService.getAll()
      ]);
      setTransactions(transData);
      setCategories(catData);
    } catch (err) {
      setError(err.message || "Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };
  
  const applyFilters = () => {
    let filtered = [...transactions];
    
if (filters.search) {
      filtered = filtered.filter(t =>
        (t.title && t.title.toLowerCase().includes(filters.search.toLowerCase())) ||
        t.category.toLowerCase().includes(filters.search.toLowerCase()) ||
        (t.description && t.description.toLowerCase().includes(filters.search.toLowerCase()))
      );
    }
    
    if (filters.type !== "all") {
      filtered = filtered.filter(t => t.type === filters.type);
    }
    
    if (filters.category !== "all") {
      filtered = filtered.filter(t => t.category === filters.category);
    }
    
    setFilteredTransactions(filtered);
  };
  
  const handleFilterChange = (name, value) => {
    setFilters(prev => ({ ...prev, [name]: value }));
  };
  
  const handleEdit = (transaction) => {
    setSelectedTransaction(transaction);
    setShowModal(true);
  };
  
  const handleDelete = async (transaction) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      try {
        await transactionService.delete(transaction.Id);
        toast.success("Transaction deleted successfully!");
        loadData();
      } catch (err) {
        toast.error(err.message || "Failed to delete transaction");
      }
    }
  };
  
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedTransaction(null);
  };
  
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.icon : "Circle";
  };
  
  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : "#64748b";
  };
  
  const calculateTotals = () => {
    const income = filteredTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = filteredTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    return { income, expenses };
  };
  
  if (loading) {
    return <Loading message="Loading transactions..." />;
  }
  
  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }
  
  const totals = calculateTotals();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Transactions</h1>
          <p className="text-slate-600 mt-1">Manage all your income and expenses</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedTransaction(null);
            setShowModal(true);
          }}
          className="shadow-lg"
        >
          <ApperIcon name="Plus" size={20} className="mr-2" />
          Add Transaction
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Income</p>
              <p className="text-3xl font-bold text-success">${totals.income.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-lg">
              <ApperIcon name="TrendingUp" size={28} className="text-success" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Expenses</p>
              <p className="text-3xl font-bold text-error">${totals.expenses.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-red-100 rounded-lg">
              <ApperIcon name="TrendingDown" size={28} className="text-error" />
            </div>
          </div>
        </Card>
      </div>
      
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
          />
          <Select
            value={filters.type}
            onChange={(e) => handleFilterChange("type", e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="income">Income</option>
            <option value="expense">Expense</option>
          </Select>
          <Select
            value={filters.category}
            onChange={(e) => handleFilterChange("category", e.target.value)}
          >
            <option value="all">All Categories</option>
            {categories.map(cat => (
              <option key={cat.Id} value={cat.name}>
                {cat.name}
              </option>
            ))}
          </Select>
        </div>
        
        {filteredTransactions.length === 0 ? (
          <Empty
            icon="Receipt"
            title="No transactions found"
            message="Try adjusting your filters or add a new transaction"
            actionLabel="Add Transaction"
            onAction={() => {
              setSelectedTransaction(null);
              setShowModal(true);
            }}
          />
        ) : (
          <div className="space-y-3">
            {filteredTransactions.map(transaction => (
              <div
                key={transaction.Id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-4 flex-1">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg flex-shrink-0"
                    style={{ backgroundColor: `${getCategoryColor(transaction.category)}20` }}
                  >
                    <ApperIcon
                      name={getCategoryIcon(transaction.category)}
                      size={24}
                      style={{ color: getCategoryColor(transaction.category) }}
                    />
                  </div>
<div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-secondary truncate">{transaction.title || transaction.category}</p>
                      {transaction.title && (
                        <span className="text-xs text-gray-500">• {transaction.category}</span>
                      )}
                      <CategoryBadge
                        category={transaction.type}
                        icon={transaction.type === "income" ? "ArrowUpCircle" : "ArrowDownCircle"}
                        color={transaction.type === "income" ? "#10b981" : "#ef4444"}
                        size="sm"
                      />
                    </div>
                    <p className="text-sm text-slate-600">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </p>
                    {transaction.description && (
                      <p className="text-sm text-slate-500 mt-1 truncate">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <p
                    className={`text-xl font-bold ${
                      transaction.type === "income" ? "text-success" : "text-error"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </p>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <ApperIcon name="Edit" size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(transaction)}
                      className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <ApperIcon name="Trash2" size={18} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
      
      <TransactionModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={loadData}
        transaction={selectedTransaction}
      />
    </div>
  );
};

export default Transactions;
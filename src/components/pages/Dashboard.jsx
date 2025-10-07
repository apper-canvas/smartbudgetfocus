import React, { useEffect, useState } from "react";
import { format } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import MetricCard from "@/components/molecules/MetricCard";
import CategoryBadge from "@/components/molecules/CategoryBadge";
import SpendingChart from "@/components/organisms/SpendingChart";
import TrendChart from "@/components/organisms/TrendChart";
import TransactionModal from "@/components/organisms/TransactionModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import transactionService from "@/services/api/transactionService";
import categoryService from "@/services/api/categoryService";

const Dashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  
  useEffect(() => {
    loadData();
  }, []);
  
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
      setError(err.message || "Failed to load data");
    } finally {
      setLoading(false);
    }
  };
  
  const getCurrentMonthTransactions = () => {
    const now = new Date();
    const currentMonth = format(now, "yyyy-MM");
    return transactions.filter(t => {
      const transMonth = format(new Date(t.date), "yyyy-MM");
      return transMonth === currentMonth;
    });
  };
  
  const calculateMetrics = () => {
    const currentMonthTransactions = getCurrentMonthTransactions();
    
    const income = currentMonthTransactions
      .filter(t => t.type === "income")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const expenses = currentMonthTransactions
      .filter(t => t.type === "expense")
      .reduce((sum, t) => sum + t.amount, 0);
    
    const balance = income - expenses;
    
    return { income, expenses, balance };
  };
  
  const getRecentTransactions = () => {
    return transactions.slice(0, 5);
  };
  
  const getCategoryIcon = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.icon : "Circle";
  };
  
  const getCategoryColor = (categoryName) => {
    const category = categories.find(c => c.name === categoryName);
    return category ? category.color : "#64748b";
  };
  
  if (loading) {
    return <Loading message="Loading dashboard..." />;
  }
  
  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }
  
  const metrics = calculateMetrics();
  const recentTransactions = getRecentTransactions();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Dashboard</h1>
          <p className="text-slate-600 mt-1">Welcome back! Here's your financial overview</p>
        </div>
        <Button
          variant="primary"
          onClick={() => setShowModal(true)}
          className="shadow-lg"
        >
          <ApperIcon name="Plus" size={20} className="mr-2" />
          Add Transaction
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Income"
          value={`$${metrics.income.toFixed(2)}`}
          icon="TrendingUp"
          color="success"
          trend="up"
          trendValue="+12%"
        />
        <MetricCard
          title="Total Expenses"
          value={`$${metrics.expenses.toFixed(2)}`}
          icon="TrendingDown"
          color="error"
          trend="down"
          trendValue="-5%"
        />
        <MetricCard
          title="Net Balance"
          value={`$${metrics.balance.toFixed(2)}`}
          icon="Wallet"
          color={metrics.balance >= 0 ? "success" : "error"}
        />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SpendingChart transactions={getCurrentMonthTransactions()} />
        <TrendChart transactions={transactions} />
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-secondary">Recent Transactions</h2>
          <Button variant="ghost" size="sm">
            View All
            <ApperIcon name="ArrowRight" size={16} className="ml-2" />
          </Button>
        </div>
        
        {recentTransactions.length === 0 ? (
          <div className="text-center py-12 text-slate-500">
            No transactions yet. Add your first transaction to get started!
          </div>
        ) : (
          <div className="space-y-4">
            {recentTransactions.map(transaction => (
              <div
                key={transaction.Id}
                className="flex items-center justify-between p-4 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors duration-200"
              >
                <div className="flex items-center gap-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg"
                    style={{ backgroundColor: `${getCategoryColor(transaction.category)}20` }}
                  >
                    <ApperIcon
                      name={getCategoryIcon(transaction.category)}
                      size={24}
                      style={{ color: getCategoryColor(transaction.category) }}
                    />
                  </div>
                  <div>
                    <p className="font-semibold text-secondary">{transaction.category}</p>
                    <p className="text-sm text-slate-600">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </p>
                    {transaction.description && (
                      <p className="text-sm text-slate-500 mt-1">{transaction.description}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <p
                    className={`text-lg font-bold ${
                      transaction.type === "income" ? "text-success" : "text-error"
                    }`}
                  >
                    {transaction.type === "income" ? "+" : "-"}${transaction.amount.toFixed(2)}
                  </p>
                  <CategoryBadge
                    category={transaction.type}
                    icon={transaction.type === "income" ? "ArrowUpCircle" : "ArrowDownCircle"}
                    color={transaction.type === "income" ? "#10b981" : "#ef4444"}
                    size="sm"
                  />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <TransactionModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={loadData}
      />
    </div>
  );
};

export default Dashboard;
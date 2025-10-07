import React, { useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Select from '@/components/atoms/Select';
import Badge from '@/components/atoms/Badge';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Empty from '@/components/ui/Empty';
import SpendingChart from '@/components/organisms/SpendingChart';
import TrendChart from '@/components/organisms/TrendChart';
import transactionService from '@/services/api/transactionService';
import categoryService from '@/services/api/categoryService';
import budgetService from '@/services/api/budgetService';
import bankAccountService from '@/services/api/bankAccountService';
import { format, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, parseISO } from 'date-fns';

const Reports = () => {
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [budgets, setBudgets] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState('thisMonth');
  const [reportType, setReportType] = useState('incomeVsExpenses');
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  useEffect(() => {
    fetchAllData();
  }, [dateRange, customStartDate, customEndDate]);

  const getDateRange = () => {
    const today = new Date();
    let start, end;

    switch (dateRange) {
      case 'thisMonth':
        start = startOfMonth(today);
        end = endOfMonth(today);
        break;
      case 'lastMonth':
        const lastMonth = subMonths(today, 1);
        start = startOfMonth(lastMonth);
        end = endOfMonth(lastMonth);
        break;
      case 'thisYear':
        start = startOfYear(today);
        end = endOfYear(today);
        break;
      case 'custom':
        if (customStartDate && customEndDate) {
          start = new Date(customStartDate);
          end = new Date(customEndDate);
        } else {
          start = startOfMonth(today);
          end = endOfMonth(today);
        }
        break;
      default:
        start = startOfMonth(today);
        end = endOfMonth(today);
    }

    return {
      start: format(start, 'yyyy-MM-dd'),
      end: format(end, 'yyyy-MM-dd')
    };
  };

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const { start, end } = getDateRange();

      const transactionsParams = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "transaction_date_c" } },
          { field: { Name: "transaction_type_c" } }
        ],
        where: [
          {
            FieldName: "transaction_date_c",
            Operator: "GreaterThanOrEqualTo",
            Values: [start]
          },
          {
            FieldName: "transaction_date_c",
            Operator: "LessThanOrEqualTo",
            Values: [end]
          }
        ],
        orderBy: [{ fieldName: "transaction_date_c", sorttype: "DESC" }],
        pagingInfo: { limit: 1000, offset: 0 }
      };

      const categoriesParams = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "color_c" } }
        ],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const budgetsParams = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "period_c" } }
        ],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const accountsParams = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "account_name_c" } },
          { field: { Name: "account_type_c" } },
          { field: { Name: "current_balance_c" } }
        ],
        pagingInfo: { limit: 100, offset: 0 }
      };

      const [transactionsRes, categoriesRes, budgetsRes, accountsRes] = await Promise.all([
transactionService.getAll(transactionsParams),
        categoryService.fetchRecords(categoriesParams),
        budgetService.fetchRecords(budgetsParams),
        bankAccountService.fetchRecords(accountsParams)
      ]);

      setTransactions(transactionsRes || []);
      setCategories(categoriesRes || []);
      setBudgets(budgetsRes || []);
      setAccounts(accountsRes || []);
    } catch (error) {
      console.error("Error fetching report data:", error?.response?.data?.message || error);
      toast.error("Failed to load report data");
    } finally {
      setLoading(false);
    }
  };

  const calculateTotals = () => {
    const income = transactions
      .filter(t => t.transaction_type_c === 'Income')
      .reduce((sum, t) => sum + (parseFloat(t.amount_c) || 0), 0);

    const expenses = transactions
      .filter(t => t.transaction_type_c === 'Expense')
      .reduce((sum, t) => sum + (parseFloat(t.amount_c) || 0), 0);

    const savings = income - expenses;

    const totalBudget = budgets.reduce((sum, b) => sum + (parseFloat(b.amount_c) || 0), 0);
    const budgetUtilization = totalBudget > 0 ? (expenses / totalBudget) * 100 : 0;

    return { income, expenses, savings, budgetUtilization };
  };

  const getCategoryBreakdown = () => {
    const categoryTotals = {};
    
    transactions
      .filter(t => t.transaction_type_c === 'Expense')
      .forEach(t => {
        const categoryId = t.category_id_c?.Id;
        const categoryName = t.category_id_c?.Name || 'Uncategorized';
        if (!categoryTotals[categoryName]) {
          categoryTotals[categoryName] = 0;
        }
        categoryTotals[categoryName] += parseFloat(t.amount_c) || 0;
      });

    const total = Object.values(categoryTotals).reduce((sum, val) => sum + val, 0);
    
    return Object.entries(categoryTotals).map(([name, amount]) => ({
      name,
      amount,
      percentage: total > 0 ? ((amount / total) * 100).toFixed(1) : 0
    })).sort((a, b) => b.amount - a.amount);
  };

  const getMonthlyTrends = () => {
    const monthlyData = {};

    transactions.forEach(t => {
      if (!t.transaction_date_c) return;
      
      const date = parseISO(t.transaction_date_c);
      const monthKey = format(date, 'yyyy-MM');
      
      if (!monthlyData[monthKey]) {
        monthlyData[monthKey] = { income: 0, expenses: 0 };
      }

      const amount = parseFloat(t.amount_c) || 0;
      if (t.transaction_type_c === 'Income') {
        monthlyData[monthKey].income += amount;
      } else {
        monthlyData[monthKey].expenses += amount;
      }
    });

    return Object.entries(monthlyData)
      .map(([month, data]) => ({
        month: format(parseISO(month + '-01'), 'MMM yyyy'),
        ...data
      }))
      .sort((a, b) => a.month.localeCompare(b.month));
  };

  const getBudgetPerformance = () => {
    const budgetData = budgets.map(budget => {
      const budgetAmount = parseFloat(budget.amount_c) || 0;
      const spent = transactions
        .filter(t => t.transaction_type_c === 'Expense')
        .reduce((sum, t) => sum + (parseFloat(t.amount_c) || 0), 0);
      
      return {
        period: budget.period_c || 'Unknown',
        budgeted: budgetAmount,
        spent: spent,
        remaining: budgetAmount - spent,
        percentage: budgetAmount > 0 ? ((spent / budgetAmount) * 100).toFixed(1) : 0
      };
    });

    return budgetData;
  };

  const renderReportContent = () => {
    switch (reportType) {
      case 'incomeVsExpenses':
        const totals = calculateTotals();
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
                <SpendingChart 
                  categories={['Income', 'Expenses']}
                  data={[totals.income, totals.expenses]}
                />
              </Card>
              <Card className="p-6">
                <h3 className="text-lg font-semibold mb-4">Summary</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Total Income:</span>
                    <span className="text-lg font-bold text-success">${totals.income.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-secondary">Total Expenses:</span>
                    <span className="text-lg font-bold text-error">${totals.expenses.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t">
                    <span className="text-secondary font-semibold">Net Savings:</span>
                    <span className={`text-xl font-bold ${totals.savings >= 0 ? 'text-success' : 'text-error'}`}>
                      ${totals.savings.toFixed(2)}
                    </span>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        );

      case 'categoryBreakdown':
        const breakdown = getCategoryBreakdown();
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Spending by Category</h3>
            {breakdown.length > 0 ? (
              <div className="space-y-4">
                {breakdown.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-medium">{item.name}</span>
                      <span className="text-secondary">${item.amount.toFixed(2)} ({item.percentage}%)</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-primary h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty message="No expense data available for this period" />
            )}
          </Card>
        );

      case 'monthlyTrends':
        const trends = getMonthlyTrends();
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
            {trends.length > 0 ? (
              <TrendChart 
                data={trends.map(t => ({ month: t.month, amount: t.income - t.expenses }))}
              />
            ) : (
              <Empty message="No transaction data available for trend analysis" />
            )}
          </Card>
        );

      case 'budgetPerformance':
        const performance = getBudgetPerformance();
        return (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Budget Performance</h3>
            {performance.length > 0 ? (
              <div className="space-y-6">
                {performance.map((item, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold">{item.period}</span>
                      <Badge variant={item.percentage > 100 ? 'danger' : item.percentage > 80 ? 'warning' : 'success'}>
                        {item.percentage}% Used
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="text-secondary">Budgeted:</span>
                        <p className="font-semibold">${item.budgeted.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-secondary">Spent:</span>
                        <p className="font-semibold text-error">${item.spent.toFixed(2)}</p>
                      </div>
                      <div>
                        <span className="text-secondary">Remaining:</span>
                        <p className={`font-semibold ${item.remaining >= 0 ? 'text-success' : 'text-error'}`}>
                          ${item.remaining.toFixed(2)}
                        </p>
                      </div>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-300 ${
                          item.percentage > 100 ? 'bg-error' : item.percentage > 80 ? 'bg-warning' : 'bg-success'
                        }`}
                        style={{ width: `${Math.min(item.percentage, 100)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <Empty message="No budget data available" />
            )}
          </Card>
        );

      default:
        return null;
    }
  };

  if (loading) {
    return <Loading />;
  }

  const totals = calculateTotals();

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-secondary">Financial Reports</h1>
          <p className="text-sm text-gray-600 mt-1">Analyze your financial data and performance</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Total Income</p>
              <p className="text-2xl font-bold text-success">${totals.income.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-success/10 rounded-full flex items-center justify-center">
              <ApperIcon name="TrendingUp" size={24} className="text-success" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Total Expenses</p>
              <p className="text-2xl font-bold text-error">${totals.expenses.toFixed(2)}</p>
            </div>
            <div className="w-12 h-12 bg-error/10 rounded-full flex items-center justify-center">
              <ApperIcon name="TrendingDown" size={24} className="text-error" />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Net Savings</p>
              <p className={`text-2xl font-bold ${totals.savings >= 0 ? 'text-success' : 'text-error'}`}>
                ${totals.savings.toFixed(2)}
              </p>
            </div>
            <div className={`w-12 h-12 ${totals.savings >= 0 ? 'bg-success/10' : 'bg-error/10'} rounded-full flex items-center justify-center`}>
              <ApperIcon name="DollarSign" size={24} className={totals.savings >= 0 ? 'text-success' : 'text-error'} />
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-secondary">Budget Used</p>
              <p className="text-2xl font-bold text-primary">{totals.budgetUtilization.toFixed(1)}%</p>
            </div>
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
              <ApperIcon name="PieChart" size={24} className="text-primary" />
            </div>
          </div>
        </Card>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Date Range</label>
            <Select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="thisMonth">This Month</option>
              <option value="lastMonth">Last Month</option>
              <option value="thisYear">This Year</option>
              <option value="custom">Custom Range</option>
            </Select>
          </div>

          {dateRange === 'custom' && (
            <>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">Start Date</label>
                <input
                  type="date"
                  value={customStartDate}
                  onChange={(e) => setCustomStartDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary mb-2">End Date</label>
                <input
                  type="date"
                  value={customEndDate}
                  onChange={(e) => setCustomEndDate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary"
                />
              </div>
            </>
          )}

          <div>
            <label className="block text-sm font-medium text-secondary mb-2">Report Type</label>
            <Select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
            >
              <option value="incomeVsExpenses">Income vs Expenses</option>
              <option value="categoryBreakdown">Category Breakdown</option>
              <option value="monthlyTrends">Monthly Trends</option>
              <option value="budgetPerformance">Budget Performance</option>
            </Select>
          </div>
        </div>
      </Card>

      {/* Report Content */}
      {transactions.length > 0 ? (
        renderReportContent()
      ) : (
        <Empty message="No transaction data available for the selected period" />
      )}
    </div>
  );
};

export default Reports;
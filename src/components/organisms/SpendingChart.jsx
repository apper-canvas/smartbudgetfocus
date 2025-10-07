import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import categoryService from "@/services/api/categoryService";

const SpendingChart = ({ transactions }) => {
  const [chartData, setChartData] = useState(null);
  const [categories, setCategories] = useState([]);
  
  useEffect(() => {
    loadCategories();
  }, []);
  
  useEffect(() => {
    if (categories.length > 0 && transactions.length > 0) {
      prepareChartData();
    }
  }, [transactions, categories]);
  
  const loadCategories = async () => {
    try {
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (error) {
      console.error("Failed to load categories:", error);
    }
  };
  
  const prepareChartData = () => {
    const expenses = transactions.filter(t => t.type === "expense");
    
    const categoryTotals = expenses.reduce((acc, transaction) => {
      acc[transaction.category] = (acc[transaction.category] || 0) + transaction.amount;
      return acc;
    }, {});
    
    const sortedCategories = Object.entries(categoryTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 6);
    
    const labels = sortedCategories.map(([category]) => category);
    const values = sortedCategories.map(([, total]) => total);
    
    const colors = labels.map(label => {
      const category = categories.find(c => c.name === label);
      return category ? category.color : "#64748b";
    });
    
    setChartData({
      series: values,
      options: {
        chart: {
          type: "donut",
          fontFamily: "Inter, system-ui, sans-serif",
          toolbar: { show: false }
        },
        labels: labels,
        colors: colors,
        legend: {
          position: "bottom",
          fontSize: "14px",
          fontWeight: 500,
          markers: {
            width: 12,
            height: 12,
            radius: 3
          }
        },
        dataLabels: {
          enabled: true,
          formatter: function(val) {
            return val.toFixed(1) + "%";
          },
          style: {
            fontSize: "12px",
            fontWeight: 600
          }
        },
        plotOptions: {
          pie: {
            donut: {
              size: "65%",
              labels: {
                show: true,
                name: {
                  show: true,
                  fontSize: "16px",
                  fontWeight: 600
                },
                value: {
                  show: true,
                  fontSize: "24px",
                  fontWeight: 700,
                  formatter: function(val) {
                    return "$" + parseFloat(val).toFixed(2);
                  }
                },
                total: {
                  show: true,
                  label: "Total Spent",
                  fontSize: "14px",
                  fontWeight: 500,
                  color: "#475569",
                  formatter: function(w) {
                    const total = w.globals.seriesTotals.reduce((a, b) => a + b, 0);
                    return "$" + total.toFixed(2);
                  }
                }
              }
            }
          }
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return "$" + val.toFixed(2);
            }
          }
        }
      }
    });
  };
  
  if (!chartData || transactions.filter(t => t.type === "expense").length === 0) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold text-secondary mb-4">Spending by Category</h3>
        <div className="flex items-center justify-center h-64 text-slate-500">
          No expense data available
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-secondary mb-4">Spending by Category</h3>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="donut"
        height={350}
      />
    </Card>
  );
};

export default SpendingChart;
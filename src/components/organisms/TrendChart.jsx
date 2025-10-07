import React, { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import Card from "@/components/atoms/Card";
import { format, subMonths, startOfMonth, endOfMonth, eachMonthOfInterval } from "date-fns";

const TrendChart = ({ transactions }) => {
  const [chartData, setChartData] = useState(null);
  
  useEffect(() => {
    if (transactions.length > 0) {
      prepareChartData();
    }
  }, [transactions]);
  
  const prepareChartData = () => {
    const now = new Date();
    const sixMonthsAgo = subMonths(now, 5);
    
    const months = eachMonthOfInterval({
      start: sixMonthsAgo,
      end: now
    });
    
    const monthlyData = months.map(month => {
      const monthStart = startOfMonth(month);
      const monthEnd = endOfMonth(month);
      
      const monthTransactions = transactions.filter(t => {
        const transDate = new Date(t.date);
        return transDate >= monthStart && transDate <= monthEnd;
      });
      
      const income = monthTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);
      
      const expenses = monthTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);
      
      return {
        month: format(month, "MMM yyyy"),
        income,
        expenses
      };
    });
    
    setChartData({
      series: [
        {
          name: "Income",
          data: monthlyData.map(d => d.income)
        },
        {
          name: "Expenses",
          data: monthlyData.map(d => d.expenses)
        }
      ],
      options: {
        chart: {
          type: "line",
          fontFamily: "Inter, system-ui, sans-serif",
          toolbar: { show: false },
          zoom: { enabled: false }
        },
        stroke: {
          width: 3,
          curve: "smooth"
        },
        colors: ["#10b981", "#ef4444"],
        xaxis: {
          categories: monthlyData.map(d => d.month),
          labels: {
            style: {
              fontSize: "12px",
              fontWeight: 500
            }
          }
        },
        yaxis: {
          labels: {
            formatter: function(val) {
              return "$" + val.toFixed(0);
            },
            style: {
              fontSize: "12px",
              fontWeight: 500
            }
          }
        },
        legend: {
          position: "top",
          fontSize: "14px",
          fontWeight: 500,
          markers: {
            width: 12,
            height: 12,
            radius: 3
          }
        },
        grid: {
          borderColor: "#e2e8f0",
          strokeDashArray: 4
        },
        tooltip: {
          y: {
            formatter: function(val) {
              return "$" + val.toFixed(2);
            }
          }
        },
        markers: {
          size: 5,
          hover: {
            size: 7
          }
        }
      }
    });
  };
  
  if (!chartData) {
    return (
      <Card className="p-6">
        <h3 className="text-lg font-bold text-secondary mb-4">Income vs Expenses Trend</h3>
        <div className="flex items-center justify-center h-64 text-slate-500">
          Loading chart data...
        </div>
      </Card>
    );
  }
  
  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-secondary mb-4">Income vs Expenses Trend</h3>
      <Chart
        options={chartData.options}
        series={chartData.series}
        type="line"
        height={300}
      />
    </Card>
  );
};

export default TrendChart;
import React, { useEffect, useState } from "react";
import { format, differenceInDays } from "date-fns";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import GoalModal from "@/components/organisms/GoalModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";
import savingsGoalService from "@/services/api/savingsGoalService";

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [modalMode, setModalMode] = useState("create");
  
  useEffect(() => {
    loadData();
  }, []);
  
  const loadData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const data = await savingsGoalService.getAll();
      setGoals(data);
    } catch (err) {
      setError(err.message || "Failed to load goals");
    } finally {
      setLoading(false);
    }
  };
  
  const handleEdit = (goal) => {
    setSelectedGoal(goal);
    setModalMode("edit");
    setShowModal(true);
  };
  
  const handleContribute = (goal) => {
    setSelectedGoal(goal);
    setModalMode("contribute");
    setShowModal(true);
  };
  
  const handleDelete = async (goal) => {
    if (window.confirm("Are you sure you want to delete this savings goal?")) {
      try {
        await savingsGoalService.delete(goal.Id);
        toast.success("Goal deleted successfully!");
        loadData();
      } catch (err) {
        toast.error(err.message || "Failed to delete goal");
      }
    }
  };
  
  const handleModalClose = () => {
    setShowModal(false);
    setSelectedGoal(null);
    setModalMode("create");
  };
  
  const calculateProgress = (goal) => {
    const percentage = (goal.currentAmount / goal.targetAmount) * 100;
    return Math.min(percentage, 100);
  };
  
  const getDaysRemaining = (targetDate) => {
    const days = differenceInDays(new Date(targetDate), new Date());
    return days > 0 ? days : 0;
  };
  
  const getProgressColor = (percentage) => {
    if (percentage >= 100) return "text-success";
    if (percentage >= 75) return "text-primary";
    if (percentage >= 50) return "text-info";
    if (percentage >= 25) return "text-warning";
    return "text-slate-500";
  };
  
  const calculateTotals = () => {
    const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0);
    const totalSaved = goals.reduce((sum, g) => sum + g.currentAmount, 0);
    const totalRemaining = totalTarget - totalSaved;
    
    return { totalTarget, totalSaved, totalRemaining };
  };
  
  if (loading) {
    return <Loading message="Loading goals..." />;
  }
  
  if (error) {
    return <Error message={error} onRetry={loadData} />;
  }
  
  const totals = calculateTotals();
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Savings Goals</h1>
          <p className="text-slate-600 mt-1">Track your progress toward financial milestones</p>
        </div>
        <Button
          variant="primary"
          onClick={() => {
            setSelectedGoal(null);
            setModalMode("create");
            setShowModal(true);
          }}
          className="shadow-lg"
        >
          <ApperIcon name="Plus" size={20} className="mr-2" />
          Create Goal
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Target</p>
              <p className="text-3xl font-bold text-primary">${totals.totalTarget.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-blue-100 rounded-lg">
              <ApperIcon name="Target" size={28} className="text-primary" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Total Saved</p>
              <p className="text-3xl font-bold text-success">${totals.totalSaved.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-green-100 rounded-lg">
              <ApperIcon name="PiggyBank" size={28} className="text-success" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-slate-600 mb-1">Remaining</p>
              <p className="text-3xl font-bold text-warning">${totals.totalRemaining.toFixed(2)}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-yellow-100 rounded-lg">
              <ApperIcon name="TrendingUp" size={28} className="text-warning" />
            </div>
          </div>
        </Card>
      </div>
      
      {goals.length === 0 ? (
        <Empty
          icon="Target"
          title="No savings goals yet"
          message="Create your first savings goal to start building toward your financial dreams"
          actionLabel="Create Goal"
          onAction={() => {
            setSelectedGoal(null);
            setModalMode("create");
            setShowModal(true);
          }}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map(goal => {
            const progress = calculateProgress(goal);
            const remaining = goal.targetAmount - goal.currentAmount;
            const daysLeft = getDaysRemaining(goal.targetDate);
            
            return (
              <Card key={goal.Id} className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-lg font-bold text-secondary mb-1">{goal.name}</h3>
                    <p className="text-sm text-slate-600">
                      {daysLeft > 0 ? `${daysLeft} days remaining` : "Target date reached"}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleEdit(goal)}
                      className="p-2 text-primary hover:bg-blue-50 rounded-lg transition-colors duration-200"
                    >
                      <ApperIcon name="Edit" size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(goal)}
                      className="p-2 text-error hover:bg-red-50 rounded-lg transition-colors duration-200"
                    >
                      <ApperIcon name="Trash2" size={18} />
                    </button>
                  </div>
                </div>
                
                <div className="relative mb-6">
                  <div className="flex items-center justify-center w-32 h-32 mx-auto">
                    <svg className="transform -rotate-90 w-32 h-32">
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke="#e2e8f0"
                        strokeWidth="12"
                        fill="none"
                      />
                      <circle
                        cx="64"
                        cy="64"
                        r="56"
                        stroke={progress >= 100 ? "#10b981" : progress >= 75 ? "#2563eb" : progress >= 50 ? "#3b82f6" : progress >= 25 ? "#f59e0b" : "#94a3b8"}
                        strokeWidth="12"
                        fill="none"
                        strokeDasharray={`${2 * Math.PI * 56}`}
                        strokeDashoffset={`${2 * Math.PI * 56 * (1 - progress / 100)}`}
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className={`text-3xl font-bold ${getProgressColor(progress)}`}>
                        {progress.toFixed(0)}%
                      </span>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Saved</span>
                    <span className="text-lg font-bold text-success">
                      ${goal.currentAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">Target</span>
                    <span className="text-lg font-bold text-primary">
                      ${goal.targetAmount.toFixed(2)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                    <span className="text-sm text-slate-600">Remaining</span>
                    <span className="text-lg font-bold text-warning">
                      ${remaining.toFixed(2)}
                    </span>
                  </div>
                  
                  <Button
                    variant="primary"
                    onClick={() => handleContribute(goal)}
                    className="w-full mt-4"
                    disabled={progress >= 100}
                  >
                    <ApperIcon name="Plus" size={18} className="mr-2" />
                    {progress >= 100 ? "Goal Achieved!" : "Add Contribution"}
                  </Button>
                </div>
              </Card>
            );
          })}
        </div>
      )}
      
      <GoalModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={loadData}
        goal={selectedGoal}
        mode={modalMode}
      />
    </div>
  );
};

export default Goals;
import React, { useEffect, useState } from "react";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import Badge from "@/components/atoms/Badge";
import CategoryModal from "@/components/organisms/CategoryModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import Empty from "@/components/ui/Empty";
import { toast } from "react-toastify";
import categoryService from "@/services/api/categoryService";

function Categories() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await categoryService.getAll();
      setCategories(data);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load categories");
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = (category) => {
    setSelectedCategory(category);
    setShowModal(true);
  };

  const handleDelete = async (category) => {
    if (!confirm(`Are you sure you want to delete "${category.name}"?`)) {
      return;
    }

    try {
      await categoryService.delete(category.Id);
      toast.success("Category deleted successfully");
      loadData();
    } catch (err) {
      toast.error(err.message || "Failed to delete category");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedCategory(null);
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadData} />;

  const incomeCategories = categories.filter(c => c.type === "income");
  const expenseCategories = categories.filter(c => c.type === "expense");

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Categories</h1>
            <p className="text-gray-500 mt-1">Manage your income and expense categories</p>
          </div>
          <Button onClick={() => setShowModal(true)} className="w-full sm:w-auto">
            <ApperIcon name="Plus" size={20} className="mr-2" />
            Add Category
          </Button>
        </div>

        {categories.length === 0 ? (
          <Empty
            icon="Layers"
            title="No categories yet"
            description="Create your first category to start organizing your finances"
            action={
              <Button onClick={() => setShowModal(true)}>
                <ApperIcon name="Plus" size={20} className="mr-2" />
                Add Category
              </Button>
            }
          />
        ) : (
          <div className="grid gap-8">
            {/* Income Categories */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-green-50 flex items-center justify-center">
                    <ApperIcon name="TrendingUp" size={20} className="text-green-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Income Categories</h2>
                    <p className="text-sm text-gray-500">{incomeCategories.length} categories</p>
                  </div>
                </div>

                {incomeCategories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No income categories yet</p>
                ) : (
                  <div className="grid gap-3">
                    {incomeCategories.map((category) => (
                      <div
                        key={category.Id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <ApperIcon
                              name={category.icon}
                              size={24}
                              style={{ color: category.color }}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            {category.isCustom && (
                              <Badge variant="secondary" className="mt-1">Custom</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <ApperIcon name="Pencil" size={16} />
                          </Button>
                          {category.isCustom && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <ApperIcon name="Trash2" size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>

            {/* Expense Categories */}
            <Card>
              <div className="p-6">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-10 h-10 rounded-lg bg-red-50 flex items-center justify-center">
                    <ApperIcon name="TrendingDown" size={20} className="text-red-600" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-gray-900">Expense Categories</h2>
                    <p className="text-sm text-gray-500">{expenseCategories.length} categories</p>
                  </div>
                </div>

                {expenseCategories.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No expense categories yet</p>
                ) : (
                  <div className="grid gap-3">
                    {expenseCategories.map((category) => (
                      <div
                        key={category.Id}
                        className="flex items-center justify-between p-4 rounded-lg border border-gray-200 hover:border-gray-300 transition-colors"
                      >
                        <div className="flex items-center gap-4">
                          <div
                            className="w-12 h-12 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: `${category.color}20` }}
                          >
                            <ApperIcon
                              name={category.icon}
                              size={24}
                              style={{ color: category.color }}
                            />
                          </div>
                          <div>
                            <h3 className="font-medium text-gray-900">{category.name}</h3>
                            {category.isCustom && (
                              <Badge variant="secondary" className="mt-1">Custom</Badge>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEdit(category)}
                          >
                            <ApperIcon name="Pencil" size={16} />
                          </Button>
                          {category.isCustom && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(category)}
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                            >
                              <ApperIcon name="Trash2" size={16} />
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Card>
          </div>
        )}
      </div>

      <CategoryModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={loadData}
        category={selectedCategory}
      />
    </div>
  );
}

export default Categories;
const budgetService = {
  getAll: async () => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
{ field: { Name: "Name" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "limit_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "spent_c" } }
        ]
      };

      const response = await apperClient.fetchRecords("budget_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((b) => ({
Id: b.Id,
        title: b.Name || "",
        Name: b.Name || "",
        category: b.category_c?.Name || "",
        limit: b.limit_c || 0,
        month: b.month_c || "",
        spent: b.spent_c || 0
      }));
    } catch (error) {
      console.error("Error fetching budgets:", error?.response?.data?.message || error);
      return [];
    }
  },

  getById: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
fields: [
          { field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "limit_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "spent_c" } }
        ]
      };

      const response = await apperClient.getRecordById("budget_c", id, params);

      if (!response?.data) {
        return null;
      }

const b = response.data;
      return {
        Id: b.Id,
        title: b.Name || "",
        Name: b.Name || "",
        Id: b.Id,
        category: b.category_c?.Name || "",
        limit: b.limit_c || 0,
        month: b.month_c || "",
        spent: b.spent_c || 0
      };
    } catch (error) {
      console.error(`Error fetching budget ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  getByMonth: async (month) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
{ field: { Name: "Id" } },
          { field: { Name: "Name" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "Name" } } },
          { field: { Name: "limit_c" } },
          { field: { Name: "month_c" } },
          { field: { Name: "spent_c" } }
        ],
        where: [
          {
            FieldName: "month_c",
            Operator: "ExactMatch",
            Values: [month]
          }
        ]
      };

      const response = await apperClient.fetchRecords("budget_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((b) => ({
        Id: b.Id,
title: b.Name || "",
        Name: b.Name || "",
        category: b.category_c?.Name || "",
        limit: b.limit_c || 0,
        month: b.month_c || "",
        spent: b.spent_c || 0
      }));
    } catch (error) {
      console.error("Error fetching budgets by month:", error?.response?.data?.message || error);
      return [];
    }
  },

  create: async (budgetData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
Name: budgetData.title,
            category_c: typeof budgetData.category === 'object' ? parseInt(budgetData.category.Id) : parseInt(budgetData.category),
            limit_c: parseFloat(budgetData.limit),
            month_c: budgetData.month,
            spent_c: 0
          }
        ]
      };

      const response = await apperClient.createRecord("budget_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create budget:`, failed);
          throw new Error(failed[0].message || "Failed to create budget");
        }

        const created = response.results[0];
        return {
Id: created.data.Id,
          title: created.data.Name || budgetData.title,
          Name: created.data.Name || budgetData.title,
          category: created.data.category_c?.Name || budgetData.category,
          limit: created.data.limit_c || 0,
          month: created.data.month_c || budgetData.month,
          spent: created.data.spent_c || 0
        };
      }
    } catch (error) {
      console.error("Error creating budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  update: async (id, budgetData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const updateData = {
Id: parseInt(id),
Name: budgetData.title,
        category_c: typeof budgetData.category === 'object' ? parseInt(budgetData.category.Id) : parseInt(budgetData.category),
        limit_c: parseFloat(budgetData.limit),
        month_c: budgetData.month
      };

      if (budgetData.spent !== undefined) {
        updateData.spent_c = parseFloat(budgetData.spent);
      }

      const params = {
        records: [updateData]
      };

      const response = await apperClient.updateRecord("budget_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update budget:`, failed);
          throw new Error(failed[0].message || "Failed to update budget");
        }

        const updated = response.results[0];
        return {
Id: updated.data.Id,
          title: updated.data.Name || budgetData.title,
          Name: updated.data.Name || budgetData.title,
          category: updated.data.category_c?.Name || budgetData.category,
          limit: updated.data.limit_c || 0,
          month: updated.data.month_c || budgetData.month,
          spent: updated.data.spent_c || 0
        };
      }
    } catch (error) {
      console.error("Error updating budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  delete: async (id) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        RecordIds: [parseInt(id)]
      };

      const response = await apperClient.deleteRecord("budget_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete budget:`, failed);
          throw new Error(failed[0].message || "Failed to delete budget");
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting budget:", error?.response?.data?.message || error);
      throw error;
    }
  },

  updateSpent: async (category, month, amount) => {
    try {
      const budgets = await budgetService.getByMonth(month);
      const budget = budgets.find((b) => b.category === category);

      if (!budget) {
        return null;
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Id: budget.Id,
            spent_c: parseFloat(amount)
          }
        ]
      };

      const response = await apperClient.updateRecord("budget_c", params);

      if (!response.success) {
        console.error(response.message);
        return null;
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update spent amount:`, failed);
          return null;
        }

        const updated = response.results[0];
        return {
Id: updated.data.Id,
          title: updated.data.Name || "",
          Name: updated.data.Name || "",
          category: updated.data.category_c?.Name || category,
          limit: updated.data.limit_c || 0,
          month: updated.data.month_c || month,
          spent: updated.data.spent_c || 0
        };
      }

      return null;
    } catch (error) {
      console.error("Error updating spent amount:", error?.response?.data?.message || error);
      return null;
    }
  }
};

export default budgetService;
const savingsGoalService = {
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
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "target_date_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.fetchRecords("savings_goal_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((g) => ({
        Id: g.Id,
        name: g.name_c || g.Name || "",
        targetAmount: g.target_amount_c || 0,
        currentAmount: g.current_amount_c || 0,
        targetDate: g.target_date_c || new Date().toISOString(),
        createdAt: g.created_at_c || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching savings goals:", error?.response?.data?.message || error);
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
          { field: { Name: "name_c" } },
          { field: { Name: "target_amount_c" } },
          { field: { Name: "current_amount_c" } },
          { field: { Name: "target_date_c" } },
          { field: { Name: "created_at_c" } }
        ]
      };

      const response = await apperClient.getRecordById("savings_goal_c", id, params);

      if (!response?.data) {
        return null;
      }

      const g = response.data;
      return {
        Id: g.Id,
        name: g.name_c || g.Name || "",
        targetAmount: g.target_amount_c || 0,
        currentAmount: g.current_amount_c || 0,
        targetDate: g.target_date_c || new Date().toISOString(),
        createdAt: g.created_at_c || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching savings goal ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  create: async (goalData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: goalData.name,
            name_c: goalData.name,
            target_amount_c: parseFloat(goalData.targetAmount),
            current_amount_c: 0,
            target_date_c: goalData.targetDate,
            created_at_c: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord("savings_goal_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create savings goal:`, failed);
          throw new Error(failed[0].message || "Failed to create savings goal");
        }

        const created = response.results[0];
        return {
          Id: created.data.Id,
          name: created.data.name_c || created.data.Name || "",
          targetAmount: created.data.target_amount_c || 0,
          currentAmount: created.data.current_amount_c || 0,
          targetDate: created.data.target_date_c || goalData.targetDate,
          createdAt: created.data.created_at_c || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Error creating savings goal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  update: async (id, goalData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Id: parseInt(id),
            Name: goalData.name,
            name_c: goalData.name,
            target_amount_c: parseFloat(goalData.targetAmount),
            target_date_c: goalData.targetDate
          }
        ]
      };

      const response = await apperClient.updateRecord("savings_goal_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update savings goal:`, failed);
          throw new Error(failed[0].message || "Failed to update savings goal");
        }

        const updated = response.results[0];
        return {
          Id: updated.data.Id,
          name: updated.data.name_c || updated.data.Name || "",
          targetAmount: updated.data.target_amount_c || 0,
          currentAmount: updated.data.current_amount_c || 0,
          targetDate: updated.data.target_date_c || goalData.targetDate,
          createdAt: updated.data.created_at_c || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Error updating savings goal:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord("savings_goal_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete savings goal:`, failed);
          throw new Error(failed[0].message || "Failed to delete savings goal");
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting savings goal:", error?.response?.data?.message || error);
      throw error;
    }
  },

  addContribution: async (id, amount) => {
    try {
      const current = await savingsGoalService.getById(id);
      if (!current) {
        throw new Error("Savings goal not found");
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const newAmount = current.currentAmount + amount;

      const params = {
        records: [
          {
            Id: parseInt(id),
            current_amount_c: parseFloat(newAmount)
          }
        ]
      };

      const response = await apperClient.updateRecord("savings_goal_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to add contribution:`, failed);
          throw new Error(failed[0].message || "Failed to add contribution");
        }

        const updated = response.results[0];
        return {
          Id: updated.data.Id,
          name: updated.data.name_c || updated.data.Name || "",
          targetAmount: updated.data.target_amount_c || 0,
          currentAmount: updated.data.current_amount_c || 0,
          targetDate: updated.data.target_date_c || new Date().toISOString(),
          createdAt: updated.data.created_at_c || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Error adding contribution:", error?.response?.data?.message || error);
      throw error;
    }
  }
};

export default savingsGoalService;
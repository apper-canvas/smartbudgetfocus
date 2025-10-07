const transactionService = {
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
          { field: { Name: "title_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "Name" } } }
        ],
        orderBy: [{ fieldName: "date_c", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords("transaction_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((t) => ({
Id: t.Id,
        title: t.title_c || "",
        amount: t.amount_c || 0,
        type: t.type_c || "",
        category: t.category_c?.Name || "",
        date: t.date_c || new Date().toISOString(),
        description: t.description_c || "",
        createdAt: t.created_at_c || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching transactions:", error?.response?.data?.message || error);
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
          { field: { Name: "title_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "Name" } } }
        ]
      };

      const response = await apperClient.getRecordById("transaction_c", id, params);

      if (!response?.data) {
        return null;
      }

      const t = response.data;
      return {
Id: t.Id,
        title: t.title_c || "",
        amount: t.amount_c || 0,
        type: t.type_c || "",
        category: t.category_c?.Name || "",
        date: t.date_c || new Date().toISOString(),
        description: t.description_c || "",
        createdAt: t.created_at_c || new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching transaction ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  create: async (transactionData) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

const params = {
        records: [
          {
Name: `${transactionData.title || transactionData.type} - ${transactionData.category}`,
            amount_c: parseFloat(transactionData.amount),
            title_c: transactionData.title || "",
            type_c: transactionData.type,
            category_c: parseInt(transactionData.categoryId), // Use integer ID for lookup field
            date_c: transactionData.date,
            description_c: transactionData.description || "",
            created_at_c: new Date().toISOString()
          }
        ]
      };

      const response = await apperClient.createRecord("transaction_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create transaction:`, failed);
          throw new Error(failed[0].message || "Failed to create transaction");
        }

        const created = response.results[0];
        return {
Id: created.data.Id,
          title: created.data.title_c || "",
          amount: created.data.amount_c || 0,
          type: created.data.type_c || "",
          category: created.data.category_c?.Name || transactionData.category,
          date: created.data.date_c || transactionData.date,
          description: created.data.description_c || "",
          createdAt: created.data.created_at_c || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Error creating transaction:", error?.response?.data?.message || error);
      throw error;
    }
  },

  update: async (id, transactionData) => {
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
Name: `${transactionData.title || transactionData.type} - ${transactionData.category}`,
            amount_c: parseFloat(transactionData.amount),
            title_c: transactionData.title || "",
            type_c: transactionData.type,
            category_c: parseInt(transactionData.categoryId), // Use integer ID for lookup field
            date_c: transactionData.date,
            description_c: transactionData.description || ""
          }
        ]
      };

      const response = await apperClient.updateRecord("transaction_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update transaction:`, failed);
          throw new Error(failed[0].message || "Failed to update transaction");
        }

        const updated = response.results[0];
        return {
Id: updated.data.Id,
          title: updated.data.title_c || "",
          amount: updated.data.amount_c || 0,
          type: updated.data.type_c || "",
          category: updated.data.category_c?.Name || transactionData.category,
          date: updated.data.date_c || transactionData.date,
          description: updated.data.description_c || "",
          createdAt: updated.data.created_at_c || new Date().toISOString()
        };
      }
    } catch (error) {
      console.error("Error updating transaction:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord("transaction_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete transaction:`, failed);
          throw new Error(failed[0].message || "Failed to delete transaction");
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting transaction:", error?.response?.data?.message || error);
      throw error;
    }
  },

  getByDateRange: async (startDate, endDate) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
{ field: { Name: "Id" } },
          { field: { Name: "title_c" } },
          { field: { Name: "Name" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "Name" } } }
        ],
        whereGroups: [
          {
            operator: "AND",
            subGroups: [
              {
                conditions: [
                  {
                    fieldName: "date_c",
                    operator: "GreaterThanOrEqualTo",
                    values: [startDate]
                  }
                ]
              },
              {
                conditions: [
                  {
                    fieldName: "date_c",
                    operator: "LessThanOrEqualTo",
                    values: [endDate]
                  }
                ]
              }
            ]
          }
        ],
        orderBy: [{ fieldName: "date_c", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords("transaction_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((t) => ({
Id: t.Id,
        title: t.title_c || "",
        amount: t.amount_c || 0,
        type: t.type_c || "",
        category: t.category_c?.Name || "",
        date: t.date_c || new Date().toISOString(),
        description: t.description_c || "",
        createdAt: t.created_at_c || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching transactions by date range:", error?.response?.data?.message || error);
      return [];
    }
  },

  getByCategory: async (category) => {
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
          { field: { Name: "title_c" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "Name" } } }
        ],
        where: [
          {
            FieldName: "category_c",
            Operator: "ExactMatch",
            Values: [category]
          }
        ],
        orderBy: [{ fieldName: "date_c", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords("transaction_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((t) => ({
        Id: t.Id,
amount: t.amount_c || 0,
        title: t.title_c || "",
        type: t.type_c || "",
        category: t.category_c?.Name || "",
        date: t.date_c || new Date().toISOString(),
        description: t.description_c || "",
        createdAt: t.created_at_c || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching transactions by category:", error?.response?.data?.message || error);
      return [];
    }
  },

  getByType: async (type) => {
    try {
      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        fields: [
{ field: { Name: "Id" } },
          { field: { Name: "title_c" } },
          { field: { Name: "Name" } },
          { field: { Name: "amount_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "date_c" } },
          { field: { Name: "description_c" } },
          { field: { Name: "created_at_c" } },
          { field: { Name: "category_c" }, referenceField: { field: { Name: "Name" } } }
        ],
        where: [
          {
            FieldName: "type_c",
            Operator: "ExactMatch",
            Values: [type]
          }
        ],
        orderBy: [{ fieldName: "date_c", sorttype: "DESC" }]
      };

      const response = await apperClient.fetchRecords("transaction_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((t) => ({
Id: t.Id,
        title: t.title_c || "",
        amount: t.amount_c || 0,
        type: t.type_c || "",
        category: t.category_c?.Name || "",
        date: t.date_c || new Date().toISOString(),
        description: t.description_c || "",
        createdAt: t.created_at_c || new Date().toISOString()
      }));
    } catch (error) {
      console.error("Error fetching transactions by type:", error?.response?.data?.message || error);
      return [];
    }
  }
};

export default transactionService;
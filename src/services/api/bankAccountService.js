const bankAccountService = {
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
          { field: { Name: "account_name_c" } },
          { field: { Name: "account_type_c" } },
          { field: { Name: "balance_c" } }
        ]
      };

      const response = await apperClient.fetchRecords("bank_account_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((account) => ({
        Id: account.Id,
        name: account.Name || account.account_name_c || "",
        accountName: account.account_name_c || "",
        accountType: account.account_type_c || "",
        balance: account.balance_c || 0
      }));
    } catch (error) {
      console.error("Error fetching bank accounts:", error?.response?.data?.message || error);
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
          { field: { Name: "account_name_c" } },
          { field: { Name: "account_type_c" } },
          { field: { Name: "balance_c" } }
        ]
      };

      const response = await apperClient.getRecordById("bank_account_c", id, params);

      if (!response?.data) {
        return null;
      }

      const account = response.data;
      return {
        Id: account.Id,
        name: account.Name || account.account_name_c || "",
        accountName: account.account_name_c || "",
        accountType: account.account_type_c || "",
        balance: account.balance_c || 0
      };
    } catch (error) {
      console.error(`Error fetching bank account ${id}:`, error?.response?.data?.message || error);
      return null;
    }
  },

  create: async (data) => {
    try {
      if (!data.accountName || !data.accountType || data.balance === undefined) {
        throw new Error("All fields are required");
      }

      const { ApperClient } = window.ApperSDK;
      const apperClient = new ApperClient({
        apperProjectId: import.meta.env.VITE_APPER_PROJECT_ID,
        apperPublicKey: import.meta.env.VITE_APPER_PUBLIC_KEY
      });

      const params = {
        records: [
          {
            Name: data.accountName,
            account_name_c: data.accountName,
            account_type_c: data.accountType,
            balance_c: parseFloat(data.balance)
          }
        ]
      };

      const response = await apperClient.createRecord("bank_account_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create bank account:`, failed);
          const errorMsg = failed[0].message || "Failed to create bank account";
          throw new Error(errorMsg);
        }

        const created = response.results[0];
        return {
          Id: created.data.Id,
          name: created.data.Name || created.data.account_name_c || "",
          accountName: created.data.account_name_c || "",
          accountType: created.data.account_type_c || "",
          balance: created.data.balance_c || 0
        };
      }
    } catch (error) {
      console.error("Error creating bank account:", error?.response?.data?.message || error);
      throw error;
    }
  },

  update: async (id, data) => {
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
            Name: data.accountName,
            account_name_c: data.accountName,
            account_type_c: data.accountType,
            balance_c: parseFloat(data.balance)
          }
        ]
      };

      const response = await apperClient.updateRecord("bank_account_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update bank account:`, failed);
          const errorMsg = failed[0].message || "Failed to update bank account";
          throw new Error(errorMsg);
        }

        const updated = response.results[0];
        return {
          Id: updated.data.Id,
          name: updated.data.Name || updated.data.account_name_c || "",
          accountName: updated.data.account_name_c || "",
          accountType: updated.data.account_type_c || "",
          balance: updated.data.balance_c || 0
        };
      }
    } catch (error) {
      console.error("Error updating bank account:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord("bank_account_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete bank account:`, failed);
          throw new Error(failed[0].message || "Failed to delete bank account");
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting bank account:", error?.response?.data?.message || error);
      throw error;
    }
  },

  getTotalBalance: async () => {
    try {
      const accounts = await bankAccountService.getAll();
      return accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
    } catch (error) {
      console.error("Error calculating total balance:", error);
      return 0;
    }
  }
};

export default bankAccountService;
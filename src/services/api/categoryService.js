const categoryService = {
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
          { field: { Name: "type_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "is_custom_c" } }
        ],
        orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}]
      };

      const response = await apperClient.fetchRecords("category_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((c) => ({
        Id: c.Id,
        name: c.name_c || c.Name || "",
        type: c.type_c || "",
        color: c.color_c || "#64748b",
        icon: c.icon_c || "Circle",
        isCustom: c.is_custom_c || false
      }));
    } catch (error) {
      console.error("Error fetching categories:", error?.response?.data?.message || error);
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
          { field: { Name: "type_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "is_custom_c" } }
        ]
      };

      const response = await apperClient.getRecordById("category_c", id, params);

      if (!response?.data) {
        return null;
      }

      const c = response.data;
      return {
        Id: c.Id,
        name: c.name_c || c.Name || "",
        type: c.type_c || "",
        color: c.color_c || "#64748b",
        icon: c.icon_c || "Circle",
        isCustom: c.is_custom_c || false
      };
    } catch (error) {
      console.error(`Error fetching category ${id}:`, error?.response?.data?.message || error);
      return null;
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
          { field: { Name: "Name" } },
          { field: { Name: "name_c" } },
          { field: { Name: "type_c" } },
          { field: { Name: "color_c" } },
          { field: { Name: "icon_c" } },
          { field: { Name: "is_custom_c" } }
        ],
        where: [
          {
            FieldName: "type_c",
            Operator: "ExactMatch",
            Values: [type]
          }
        ],
        orderBy: [{"fieldName": "name_c", "sorttype": "ASC"}]
      };

      const response = await apperClient.fetchRecords("category_c", params);

      if (!response?.data?.length) {
        return [];
      }

      return response.data.map((c) => ({
        Id: c.Id,
        name: c.name_c || c.Name || "",
        type: c.type_c || "",
        color: c.color_c || "#64748b",
        icon: c.icon_c || "Circle",
        isCustom: c.is_custom_c || false
      }));
    } catch (error) {
      console.error("Error fetching categories by type:", error?.response?.data?.message || error);
      return [];
    }
  },

create: async (data) => {
    try {
      if (!data.name || !data.type || !data.color || !data.icon) {
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
            Name: data.name,
            name_c: data.name,
            type_c: data.type,
            color_c: data.color,
            icon_c: data.icon,
            is_custom_c: true
          }
        ]
      };

      const response = await apperClient.createRecord("category_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to create category:`, failed);
          const errorMsg = failed[0].message || "Failed to create category";
          if (errorMsg.toLowerCase().includes("duplicate") || errorMsg.toLowerCase().includes("already exists")) {
            throw new Error("Category with this name already exists");
          }
          throw new Error(errorMsg);
        }

        const created = response.results[0];
        return {
          Id: created.data.Id,
          name: created.data.name_c || created.data.Name || "",
          type: created.data.type_c || "",
          color: created.data.color_c || "#64748b",
          icon: created.data.icon_c || "Circle",
          isCustom: created.data.is_custom_c || false
        };
      }
    } catch (error) {
      console.error("Error creating category:", error?.response?.data?.message || error);
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
            Name: data.name,
            name_c: data.name,
            type_c: data.type,
            color_c: data.color,
            icon_c: data.icon
          }
        ]
      };

      const response = await apperClient.updateRecord("category_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to update category:`, failed);
          const errorMsg = failed[0].message || "Failed to update category";
          if (errorMsg.toLowerCase().includes("duplicate") || errorMsg.toLowerCase().includes("already exists")) {
            throw new Error("Category with this name already exists");
          }
          throw new Error(errorMsg);
        }

        const updated = response.results[0];
        return {
          Id: updated.data.Id,
          name: updated.data.name_c || updated.data.Name || "",
          type: updated.data.type_c || "",
          color: updated.data.color_c || "#64748b",
          icon: updated.data.icon_c || "Circle",
          isCustom: updated.data.is_custom_c || false
        };
      }
    } catch (error) {
      console.error("Error updating category:", error?.response?.data?.message || error);
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

      const response = await apperClient.deleteRecord("category_c", params);

      if (!response.success) {
        console.error(response.message);
        throw new Error(response.message);
      }

      if (response.results) {
        const failed = response.results.filter((r) => !r.success);
        if (failed.length > 0) {
          console.error(`Failed to delete category:`, failed);
          throw new Error(failed[0].message || "Failed to delete category");
        }
      }

      return true;
    } catch (error) {
      console.error("Error deleting category:", error?.response?.data?.message || error);
      throw error;
    }
  }
};

export default categoryService;
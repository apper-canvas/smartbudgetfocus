import React, { useState, useEffect } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Select from "@/components/atoms/Select";
import Label from "@/components/atoms/Label";
import bankAccountService from "@/services/api/bankAccountService";

const BankAccountModal = ({ isOpen, onClose, onSuccess, account }) => {
  const [formData, setFormData] = useState({
    accountName: "",
    accountType: "Checking",
    balance: ""
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (account) {
      setFormData({
        accountName: account.accountName || "",
        accountType: account.accountType || "Checking",
        balance: account.balance?.toString() || ""
      });
    } else {
      setFormData({
        accountName: "",
        accountType: "Checking",
        balance: ""
      });
    }
    setErrors({});
  }, [account, isOpen]);

  const validateForm = () => {
    const newErrors = {};

    if (!formData.accountName.trim()) {
      newErrors.accountName = "Account name is required";
    }

    if (!formData.accountType) {
      newErrors.accountType = "Account type is required";
    }

    if (!formData.balance) {
      newErrors.balance = "Balance is required";
    } else if (isNaN(parseFloat(formData.balance))) {
      newErrors.balance = "Balance must be a valid number";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const data = {
        accountName: formData.accountName.trim(),
        accountType: formData.accountType,
        balance: parseFloat(formData.balance)
      };

      if (account) {
        await bankAccountService.update(account.Id, data);
        toast.success("Bank account updated successfully");
      } else {
        await bankAccountService.create(data);
        toast.success("Bank account created successfully");
      }

      onSuccess();
    } catch (error) {
      toast.error(error.message || "Failed to save bank account");
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-100 p-6 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-secondary">
            {account ? "Edit Bank Account" : "Add Bank Account"}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-slate-100 rounded-lg transition-colors"
            disabled={loading}
          >
            <ApperIcon name="X" size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <Label htmlFor="accountName">Account Name *</Label>
            <Input
              id="accountName"
              name="accountName"
              value={formData.accountName}
              onChange={handleChange}
              placeholder="Enter account name"
              disabled={loading}
            />
            {errors.accountName && (
              <p className="text-sm text-error mt-1">{errors.accountName}</p>
            )}
          </div>

          <div>
            <Label htmlFor="accountType">Account Type *</Label>
            <Select
              id="accountType"
              name="accountType"
              value={formData.accountType}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Money Market">Money Market</option>
            </Select>
            {errors.accountType && (
              <p className="text-sm text-error mt-1">{errors.accountType}</p>
            )}
          </div>

          <div>
            <Label htmlFor="balance">Balance *</Label>
            <Input
              id="balance"
              name="balance"
              type="number"
              step="0.01"
              value={formData.balance}
              onChange={handleChange}
              placeholder="0.00"
              disabled={loading}
            />
            {errors.balance && (
              <p className="text-sm text-error mt-1">{errors.balance}</p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={loading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              disabled={loading}
              className="flex-1"
            >
              {loading ? (
                <>
                  <div className="inline-block w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                  Saving...
                </>
              ) : (
                <>{account ? "Update" : "Create"}</>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default BankAccountModal;
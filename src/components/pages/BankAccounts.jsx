import React, { useEffect, useState } from "react";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Button from "@/components/atoms/Button";
import Card from "@/components/atoms/Card";
import MetricCard from "@/components/molecules/MetricCard";
import BankAccountModal from "@/components/organisms/BankAccountModal";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import bankAccountService from "@/services/api/bankAccountService";

const BankAccounts = () => {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingAccount, setEditingAccount] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("all");

  useEffect(() => {
    loadAccounts();
  }, []);

  const loadAccounts = async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await bankAccountService.getAll();
      setAccounts(data);
    } catch (err) {
      setError(err.message || "Failed to load bank accounts");
    } finally {
      setLoading(false);
    }
  };

  const handleAddAccount = () => {
    setEditingAccount(null);
    setShowModal(true);
  };

  const handleEditAccount = (account) => {
    setEditingAccount(account);
    setShowModal(true);
  };

  const handleDeleteAccount = async (id, accountName) => {
    if (!confirm(`Are you sure you want to delete ${accountName}?`)) {
      return;
    }

    try {
      await bankAccountService.delete(id);
      toast.success("Bank account deleted successfully");
      loadAccounts();
    } catch (err) {
      toast.error(err.message || "Failed to delete bank account");
    }
  };

  const handleModalClose = () => {
    setShowModal(false);
    setEditingAccount(null);
  };

  const handleModalSuccess = () => {
    loadAccounts();
    handleModalClose();
  };

  const getFilteredAccounts = () => {
    let filtered = accounts;

    if (filterType !== "all") {
      filtered = filtered.filter((account) => account.accountType === filterType);
    }

    if (searchTerm) {
      filtered = filtered.filter((account) =>
        account.accountName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    return filtered;
  };

  const calculateTotalBalance = () => {
    return accounts.reduce((sum, account) => sum + (account.balance || 0), 0);
  };

  const getAccountTypeIcon = (type) => {
    const icons = {
      "Checking": "Wallet",
      "Savings": "PiggyBank",
      "Credit Card": "CreditCard",
      "Money Market": "TrendingUp"
    };
    return icons[type] || "Wallet";
  };

  const getAccountTypeColor = (type) => {
    const colors = {
      "Checking": "#3b82f6",
      "Savings": "#10b981",
      "Credit Card": "#ef4444",
      "Money Market": "#f59e0b"
    };
    return colors[type] || "#64748b";
  };

  if (loading) {
    return <Loading message="Loading bank accounts..." />;
  }

  if (error) {
    return <Error message={error} onRetry={loadAccounts} />;
  }

  const filteredAccounts = getFilteredAccounts();
  const totalBalance = calculateTotalBalance();

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-secondary">Bank Accounts</h1>
          <p className="text-slate-600 mt-1">Manage your bank accounts and balances</p>
        </div>
        <Button
          variant="primary"
          onClick={handleAddAccount}
          className="shadow-lg"
        >
          <ApperIcon name="Plus" size={20} className="mr-2" />
          Add Account
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <MetricCard
          title="Total Balance"
          value={`$${totalBalance.toFixed(2)}`}
          icon="Wallet"
          color="success"
        />
        <MetricCard
          title="Total Accounts"
          value={accounts.length}
          icon="CreditCard"
          color="primary"
        />
        <MetricCard
          title="Active Types"
          value={new Set(accounts.map(a => a.accountType)).size}
          icon="Layers"
          color="warning"
        />
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <div className="relative">
              <ApperIcon
                name="Search"
                size={20}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              />
              <input
                type="text"
                placeholder="Search accounts..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="Checking">Checking</option>
            <option value="Savings">Savings</option>
            <option value="Credit Card">Credit Card</option>
            <option value="Money Market">Money Market</option>
          </select>
        </div>

        {filteredAccounts.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-slate-100 rounded-full mb-4">
              <ApperIcon name="Wallet" size={32} className="text-slate-400" />
            </div>
            <h3 className="text-lg font-semibold text-secondary mb-2">
              {searchTerm || filterType !== "all" ? "No accounts found" : "No accounts yet"}
            </h3>
            <p className="text-slate-600 mb-6">
              {searchTerm || filterType !== "all"
                ? "Try adjusting your search or filter"
                : "Add your first bank account to get started"}
            </p>
            {!searchTerm && filterType === "all" && (
              <Button variant="primary" onClick={handleAddAccount}>
                <ApperIcon name="Plus" size={20} className="mr-2" />
                Add Account
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredAccounts.map((account) => (
              <Card
                key={account.Id}
                className="p-6 hover:shadow-lg transition-shadow duration-200"
              >
                <div className="flex items-start justify-between mb-4">
                  <div
                    className="flex items-center justify-center w-12 h-12 rounded-lg"
                    style={{
                      backgroundColor: `${getAccountTypeColor(account.accountType)}20`
                    }}
                  >
                    <ApperIcon
                      name={getAccountTypeIcon(account.accountType)}
                      size={24}
                      style={{ color: getAccountTypeColor(account.accountType) }}
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditAccount(account)}
                      className="p-2 text-slate-600 hover:text-primary hover:bg-slate-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Edit" size={16} />
                    </button>
                    <button
                      onClick={() => handleDeleteAccount(account.Id, account.accountName)}
                      className="p-2 text-slate-600 hover:text-error hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ApperIcon name="Trash2" size={16} />
                    </button>
                  </div>
                </div>
                <h3 className="text-lg font-bold text-secondary mb-1">
                  {account.accountName}
                </h3>
                <p className="text-sm text-slate-600 mb-4">{account.accountType}</p>
                <div className="pt-4 border-t border-slate-100">
                  <p className="text-sm text-slate-600 mb-1">Balance</p>
                  <p className="text-2xl font-bold text-success">
                    ${account.balance.toFixed(2)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Card>

      <BankAccountModal
        isOpen={showModal}
        onClose={handleModalClose}
        onSuccess={handleModalSuccess}
        account={editingAccount}
      />
    </div>
  );
};

export default BankAccounts;
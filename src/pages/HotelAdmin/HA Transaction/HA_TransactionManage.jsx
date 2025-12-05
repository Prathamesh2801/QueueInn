import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
import { Plus, ArrowLeft, Building2 } from "lucide-react";

import {
  getHotelTransactionDetails,
  createHotelTransaction,
  deleteHotelTransaction,
} from "../../../api/HotelAdmin/HATransactionAPI"; // adjust path if needed

import TransactionRecords from "./HA_TransactionRecord";
import TransactionForm from "./HA_TransactionForm";

export default function HA_TransactionManage() {
  const [currentView, setCurrentView] = useState("records"); // 'records' or 'form'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [viewingTransaction, setViewingTransaction] = useState(null);
  const [formMode, setFormMode] = useState("create"); // 'create', 'view'

  // Fetch transactions on component mount
  useEffect(() => {
    fetchTransactionDetails();
  }, []);

  const fetchTransactionDetails = async () => {
    setLoading(true);
    try {
      const response = await getHotelTransactionDetails();
      if (response.Status) {
        setTransactions(response.Data || []);
      } else {
        toast.error(response.Message || "Failed to fetch transaction details");
      }
    } catch (error) {
      toast.error("Error fetching transaction details");
      console.error("Fetch Transaction Details error:", error);
    } finally {
      setLoading(false);
    }
  };

  /**
   * ⏳ Create – just a placeholder for now
   * API is not ready, so we only show a toast.
   */
  const handleCreateTransaction = async (transactionData) => {
    toast.error("Create Transaction API not available yet.");
    // When API is ready, uncomment this block:
    /*
    const promise = createHotelTransaction(transactionData);

    toast.promise(promise, {
      loading: "Creating Transaction...",
      success: (response) => {
        if (response.Status) {
          fetchTransactionDetails();
          setCurrentView("records");
          return response.Message || "Transaction created successfully!";
        }
        throw new Error(response.Message || "Failed to create transaction");
      },
      error: (err) => err.message || "Failed to create transaction",
    });

    return promise;
    */
  };

  /**
   * ⏳ Delete – placeholder
   */
  const handleDeleteTransaction = async (logId) => {
    toast.error("Delete Transaction API not available yet.");
    // When API is ready, use this:
    /*
    const promise = deleteHotelTransaction(logId);

    toast.promise(promise, {
      loading: "Deleting Transaction...",
      success: (response) => {
        if (response.Status) {
          fetchTransactionDetails();
          return response.Message || "Transaction deleted successfully!";
        }
        throw new Error(response.Message || "Failed to delete transaction");
      },
      error: (err) => err.message || "Failed to delete transaction",
    });

    return promise;
    */
  };

  const handleView = (transaction) => {
    setViewingTransaction(transaction);
    setFormMode("view");
    setCurrentView("form");
  };

  const handleNewTransaction = () => {
    setViewingTransaction(null);
    setFormMode("create");
    setCurrentView("form");
  };

  const handleBack = () => {
    setCurrentView("records");
    setViewingTransaction(null);
    setFormMode("create");
  };

  const getHeaderSubtitle = () => {
    switch (formMode) {
      case "view":
        return "Transaction information and details";
      case "create":
      default:
        return "Add a new transaction to the system";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 md:p-6">
            <div className="flex items-center space-x-3">
              {currentView === "form" && (
                <motion.button
                  onClick={handleBack}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
              )}
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Building2 className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Hotel Transaction Management
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  {currentView === "records"
                    ? "View and manage hotel game point transactions"
                    : getHeaderSubtitle()}
                </p>
              </div>
            </div>

            {currentView === "records" && (
              <motion.button
                onClick={handleNewTransaction}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center space-x-2 text-sm md:text-base backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Transaction</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {currentView === "records" ? (
            <motion.div
              key="records"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <TransactionRecords
                transactions={transactions}
                loading={loading}
                onView={handleView}
                onDelete={handleDeleteTransaction}
                onRefresh={fetchTransactionDetails}
              />
            </motion.div>
          ) : (
            <motion.div
              key="form"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              transition={{ duration: 0.3 }}
            >
              <TransactionForm
                viewingHotelDetails={viewingTransaction} // prop name reused from template
                onSubmit={handleCreateTransaction}
                onCancel={handleBack}
                mode={formMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

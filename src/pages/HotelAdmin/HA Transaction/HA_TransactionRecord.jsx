import { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AnimatePresence, motion } from "framer-motion";
import { Trash2, Eye, RefreshCw, Filter, Building2, Copy } from "lucide-react";
import ConfirmModal from "../../../components/ui/Modals/ConfirmModal";
import { toast } from "react-hot-toast";

export default function HA_TransactionRecord({
  transactions,
  loading,
  onView,
  onDelete,
  onRefresh,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    Log_ID: "",
    Game_ID: "",
    Transaction_Type: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  // Action buttons renderer
  const ActionButtonsRenderer = useCallback(
    (params) => {
      const handleView = () => onView(params.data);
      const handleDelete = () => {
        setDeleteConfirm(params.data);
      };

      return (
        <div className="flex items-center space-x-1 h-full">
          <motion.button
            onClick={handleView}
            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="View transaction"
          >
            <Eye className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={handleDelete}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Delete transaction"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
        </div>
      );
    },
    [onView]
  );

  // Column definitions (based on your sample API)
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Log ID",
        field: "Log_ID",
        sortable: true,
        filter: true,
        flex: 0.6,
        minWidth: 120,
        cellStyle: {
          fontWeight: "500",
          color: "#E5E7EB",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Game ID",
        field: "Game_ID",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 200,
         cellRenderer: (params) => {
          const handleCopy = () => {
            navigator.clipboard.writeText(params.value);
            toast.success(`Copied Hotel ID: ${params.value}`);
            const copyBtn = document.getElementById(`copy-${params.value}`);
            if (copyBtn) {
              copyBtn.classList.add("text-green-400");
              setTimeout(() => copyBtn.classList.remove("text-green-400"), 800);
            }
          };

          return (
            <div className="flex items-center space-x-2 text-gray-300">
              <span>{params.value}</span>
              <button
                id={`copy-${params.value}`}
                onClick={handleCopy}
                className="text-gray-400 hover:text-blue-400 transition-colors"
                title="Copy Hotel ID"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>
          );
        },
        cellStyle: {
          color: "#E5E7EB",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Points",
        field: "Points",
        sortable: true,
        filter: true,
        flex: 0.5,
        minWidth: 100,
        cellStyle: {
          color: "#E5E7EB",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Type",
        field: "Transaction_Type",
        sortable: true,
        filter: true,
        flex: 0.7,
        minWidth: 120,
        cellStyle: {
          color: "#E5E7EB",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Created At",
        field: "Created_At",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 180,
        cellStyle: {
          color: "#E5E7EB",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Updated At",
        field: "Updated_At",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 180,
        cellStyle: {
          color: "#E5E7EB",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Actions",
        cellRenderer: ActionButtonsRenderer,
        width: 120,
        sortable: false,
        filter: false,
        cellStyle: { backgroundColor: "transparent" },
        pinned: "right",
      },
    ],
    [ActionButtonsRenderer]
  );

  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      cellStyle: { backgroundColor: "transparent" },
    }),
    []
  );

  // Filter Transactions based on local filters
  const filteredTransactions = useMemo(() => {
    return transactions.filter((tx) => {
      const matchesLogId =
        !filters.Log_ID ||
        String(tx.Log_ID).toLowerCase().includes(filters.Log_ID.toLowerCase());
      const matchesGameId =
        !filters.Game_ID ||
        String(tx.Game_ID).toLowerCase().includes(filters.Game_ID.toLowerCase());
      const matchesType =
        !filters.Transaction_Type || tx.Transaction_Type === filters.Transaction_Type;

      return matchesLogId && matchesGameId && matchesType;
    });
  }, [transactions, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilters({ Log_ID: "", Game_ID: "", Transaction_Type: "" });
  };

  const gridStyles = {
    "--ag-background-color": "#1F2937",
    "--ag-header-background-color": "#374151",
    "--ag-header-foreground-color": "#F9FAFB",
    "--ag-odd-row-background-color": "#1F2937",
    "--ag-even-row-background-color": "#111827",
    "--ag-row-hover-color": "#374151",
    "--ag-selected-row-background-color": "#1E40AF",
    "--ag-border-color": "#4B5563",
    "--ag-header-column-separator-color": "#4B5563",
    "--ag-row-border-color": "#374151",
    "--ag-foreground-color": "#E5E7EB",
    "--ag-secondary-foreground-color": "#9CA3AF",
    "--ag-input-background-color": "#374151",
    "--ag-input-border-color": "#4B5563",
    "--ag-input-focus-border-color": "#3B82F6",
    "--ag-checkbox-background-color": "#374151",
    "--ag-checkbox-border-color": "#4B5563",
    "--ag-range-selection-background-color": "#1E40AF33",
    "--ag-cell-horizontal-padding": "12px",
    "--ag-grid-size": "6px",
    "--ag-list-item-height": "28px",
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl p-6"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-3 text-sm text-gray-300">
            <Building2 className="h-5 w-5 text-blue-400" />
            <span className="font-medium">
              Total Transactions: {filteredTransactions.length}
            </span>
            {transactions.length > 0 &&
              filteredTransactions.length !== transactions.length && (
                <span className="text-blue-400">
                  (Filtered from {transactions.length})
                </span>
              )}
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm backdrop-blur-sm ${
                showFilters
                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                  : "bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50"
              }`}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <Filter className="h-4 w-4" />
              <span>Filters</span>
            </motion.button>

            <motion.button
              onClick={onRefresh}
              disabled={loading}
              className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all disabled:opacity-50 backdrop-blur-sm border border-gray-600/50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="mt-6 pt-6 border-t border-gray-700/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label
                  htmlFor="Log_ID"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Log ID
                </label>
                <input
                  type="number"
                  name="Log_ID"
                  id="Log_ID"
                  value={filters.Log_ID}
                  onChange={(e) =>
                    handleFilterChange("Log_ID", e.target.value)
                  }
                  placeholder="Search by Log ID"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="Game_ID"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Game ID
                </label>
                <input
                  type="text"
                  name="Game_ID"
                  id="Game_ID"
                  value={filters.Game_ID}
                  onChange={(e) =>
                    handleFilterChange("Game_ID", e.target.value)
                  }
                  placeholder="Search by Game ID"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="Transaction_Type"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Transaction Type
                </label>
                <select
                  name="Transaction_Type"
                  id="Transaction_Type"
                  value={filters.Transaction_Type}
                  onChange={(e) =>
                    handleFilterChange("Transaction_Type", e.target.value)
                  }
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white backdrop-blur-sm"
                >
                  <option value="">All</option>
                  <option value="Credit">Credit</option>
                  <option value="Debit">Debit</option>
                </select>
              </div>
              <div>
                <motion.button
                  onClick={handleFilterReset}
                  className="w-full px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-600/50 rounded-lg transition-all text-sm backdrop-blur-sm border border-gray-600/50"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                >
                  Reset Filters
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>

      {/* Data Grid */}
      <motion.div
        className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div
          className="h-[600px] w-full ag-theme-alpine-dark"
          style={gridStyles}
        >
          <AgGridReact
            rowData={filteredTransactions}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowHeight={60}
            headerHeight={50}
            animateRows={true}
            loading={loading}
            overlayLoadingTemplate='<span class="text-gray-300">Loading transactions...</span>'
            overlayNoRowsTemplate='<span class="text-gray-300">No transactions found</span>'
            className="text-sm"
            gridOptions={{
              domLayout: "normal",
              suppressHorizontalScroll: false,
              alwaysShowHorizontalScroll: false,
              suppressColumnVirtualisation: false,
              rowClassRules: {
                "hover:bg-gray-700/30": () => true,
              },
              paginationAutoPageSize: false,
              suppressPaginationPanel: false,
              paginationNumberFormatter: (params) => {
                return params.value.toLocaleString();
              },
            }}
            onGridReady={(params) => {
              if (params.api.gridOptionsWrapper) {
                params.api.sizeColumnsToFit();
              }
            }}
          />
        </div>
      </motion.div>

      <ConfirmModal
        open={!!deleteConfirm}
        title="Confirm Delete"
        message={
          deleteConfirm
            ? `Are you sure you want to delete transaction "${deleteConfirm.Log_ID}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            if (!onDelete) {
              toast.error("Delete Transaction API not available yet.");
            } else {
              onDelete(deleteConfirm.Log_ID);
            }
            setDeleteConfirm(null);
          }
        }}
      />
    </div>
  );
}

import React, { useState, useMemo, useCallback } from "react";
import { AgGridReact } from "ag-grid-react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Edit,
  Trash2,
  Eye,
  RefreshCw,
  Filter,
  Image as ImageIcon,
  Building2,
  SquareArrowOutUpRight,
  Copy,
  UserCircle2,
} from "lucide-react";
import { USER_URL } from "../../../../config";
import ConfirmModal from "../../../components/ui/Modals/ConfirmModal";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function HotelRecords({
  hotelDetails,
  loading,
  onEdit,
  onView,
  onDelete,
  onRefresh,
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    Hotel_ID: "",
    Hotel_Name: "",
    Hotel_Contact: "",
    Hotel_Location: "",
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();

  // Action buttons renderer
  const ActionButtonsRenderer = useCallback(
    (params) => {
      const handleView = () => onView(params.data);
      const handleEdit = () => onEdit(params.data);
      const handleDelete = () => {
        setDeleteConfirm(params.data); // store the category to delete
      };
      const redirectToAdmin = () => {
        const hotelId = params.data.Hotel_ID;
        if (!hotelId) {
          toast.error("Hotel ID not found");
          return;
        }
        localStorage.setItem("Hotel_ID", hotelId);
        navigate("/hotelAdmin/dashboard");
      };
      const handleCopy = () => {
        const hotelId = params.data.Hotel_ID;
        const urlToCopy = `${USER_URL}/startup?Hotel_ID=${hotelId}`;

        navigator.clipboard
          .writeText(urlToCopy)
          .then(() => {
            toast.success(`Copied Link: ${urlToCopy}`);
            const copyBtn = document.getElementById(`copy-${hotelId}`);
            if (copyBtn) {
              copyBtn.classList.add("text-green-400");
              setTimeout(() => copyBtn.classList.remove("text-green-400"), 800);
            }
          })
          .catch(() => {
            toast.error("Failed to copy");
          });
      };

      return (
        <div className="flex items-center space-x-1 h-full">
          <motion.button
            onClick={handleView}
            className="p-1.5 text-blue-400 hover:text-blue-300 hover:bg-blue-500/20 rounded transition-colors backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="View hotel"
          >
            <Eye className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={handleEdit}
            className="p-1.5 text-green-400 hover:text-green-300 hover:bg-green-500/20 rounded transition-colors backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Edit hotel"
          >
            <Edit className="h-4 w-4" />
          </motion.button>
          <motion.button
            onClick={handleDelete}
            className="p-1.5 text-red-400 hover:text-red-300 hover:bg-red-500/20 rounded transition-colors backdrop-blur-sm"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            title="Delete hotel"
          >
            <Trash2 className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={redirectToAdmin}
            className="flex items-center justify-center w-8 h-8 rounded-full  text-purple-600 hover:bg-purple-200 transition-colors"
            title="Redirect Hotel Admin Dashboard"
          >
            <SquareArrowOutUpRight className="h-4 w-4" />
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={handleCopy}
            className="flex items-center justify-center w-8 h-8 rounded-full  text-yellow-600 hover:bg-yellow-200 transition-colors"
            title="Redirect User Part"
          >
            <UserCircle2 className="h-4 w-4" />
          </motion.button>
        </div>
      );
    },
    [onView, onEdit, onDelete]
  );

  // Column definitions
  const columnDefs = useMemo(
    () => [
      {
        headerName: "Hotel ID",
        field: "Hotel_ID",
        sortable: true,
        filter: true,
        minWidth: 250,
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
          color: "#9CA3AF",
          fontSize: "0.875rem",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Hotel Name",
        field: "Hotel_Name",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
        cellStyle: {
          fontWeight: "500",
          color: "#E5E7EB",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Hotel Contact",
        field: "Hotel_Contact",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 120,
        cellStyle: {
          color: "#E5E7EB",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Hotel Location",
        field: "Hotel_Location",
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
        headerName: "Created At",
        field: "Created_At",
        sortable: true,
        filter: true,
        flex: 1,
        minWidth: 150,
        cellStyle: {
          color: "#E5E7EB",
          backgroundColor: "transparent",
        },
        cellClass: "flex items-center justify-start text-sm",
      },
      {
        headerName: "Actions",
        cellRenderer: ActionButtonsRenderer,
        width: 200,
        sortable: false,
        filter: false,
        cellStyle: { backgroundColor: "transparent" },
        // pinned: "right",
      },
    ],
    [ActionButtonsRenderer]
  );

  // Grid options
  const defaultColDef = useMemo(
    () => ({
      resizable: true,
      sortable: true,
      filter: true,
      cellStyle: { backgroundColor: "transparent" },
    }),
    []
  );

  // Filter Hotel Details based on local filters
  const filteredHotelDetails = useMemo(() => {
    return hotelDetails.filter((hotelData) => {
      const matchesId =
        !filters.Hotel_ID ||
        hotelData.Hotel_ID?.toString().includes(filters.Hotel_ID.toString());

      const matchesName =
        !filters.Hotel_Name ||
        hotelData.Hotel_Name?.toLowerCase().includes(
          filters.Hotel_Name.toLowerCase()
        );

      const matchesContact =
        !filters.Hotel_Contact ||
        hotelData.Hotel_Contact?.toString().includes(
          filters.Hotel_Contact.toString()
        );

      const matchesLocation =
        !filters.Hotel_Location ||
        hotelData.Hotel_Location?.toLowerCase().includes(
          filters.Hotel_Location.toLowerCase()
        );

      return matchesId && matchesName && matchesContact && matchesLocation;
    });
  }, [hotelDetails, filters]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilters({
      Hotel_ID: "",
      Hotel_Name: "",
      Hotel_Contact: "",
      Hotel_Location: "",
    });
  };

  // Custom grid styles
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
              Total Hotels: {filteredHotelDetails.length}
            </span>
            {(filters.Hotel_ID ||
              filters.Hotel_Name ||
              filters.Hotel_Contact ||
              filters.Hotel_Location) && (
              <span className="text-blue-400">
                (Filtered from {hotelDetails.length})
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
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
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
                  htmlFor="Hotel_ID"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Hotel ID
                </label>
                <input
                  type="text"
                  name="Hotel_ID"
                  id="Hotel_ID"
                  value={filters.Hotel_ID}
                  onChange={(e) =>
                    handleFilterChange("Hotel_ID", e.target.value)
                  }
                  placeholder="Search by Hotel ID"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="Hotel_Name"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Hotel Name
                </label>
                <input
                  type="text"
                  name="Hotel_Name"
                  id="Hotel_Name"
                  value={filters.Hotel_Name}
                  onChange={(e) =>
                    handleFilterChange("Hotel_Name", e.target.value)
                  }
                  placeholder="Search by Hotel Name"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="Hotel_Contact"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Hotel Contact
                </label>
                <input
                  type="tel"
                  name="Hotel_Contact"
                  id="Hotel_Contact"
                  value={filters.Hotel_Contact}
                  onChange={(e) =>
                    handleFilterChange("Hotel_Contact", e.target.value)
                  }
                  placeholder="Search by Contact"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>

              <div>
                <label
                  htmlFor="Hotel_Location"
                  className="block text-sm font-medium text-gray-200 mb-2"
                >
                  Hotel Location
                </label>
                <input
                  type="text"
                  name="Hotel_Location"
                  id="Hotel_Location"
                  value={filters.Hotel_Location}
                  onChange={(e) =>
                    handleFilterChange("Hotel_Location", e.target.value)
                  }
                  placeholder="Search by Location"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>

              <div className="flex items-end">
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
            rowData={filteredHotelDetails}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowHeight={60}
            headerHeight={50}
            animateRows={true}
            loading={loading}
            overlayLoadingTemplate='<span class="text-gray-300">Loading hotels...</span>'
            overlayNoRowsTemplate='<span class="text-gray-300">No hotels found</span>'
            className="text-sm"
            gridOptions={{
              domLayout: "normal",
              suppressHorizontalScroll: false,
              alwaysShowHorizontalScroll: false,
              suppressColumnVirtualisation: false,
              rowClassRules: {
                "hover:bg-gray-700/30": () => true,
              },
              // Mobile-friendly pagination options
              paginationAutoPageSize: false,
              suppressPaginationPanel: false,
              paginationNumberFormatter: (params) => {
                // Custom number formatter for better mobile display
                return params.value.toLocaleString();
              },
            }}
            onGridReady={(params) => {
              // Apply additional custom styling after grid is ready
              const gridDiv = params.api.getGridOption("domLayout");
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
            ? `Are you sure you want to delete hotel "${deleteConfirm.Hotel_Name}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            onDelete(deleteConfirm.Hotel_ID);
            setDeleteConfirm(null);
          }
        }}
      />
    </div>
  );
}

import { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { AnimatePresence, motion } from 'framer-motion';
import { Edit, Trash2, Eye, RefreshCw, Filter, Building2, SquareArrowOutUpRight } from 'lucide-react';
import ConfirmModal from '../../../components/ui/Modals/ConfirmModal';
import { useNavigate } from 'react-router-dom';

export default function HA_HotelRecords({
  hotelDetails,
  loading,
  onView,
  onDelete,
  onRefresh
}) {
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    SR_NO: '',
    TableSize: '',
    TableType: ''
  });
  const [deleteConfirm, setDeleteConfirm] = useState(null);
  const navigate = useNavigate();


  // Action buttons renderer
  const ActionButtonsRenderer = useCallback((params) => {
    const handleView = () => onView(params.data);
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
      navigate('/hotelAdmin/dashboard');
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
      </div>
    );
  }, [onView, onDelete]);

  // Column definitions
  const columnDefs = useMemo(() => [
   
    {
      headerName: 'Table Size',
      field: 'TableSize',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 200,
      cellStyle: {
        fontWeight: '500',
        color: '#E5E7EB',
        backgroundColor: 'transparent'
      },
      cellClass: "flex items-center justify-start text-sm",
    },
    {
      headerName: 'Table Type',
      field: 'TableType',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 180,
      cellStyle: {
        color: '#E5E7EB',
        backgroundColor: 'transparent'
      },
      cellClass: "flex items-center justify-start text-sm",
    },
    {
      headerName: 'Created At',
      field: 'Created_At',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 150,
      cellStyle: {
        color: '#E5E7EB',
        backgroundColor: 'transparent'
      },
      cellClass: "flex items-center justify-start text-sm",
    },
    {
      headerName: 'Actions',
      cellRenderer: ActionButtonsRenderer,
      width: 140,
      sortable: false,
      filter: false,
      cellStyle: { backgroundColor: 'transparent' },
      pinned: 'right'
    }
  ], [ActionButtonsRenderer]);

  // Grid options
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true,
    cellStyle: { backgroundColor: 'transparent' }
  }), []);

  // Filter Hotel Details based on local filters
  const filteredHotelDetails = useMemo(() => {
    return hotelDetails.filter((hotelData) => {
      const matchesSRNo =
        !filters.SR_NO || hotelData.SR_NO?.toString().includes(filters.SR_NO.toString());
      const matchesTableSize =
        !filters.TableSize || hotelData.TableSize?.toString().includes(filters.TableSize.toString());
      const matchesTableType =
        !filters.TableType || hotelData.TableType === filters.TableType;
      return (
        matchesSRNo &&
        matchesTableSize &&
        matchesTableType
      );
    });
  }, [hotelDetails, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
  setFilters({ SR_NO: '', TableSize: '', TableType: '' });
  };

  // Custom grid styles
  const gridStyles = {
    '--ag-background-color': '#1F2937',
    '--ag-header-background-color': '#374151',
    '--ag-header-foreground-color': '#F9FAFB',
    '--ag-odd-row-background-color': '#1F2937',
    '--ag-even-row-background-color': '#111827',
    '--ag-row-hover-color': '#374151',
    '--ag-selected-row-background-color': '#1E40AF',
    '--ag-border-color': '#4B5563',
    '--ag-header-column-separator-color': '#4B5563',
    '--ag-row-border-color': '#374151',
    '--ag-foreground-color': '#E5E7EB',
    '--ag-secondary-foreground-color': '#9CA3AF',
    '--ag-input-background-color': '#374151',
    '--ag-input-border-color': '#4B5563',
    '--ag-input-focus-border-color': '#3B82F6',
    '--ag-checkbox-background-color': '#374151',
    '--ag-checkbox-border-color': '#4B5563',
    '--ag-range-selection-background-color': '#1E40AF33',
    '--ag-cell-horizontal-padding': '12px',
    '--ag-grid-size': '6px',
    '--ag-list-item-height': '28px'
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
            <span className="font-medium">Total Hotels: {filteredHotelDetails.length}</span>
            {(filters.Hotel_ID || filters.Hotel_Name || filters.Hotel_Contact) && (
              <span className="text-blue-400">
                (Filtered from {hotelDetails.length})
              </span>
            )}
          </div>

          <div className="flex items-center space-x-3">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-all text-sm backdrop-blur-sm ${showFilters
                ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                : 'bg-gray-700/50 text-gray-300 hover:bg-gray-600/50 border border-gray-600/50'
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
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              className="mt-6 pt-6 border-t border-gray-700/50 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <div>
                <label htmlFor="SR_NO" className="block text-sm font-medium text-gray-200 mb-2">SR_NO</label>
                <input
                  type="number"
                  name='SR_NO'
                  id='SR_NO'
                  value={filters.SR_NO}
                  onChange={(e) => handleFilterChange('SR_NO', e.target.value)}
                  placeholder="Search by SR_NO"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
              <div>
                <label htmlFor="TableSize" className="block text-sm font-medium text-gray-200 mb-2">Table Size</label>
                <input
                  type="number"
                  name='TableSize'
                  id='TableSize'
                  value={filters.TableSize}
                  onChange={(e) => handleFilterChange('TableSize', e.target.value)}
                  placeholder="Search by Table Size"
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white placeholder-gray-400 backdrop-blur-sm"
                />
              </div>
              <div>
                <label htmlFor="TableType" className="block text-sm font-medium text-gray-200 mb-2">Table Type</label>
                <select
                  name='TableType'
                  id='TableType'
                  value={filters.TableType}
                  onChange={(e) => handleFilterChange('TableType', e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-white backdrop-blur-sm"
                >
                  <option value="">All</option>
                  <option value="AC">AC</option>
                  <option value="NON-AC">NON-AC</option>
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
        <div className="h-[600px] w-full ag-theme-alpine-dark" style={gridStyles}>
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
              domLayout: 'normal',
              suppressHorizontalScroll: false,
              alwaysShowHorizontalScroll: false,
              suppressColumnVirtualisation: false,
              rowClassRules: {
                'hover:bg-gray-700/30': () => true,
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
              const gridDiv = params.api.getGridOption('domLayout');
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
            ? `Are you sure you want to delete hotel "${deleteConfirm.SR_NO}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            onDelete(deleteConfirm.SR_NO);
            setDeleteConfirm(null);
          }
        }}
      />
    </div>
  );
};
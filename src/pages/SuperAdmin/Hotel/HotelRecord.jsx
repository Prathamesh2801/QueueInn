import React, { useState, useMemo, useCallback } from 'react';
import { AgGridReact } from 'ag-grid-react';
import { motion } from 'framer-motion';
import { Edit, Trash2, Eye, RefreshCw, Filter, Image as ImageIcon } from 'lucide-react';
import { BASE_URL } from '../../../../../config';
import ConfirmModal from '../../../ui/ConfirmModal';
import ImageModal from '../../../ui/ImageModal';


export default function HotelRecords  ({
  categories,
  loading,
  onEdit,
  onView,
  onDelete,
  onRefresh
}){
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    Category_ID: '',
    Gender: '',
    Category_Title: ''
  });
  const [imageModal, setImageModal] = useState({ show: false, src: '', title: '' });
  const [deleteConfirm, setDeleteConfirm] = useState(null);


  // Image renderer with preview
  const ImageRenderer = useCallback((params) => {
    const imageUrl = BASE_URL + '/' + params.value;

    if (!imageUrl) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
            <ImageIcon className="h-5 w-5 text-gray-400" />
          </div>
        </div>
      );
    }

    const handleImageClick = () => {
      setImageModal({
        show: true,
        src: imageUrl,
        title: params.data.Category_Title
      });
    };

    return (
      <div className="flex items-center justify-center h-full">
        <motion.img
          src={imageUrl}
          alt={params.data.Category_Title}
          className="w-16 h-16 object-cover rounded-lg cursor-pointer border-2 border-gray-200 hover:border-[#8B7355]"
          onClick={handleImageClick}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
        />
      </div>
    );
  }, []);

  // Action buttons renderer
  const ActionButtonsRenderer = useCallback((params) => {
    const handleView = () => onView(params.data);
    const handleEdit = () => onEdit(params.data);
    const handleDelete = () => {
      setDeleteConfirm(params.data); // store the category to delete
    };


    return (
      <div className="flex items-center space-x-1 h-full">
        <motion.button
          onClick={handleView}
          className="p-1.5 text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="View category"
        >
          <Eye className="h-4 w-4" />
        </motion.button>
        <motion.button
          onClick={handleEdit}
          className="p-1.5 text-green-600 hover:text-green-800 hover:bg-green-50 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Edit category"
        >
          <Edit className="h-4 w-4" />
        </motion.button>
        <motion.button
          onClick={handleDelete}
          className="p-1.5 text-red-600 hover:text-red-800 hover:bg-red-50 rounded transition-colors"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          title="Delete category"
        >
          <Trash2 className="h-4 w-4" />
        </motion.button>
      </div>
    );
  }, [onView, onEdit, onDelete]);

  // Gender badge renderer
  const GenderBadgeRenderer = useCallback((params) => {
    const gender = params.value;
    const getVariant = (gender) => {
      switch (gender?.toLowerCase()) {
        case 'male':
          return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'female':
          return 'bg-pink-100 text-pink-800 border-pink-200';
        case 'unisex':
          return 'bg-purple-100 text-purple-800 border-purple-200';
        default:
          return 'bg-gray-100 text-gray-800 border-gray-200';
      }
    };

    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getVariant(gender)}`}>
        {gender || 'N/A'}
      </span>
    );
  }, []);

  // Column definitions
  const columnDefs = useMemo(() => [
    {
      headerName: 'Image',
      field: 'Image_URL',
      cellRenderer: ImageRenderer,
      width: 100,

      sortable: false,
      filter: false
    },
    {
      headerName: 'Category ID',
      field: 'Category_ID',
      sortable: true,
      filter: true,

      cellStyle: { color: '#6B7280', fontSize: '0.875rem' },
      cellClass: "flex items-center justify-start  text-sm",
    },
    {
      headerName: 'Category Title',
      field: 'Category_Title',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 100,
      cellStyle: { fontWeight: '500' },
      cellClass: "flex items-center justify-start text-gray-700 text-sm",
    },
    {
      headerName: 'Category Description',
      field: 'Category_Description',
      sortable: true,
      filter: true,
      flex: 1,
      minWidth: 250,

      cellClass: "flex items-center justify-start text-gray-700 text-sm",
    },
    {
      headerName: 'Gender',
      field: 'Gender',
      sortable: true,
      filter: true,
      width: 150,
      cellRenderer: GenderBadgeRenderer,
      cellClass: "flex items-center justify-start ",
    },

    {
      headerName: 'Actions',
      cellRenderer: ActionButtonsRenderer,
      // width: 120,
      sortable: false,
      filter: false,
      // pinned: 'right'
    }
  ], [ImageRenderer, ActionButtonsRenderer, GenderBadgeRenderer]);

  // Grid options
  const defaultColDef = useMemo(() => ({
    resizable: true,
    sortable: true,
    filter: true
  }), []);

  // Filter categories based on local filters
  const filteredCategories = useMemo(() => {
    return categories.filter(category => {
      const matchesId = !filters.Category_ID ||
        category.Category_ID?.toString().includes(filters.Category_ID.toString());
      const matchesGender = !filters.Gender ||
        category.Gender?.toString().trim().toLowerCase() === filters.Gender.trim().toLowerCase();

      const matchesTitle = !filters.Category_Title ||
        category.Category_Title?.toLowerCase().includes(filters.Category_Title.toLowerCase());

      return matchesId && matchesGender && matchesTitle;
    });
  }, [categories, filters]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleFilterReset = () => {
    setFilters({ Category_ID: '', Gender: '', Category_Title: '' });
  };

  const closeImageModal = () => {
    setImageModal({ show: false, src: '', title: '' });
  };

  return (
    <div className="space-y-4">
      {/* Filter Bar */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-[#e8dabe] p-4"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-sm text-gray-600">
            <span className="font-medium">Total Categories: {filteredCategories.length}</span>
            {(filters.Category_ID || filters.Gender || filters.Category_Title) && (
              <span className="text-[#8B7355]">
                (Filtered from {categories.length})
              </span>
            )}
          </div>

          <div className="flex items-center space-x-2">
            <motion.button
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-lg transition-colors text-sm ${showFilters
                ? 'bg-[#8B7355] text-white'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
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
              className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </motion.button>
          </div>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <motion.div
            className="mt-4 pt-4 border-t border-[#e8dabe] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4  gap-4"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
          >
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category ID</label>
              <input
                type="text"
                value={filters.Category_ID}
                onChange={(e) => handleFilterChange('Category_ID', e.target.value)}
                placeholder="Search by ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={filters.Gender}
                onChange={(e) => handleFilterChange('Gender', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
              >
                <option value="">All Genders</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Unisex">Unisex</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Category Title</label>
              <input
                type="text"
                value={filters.Category_Title}
                onChange={(e) => handleFilterChange('Category_Title', e.target.value)}
                placeholder="Search by title"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent"
              />
            </div>

            <div className="flex items-end space-x-2">
              <motion.button
                onClick={handleFilterReset}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg transition-colors text-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                Reset Filters
              </motion.button>
            </div>
          </motion.div>
        )}
      </motion.div>

      {/* Data Grid */}
      <motion.div
        className="bg-white rounded-lg shadow-sm border border-[#e8dabe] overflow-hidden"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
      >
        <div className="h-[600px] w-full ag-theme-alpine">
          <AgGridReact
            rowData={filteredCategories}
            columnDefs={columnDefs}
            defaultColDef={defaultColDef}
            pagination={true}
            paginationPageSize={20}
            paginationPageSizeSelector={[10, 20, 50, 100]}
            rowHeight={100}
            headerHeight={50}

            animateRows={true}
            // rowSelection={{ mode: 'singleRow', enableClickSelection: false }}

            loading={loading}
            overlayLoadingTemplate='<span class="text-gray-600">Loading categories...</span>'
            overlayNoRowsTemplate='<span class="text-gray-600">No categories found</span>'
            className="text-sm"
            gridOptions={{
              domLayout: 'normal',
              suppressHorizontalScroll: false,
              alwaysShowHorizontalScroll: false,
              suppressColumnVirtualisation: false,
            }}
          />
        </div>
      </motion.div>

      {/* Image Modal */}
      <ImageModal
        isOpen={imageModal.show}
        onClose={closeImageModal}
        imageSrc={imageModal.src}
        imageTitle={imageModal.title}
        imageAlt={imageModal.title || 'Category image'}
        showTitle={true}
        overlayOpacity={0.75}
        maxWidth="4xl"
      />

      <ConfirmModal
        open={!!deleteConfirm}
        title="Confirm Delete"
        message={
          deleteConfirm
            ? `Are you sure you want to delete category "${deleteConfirm.Category_Title}"? This action cannot be undone.`
            : ""
        }
        confirmText="Delete"
        confirmColor="bg-red-600 hover:bg-red-700"
        onCancel={() => setDeleteConfirm(null)}
        onConfirm={() => {
          if (deleteConfirm) {
            onDelete(deleteConfirm.Category_ID);
            setDeleteConfirm(null);
          }
        }}
      />

    </div>
  );
};

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Package, Plus, ArrowLeft } from 'lucide-react';

import {
createHotelDetails,
deleteCategory,
updateCategory,
getHotelDetails
} from '../../../api/SuperAdmin/Hotel API/HotelAPIfetch';

export default function HotelManage () {
  const [currentView, setCurrentView] = useState('records'); // 'records' or 'form'
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const [viewingCategory, setViewingCategory] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'view'


  // Fetch categories on component mount
  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    setLoading(true);
    try {
      const response = await getCategories();
      if (response.Status) {
        setCategories(response.Data || []);
      } else {
        toast.error(response.Message || 'Failed to fetch categories');
      }
    } catch (error) {
      toast.error('Error fetching categories');
      console.error('Fetch categories error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCategory = async (categoryData) => {
    const promise = createCategory(categoryData);

    toast.promise(promise, {
      loading: 'Creating category...',
      success: (response) => {
        if (response.Status) {
          fetchCategories(); // Refresh the list
          setCurrentView('records');
          return response.Message || 'Category created successfully!';
        }
        throw new Error(response.Message || 'Failed to create category');
      },
      error: (err) => err.message || 'Failed to create category'
    });

    return promise;
  };

  const handleUpdateCategory = async (updateData) => {
    const promise = updateCategory(updateData);
    toast.promise(promise, {
      loading: 'Updating category...',
      success: (response) => {
        if (response.Status) {
          fetchCategories();
          setCurrentView('records');
          setEditingCategory(null);
          return response.Message || 'Category updated successfully!';
        }
        throw new Error(response.Message || 'Failed to update category');
      },
      error: (err) => err.message || 'Failed to update category'
    });

    return promise;
  };


  const handleDeleteCategory = async (categoryId) => {
    const promise = deleteCategory(categoryId);

    toast.promise(promise, {
      loading: 'Deleting category...',
      success: (response) => {
        if (response.Status) {
          fetchCategories(); // Refresh the list
          return response.Message || 'Category deleted successfully!';
        }
        throw new Error(response.Message || 'Failed to delete category');
      },
      error: (err) => err.message || 'Failed to delete category'
    });

    return promise;
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setFormMode('edit');
    setCurrentView('form');
  };

  const handleView = (category) => {
    setViewingCategory(category);
    setFormMode('view');
    setCurrentView('form');
  };

  const handleNewCategory = () => {
    setEditingCategory(null);
    setViewingCategory(null);
    setFormMode('create');
    setCurrentView('form');
  };

  const handleBack = () => {
    setCurrentView('records');
    setEditingCategory(null);
    setViewingCategory(null);
    setFormMode('create');
  };

  const getHeaderSubtitle = () => {
    switch (formMode) {
      case 'view':
        return 'Category information and details';
      case 'edit':
        return 'Update category information';
      case 'create':
      default:
        return 'Add a new category to the system';
    }
  };

  return (
    <div className="min-h-screen bg-[#f7f2e5] p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4 md:p-6 border border-[#e8dabe]">
            <div className="flex items-center space-x-3">
              {currentView === 'form' && (
                <motion.button
                  onClick={handleBack}
                  className="p-2 text-gray-600 hover:text-gray-800 hover:bg-[#f7f2e5] rounded-lg transition-colors"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
              )}
              <Package className="h-6 w-6 md:h-7 md:w-7 text-[#8B7355]" />
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-gray-800">
                  Category Management
                </h1>
                <p className="text-sm text-gray-600 mt-1">
                  {currentView === 'records' ? 'Manage product categories' : getHeaderSubtitle()}
                </p>
              </div>
            </div>

            {currentView === 'records' && (
              <motion.button
                onClick={handleNewCategory}
                className="bg-[#8B7355] text-white px-4 py-2 rounded-lg hover:bg-[#7A6249] transition-colors flex items-center space-x-2 text-sm md:text-base"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Category</span>
                <span className="sm:hidden">Add</span>
              </motion.button>
            )}
          </div>
        </motion.div>

        {/* Content */}
        <AnimatePresence mode="wait">
          {currentView === 'records' ? (
            <motion.div
              key="records"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <CategoryRecords
                categories={categories}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteCategory}
                onRefresh={fetchCategories}
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
              <CategoryForm
                editingCategory={editingCategory}
                viewingCategory={viewingCategory}
                onSubmit={formMode === 'edit' ? handleUpdateCategory : handleCreateCategory}
                onCancel={handleBack}
                mode={formMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};


import React, { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { Save, X, Upload, Image as ImageIcon, Eye, Edit3, Package } from 'lucide-react';
import { BASE_URL } from '../../../../config'

export default function HotelForm({
  editingCategory,
  viewingCategory,
  onSubmit,
  onCancel,
  mode = 'create'
}) {
  const [formData, setFormData] = useState({
    Category_Title: '',
    Category_Description: '',
    Gender: '',
    image: null
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef(null);

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';
  const isCreateMode = mode === 'create';

  // Pre-fill form when editing or viewing
  useEffect(() => {
    const categoryData = editingCategory || viewingCategory;

    if ((isEditMode || isViewMode) && categoryData) {
      setFormData({
        Category_Title: categoryData.Category_Title || '',
        Category_Description: categoryData.Category_Description || '',
        Gender: categoryData.Gender || '',
        image: null // Don't set the image file, just show preview
      });

      // Set image preview if exists
      if (categoryData.Image_URL) {
        setImagePreview(BASE_URL + '/' + categoryData.Image_URL);
      }
    } else if (isCreateMode) {
      setFormData({
        Category_Title: '',
        Gender: '',
        image: null
      });
      setImagePreview(null);
    }
    setErrors({});
  }, [editingCategory, viewingCategory, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleImageChange = (file) => {
    if (file && file.type.startsWith('image/')) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));

      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target.result);
      };
      reader.readAsDataURL(file);

      // Clear image error
      if (errors.image) {
        setErrors(prev => ({ ...prev, image: '' }));
      }
    } else {
      toast.error('Please select a valid image file');
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragActive(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleImageChange(file);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const removeImage = () => {
    setFormData(prev => ({ ...prev, image: null }));
    setImagePreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.Category_Title.trim()) {
      newErrors.Category_Title = 'Category title is required';
    } else if (formData.Category_Title.length < 2) {
      newErrors.Category_Title = 'Category title must be at least 2 characters';
    }

    if (!formData.Gender) {
      newErrors.Gender = 'Gender is required';
    }

    if (isCreateMode && !formData.image && !imagePreview) {
      newErrors.image = 'Category image is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditMode) {
        const editData = {
          Category_ID: editingCategory.Category_ID,
          Category_Title: formData.Category_Title,
          Category_Description: formData.Category_Description,
          Gender: formData.Gender
        };

        // If there's a new image, include it
        if (formData.image) {
          editData.image = formData.image;
        }

        await onSubmit(editData);
      } else if (isCreateMode) {
        await onSubmit(formData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormIcon = () => {
    switch (mode) {
      case 'view':
        return <Eye className="h-6 w-6 text-[#8B7355]" />;
      case 'edit':
        return <Edit3 className="h-6 w-6 text-[#8B7355]" />;
      default:
        return <Package className="h-6 w-6 text-[#8B7355]" />;
    }
  };

  const getFormTitle = () => {
    switch (mode) {
      case 'view':
        return 'Category Details';
      case 'edit':
        return 'Edit Category';
      default:
        return 'Create New Category';
    }
  };

  const getFormSubtitle = () => {
    switch (mode) {
      case 'view':
        return 'View category information and image';
      case 'edit':
        return 'Update category information and image';
      default:
        return 'Add a new category with image';
    }
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-white rounded-lg shadow-sm border border-[#e8dabe] overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-[#f7f2e5] to-[#e8dabe] px-6 py-4 border-b border-[#e8dabe]">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white rounded-lg">
              {getFormIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-800">
                {getFormTitle()}
              </h2>
              <p className="text-sm text-gray-600">
                {getFormSubtitle()}
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Image Upload Section */}
          <div className="flex flex-col items-center justify-center space-y-4 w-full">
            {/* Label */}
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <ImageIcon className="h-4 w-4" />
              <span>Category Image {!isViewMode && '*'}</span>
            </label>

            {/* Image Preview + Upload */}
            <div className="flex flex-col items-center justify-center space-y-4">
              {imagePreview && (
                <motion.div
                  className="relative inline-block"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                >
                  <img
                    src={imagePreview}
                    alt="Category preview"
                    className="w-32 h-32 object-cover rounded-lg border-2 border-gray-300"
                  />
                  {!isViewMode && (
                    <motion.button
                      type="button"
                      onClick={removeImage}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-red-600"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      ✕
                    </motion.button>
                  )}
                </motion.div>
              )}

              {!isViewMode && (
                <div
                  className={`border-2 border-dashed rounded-lg p-6 w-full max-w-xs text-center transition-colors
          ${dragActive
                      ? 'border-[#8B7355] bg-[#f7f2e5]'
                      : errors.image
                        ? 'border-red-300 bg-red-50'
                        : 'border-gray-300 hover:border-[#8B7355] hover:bg-[#f7f2e5]'
                    }`}
                  onDrop={handleDrop}
                  onDragOver={handleDrag}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleFileSelect}
                    className="hidden"
                  />

                  <div className="space-y-2">
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <div className="text-sm text-gray-600">
                      <button
                        type="button"
                        onClick={() => fileInputRef.current?.click()}
                        className="text-[#8B7355] hover:text-[#7A6249] font-medium"
                      >
                        Click to upload
                      </button>
                      <span> or drag and drop</span>
                    </div>
                    <p className="text-xs text-gray-500">PNG, JPG, GIF up to 10MB</p>
                  </div>
                </div>
              )}
            </div>

            {/* Error */}
            {errors.image && (
              <motion.p
                className="text-red-500 text-sm flex items-center"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>{errors.image}</span>
              </motion.p>
            )}
          </div>


          {/* Category Title Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Package className="h-4 w-4" />
              <span>Category Title *</span>
            </label>
            <input
              type="text"
              name="Category_Title"
              value={formData.Category_Title}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent transition-colors ${errors.Category_Title ? 'border-red-500' : 'border-gray-300'
                } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter category title"
            />
            {errors.Category_Title && (
              <motion.p
                className="text-red-500 text-sm flex items-center space-x-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>{errors.Category_Title}</span>
              </motion.p>
            )}
          </div>

          {/* Category Description Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <Package className="h-4 w-4" />
              <span>Category Description</span>
            </label>
            <input
              type="text"
              name="Category_Description"
              value={formData.Category_Description}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent transition-colors ${errors.Category_Title ? 'border-red-500' : 'border-gray-300'
                } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
              placeholder="Enter category description (optional)"
            />
            {errors.Category_Description && (
              <motion.p
                className="text-red-500 text-sm flex items-center space-x-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>{errors.Category_Description}</span>
              </motion.p>
            )}
          </div>

          {/* Gender Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              <span>Gender *</span>
            </label>
            <select
              name="Gender"
              value={formData.Gender}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#8B7355] focus:border-transparent transition-colors ${errors.Gender ? 'border-red-500' : 'border-gray-300'
                } ${isViewMode ? 'bg-gray-50 cursor-not-allowed' : ''}`}
            >
              <option value="">Select gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Unisex">Unisex</option>
            </select>
            {errors.Gender && (
              <motion.p
                className="text-red-500 text-sm flex items-center space-x-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>{errors.Gender}</span>
              </motion.p>
            )}
          </div>

          {/* Category ID Field (View/Edit Mode Only) */}
          {(isViewMode || isEditMode) && (editingCategory || viewingCategory) && (
            <div className="space-y-2">
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-700">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                <span>Category ID</span>
              </label>
              <input
                type="text"
                value={(editingCategory || viewingCategory)?.Category_ID || ''}
                disabled
                className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 cursor-not-allowed text-gray-500"
              />
            </div>
          )}

          {/* Form Actions */}
          {!isViewMode && (
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                onClick={onCancel}
                className="w-full sm:w-auto px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center justify-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <X className="h-4 w-4" />
                <span>Cancel</span>
              </motion.button>

              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="w-full sm:w-auto px-6 py-3 bg-[#8B7355] text-white hover:bg-[#7A6249] disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors flex items-center justify-center space-x-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                <Save className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? (isEditMode ? 'Updating...' : 'Creating...')
                    : (isEditMode ? 'Update Category' : 'Create Category')
                  }
                </span>
              </motion.button>
            </div>
          )}

          {/* View Mode Actions */}
          {isViewMode && (
            <div className="flex justify-end pt-6 border-t border-gray-200">
              <motion.button
                type="button"
                onClick={onCancel}
                className="px-6 py-3 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors flex items-center space-x-2"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <X className="h-4 w-4" />
                <span>Close</span>
              </motion.button>
            </div>
          )}
        </form>
      </div>


    </motion.div>
  );
};


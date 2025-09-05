import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Eye, Edit3, Building2, Phone } from "lucide-react";

export default function HotelForm({
  editingHotelDetails,
  viewingHotelDetails,
  onSubmit,
  onCancel,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    Hotel_Name: "",
    Hotel_Contact: "",
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Prefill hotel data when editing/viewing
  useEffect(() => {
    const hotelData = editingHotelDetails || viewingHotelDetails;
    console.log("Hotel Data : ",hotelData)
    if ((isEditMode || isViewMode) && hotelData) {
      setFormData({
        Hotel_ID: hotelData.Hotel_ID,
        Hotel_Name: hotelData.Hotel_Name || "",
        Hotel_Contact: hotelData.Hotel_Contact?.toString() || "",
      });

    } else if (isCreateMode) {
      setFormData({ Hotel_Name: "", Hotel_Contact: "" });
    }
    setErrors({});
  }, [editingHotelDetails, viewingHotelDetails, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Hotel_Name.trim()) {
      newErrors.Hotel_Name = "Hotel name is required";
    }
    if (!formData.Hotel_Contact.trim()) {
      newErrors.Hotel_Contact = "Hotel contact is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const getFormIcon = () => {
    switch (mode) {
      case "view":
        return <Eye className="h-6 w-6 text-purple-400" />;
      case "edit":
        return <Edit3 className="h-6 w-6 text-purple-400" />;
      default:
        return <Building2 className="h-6 w-6 text-purple-400" />;
    }
  };

  const getFormTitle = () => {
    switch (mode) {
      case "view":
        return "Hotel Details";
      case "edit":
        return "Edit Hotel";
      default:
        return "Create New Hotel";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      className="max-w-2xl mx-auto"
    >
      <div className="bg-gray-800/50 backdrop-blur-xl border border-gray-700/50 rounded-xl overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-900/90 to-gray-800/90 px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gray-700/50 rounded-lg backdrop-blur-sm">
              {getFormIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {getFormTitle()}
              </h2>
              <p className="text-sm text-gray-300">
                {isViewMode
                  ? "View hotel information"
                  : isEditMode
                    ? "Update hotel information"
                    : "Add a new hotel to the system"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Hotel Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Hotel Name *
            </label>
            <input
              type="text"
              name="Hotel_Name"
              value={formData.Hotel_Name}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                text-white placeholder-gray-400 transition-all ${errors.Hotel_Name ? "border-red-500/50 ring-2 ring-red-500/20" : "border-gray-600/50"
                } ${isViewMode ? "opacity-60 cursor-not-allowed" : "hover:border-gray-500/50"}`}
              placeholder="Enter hotel name"
            />
            {errors.Hotel_Name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Hotel_Name}
              </motion.p>
            )}
          </motion.div>

          {/* Hotel Contact */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Phone className="h-4 w-4" />
              Hotel Contact *
            </label>
            <input
              type="tel"
              name="Hotel_Contact"
              maxLength={10}
              value={formData.Hotel_Contact}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                text-white placeholder-gray-400 transition-all ${errors.Hotel_Contact ? "border-red-500/50 ring-2 ring-red-500/20" : "border-gray-600/50"
                } ${isViewMode ? "opacity-60 cursor-not-allowed" : "hover:border-gray-500/50"}`}
              placeholder="Enter hotel contact"
            />
            {errors.Hotel_Contact && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Hotel_Contact}
              </motion.p>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex justify-end space-x-3 pt-6 border-t border-gray-700/50"
          >
            <motion.button
              type="button"
              onClick={onCancel}
              className="px-6 py-3 text-gray-300 bg-gray-700/50 hover:bg-gray-600/50 rounded-lg transition-all backdrop-blur-sm flex items-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="h-4 w-4" />
              <span>{isViewMode ? "Close" : "Cancel"}</span>
            </motion.button>

            {!isViewMode && (
              <motion.button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex items-center space-x-2"
                whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
              >
                <Save className="h-4 w-4" />
                <span>
                  {isSubmitting
                    ? isEditMode
                      ? "Updating..."
                      : "Creating..."
                    : isEditMode
                      ? "Update Hotel"
                      : "Create Hotel"}
                </span>
              </motion.button>
            )}
          </motion.div>
        </form>
      </div>
    </motion.div>

  );
}

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Building2, Phone } from "lucide-react";

export default function HA_HotelForm({
  onSubmit,
  onCancel,
  viewingHotelDetails,
}) {
  const [formData, setFormData] = useState({
    TableSize: "",
    TableType: ""
  });
  const isViewMode = !!viewingHotelDetails;
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (viewingHotelDetails) {
      setFormData({
        TableSize: viewingHotelDetails.TableSize || "",
        TableType: viewingHotelDetails.TableType || ""
      });
    } else {
      setFormData({ TableSize: "", TableType: "" });
    }
    setErrors({});
  }, [viewingHotelDetails]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.TableSize || isNaN(formData.TableSize)) {
      newErrors.TableSize = "Table size is required and must be a number";
    }
    if (!formData.TableType) {
      newErrors.TableType = "Table type is required";
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
    return <Building2 className="h-6 w-6 text-purple-400" />;
  };

  const getFormTitle = () => {
    return "Create New Table";
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
                {"Add a new table to the system"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Table Size */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Table Size *
            </label>
            <input
              type="number"
              name="TableSize"
              value={formData.TableSize}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                text-white placeholder-gray-400 transition-all ${errors.TableSize ? "border-red-500/50 ring-2 ring-red-500/20" : "border-gray-600/50"
                } ${isViewMode ? "opacity-60 cursor-not-allowed" : "hover:border-gray-500/50"}`}
              placeholder="Enter table size"
            />
            {errors.TableSize && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.TableSize}
              </motion.p>
            )}
          </motion.div>

          {/* Table Type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Table Type *
            </label>
            <select
              name="TableType"
              value={formData.TableType}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                text-white placeholder-gray-400 transition-all ${errors.TableType ? "border-red-500/50 ring-2 ring-red-500/20" : "border-gray-600/50"
                } ${isViewMode ? "opacity-60 cursor-not-allowed" : "hover:border-gray-500/50"}`}
            >
              <option value="">Select Table Type</option>
              <option value="AC">AC</option>
              <option value="NON-AC">NON-AC</option>
            </select>
            {errors.TableType && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.TableType}
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
                  {isSubmitting ? "Creating..." : "Create Table"}
                </span>
              </motion.button>
            )}
          </motion.div>
        </form>
      </div>
    </motion.div>

  );
}

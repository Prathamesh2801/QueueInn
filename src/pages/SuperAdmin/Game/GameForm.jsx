import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Eye, Edit3, Building2, Phone } from "lucide-react";

export default function GameForm({
  editingGameDetails,
  viewingGameDetails,
  onSubmit,
  onCancel,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    Game_Name: "",
    Reward_Type: "",
    Location: "",
    Number_Of_Playable: "1",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // Prefill game data when editing/viewing
  useEffect(() => {
    const gameData = editingGameDetails || viewingGameDetails;
    if ((isEditMode || isViewMode) && gameData) {
      setFormData({
        Game_ID: gameData.Game_ID,
        Game_Name: gameData.Game_Name || "",
        Reward_Type: gameData.Reward_Type || "",
        Location: gameData.Location || "",
        Number_Of_Playable: gameData.Number_Of_Playable || "1",
      });
    } else if (isCreateMode) {
      setFormData({
        Game_Name: "",
        Reward_Type: "",
        Location: "",
        Number_Of_Playable: "",
      });
    }
    setErrors({});
  }, [editingGameDetails, viewingGameDetails, mode]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Game_Name.trim()) {
      newErrors.Game_Name = "Game name is required";
    }
    if (!formData.Reward_Type.trim()) {
      newErrors.Reward_Type = "Reward type is required";
    }
    if (!formData.Location.trim()) {
      newErrors.Location = "Location is required";
    }
    if (
      !formData.Number_Of_Playable ||
      Number(formData.Number_Of_Playable) < 1
    ) {
      newErrors.Number_Of_Playable = "Enter valid number (min 1)";
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
        return "Game Details";
      case "edit":
        return "Edit Game";
      default:
        return "Create New Game";
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
                  ? "View game information"
                  : isEditMode
                  ? "Update game information"
                  : "Add a new game to the system"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Game Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Game Name *
            </label>
            <input
              type="text"
              name="Game_Name"
              value={formData.Game_Name}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                text-white placeholder-gray-400 transition-all ${
                  errors.Game_Name
                    ? "border-red-500/50 ring-2 ring-red-500/20"
                    : "border-gray-600/50"
                } ${
                isViewMode
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-gray-500/50"
              }`}
              placeholder="Enter game name"
            />
            {errors.Game_Name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Game_Name}
              </motion.p>
            )}
          </motion.div>

          {/* Reward Type */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Reward Type *
            </label>
            <select
              name="Reward_Type"
              value={formData.Reward_Type}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-800 text-white border rounded-lg 
      focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500
      ${
        errors.Reward_Type
          ? "border-red-500 ring-2 ring-red-500/20"
          : "border-gray-600"
      }
      ${
        isViewMode ? "opacity-60 cursor-not-allowed" : "hover:border-gray-500"
      }`}
            >
              <option value="" className="bg-gray-800 text-white">
                Select Reward type
              </option>
              <option value="Product" className="bg-gray-800 text-white">
                Product
              </option>
              <option value="Voucher" className="bg-gray-800 text-white">
                Voucher
              </option>
            </select>
            {errors.Reward_Type && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Reward_Type}
              </motion.p>
            )}
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Location *
            </label>
            <input
              type="text"
              name="Location"
              value={formData.Location}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                text-white placeholder-gray-400 transition-all ${
                  errors.Location
                    ? "border-red-500/50 ring-2 ring-red-500/20"
                    : "border-gray-600/50"
                } ${
                isViewMode
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-gray-500/50"
              }`}
              placeholder="Enter location"
            />
            {errors.Location && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Location}
              </motion.p>
            )}
          </motion.div>
          {/* Number of Playable */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Number Of Playable *
            </label>
            <input
              type="number"
              min="1"
              name="Number_Of_Playable"
              value={formData.Number_Of_Playable}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
      focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
      text-white placeholder-gray-400 transition-all 
      ${
        errors.Number_Of_Playable
          ? "border-red-500/50 ring-2 ring-red-500/20"
          : "border-gray-600/50"
      }
      ${
        isViewMode
          ? "opacity-60 cursor-not-allowed"
          : "hover:border-gray-500/50"
      }`}
              placeholder="Enter number of players that can play"
            />

            {errors.Number_Of_Playable && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Number_Of_Playable}
              </motion.p>
            )}
          </motion.div>

          {/* Actions */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
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
                    ? "Update Game"
                    : "Create Game"}
                </span>
              </motion.button>
            )}
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}

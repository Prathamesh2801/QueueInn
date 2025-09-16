import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Eye, Edit3, Package } from "lucide-react";
import Select from "react-select";
import { getGameDetails } from "../../../api/SuperAdmin/Game Management/GameManagementAPI";
import { toast } from "react-hot-toast";

export default function SlotForm({
  editingSlotDetails,
  viewingSlotDetails,
  deviceOptions = [], // array of device objects
  onSubmit,
  onCancel,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    Slot_ID: "",
    Device_ID: "",
    Game_ID: "",
    Remain_Product: "",
  });
  const [selectedDevice, setSelectedDevice] = useState(null); // react-select option
  const [selectedGame, setSelectedGame] = useState(null); // react-select option for games
  const [gameOptions, setGameOptions] = useState([]); // available games based on device location
  const [loadingGames, setLoadingGames] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // prepare react-select options from deviceOptions
  const selectOptions = (deviceOptions || []).map(d => ({
    value: d.Device_ID,
    label: `${d.Device_ID}${d.Name ? ` — ${d.Name}` : ''}${d.Location ? ` (${d.Location})` : ''}`,
    location: d.Location // store location for later use
  }));

  // prepare react-select options from gameOptions
  const gameSelectOptions = (gameOptions || []).map(g => ({
    value: g.Game_ID,
    label: `${g.Game_ID}${g.Game_Name ? ` — ${g.Game_Name}` : ''}${g.Reward_Type ? ` (${g.Reward_Type})` : ''}`
  }));

  // fetch games based on device location
  const fetchGamesByLocation = async (location) => {
    if (!location) {
      setGameOptions([]);
      return;
    }

    try {
      setLoadingGames(true);
      const response = await getGameDetails({ Location: location });
      
      if (response?.Status) {
        setGameOptions(response.Data || []);
        console.log('Fetched games for location:', location, response.Data);
      } else {
        toast.error(response?.Message || 'Failed to fetch games');
        setGameOptions([]);
      }
    } catch (err) {
      console.error('Error fetching games:', err);
      toast.error('Error fetching games');
      setGameOptions([]);
    } finally {
      setLoadingGames(false);
    }
  };

  useEffect(() => {
    const slotData = editingSlotDetails || viewingSlotDetails;
    if ((isEditMode || isViewMode) && slotData) {
      setFormData({
        Slot_ID: slotData.Slot_ID,
        Device_ID: slotData.Device_ID || "",
        Game_ID: slotData.Game_ID || "",
        Remain_Product: slotData.Remain_Product?.toString() || "",
      });

      const matchingDevice = selectOptions.find(o => o.value === slotData.Device_ID);
      setSelectedDevice(matchingDevice || null);

      // If we have device with location, fetch games for that location
      if (matchingDevice?.location) {
        fetchGamesByLocation(matchingDevice.location);
      }

      // Set selected game if we have Game_ID (will be set after games are loaded)
      if (slotData.Game_ID) {
        // We'll set this in another useEffect after games are loaded
      }
    } else if (isCreateMode) {
      setFormData({ Slot_ID: "", Device_ID: "", Game_ID: "", Remain_Product: "" });
      setSelectedDevice(null);
      setSelectedGame(null);
      setGameOptions([]);
    }
    setErrors({});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingSlotDetails, viewingSlotDetails, mode, deviceOptions]);

  // Set selected game after games are loaded (for edit/view mode)
  useEffect(() => {
    const slotData = editingSlotDetails || viewingSlotDetails;
    if ((isEditMode || isViewMode) && slotData?.Game_ID && gameOptions.length > 0) {
      const matchingGame = gameSelectOptions.find(o => o.value === slotData.Game_ID);
      setSelectedGame(matchingGame || null);
    }
  }, [gameOptions, editingSlotDetails, viewingSlotDetails, isEditMode, isViewMode]);

  const validateForm = () => {
    const newErrors = {};
    if (!selectedDevice || !selectedDevice.value) {
      newErrors.Device_ID = "Device ID is required";
    }
    if (!selectedGame || !selectedGame.value) {
      newErrors.Game_ID = "Game ID is required";
    }
    if (!formData.Remain_Product?.toString().trim()) {
      newErrors.Remain_Product = "Remaining Product is required";
    } else if (isNaN(Number(formData.Remain_Product))) {
      newErrors.Remain_Product = "Remaining Product must be a number";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleSelectChange = (option) => {
    setSelectedDevice(option);
    setFormData(prev => ({ ...prev, Device_ID: option?.value || "" }));
    
    // Reset game selection when device changes
    setSelectedGame(null);
    setFormData(prev => ({ ...prev, Game_ID: "" }));
    
    // Fetch games for the selected device's location
    if (option?.location) {
      fetchGamesByLocation(option.location);
    } else {
      setGameOptions([]);
    }
    
    if (errors.Device_ID) setErrors(prev => ({ ...prev, Device_ID: "" }));
  };

  const handleGameSelectChange = (option) => {
    setSelectedGame(option);
    setFormData(prev => ({ ...prev, Game_ID: option?.value || "" }));
    if (errors.Game_ID) setErrors(prev => ({ ...prev, Game_ID: "" }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    const payload = {
      Device_ID: selectedDevice.value,
      Game_ID: selectedGame.value,
      Remain_Product: Number(formData.Remain_Product),
    };

    // include Slot_ID for edit
    if (isEditMode && formData.Slot_ID) {
      payload.Slot_ID = formData.Slot_ID;
    }

    setIsSubmitting(true);
    try {
      await onSubmit(payload);
    } catch (error) {
      console.error("Slot form submission error:", error);
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
        return <Package className="h-6 w-6 text-purple-400" />;
    }
  };

  const getFormTitle = () => {
    switch (mode) {
      case "view":
        return "Slot Details";
      case "edit":
        return "Edit Slot";
      default:
        return "Create New Slot";
    }
  };

  // react-select custom styles to ensure white text on dark background
  const selectStyles = {
    control: (provided, state) => ({
      ...provided,
      background: 'rgba(31,41,55,0.6)', // dark translucent background
      borderColor: errors.Device_ID ? '#f87171' : (state.isFocused ? '#3b82f6' : '#4b5563'),
      boxShadow: state.isFocused ? '0 0 0 1px rgba(59,130,246,0.25)' : 'none',
      minHeight: '44px',
      color: '#fff',
    }),
    valueContainer: (provided) => ({
      ...provided,
      padding: '6px 10px',
    }),
    singleValue: (provided) => ({ ...provided, color: '#fff', margin: 0 }),
    input: (provided) => ({ ...provided, color: '#fff' }),
    placeholder: (provided) => ({ ...provided, color: 'rgba(255,255,255,0.6)' }),
    menu: (provided) => ({ ...provided, background: '#0b1220', zIndex: 9999 }),
    menuList: (provided) => ({ ...provided, background: '#0b1220', padding: 0 }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused ? '#111827' : 'transparent',
      color: state.isSelected ? '#fff' : '#E5E7EB',
      padding: '10px 12px',
      cursor: 'pointer',
    }),
    dropdownIndicator: (provided) => ({ ...provided, color: '#9CA3AF', padding: 4 }),
    indicatorSeparator: () => ({ display: 'none' }),
    clearIndicator: (provided) => ({ ...provided, color: '#9CA3AF' }),
    noOptionsMessage: (provided) => ({ ...provided, color: 'rgba(255,255,255,0.7)' }),
    loadingMessage: (provided) => ({ ...provided, color: 'rgba(255,255,255,0.7)' }),
  };

  // Game select styles (with different error field)
  const gameSelectStyles = {
    ...selectStyles,
    control: (provided, state) => ({
      ...provided,
      background: 'rgba(31,41,55,0.6)',
      borderColor: errors.Game_ID ? '#f87171' : (state.isFocused ? '#3b82f6' : '#4b5563'),
      boxShadow: state.isFocused ? '0 0 0 1px rgba(59,130,246,0.25)' : 'none',
      minHeight: '44px',
      color: '#fff',
    }),
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
            <div className="p-2 bg-gray-700/50 rounded-lg">
              {getFormIcon()}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {getFormTitle()}
              </h2>
              <p className="text-sm text-gray-300">
                {isViewMode
                  ? "View slot information"
                  : isEditMode
                    ? "Update slot information"
                    : "Add a new slot to the system"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Device ID (react-select) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Device ID *
            </label>

            <div className={`${isViewMode ? 'opacity-60 pointer-events-none' : ''}`}>
              <Select
                isDisabled={isViewMode}
                options={selectOptions}
                value={selectedDevice}
                onChange={handleSelectChange}
                placeholder="Select device..."
                classNamePrefix="react-select"
                styles={selectStyles}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                menuShouldBlockScroll={true}
              />
            </div>

            {errors.Device_ID && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Device_ID}
              </motion.p>
            )}
          </motion.div>

          {/* Game ID (react-select) */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Game ID *
            </label>

            <div className={`${isViewMode ? 'opacity-60 pointer-events-none' : ''}`}>
              <Select
                isDisabled={isViewMode || !selectedDevice || loadingGames}
                isLoading={loadingGames}
                options={gameSelectOptions}
                value={selectedGame}
                onChange={handleGameSelectChange}
                placeholder={
                  !selectedDevice 
                    ? "Select device first..." 
                    : loadingGames 
                    ? "Loading games..." 
                    : gameOptions.length === 0 
                    ? "No games available for this location"
                    : "Select game..."
                }
                classNamePrefix="react-select"
                styles={gameSelectStyles}
                menuPortalTarget={typeof document !== 'undefined' ? document.body : undefined}
                menuShouldBlockScroll={true}
                noOptionsMessage={() => 
                  !selectedDevice 
                    ? "Please select a device first"
                    : "No games available for this location"
                }
              />
            </div>

            {errors.Game_ID && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Game_ID}
              </motion.p>
            )}
          </motion.div>

          {/* Remain Product */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Remaining Product *
            </label>
            <input
              type="number"
              name="Remain_Product"
              value={formData.Remain_Product}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                text-white placeholder-gray-400 transition-all ${errors.Remain_Product ? "border-red-500/50 ring-2 ring-red-500/20" : "border-gray-600/50"
                } ${isViewMode ? "opacity-60 cursor-not-allowed" : "hover:border-gray-500/50"}`}
              placeholder="Enter remaining product"
            />
            {errors.Remain_Product && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Remain_Product}
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
                      ? "Update Slot"
                      : "Create Slot"}
                </span>
              </motion.button>
            )}
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}
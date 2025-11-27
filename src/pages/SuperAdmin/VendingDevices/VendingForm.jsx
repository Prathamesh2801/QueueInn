// src/components/.../VendingForm.jsx  (path as per your project)
import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Save,
  X,
  Eye,
  Edit3,
  Building2,
  Phone,
  Search,
  Loader2,
  MapPin,
} from "lucide-react";

import { getHotelDetails } from "../../../api/SuperAdmin/Hotel/HotelAPIfetch";

export default function VendingForm({
  editingDeviceDetails,
  viewingDeviceDetails,
  onSubmit,
  onCancel,
  mode = "create",
}) {
  const [formData, setFormData] = useState({
    Hotel_ID: "",
    Location: "",
    Name: "",
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 🔎 Hotel search state
  const [allHotels, setAllHotels] = useState([]); // full list from API
  const [hotelQuery, setHotelQuery] = useState(""); // text in search box
  const [hotelResults, setHotelResults] = useState([]); // filtered list
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [hotelLoading, setHotelLoading] = useState(false);
  const [showHotelDropdown, setShowHotelDropdown] = useState(false);

  const isViewMode = mode === "view";
  const isEditMode = mode === "edit";
  const isCreateMode = mode === "create";

  // =============================
  // 1) Load ALL hotels once
  // =============================
  const loadAllHotels = async () => {
    try {
      setHotelLoading(true);
      const res = await getHotelDetails(); // no filters → backend returns all
      console.log("Hotel list for VendingForm:", res);

      if (res?.Status && Array.isArray(res.Data)) {
        setAllHotels(res.Data);
        // show all initially (optional)
        setHotelResults(res.Data);
      } else {
        setAllHotels([]);
        setHotelResults([]);
      }
    } catch (err) {
      console.error("Error loading hotels:", err);
      setAllHotels([]);
      setHotelResults([]);
    } finally {
      setHotelLoading(false);
    }
  };

  // =============================
  // 2) Prefill when editing/viewing
  // =============================
  useEffect(() => {
    const deviceData = editingDeviceDetails || viewingDeviceDetails;

    if ((isEditMode || isViewMode) && deviceData) {
      setFormData({
        Device_ID: deviceData.Device_ID,
        Hotel_ID: deviceData.Hotel_ID || "",
        Location: deviceData.Location || "",
        Name: deviceData.Name || "",
      });

      // We'll set the hotelQuery after hotels have loaded
      setSelectedHotel(null);
    } else if (isCreateMode) {
      setFormData({
        Hotel_ID: "",
        Location: "",
        Name: "",
      });
      setSelectedHotel(null);
      setHotelQuery("");
    }
    setErrors({});
  }, [editingDeviceDetails, viewingDeviceDetails, mode]);

  // Load hotels once when form is shown
  useEffect(() => {
    loadAllHotels();
  }, []);

  // After hotels are loaded, if we already know Hotel_ID from edit/view, set the visible text
  useEffect(() => {
    if (!formData.Hotel_ID || allHotels.length === 0) return;

    const found = allHotels.find((h) => h.Hotel_ID === formData.Hotel_ID);
    if (found) {
      setSelectedHotel(found);
      setHotelQuery(
        `${found.Hotel_Name} (${found.Hotel_ID}) | ${
          found.Hotel_Contact || "No contact"
        }`
      );
    } else {
      // fallback: show just the ID
      setHotelQuery(`Hotel ID: ${formData.Hotel_ID}`);
    }
  }, [formData.Hotel_ID, allHotels]);

  // =============================
  // 3) Handle text input changes
  // =============================
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  // Hotel search box change → fuzzy filter on frontend
  const handleHotelQueryChange = (e) => {
    const value = e.target.value;
    setHotelQuery(value);

    if (errors.Hotel_ID) {
      setErrors((prev) => ({ ...prev, Hotel_ID: "" }));
    }

    if (!value.trim()) {
      // if empty, either show all or none; here we show all
      setHotelResults(allHotels);
      setShowHotelDropdown(true);
      setSelectedHotel(null);
      setFormData((prev) => ({ ...prev, Hotel_ID: "" }));
      return;
    }

    const q = value.toLowerCase();

    const filtered = allHotels.filter((h) => {
      const id = h.Hotel_ID || "";
      const name = h.Hotel_Name || "";
      const contact = h.Hotel_Contact != null ? String(h.Hotel_Contact) : "";
      const location = h.Hotel_Location || "";

      return (
        id.toLowerCase().includes(q) ||
        name.toLowerCase().includes(q) ||
        contact.toLowerCase().includes(q) ||
        location.toLowerCase().includes(q)
      );
    });

    setHotelResults(filtered);
    setShowHotelDropdown(true);
  };

  const handleSelectHotel = (hotel) => {
    setSelectedHotel(hotel);

    setFormData((prev) => ({
      ...prev,
      Hotel_ID: hotel.Hotel_ID,
      // ⬇️ auto-fill Location from the selected hotel
      Location: hotel.Hotel_Location || prev.Location || "",
    }));

    setHotelQuery(
      `${hotel.Hotel_Name} (${hotel.Hotel_ID}) | ${
        hotel.Hotel_Contact || "No contact"
      }`
    );
    setShowHotelDropdown(false);

    if (errors.Hotel_ID) {
      setErrors((prev) => ({ ...prev, Hotel_ID: "" }));
    }
  };

  // =============================
  // 4) Validation + submit
  // =============================
  const validateForm = () => {
    const newErrors = {};
    if (!formData.Hotel_ID || !String(formData.Hotel_ID).trim()) {
      newErrors.Hotel_ID = "Please select a hotel from the list";
    }
    if (!formData.Location.trim()) {
      newErrors.Location = "Location is required";
    }
    if (!formData.Name.trim()) {
      newErrors.Name = "Device name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData); // goes to createVendingDeviceDetails / updateVendingDeviceDetails
    } catch (error) {
      console.error("Form submission error:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // =============================
  // 5) UI helpers
  // =============================
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
        return "Vending Device Details";
      case "edit":
        return "Edit Vending Device";
      default:
        return "Create New Vending Device";
    }
  };

  // =============================
  // 6) JSX
  // =============================
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
                  ? "View vending device information"
                  : isEditMode
                  ? "Update vending device information"
                  : "Add a new vending device to the system"}
              </p>
            </div>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Hotel fuzzy search */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.05 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Hotel *
            </label>
            <div className="relative">
              <input
                type="text"
                name="Hotel_Search"
                value={hotelQuery}
                onChange={handleHotelQueryChange}
                disabled={isViewMode}
                onFocus={() => {
                  if (!isViewMode && hotelResults.length > 0) {
                    setShowHotelDropdown(true);
                  }
                }}
                className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
                  focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                  text-white placeholder-gray-400 transition-all ${
                    errors.Hotel_ID
                      ? "border-red-500/50 ring-2 ring-red-500/20"
                      : "border-gray-600/50"
                  } ${
                  isViewMode
                    ? "opacity-60 cursor-not-allowed"
                    : "hover:border-gray-500/50"
                }`}
                placeholder="Search by Hotel ID / Name / Contact / Location"
              />
              <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                {hotelLoading && (
                  <Loader2 className="h-4 w-4 animate-spin text-gray-300" />
                )}
                <Search className="h-4 w-4 text-gray-400" />
              </div>

              {/* Dropdown */}
              {!isViewMode && showHotelDropdown && hotelResults.length > 0 && (
                <div className="absolute z-20 mt-1 w-full max-h-60 overflow-y-auto bg-gray-900/95 border border-gray-700/60 rounded-lg shadow-xl">
                  {hotelResults.map((hotel) => (
                    <button
                      key={hotel.Hotel_ID}
                      type="button"
                      onClick={() => handleSelectHotel(hotel)}
                      className="w-full text-left px-4 py-2 hover:bg-gray-700/80 flex flex-col gap-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-semibold text-white">
                          {hotel.Hotel_Name}
                        </span>
                        <span className="text-xs text-gray-300">
                          ID: {hotel.Hotel_ID}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-gray-400">
                        {hotel.Hotel_Contact && (
                          <span className="flex items-center gap-1">
                            <Phone className="h-3 w-3" />
                            {hotel.Hotel_Contact}
                          </span>
                        )}
                        {hotel.Hotel_Location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {hotel.Hotel_Location}
                          </span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedHotel && (
              <p className="text-xs text-gray-300">
                Selected:{" "}
                <span className="font-medium">{selectedHotel.Hotel_Name}</span>{" "}
                (ID: {selectedHotel.Hotel_ID})
              </p>
            )}

            {errors.Hotel_ID && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Hotel_ID}
              </motion.p>
            )}
          </motion.div>

          {/* Device Name */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-2"
          >
            <label className="text-sm font-medium text-gray-200 flex items-center gap-2">
              Device Name *
            </label>
            <input
              type="text"
              name="Name"
              value={formData.Name}
              onChange={handleInputChange}
              disabled={isViewMode}
              className={`w-full px-4 py-3 bg-gray-700/50 backdrop-blur-sm border rounded-lg 
                focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500/50 
                text-white placeholder-gray-400 transition-all ${
                  errors.Name
                    ? "border-red-500/50 ring-2 ring-red-500/20"
                    : "border-gray-600/50"
                } ${
                isViewMode
                  ? "opacity-60 cursor-not-allowed"
                  : "hover:border-gray-500/50"
              }`}
              placeholder="Enter device name"
            />
            {errors.Name && (
              <motion.p
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="text-red-400 text-sm"
              >
                {errors.Name}
              </motion.p>
            )}
          </motion.div>

          {/* Location */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
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
                    ? "Update Device"
                    : "Create Device"}
                </span>
              </motion.button>
            )}
          </motion.div>
        </form>
      </div>
    </motion.div>
  );
}

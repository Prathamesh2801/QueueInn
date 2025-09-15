import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Save, X, Eye, EyeOff, User, Shield, Building } from "lucide-react";
import Select from 'react-select';
import { getHotelDetails } from "../../../api/SuperAdmin/Hotel/HotelAPIfetch";

export default function HA_UserCredentialForm({
  editingUser, onSubmit, onCancel, isEdit = false
}) {
  const storedRole = localStorage.getItem('Role');
  const storedHotelID = localStorage.getItem('Hotel_ID');
  const [userRole, setUserRole] = useState(storedRole || '');
  const [userHotelID, setUserHotelID] = useState(storedHotelID || '');

  const [formData, setFormData] = useState({
    Username: '',
    Password: '',
    Role: 'Hotel_Staff',
    Hotel_ID: ''
  });
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [hotelOptions, setHotelOptions] = useState([]);
  const [loadingShops, setLoadingShops] = useState(false);

  useEffect(() => {
    const fetchAllHotels = async () => {
      setLoadingShops(true);
      try {
        const filters = {};
        if (userRole === 'Super_Admin' && userHotelID) {
          filters.Hotel_ID = userHotelID; // Pass Hotel_ID only for Super_Admin
        }
        const res = await getHotelDetails(filters);
        console.log("Hotel Response", res);
        if (res.Status) {
          const options = res.Data.map((hotel) => ({
            value: hotel.Hotel_ID,
            label: `${hotel.Hotel_Name} (${hotel.Hotel_Contact})`,
          }));
          setHotelOptions(options);

          // Pre-fill Hotel_ID if Super_Admin
          if (userRole === 'Super_Admin' && userHotelID) {
            const matchedHotel = options.find(opt => opt.value === userHotelID);
            if (matchedHotel) {
              setFormData(prev => ({
                ...prev,
                Hotel_ID: matchedHotel.value
              }));
            }
          }
        }
      } catch (err) {
        console.error("Error loading hotels:", err);
      } finally {
        setLoadingShops(false);
      }
    };
    fetchAllHotels();
  }, [userRole, userHotelID]);


  // Pre-fill form when editing
  useEffect(() => {
    if (isEdit && editingUser) {
      setFormData({
        Username: editingUser.Username || '',
        Password: '', // Don't pre-fill password for security
        Role: editingUser.Role || '',
        Hotel_ID: editingUser.Hotel_ID || ''
      });
    } else {
      setFormData({
        Username: '',
        Password: '',
        Role: '',
        Hotel_ID: ''
      });
    }
    setErrors({});
  }, [editingUser, isEdit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleHotelChange = (selected) => {
    setFormData((prev) => ({ ...prev, Hotel_ID: selected ? selected.value : "" }));
    if (errors.Hotel_ID) {
      setErrors((prev) => ({ ...prev, Hotel_ID: "" }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.Username.trim()) {
      newErrors.Username = 'Username is required';
    } else if (formData.Username.length < 2) {
      newErrors.Username = 'Username must be at least 2 characters';
    }
    if (!formData.Password.trim() && !isEdit) {
      newErrors.Password = 'Password is required';
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
      // Always set Role as 'Hotel_Staff'
      const submitData = { ...formData, Role: 'Hotel_Staff' };

      // Remove Hotel_ID if the logged-in user is Super_Admin
      // if (userRole === 'Super_Admin') {
      //   delete submitData.Hotel_ID;
      // }

      if (isEdit) {
        const editData = { Username: formData.Username };
        if (formData.Password) editData.Password = formData.Password;
        if (formData.Hotel_ID && userRole !== 'Super_Admin') {
          editData.Hotel_ID = formData.Hotel_ID;
        }
        await onSubmit(editData);
      } else {
        await onSubmit(submitData);
      }
    } catch (error) {
      console.error('Form submission error:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const shouldShowHotelID = userRole === 'Super_Admin';


  // Custom styles for react-select to match dark theme
  const customSelectStyles = {
    control: (provided, state) => ({
      ...provided,
      backgroundColor: 'rgb(31 41 55)', // bg-gray-800
      borderColor: state.isFocused ? 'rgb(59 130 246)' : 'rgb(75 85 99)', // border-blue-500 : border-gray-600
      borderRadius: '0.5rem',
      minHeight: '3rem',
      paddingLeft: '0.5rem',
      paddingRight: '0.5rem',
      boxShadow: state.isFocused ? '0 0 0 2px rgba(59, 130, 246, 0.5)' : 'none',
      '&:hover': {
        borderColor: 'rgb(59 130 246)'
      }
    }),
    input: (provided) => ({
      ...provided,
      color: 'white'
    }),
    singleValue: (provided) => ({
      ...provided,
      color: 'white'
    }),
    placeholder: (provided) => ({
      ...provided,
      color: 'rgb(156 163 175)' // text-gray-400
    }),
    menu: (provided) => ({
      ...provided,
      backgroundColor: 'rgb(31 41 55)', // bg-gray-800
      border: '1px solid rgb(75 85 99)', // border-gray-600
      borderRadius: '0.5rem',
      zIndex: 9999
    }),
    menuList: (provided) => ({
      ...provided,
      backgroundColor: 'rgb(31 41 55)', // bg-gray-800
      borderRadius: '0.5rem'
    }),
    option: (provided, state) => ({
      ...provided,
      backgroundColor: state.isFocused
        ? 'rgb(59 130 246)' // bg-blue-500
        : state.isSelected
          ? 'rgb(37 99 235)' // bg-blue-600
          : 'rgb(31 41 55)', // bg-gray-800
      color: 'white',
      '&:hover': {
        backgroundColor: 'rgb(59 130 246)' // bg-blue-500
      }
    }),
    dropdownIndicator: (provided) => ({
      ...provided,
      color: 'rgb(156 163 175)', // text-gray-400
      '&:hover': {
        color: 'white'
      }
    }),
    clearIndicator: (provided) => ({
      ...provided,
      color: 'rgb(156 163 175)', // text-gray-400
      '&:hover': {
        color: 'white'
      }
    })
  };

  return (
    <motion.div
      className="max-w-2xl mx-auto"
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 overflow-hidden">
        {/* Form Header */}
        <div className="bg-gradient-to-r from-blue-500/20 to-purple-600/20 backdrop-blur-xl px-6 py-4 border-b border-gray-700/50">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
              <User className="h-6 w-6 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                {isEdit ? 'Edit User' : 'Create New User'}
              </h2>
              <p className="text-sm text-gray-300">
                {isEdit
                  ? 'Update user information and permissions'
                  : 'Add a new user to the system'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-6">
          {/* Username Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-200">
              <User className="h-4 w-4 text-blue-400" />
              <span>Username</span>
            </label>
            <input
              type="text"
              name="Username"
              value={formData.Username}
              onChange={handleInputChange}
              disabled={isEdit}
              className={`w-full px-4 py-3 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400 ${errors.Username ? 'border-red-500' : 'border-gray-600'
                } ${isEdit ? 'bg-gray-700/50 cursor-not-allowed opacity-75' : 'hover:border-gray-500'}`}
              placeholder="Enter username"
            />
            {errors.Username && (
              <motion.p
                className="text-red-400 text-sm flex items-center space-x-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>{errors.Username}</span>
              </motion.p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-200">
              <Shield className="h-4 w-4 text-blue-400" />
              <span>{isEdit ? 'New Password (optional)' : 'Password'}</span>
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                name="Password"
                value={formData.Password}
                onChange={handleInputChange}
                className={`w-full px-4 py-3 pr-12 bg-gray-800 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all text-white placeholder-gray-400 hover:border-gray-500 ${errors.Password ? 'border-red-500' : 'border-gray-600'
                  }`}
                placeholder={isEdit ? 'Leave blank to keep current password' : 'Enter password'}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white transition-colors"
              >
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
            {errors.Password && (
              <motion.p
                className="text-red-400 text-sm flex items-center space-x-1"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <span>{errors.Password}</span>
              </motion.p>
            )}
          </div>

          {/* Role Field */}
          <div className="space-y-2">
            <label className="flex items-center space-x-2 text-sm font-medium text-gray-200">
              <Shield className="h-4 w-4 text-blue-400" />
              <span>Role</span>
            </label>
            <input
              type="text"
              name="Role"
              value="Hotel_Staff"
              readOnly
              className="w-full px-4 py-3 bg-gray-800 border rounded-lg text-white placeholder-gray-400 cursor-not-allowed"
            />
          </div>


          {/* Hotel ID Field - Conditional */}
          {shouldShowHotelID && (
            <motion.div
              className="space-y-2 relative"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3 }}
            >
              <label className="flex items-center space-x-2 text-sm font-medium text-gray-200">
                <Building className="h-4 w-4 text-blue-400" />
                <span>Hotel ID <span className="text-red-400">*</span></span>
              </label>
              <div className="relative z-50">
                <Select
                  isClearable
                  isSearchable
                  isLoading={loadingShops}
                  options={Array.isArray(hotelOptions) ? hotelOptions : []}
                  value={(Array.isArray(hotelOptions) ? hotelOptions : []).find((opt) => opt.value === formData.Hotel_ID) || null}
                  onChange={handleHotelChange}
                  placeholder="Search or select a hotel..."
                  styles={customSelectStyles}
                  menuPlacement="auto"
                  menuPortalTarget={document.body}
                  classNamePrefix="react-select"
                />
              </div>
              {errors.Hotel_ID && (
                <motion.p
                  className="text-red-400 text-sm flex items-center space-x-1"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                >
                  <span>{errors.Hotel_ID}</span>
                </motion.p>
              )}
            </motion.div>
          )}

          {!shouldShowHotelID && formData.Role && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg"
            >
              <p className="text-sm text-blue-300 flex items-center space-x-2">
                <Shield className="h-4 w-4" />
                <span>Super Admin role doesn't require hotel assignment</span>
              </p>
            </motion.div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-end space-y-3 sm:space-y-0 sm:space-x-3 pt-6 border-t border-gray-700/50">
            <motion.button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 text-gray-300 bg-gray-700/50 hover:bg-gray-700 rounded-lg transition-all flex items-center justify-center space-x-2 backdrop-blur-sm border border-gray-600/50"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <X className="h-4 w-4" />
              <span>Cancel</span>
            </motion.button>

            <motion.button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-all flex items-center justify-center space-x-2 backdrop-blur-sm"
              whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
              whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
            >
              <Save className="h-4 w-4" />
              <span>
                {isSubmitting
                  ? (isEdit ? 'Updating...' : 'Creating...')
                  : (isEdit ? 'Update User' : 'Create User')
                }
              </span>
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
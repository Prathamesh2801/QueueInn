import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Package, Plus, ArrowLeft, Building2 } from 'lucide-react';

import {
  getHotelDetails,
  createHotelDetails,
  updateHotelDetails,
  deleteHotelDetails
} from '../../../api/SuperAdmin/Hotel API/HotelAPIfetch';
import HotelRecords from './HotelRecord';
import HotelForm from './HotelForm';

export default function HotelManage() {
  const [currentView, setCurrentView] = useState('records'); // 'records' or 'form'
  const [hotelDetails, setHotelDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingHotelDetails, setEditingHotelDetails] = useState(null);
  const [viewingHotelDetails, setViewingHotelDetails] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'view'


  // Fetch categories on component mount
  useEffect(() => {
    fetchHotelDetails();
  }, []);

  const fetchHotelDetails = async () => {
    setLoading(true);
    try {
      const response = await getHotelDetails();
      if (response.Status) {
        setHotelDetails(response.Data || []);
      } else {
        toast.error(response.Message || 'Failed to fetch hotel details');
      }
    } catch (error) {
      toast.error('Error fetching hotel details');
      console.error('Fetch Hotel Details error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateHotelDetails = async (hotelData) => {
    const promise = createHotelDetails(hotelData);

    toast.promise(promise, {
      loading: 'Creating Hotel Details ...',
      success: (response) => {
        if (response.Status) {
          fetchHotelDetails(); // Refresh the list
          setCurrentView('records');
          return response.Message || 'Hotel Details created successfully!';
        }
        throw new Error(response.Message || 'Failed to create Hotel Details');
      },
      error: (err) => err.message || 'Failed to create Hotel Details'
    });

    return promise;
  };

  const handleUpdateHotelDetals = async (hotelData) => {
    const promise = updateHotelDetails(hotelData);
    toast.promise(promise, {
      loading: 'Updating Hotel Details ...',
      success: (response) => {
        if (response.Status) {
          fetchHotelDetails();
          setCurrentView('records');
          setEditingHotelDetails(null);
          return response.Message || 'Hotel Details updated successfully!';
        }
        throw new Error(response.Message || 'Failed to update hotel details');
      },
      error: (err) => err.message || 'Failed to update hotel details'
    });

    return promise;
  };


  const handleDeleteHotelDetails = async (hotelID) => {
    const promise = deleteHotelDetails(hotelID);

    toast.promise(promise, {
      loading: 'Deleting Hotel Details ...',
      success: (response) => {
        if (response.Status) {
          fetchHotelDetails(); // Refresh the list
          return response.Message || 'Hotel Details deleted successfully!';
        }
        throw new Error(response.Message || 'Failed to delete Hotel Details');
      },
      error: (err) => err.message || 'Failed to delete hotel details'
    });

    return promise;
  };

  const handleEdit = (hotelData) => {
    setEditingHotelDetails(hotelData);
    setFormMode('edit');
    setCurrentView('form');
  };

  const handleView = (hotelData) => {
    setViewingHotelDetails(hotelData);
    setFormMode('view');
    setCurrentView('form');
  };

  const handleNewHotelData = () => {
    setEditingHotelDetails(null);
    setViewingHotelDetails(null);
    setFormMode('create');
    setCurrentView('form');
  };

  const handleBack = () => {
    setCurrentView('records');
    setEditingHotelDetails(null);
    setViewingHotelDetails(null);
    setFormMode('create');
  };

  const getHeaderSubtitle = () => {
    switch (formMode) {
      case 'view':
        return 'Hotel information and details';
      case 'edit':
        return 'Update Hotel information';
      case 'create':
      default:
        return 'Add a New Hotel to the system';
    }
  };

  return (
 <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          className="mb-6"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-center justify-between bg-gray-800/50 backdrop-blur-xl rounded-xl border border-gray-700/50 p-4 md:p-6">
            <div className="flex items-center space-x-3">
              {currentView === 'form' && (
                <motion.button
                  onClick={handleBack}
                  className="p-2 text-gray-300 hover:text-white hover:bg-gray-700/50 rounded-lg transition-all backdrop-blur-sm"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <ArrowLeft className="h-5 w-5" />
                </motion.button>
              )}
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg">
                <Building2 className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Hotel Management
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  {currentView === 'records' ? 'Manage your hotel listings' : getHeaderSubtitle()}
                </p>
              </div>
            </div>

            {currentView === 'records' && (
              <motion.button
                onClick={handleNewHotelData}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center space-x-2 text-sm md:text-base backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Hotel</span>
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
              <HotelRecords
                hotelDetails={hotelDetails}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteHotelDetails}
                onRefresh={fetchHotelDetails}
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
              <HotelForm
                editingHotelDetails={editingHotelDetails}
                viewingHotelDetails={viewingHotelDetails}
                onSubmit={formMode === 'edit' ? handleUpdateHotelDetals : handleCreateHotelDetails}
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


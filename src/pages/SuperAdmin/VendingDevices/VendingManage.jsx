import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Package, Plus, ArrowLeft, Building2 } from 'lucide-react';

import VendingRecord from './VendingRecord';
import VendingForm from './VendingForm';
import {
  getVendingDeviceDetails,
  createVendingDeviceDetails,
  updateVendingDeviceDetails,
  deleteVendingDeviceDetails
} from '../../../api/SuperAdmin/Vending Devices/VendingManagementAPI';

export default function VendingManage() {
  const [currentView, setCurrentView] = useState('records'); // 'records' or 'form'
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingDeviceDetails, setEditingDeviceDetails] = useState(null);
  const [viewingDeviceDetails, setViewingDeviceDetails] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'view'


  // Fetch vending devices on component mount
  useEffect(() => {
    fetchDeviceDetails();
  }, []);

  const fetchDeviceDetails = async () => {
    setLoading(true);
    try {
      const response = await getVendingDeviceDetails();
      if (response.Status) {
        setDeviceDetails(response.Data || []);
        console.log('Fetched vending device details:', response.Data);
      } else {
        toast.error(response.Message || 'Failed to fetch vending device details');
      }
    } catch (error) {
      toast.error('Error fetching vending device details');
      console.error('Fetch vending device details error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateDeviceDetails = async (deviceData) => {
    const promise = createVendingDeviceDetails(deviceData);
    toast.promise(promise, {
      loading: 'Creating Vending Device ...',
      success: (response) => {
        if (response.Status) {
          fetchDeviceDetails(); // Refresh the list
          setCurrentView('records');
          return response.Message || 'Vending Device created successfully!';
        }
        throw new Error(response.Message || 'Failed to create vending device');
      },
      error: (err) => err.message || 'Failed to create vending device'
    });
    return promise;
  };

  const handleUpdateDeviceDetails = async (deviceData) => {
    const promise = updateVendingDeviceDetails(deviceData);
    toast.promise(promise, {
      loading: 'Updating Vending Device ...',
      success: (response) => {
        if (response.Status) {
          fetchDeviceDetails();
          setCurrentView('records');
          setEditingDeviceDetails(null);
          return response.Message || 'Vending Device updated successfully!';
        }
        throw new Error(response.Message || 'Failed to update vending device');
      },
      error: (err) => err.message || 'Failed to update vending device'
    });
    return promise;
  };


  const handleDeleteDeviceDetails = async (deviceID) => {
    const promise = deleteVendingDeviceDetails(deviceID);
    toast.promise(promise, {
      loading: 'Deleting Vending Device ...',
      success: (response) => {
        if (response.Status) {
          fetchDeviceDetails(); // Refresh the list
          return response.Message || 'Vending Device deleted successfully!';
        }
        throw new Error(response.Message || 'Failed to delete vending device');
      },
      error: (err) => err.message || 'Failed to delete vending device'
    });
    return promise;
  };

  const handleEdit = (deviceData) => {
    setEditingDeviceDetails(deviceData);
    setFormMode('edit');
    setCurrentView('form');
  };

  const handleView = (deviceData) => {
    setViewingDeviceDetails(deviceData);
    setFormMode('view');
    setCurrentView('form');
  };

  const handleNewDeviceData = () => {
    setEditingDeviceDetails(null);
    setViewingDeviceDetails(null);
    setFormMode('create');
    setCurrentView('form');
  };

  const handleBack = () => {
    setCurrentView('records');
    setEditingDeviceDetails(null);
    setViewingDeviceDetails(null);
    setFormMode('create');
  };

  const getHeaderSubtitle = () => {
    switch (formMode) {
      case 'view':
        return 'Vending device information and details';
      case 'edit':
        return 'Update vending device information';
      case 'create':
      default:
        return 'Add a new vending device to the system';
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
                  Vending Device Management
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  {currentView === 'records' ? 'Manage your vending device listings' : getHeaderSubtitle()}
                </p>
              </div>
            </div>

            {currentView === 'records' && (
              <motion.button
                onClick={handleNewDeviceData}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center space-x-2 text-sm md:text-base backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Device</span>
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
              <VendingRecord
                deviceDetails={deviceDetails}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteDeviceDetails}
                onRefresh={fetchDeviceDetails}
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
              <VendingForm
                editingDeviceDetails={editingDeviceDetails}
                viewingDeviceDetails={viewingDeviceDetails}
                onSubmit={formMode === 'edit' ? handleUpdateDeviceDetails : handleCreateDeviceDetails}
                onCancel={handleBack}
                mode={formMode}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );


}
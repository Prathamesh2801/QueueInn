import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Package, Plus, ArrowLeft } from 'lucide-react';

import SlotRecord from './SlotRecord';
import SlotForm from './SlotForm';
import {
  getSlotDetails,
  createSlotDetails,
  updateSlotDetails,
  deleteSlotDetails,
} from '../../../api/SuperAdmin/Slots/SlotManagementAPI';

import { getVendingDeviceDetails } from '../../../api/SuperAdmin/Vending Devices/VendingManagementAPI';

export default function SlotManage() {
  const [currentView, setCurrentView] = useState('records'); // 'records' or 'form'
  const [slotDetails, setSlotDetails] = useState([]);
  const [deviceDetails, setDeviceDetails] = useState([]);
  const [loading, setLoading] = useState(false);

  const [editingSlotDetails, setEditingSlotDetails] = useState(null);
  const [viewingSlotDetails, setViewingSlotDetails] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create' | 'edit' | 'view'

  // fetch both devices and slots on mount
  useEffect(() => {
    fetchDeviceDetails();
    fetchSlotDetails();
  }, []);

  const fetchDeviceDetails = async () => {
    try {
      setLoading(true);
      const response = await getVendingDeviceDetails({});
      if (response?.Status) {
        setDeviceDetails(response.Data || []);
        console.log('Fetched vending devices:', response.Data);
      } else {
        toast.error(response?.Message || 'Failed to fetch devices');
      }
    } catch (err) {
      console.error('Error fetching devices', err);
      toast.error('Error fetching devices');
    } finally {
      setLoading(false);
    }
  };

  const fetchSlotDetails = async () => {
    try {
      setLoading(true);
      const response = await getSlotDetails({});
      if (response?.Status) {
        setSlotDetails(response.Data || []);
        console.log('Fetched slot details:', response.Data);
      } else {
        toast.error(response?.Message || 'Failed to fetch slots');
      }
    } catch (err) {
      console.error('Error fetching slots', err);
      toast.error('Error fetching slots');
    } finally {
      setLoading(false);
    }
  };

  // Create
  const handleCreateSlot = async (slotData) => {
    // slotData expected: { Device_ID, Remain_Product }
    const promise = createSlotDetails(slotData);
    toast.promise(promise, {
      loading: 'Creating slot ...',
      success: (res) => {
        if (res?.Status) {
          fetchSlotDetails();
          setCurrentView('records');
          return res?.Message || 'Slot created';
        }
        throw new Error(res?.Message || 'Failed to create slot');
      },
      error: (err) => err?.message || 'Failed to create slot',
    });
    return promise;
  };

  // Update
  const handleUpdateSlot = async (slotData) => {
    // slotData expected to include Slot_ID
    const promise = updateSlotDetails(slotData);
    toast.promise(promise, {
      loading: 'Updating slot ...',
      success: (res) => {
        if (res?.Status) {
          fetchSlotDetails();
          setCurrentView('records');
          setEditingSlotDetails(null);
          return res?.Message || 'Slot updated';
        }
        throw new Error(res?.Message || 'Failed to update slot');
      },
      error: (err) => err?.message || 'Failed to update slot',
    });
    return promise;
  };

  // Delete
  const handleDeleteSlot = async (slotID) => {
    const promise = deleteSlotDetails(slotID);
    toast.promise(promise, {
      loading: 'Deleting slot ...',
      success: (res) => {
        if (res?.Status) {
          fetchSlotDetails();
          return res?.Message || 'Slot deleted';
        }
        throw new Error(res?.Message || 'Failed to delete slot');
      },
      error: (err) => err?.message || 'Failed to delete slot',
    });
    return promise;
  };

  // Edit / View / New / Back helpers
  const handleEdit = (slot) => {
    setEditingSlotDetails(slot);
    setViewingSlotDetails(null);
    setFormMode('edit');
    setCurrentView('form');
  };

  const handleView = (slot) => {
    setViewingSlotDetails(slot);
    setEditingSlotDetails(null);
    setFormMode('view');
    setCurrentView('form');
  };

  const handleNew = () => {
    setEditingSlotDetails(null);
    setViewingSlotDetails(null);
    setFormMode('create');
    setCurrentView('form');
  };

  const handleBack = () => {
    setCurrentView('records');
    setEditingSlotDetails(null);
    setViewingSlotDetails(null);
    setFormMode('create');
  };

  const getHeaderSubtitle = () => {
    switch (formMode) {
      case 'view':
        return 'Slot information';
      case 'edit':
        return 'Update slot information';
      case 'create':
      default:
        return 'Add a new slot to the system';
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
                <Package className="h-6 w-6 md:h-7 md:w-7 text-white" />
              </div>
              <div>
                <h1 className="text-xl md:text-2xl font-bold text-white">
                  Slot Management
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  {currentView === 'records' ? 'Manage your slot listings' : getHeaderSubtitle()}
                </p>
              </div>
            </div>

            {currentView === 'records' && (
              <motion.button
                onClick={handleNew}
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg hover:opacity-90 transition-all flex items-center space-x-2 text-sm md:text-base backdrop-blur-sm"
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Plus className="h-4 w-4" />
                <span className="hidden sm:inline">Add Slot</span>
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
              <SlotRecord
                slotDetails={slotDetails}
                devices={deviceDetails}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteSlot}
                onRefresh={() => {
                  fetchSlotDetails();
                  fetchDeviceDetails();
                }}
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
              <SlotForm
                editingSlotDetails={editingSlotDetails}
                viewingSlotDetails={viewingSlotDetails}
                deviceOptions={deviceDetails}
                onSubmit={formMode === 'edit' ? handleUpdateSlot : handleCreateSlot}
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

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-hot-toast';
import { Package, Plus, ArrowLeft, Building2 } from 'lucide-react';

import {
  getGameDetails,
  createGameDetails,
  updateGameDetails,
  deleteGameDetails
} from '../../../api/SuperAdmin/Game Management/GameManagementAPI';

import GameForm from './GameForm';
import GameRecord from './GameRecord';

export default function GameManage() {
  const [currentView, setCurrentView] = useState('records'); // 'records' or 'form'
  const [gameDetails, setGameDetails] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingGameDetails, setEditingGameDetails] = useState(null);
  const [viewingGameDetails, setViewingGameDetails] = useState(null);
  const [formMode, setFormMode] = useState('create'); // 'create', 'edit', 'view'


  // Fetch categories on component mount
  useEffect(() => {
    fetchGameDetails();
  }, []);

  const fetchGameDetails = async () => {
    setLoading(true);
    try {
      const response = await getGameDetails();
      if (response.Status) {
        setGameDetails(response.Data || []);
      } else {
        toast.error(response.Message || 'Failed to fetch game details');
      }
    } catch (error) {
      toast.error('Error fetching game details');
      console.error('Fetch game Details error:', error);
    } finally {
      setLoading(false);
    }
  };


  const handleCreateGameDetails = async (gameData) => {
    const promise = createGameDetails(gameData);

    toast.promise(promise, {
      loading: 'Creating Game Details ...',
      success: (response) => {
        if (response.Status) {
          fetchGameDetails(); // Refresh the list
          setCurrentView('records');
          return response.Message || 'Game Details created successfully!';
        }
        throw new Error(response.Message || 'Failed to create Game Details');
      },
      error: (err) => err.message || 'Failed to create Game Details'
    });

    return promise;
  };

  const handleUpdateGameDetals = async (gameData) => {
    const promise = updateGameDetails(gameData);
    toast.promise(promise, {
      loading: 'Updating Game Details ...',
      success: (response) => {
        if (response.Status) {
          fetchGameDetails();
          setCurrentView('records');
          setEditingGameDetails(null);
          return response.Message || 'Game Details updated successfully!';
        }
        throw new Error(response.Message || 'Failed to update Game details');
      },
      error: (err) => err.message || 'Failed to update Game details'
    });

    return promise;
  };


  const handleDeleteGameDetails = async (gameID) => {
    const promise = deleteGameDetails(gameID);

    toast.promise(promise, {
      loading: 'Deleting Game Details ...',
      success: (response) => {
        if (response.Status) {
          fetchGameDetails(); // Refresh the list
          return response.Message || 'Game Details deleted successfully!';
        }
        throw new Error(response.Message || 'Failed to delete Game Details');
      },
      error: (err) => err.message || 'Failed to delete Game details'
    });

    return promise;
  };

  const handleEdit = (gameData) => {
    setEditingGameDetails(gameData);
    setFormMode('edit');
    setCurrentView('form');
  };

  const handleView = (gameData) => {
    setViewingGameDetails(gameData);
    setFormMode('view');
    setCurrentView('form');
  };

  const handleNewHotelData = () => {
    setEditingGameDetails(null);
    setViewingGameDetails(null);
    setFormMode('create');
    setCurrentView('form');
  };

  const handleBack = () => {
    setCurrentView('records');
    setEditingGameDetails(null);
    setViewingGameDetails(null);
    setFormMode('create');
  };

  const getHeaderSubtitle = () => {
    switch (formMode) {
      case 'view':
        return 'Game information and details';
      case 'edit':
        return 'Update Game information';
      case 'create':
      default:
        return 'Add a New Game to the system';
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
                  Game Management
                </h1>
                <p className="text-sm text-gray-300 mt-1">
                  {currentView === 'records' ? 'Manage your game listings' : getHeaderSubtitle()}
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
                <span className="hidden sm:inline">Add Game</span>
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
              <GameRecord
                gameDetails={gameDetails}
                loading={loading}
                onEdit={handleEdit}
                onView={handleView}
                onDelete={handleDeleteGameDetails}
                onRefresh={fetchGameDetails}
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
              <GameForm
                editingGameDetails={editingGameDetails}
                viewingGameDetails={viewingGameDetails}
                onSubmit={formMode === 'edit' ? handleUpdateGameDetals : handleCreateGameDetails}
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


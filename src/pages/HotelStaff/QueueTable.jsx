import React, { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Phone, Edit3, Trash2, Clock, Users, User } from "lucide-react";
import { updateQueueStatus } from "../../api/HotelStaff/ChangeQueueStatusAPI";
import { createQueueSSE } from "../../api/HotelStaff/HotelStaffAPI";




export default function QueueTable({ tableType = "", tableSize = "" }) {
  const [waitingList, setWaitingList] = useState([]);
  const [calling, setCalling] = useState(null);
  const [notification, setNotification] = useState(null);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sseConnected, setSseConnected] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Modal states
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [editMinutes, setEditMinutes] = useState("");

  const sseRef = useRef(null);

  // Helper functions
  function normalizeContact(rawContact) {
    if (rawContact === null || rawContact === undefined) return "";
    if (Array.isArray(rawContact)) {
      const first = rawContact.find((x) => x !== undefined && x !== null) ?? rawContact[0];
      return String(first ?? "");
    }
    return String(rawContact);
  }

  function parseWaiting(waitingObj) {
    if (!waitingObj) return [];
    const names = waitingObj.Name || [];
    const contacts = waitingObj.Contact || [];
    const times = waitingObj.Time || [];
    const genders = waitingObj.Gender || [];
    const numPeople = waitingObj.NumberOfPeople || [];

    const length = Math.max(
      names?.length || 0,
      contacts?.length || 0,
      times?.length || 0,
      genders?.length || 0,
      numPeople?.length || 0
    );

    const list = [];
    for (let idx = 0; idx < length; idx++) {
      const rawContact = contacts[idx] ?? null;
      list.push({
        Name: names[idx] ?? "",
        Contact: normalizeContact(rawContact),
        Time: times[idx] ?? null,
        Gender: genders[idx] ?? null,
        NumberOfPeople: numPeople[idx] ?? null,
      });
    }
    return list;
  }

  function handleIncoming(data) {
    try {
      if (!data) return;
      
      if (data.Waiting) {
        const parsed = parseWaiting(data.Waiting);
        setWaitingList(parsed);
      } else {
        setWaitingList([]);
      }

      if (data.Calling && data.Calling.Exits !== false) {
        const callingObj = { ...data.Calling };
        if (callingObj.Contact !== undefined) {
          callingObj.Contact = normalizeContact(callingObj.Contact);
        }
        setCalling(callingObj);
      } else {
        setCalling(null);
      }

      setNotification(data.Notification ?? null);
      setMessage(data.Message ?? "");
      setLastUpdated(new Date().toLocaleTimeString());
      setLoading(false);
      setSseConnected(true);
    } catch (err) {
      console.error("Error processing queue data:", err);
      toast.error("Error processing queue data");
    }
  }

  // Initialize SSE connection
  useEffect(() => {
    console.log("[QueueTable] Initializing SSE connection");
    
    if (sseRef.current) {
      sseRef.current.close();
    }

    setLoading(true);
    setSseConnected(false);

    const sse = createQueueSSE({ tableType, tableSize });
    sseRef.current = sse;

    const onMessage = (data) => {
      handleIncoming(data);
      // toast.success("Queue data updated", { duration: 2000 });
    };

    const onError = (err) => {
      console.warn("[QueueTable] SSE Error:", err);
      setSseConnected(false);
      toast.error("Connection lost - retrying...");
    };

    try {
      sse.start(onMessage, onError);
    } catch (err) {
      console.error("[QueueTable] Failed to start SSE:", err);
      toast.error("Failed to connect to queue");
    }

    return () => {
      if (sseRef.current) {
        sseRef.current.close();
      }
    };
  }, [tableType, tableSize]);

  // Action handlers
  async function handleDeleteItem(item) {
    try {
      toast.loading("Deleting from queue...", { id: "delete" });
      
      const payload = {
        Contact: normalizeContact(item.Contact),
        Waiting: "delete"
      };

      await updateQueueStatus(payload);
      
      setWaitingList(prev => 
        prev.filter(p => normalizeContact(p.Contact) !== normalizeContact(item.Contact))
      );
      
      if (calling && normalizeContact(calling.Contact) === normalizeContact(item.Contact)) {
        setCalling(null);
      }
      
      toast.success("Removed from queue", { id: "delete" });
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete", { id: "delete" });
    }
  }

  function openEditModal(item) {
    setEditItem(item);
    setEditMinutes("10"); // Default 10 minutes
    setIsEditOpen(true);
  }

  async function saveEdit() {
    if (!editItem || !editMinutes) return;
    
    try {
      toast.loading("Updating time...", { id: "edit" });
      
      const payload = {
        Contact: normalizeContact(editItem.Contact),
        TimeChange: parseInt(editMinutes)
      };

      await updateQueueStatus(payload);
      
      // Update local state optimistically
      const newTime = new Date(Date.now() + parseInt(editMinutes) * 60000).toLocaleTimeString();
      setWaitingList(prev =>
        prev.map(p => 
          normalizeContact(p.Contact) === normalizeContact(editItem.Contact) 
            ? { ...p, Time: newTime }
            : p
        )
      );
      
      if (calling && normalizeContact(calling.Contact) === normalizeContact(editItem.Contact)) {
        setCalling(c => ({ ...c, Time: newTime }));
      }
      
      setIsEditOpen(false);
      setEditItem(null);
      toast.success("Time updated successfully", { id: "edit" });
    } catch (err) {
      console.error("Edit failed:", err);
      toast.error("Failed to update time", { id: "edit" });
    }
  }

  async function handleCallItem(item) {
    try {
      toast.loading("Calling customer...", { id: "call" });
      
      const payload = {
        Contact: normalizeContact(item.Contact),
        Waiting: "calling"
      };

      console.log("Calling with payload:", payload);

      await updateQueueStatus(payload);
      
      const now = new Date().toLocaleTimeString();
      const calledItem = { ...item, Time: now, Contact: normalizeContact(item.Contact) };
      
      // Move to calling and remove from waiting list
      setCalling(calledItem);
      setWaitingList(prev => 
        prev.filter(p => normalizeContact(p.Contact) !== normalizeContact(item.Contact))
      );
      
      toast.success("Customer called successfully", { id: "call" });
    } catch (err) {
      console.error("Call failed:", err);
      toast.error("Failed to call customer", { id: "call" });
    }
  }

  async function handleCallingAction(actionType) {
    if (!calling) return;
    
    try {
      toast.loading(`Processing ${actionType}...`, { id: "calling-action" });
      
      const payload = {
        Contact: normalizeContact(calling.Contact),
        Waiting: actionType
      };

      await updateQueueStatus(payload);

      if (actionType === "waiting") {
        // Move back to waiting list
        setWaitingList(prev => [calling, ...prev]);
        setCalling(null);
        toast.success("Moved back to waiting", { id: "calling-action" });
      } else if (actionType === "complete") {
        setCalling(null);
        toast.success("Service completed", { id: "calling-action" });
      } else if (actionType === "delete") {
        setCalling(null);
        toast.success("Removed from queue", { id: "calling-action" });
      }
    } catch (err) {
      console.error("Calling action failed:", err);
      toast.error("Action failed", { id: "calling-action" });
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-6">
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#1f2937',
            color: '#f9fafb',
            border: '1px solid #374151'
          }
        }}
      />
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.header 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-8"
        >
          <div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Queue Management
            </h1>
            <p className="text-gray-400 mt-1">
              {tableType || "All Tables"} • {tableSize || "Any Size"}
            </p>
            <p className="text-sm text-gray-500">{message}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${sseConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-sm text-gray-400">
                {sseConnected ? 'Live Connected' : 'Polling Mode'}
              </span>
            </div>
            
            {lastUpdated && (
              <div className="text-xs text-gray-500">
                Last updated: {lastUpdated}
              </div>
            )}
          </div>
        </motion.header>

        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Waiting List */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="xl:col-span-3"
          >
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-400" />
                  Waiting List ({waitingList.length})
                </h2>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-transparent border-t-blue-400 rounded-full animate-spin" />
                  <span className="ml-3 text-gray-400">Loading queue...</span>
                </div>
              ) : waitingList.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No customers waiting</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {waitingList.map((item, index) => (
                      <motion.div
                        key={`${normalizeContact(item.Contact)}-${index}`}
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        layout
                        className="bg-gray-900/50 rounded-xl border border-gray-600/30 p-4 hover:border-gray-500/50 transition-colors"
                      >
                        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <div className="h-10 w-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-sm font-semibold">
                                {item.Name?.charAt(0)?.toUpperCase() || '?'} 
                              </div>
                              <div>
                                <h3 className="font-semibold text-white">{item.Name} </h3>
                                <p className="text-sm text-gray-400">
                                  📞 {normalizeContact(item.Contact) || "N/A"}
                                </p>
                              </div>
                            </div>
                            
                            <div className="flex gap-4 text-sm text-gray-300">
                              <div className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                <span>{item.NumberOfPeople || "N/A"} people</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{item.Time || "No time"}</span>
                              </div>
                              <div className="flex items-center gap-1">
                                <User className="h-4 w-4" />
                                <span>{item.Gender || "N/A"}</span>
                              </div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleCallItem(item)}
                              className="flex items-center gap-1 px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Phone className="h-4 w-4" />
                              Call
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => openEditModal(item)}
                              className="flex items-center gap-1 px-3 py-2 bg-yellow-600 hover:bg-yellow-500 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Edit3 className="h-4 w-4" />
                              Edit
                            </motion.button>
                            
                            <motion.button
                              whileHover={{ scale: 1.05 }}
                              whileTap={{ scale: 0.95 }}
                              onClick={() => handleDeleteItem(item)}
                              className="flex items-center gap-1 px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
                            >
                              <Trash2 className="h-4 w-4" />
                              Delete
                            </motion.button>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              )}
            </div>
          </motion.div>

          {/* Sidebar */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-6"
          >
            {/* Currently Calling */}
            <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
              <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-400" />
                Currently Calling
              </h3>
              
              {calling ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="space-y-4"
                >
                  <div className="bg-green-900/20 border border-green-500/30 rounded-xl p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="h-10 w-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-full flex items-center justify-center text-sm font-semibold">
                        {/* {calling.Name?.charAt(0)?.toUpperCase() || '?'} */} Calling
                      </div>
                      {/* <div>
                        <h4 className="font-semibold text-white">{calling.Name}</h4>
                        <p className="text-sm text-gray-300">{calling.Contact}</p>
                      </div> */}
                    </div>
                    
                    <div className="text-sm text-gray-300 mb-4">
                      <p>Time: {calling.Time || "N/A"}</p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCallingAction("waiting")}
                        className="w-full px-3 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg text-sm font-medium transition-colors"
                      >
                        Back to Waiting
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCallingAction("complete")}
                        className="w-full px-3 py-2 bg-green-600 hover:bg-green-500 rounded-lg text-sm font-medium transition-colors"
                      >
                        Complete Service
                      </motion.button>
                      
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => handleCallingAction("delete")}
                        className="w-full px-3 py-2 bg-red-600 hover:bg-red-500 rounded-lg text-sm font-medium transition-colors"
                      >
                        Remove from Queue
                      </motion.button>
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="text-center py-8 text-gray-400">
                  <Phone className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No customer being called</p>
                </div>
              )}
            </div>

            {/* Notifications */}
            {notification && notification.Status && (
              <div className="bg-gray-800/50 backdrop-blur-lg rounded-2xl border border-gray-700/50 p-6">
                <h3 className="text-lg font-semibold mb-4">Notifications</h3>
                <div className="bg-blue-900/20 border border-blue-500/30 rounded-xl p-4">
                  <pre className="text-xs text-gray-300 whitespace-pre-wrap">
                    {JSON.stringify(notification, null, 2)}
                  </pre>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Edit Modal */}
      <AnimatePresence>
        {isEditOpen && editItem && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4"
            onClick={(e) => e.target === e.currentTarget && setIsEditOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md"
            >
              <h3 className="text-xl font-semibold mb-4">
                Edit Wait Time - {editItem.Name}
              </h3>

              <div className="mb-6">
                <label className="block text-sm text-gray-300 mb-2">
                  Additional Minutes
                </label>
                <input
                  type="number"
                  value={editMinutes}
                  onChange={(e) => setEditMinutes(e.target.value)}
                  className="w-full p-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter minutes (e.g. 10)"
                  min="1"
                  max="120"
                />
                <p className="text-xs text-gray-400 mt-1">
                  This will extend the wait time by the specified minutes
                </p>
              </div>

              <div className="flex gap-3">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => {
                    setIsEditOpen(false);
                    setEditItem(null);
                  }}
                  className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-500 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={saveEdit}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg font-medium transition-colors"
                >
                  Save Changes
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
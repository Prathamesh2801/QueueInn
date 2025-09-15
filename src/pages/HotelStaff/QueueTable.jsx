// src/components/QueueTable.jsx
import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import toast, { Toaster } from "react-hot-toast";
import { Phone, Edit3, Trash2, Users } from "lucide-react";
import { updateQueueStatus } from "../../api/HotelStaff/ChangeQueueStatusAPI";
import { createQueueSSE } from "../../api/HotelStaff/HotelStaffAPI";

export default function QueueTable({ tableType = "", tableSize = "" }) {
  const [waitingList, setWaitingList] = useState([]);
  const [callingList, setCallingList] = useState([]); // now an array
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

  // action lock map: { contact: { ts } }
  const actionLockRef = useRef({});
  const ACTION_LOCK_TTL = 5000; // TTL for optimistic locks

  // Snapshot / throttle control
  const lastSnapshotRef = useRef(null);
  const lastProcessedAtRef = useRef(0);
  const MIN_PROCESS_INTERVAL = 200; // ms

  // transient pending calling set to avoid double-calls
  const callingPendingRef = useRef(new Set());

  // Helper: normalize contact to string
  function normalizeContact(rawContact) {
    if (rawContact === null || rawContact === undefined) return "";
    if (Array.isArray(rawContact)) {
      const first = rawContact.find((x) => x !== undefined && x !== null) ?? rawContact[0];
      return String(first ?? "");
    }
    return String(rawContact);
  }

  // Parse waiting response structure into array of items
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

  // Parse calling object(s) from server into array of items
  // Parse calling object(s) from server into array of items
  function parseCalling(rawCalling) {
    // Server sometimes returns: { Exits: false } when no calling
    if (!rawCalling) return [];

    // If server explicitly marks no calling
    if (rawCalling.Exits === false) return [];

    // If server returns arrays inside the object (common shape)
    // Calling: { Name: [...], Contact: [...] }
    if (rawCalling.Name || rawCalling.Contact) {
      const names = rawCalling.Name || [];
      const contacts = rawCalling.Contact || [];
      // other fields might be absent — still create consistent objects
      const length = Math.max(names.length || 0, contacts.length || 0);
      const list = [];
      for (let i = 0; i < length; i++) {
        list.push({
          Name: names[i] ?? "",
          Contact: normalizeContact(contacts[i] ?? null),
          // no Time/Gender/NumberOfPeople in calling responses currently,
          // but keep placeholders if you plan to add them later.
        });
      }
      return list;
    }

    // If server sent an array of objects already
    if (Array.isArray(rawCalling)) {
      return rawCalling.map((c) => ({ ...c, Contact: normalizeContact(c.Contact) }));
    }

    // If server sent a single object with scalar Contact (rare)
    if (typeof rawCalling === "object" && rawCalling.Contact !== undefined) {
      return [{ ...rawCalling, Contact: normalizeContact(rawCalling.Contact) }];
    }

    return [];
  }

  // Locks
  function isLocked(contact) {
    if (!contact) return false;
    const lock = actionLockRef.current[contact];
    if (!lock) return false;
    if (Date.now() - lock.ts > ACTION_LOCK_TTL) {
      delete actionLockRef.current[contact];
      return false;
    }
    return true;
  }

  function lockContact(contact) {
    if (!contact) return;
    actionLockRef.current[contact] = { ts: Date.now() };
    // auto-unlock safety
    setTimeout(() => {
      const l = actionLockRef.current[contact];
      if (l && Date.now() - l.ts >= ACTION_LOCK_TTL) {
        delete actionLockRef.current[contact];
        // helpful debug
        console.log("[QueueTable] action lock auto-expired for", contact);
      }
    }, ACTION_LOCK_TTL + 50);
  }

  function unlockContact(contact) {
    if (!contact) return;
    delete actionLockRef.current[contact];
  }

  // Incoming SSE handler: dedupe/ throttle / merge preserve locked contacts
  function handleIncoming(data) {
    try {
      if (!data) return;

      const snapshotObj = {
        waiting: data.Waiting ?? null,
        calling: data.Calling ?? null,
        message: data.Message ?? null,
      };
      const snapshotKey = JSON.stringify(snapshotObj);

      // dedupe identical snapshots
      if (lastSnapshotRef.current === snapshotKey) return;

      // throttle
      const now = Date.now();
      if (now - lastProcessedAtRef.current < MIN_PROCESS_INTERVAL) {
        lastSnapshotRef.current = snapshotKey;
        return;
      }
      lastProcessedAtRef.current = now;
      lastSnapshotRef.current = snapshotKey;

      // parse lists
      const parsedWaiting = data.Waiting ? parseWaiting(data.Waiting) : [];
      const parsedCalling = parseCalling(data.Calling);

      // Build maps
      const parsedWaitingMap = {};
      parsedWaiting.forEach((p) => { if (p && p.Contact) parsedWaitingMap[p.Contact] = p; });

      const prevWaitingMap = {};
      waitingList.forEach((p) => { if (p && p.Contact) prevWaitingMap[p.Contact] = p; });

      // Merge waiting: preserve local optimistic entries for locked contacts
      setWaitingList((prev) => {
        const hasLocks = Object.keys(actionLockRef.current).length > 0;
        if (!hasLocks) return parsedWaiting;

        const prevMap = {};
        prev.forEach((p) => { if (p && p.Contact) prevMap[p.Contact] = p; });

        const merged = parsedWaiting.map((srvItem) => {
          const c = srvItem.Contact;
          if (c && isLocked(c) && prevMap[c]) {
            return prevMap[c]; // preserve optimistic
          }
          return srvItem;
        });

        // include locked prev items missing in server result
        Object.keys(prevMap).forEach((c) => {
          if (isLocked(c) && !parsedWaitingMap[c]) {
            merged.unshift(prevMap[c]);
          }
        });

        return merged;
      });

      // Merge calling list: preserve locked local calling entries
      setCallingList((prev) => {
        const prevMap = {};
        prev.forEach((p) => { if (p && p.Contact) prevMap[p.Contact] = p; });

        // prefer server order, but keep locked items
        const merged = parsedCalling.map((srvItem) => {
          const c = srvItem.Contact;
          if (c && isLocked(c) && prevMap[c]) {
            return prevMap[c];
          }
          return srvItem;
        });

        // include locked prev calling items not present on server
        Object.keys(prevMap).forEach((c) => {
          if (isLocked(c) && !merged.find((m) => m.Contact === c)) {
            merged.unshift(prevMap[c]);
          }
        });

        return merged;
      });

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

  // SSE init
  useEffect(() => {
    if (sseRef.current) {
      try { sseRef.current.close(); } catch (e) { }
      sseRef.current = null;
    }

    const sse = createQueueSSE({ tableType, tableSize });
    sseRef.current = sse;

    const onMessage = (data) => handleIncoming(data);
    const onError = (err) => {
      console.warn("[QueueTable] SSE Error:", err);
      setSseConnected(false);
      toast.error("Connection lost - retrying...");
    };

    try {
      sse.start(onMessage, onError);
      setSseConnected(true);
    } catch (err) {
      console.error("[QueueTable] Failed to start SSE:", err);
      toast.error("Failed to connect to queue");
    }

    return () => {
      if (sseRef.current) {
        try { sseRef.current.close(); } catch (e) { }
        sseRef.current = null;
      }
    };
  }, [tableType, tableSize]);

  //
  // Actions
  //

  // Delete waiting item
  async function handleDeleteItem(item) {
    const contact = normalizeContact(item.Contact);
    lockContact(contact);
    const toastId = `delete-${contact}`;
    toast.loading("Deleting from queue...", { id: toastId });
    try {
      const payload = { Contact: contact, Waiting: "delete" };
      const res = await updateQueueStatus(payload);
      // optimistic update
      setWaitingList((prev) => prev.filter((p) => normalizeContact(p.Contact) !== contact));
      // remove from callingList if present
      setCallingList((prev) => prev.filter((c) => c.Contact !== contact));
      toast.success("Removed from queue", { id: toastId });
    } catch (err) {
      console.error("Delete failed:", err);
      toast.error("Failed to delete", { id: toastId });
    } finally {
      unlockContact(contact);
      try { toast.dismiss(toastId); } catch (e) { }
    }
  }

  function openEditModal(item) {
    setEditItem(item);
    setEditMinutes("10");
    setIsEditOpen(true);
  }

  // Save edit (extend time)
  async function saveEdit() {
    if (!editItem || !editMinutes) return;
    const contact = normalizeContact(editItem.Contact);
    lockContact(contact);
    const toastId = `edit-${contact}`;
    toast.loading("Updating time...", { id: toastId });
    try {
      const payload = { Contact: contact, TimeChange: parseInt(editMinutes) };
      await updateQueueStatus(payload);
      const newTime = new Date(Date.now() + parseInt(editMinutes) * 60000).toLocaleTimeString();

      setWaitingList((prev) =>
        prev.map((p) => (normalizeContact(p.Contact) === contact ? { ...p, Time: newTime } : p))
      );
      setCallingList((prev) =>
        prev.map((c) => (normalizeContact(c.Contact) === contact ? { ...c, Time: newTime } : c))
      );

      setIsEditOpen(false);
      setEditItem(null);
      toast.success("Time updated successfully", { id: toastId });
    } catch (err) {
      console.error("Edit failed:", err);
      toast.error("Failed to update time", { id: toastId });
    } finally {
      unlockContact(contact);
      try { toast.dismiss(toastId); } catch (e) { }
    }
  }

  // Call an item => add to callingList (optimistic)
  async function handleCallItem(item) {
    const contact = normalizeContact(item.Contact);
    if (callingPendingRef.current.has(contact)) return; // prevent double
    callingPendingRef.current.add(contact);
    lockContact(contact);
    const toastId = `call-${contact}`;
    toast.loading("Calling customer...", { id: toastId });
    try {
      const payload = { Contact: contact, Waiting: "calling" };
      await updateQueueStatus(payload);

      const now = new Date().toLocaleTimeString();
      const calledItem = { ...item, Time: now, Contact: contact };

      // optimistic: add to callingList and remove from waiting
      setCallingList((prev) => {
        // avoid duplicates
        if (prev.find((c) => c.Contact === contact)) return prev;
        return [calledItem, ...prev];
      });
      setWaitingList((prev) => prev.filter((p) => normalizeContact(p.Contact) !== contact));

      toast.success("Customer called successfully", { id: toastId });
    } catch (err) {
      console.error("Call failed:", err);
      toast.error("Failed to call customer", { id: toastId });
    } finally {
      callingPendingRef.current.delete(contact);
      unlockContact(contact);
      try { toast.dismiss(toastId); } catch (e) { }
    }
  }

  // Perform action on a specific calling contact
  // actionType: "waiting" | "complete" | "delete"
  async function handleCallingAction(contact, actionType) {
    if (!contact) return;
    lockContact(contact);
    const toastId = `calling-action-${contact}-${actionType}`;
    toast.loading(`${actionType}...`, { id: toastId });
    try {
      const payload = { Contact: contact, Waiting: actionType };
      await updateQueueStatus(payload);

      if (actionType === "waiting") {
        // move back to waiting (we'll keep existing calling item and push it back)
        const moved = callingList.find((c) => c.Contact === contact);
        setWaitingList((prev) => (moved ? [moved, ...prev] : prev));
        setCallingList((prev) => prev.filter((c) => c.Contact !== contact));
        toast.success("Moved back to waiting", { id: toastId });
      } else if (actionType === "complete") {
        setCallingList((prev) => prev.filter((c) => c.Contact !== contact));
        toast.success("Service completed", { id: toastId });
      } else if (actionType === "delete") {
        setCallingList((prev) => prev.filter((c) => c.Contact !== contact));
        setWaitingList((prev) => prev.filter((p) => normalizeContact(p.Contact) !== contact));
        toast.success("Removed from queue", { id: toastId });
      }
    } catch (err) {
      console.error("Calling action failed:", err);
      toast.error("Action failed", { id: toastId });
    } finally {
      unlockContact(contact);
      try { toast.dismiss(toastId); } catch (e) { }
    }
  }

  // Layout helpers: on small screens we want Calling first then Waiting.
  // Use Tailwind responsive order classes in JSX below.

  // Render
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black text-white p-4 sm:p-6">
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <header className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Queue Management</h1>
            <p className="text-gray-400 mt-1 text-sm">{tableType || "All Tables"} • {tableSize || "Any Size"}</p>
            <p className="text-xs text-gray-500 mt-1">{message}</p>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`h-3 w-3 rounded-full ${sseConnected ? 'bg-green-400' : 'bg-yellow-400'}`} />
              <span className="text-sm text-gray-400">{sseConnected ? 'Live Connected' : 'Disconnected'}</span>
            </div>
            {lastUpdated && <div className="text-xs text-gray-400">Last updated: {lastUpdated}</div>}
          </div>
        </header>

        {/* Responsive layout:
            - On small screens: Calling (full width) first, then Waiting below.
            - On xl and up: two-column grid: Waiting main (3 cols) and Calling sidebar (1 col).
        */}
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">

          {/* Calling list: on small screens appears first (order-first), on xl it's sidebar (xl:col-span-1) */}
          <div className="order-1 xl:order-2 xl:col-span-1">
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 p-4">
              <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <Phone className="h-5 w-5 text-green-400" /> Calling ({callingList.length})
              </h3>

              {callingList.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <Phone className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No one being called</p>
                </div>
              ) : (
                <div className="space-y-3">
                  <AnimatePresence>
                    {callingList.map((c) => {
                      const contact = normalizeContact(c.Contact);
                      const nameString = Array.isArray(c.Name) ? c.Name[0] : c.Name;
                      const locked = isLocked(contact);

                      return (
                        <motion.div
                          key={contact}
                          initial={{ opacity: 0, y: -6 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -6 }}
                          layout
                          className="bg-green-900/10 border border-green-500/20 rounded-lg p-3"
                        >
                          <div className="flex items-start gap-3">
                            <div className="h-10 w-10 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 flex items-center justify-center font-semibold text-sm">
                              {nameString?.charAt(0)?.toUpperCase() || "?"}
                            </div>

                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <div>
                                  <div className="font-semibold">{nameString || "N/A"}</div>
                                  <div className="text-xs text-gray-300">📞 {contact}</div>
                                </div>
                                <div className="text-xs text-gray-400">{c.Time || "—"}</div>
                              </div>

                              <div className="mt-3 flex gap-2">
                                <button
                                  title="Back to Waiting"
                                  onClick={() => handleCallingAction(contact, "waiting")}
                                  disabled={locked}
                                  className={`px-2 py-1 text-sm rounded ${locked ? 'bg-gray-600 cursor-not-allowed' : 'bg-gray-700 hover:bg-gray-600'}`}
                                >
                                  Wait
                                </button>

                                <button
                                  title="Complete Service"
                                  onClick={() => handleCallingAction(contact, "complete")}
                                  disabled={locked}
                                  className={`px-2 py-1 text-sm rounded ${locked ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                                >
                                  Complete
                                </button>

                                <button
                                  title="Remove from Queue"
                                  onClick={() => handleCallingAction(contact, "delete")}
                                  disabled={locked}
                                  className={`px-2 py-1 text-sm rounded ${locked ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}`}
                                >
                                  Remove
                                </button>
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>
              )}
            </div>

            {/* Notifications box (mobile below calling) */}
            {notification && notification.Status && (
              <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 p-4 mt-4">
                <h4 className="text-sm font-semibold mb-2">Notifications</h4>
                <pre className="text-xs text-gray-300 whitespace-pre-wrap">{JSON.stringify(notification, null, 2)}</pre>
              </div>
            )}
          </div>

          {/* Waiting list main area (on xl uses 3 columns) */}
          <div className="order-2 xl:order-1 xl:col-span-3">
            <div className="bg-gray-800/50 rounded-2xl border border-gray-700/30 p-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold flex items-center gap-2"><Users className="h-5 w-5 text-blue-400" /> Waiting ({waitingList.length})</h2>
                <div className="text-xs text-gray-400">Tip: tap a card to call / edit / delete</div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="h-8 w-8 border-2 border-transparent border-t-blue-400 rounded-full animate-spin" />
                  <span className="ml-3 text-gray-400">Loading queue...</span>
                </div>
              ) : waitingList.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <Users className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No customers waiting</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-3">
                  <AnimatePresence>
                    {waitingList.map((item, idx) => {
                      const contact = normalizeContact(Array.isArray(item.Contact) ? item.Contact[0] : item.Contact);
                      const nameString = Array.isArray(item.Name) ? item.Name[0] : item.Name;
                      const locked = isLocked(contact);
                      const queueNo = idx + 1; // queue number according to arrival/order

                      return (
                        <motion.div
                          key={contact || idx}
                          initial={{ opacity: 0, scale: 0.98 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.98 }}
                          layout
                          className="bg-gray-900/50 rounded-lg border border-gray-700/30 p-3 flex flex-col justify-between"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3">
                              {/* Queue number badge */}
                              <div className="flex flex-col items-center justify-center">
                                <div className="h-8 w-8 rounded-full bg-indigo-600 text-white flex items-center justify-center font-semibold text-sm">
                                  {queueNo}
                                </div>
                              </div>

                              <div className="flex items-start gap-3">
                                <div className="h-10 w-10 rounded-full bg-gradient-to-r from-blue-500 to-purple-500 flex items-center justify-center font-semibold text-sm">
                                  {nameString?.charAt(0)?.toUpperCase() || "?"}
                                </div>
                                <div>
                                  <div className="font-semibold">{nameString || "N/A"}</div>
                                  <div className="text-xs text-gray-300">📞 {contact}</div>
                                  <div className="text-xs text-gray-400 mt-1">{item.NumberOfPeople || "N/A"} people • {item.Gender || "N/A"}</div>
                                </div>
                              </div>
                            </div>

                            <div className="text-xs text-gray-400">{item.Time || "No time"}</div>
                          </div>

                          <div className="mt-3 flex gap-2">
                            <button
                              onClick={() => handleCallItem(item)}
                              disabled={locked || callingPendingRef.current.has(contact)}
                              title="Call this customer"
                              className={`flex-1 px-3 py-2 rounded text-sm font-medium ${locked ? 'bg-gray-600 cursor-not-allowed' : 'bg-green-600 hover:bg-green-500'}`}
                            >
                              <Phone className="h-4 w-4 inline-block mr-1" /> {locked ? 'Processing...' : 'Call'}
                            </button>

                            <button
                              onClick={() => openEditModal(item)}
                              disabled={locked}
                              title="Edit wait time"
                              className={`px-3 py-2 rounded text-sm font-medium ${locked ? 'bg-gray-600 cursor-not-allowed' : 'bg-yellow-600 hover:bg-yellow-500'}`}
                            >
                              <Edit3 className="h-4 w-4 inline-block mr-1" /> Edit
                            </button>

                            <button
                              onClick={() => handleDeleteItem(item)}
                              disabled={locked}
                              title="Delete from queue"
                              className={`px-3 py-2 rounded text-sm font-medium ${locked ? 'bg-gray-600 cursor-not-allowed' : 'bg-red-600 hover:bg-red-500'}`}
                            >
                              <Trash2 className="h-4 w-4 inline-block mr-1" /> Delete
                            </button>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </div>

              )}
            </div>
          </div>
        </div>

        {/* Edit Modal */}
        <AnimatePresence>
          {isEditOpen && editItem && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4"
              onClick={(e) => e.target === e.currentTarget && setIsEditOpen(false)}
            >
              <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.95, y: 20 }} className="bg-gray-800 rounded-2xl border border-gray-700 p-6 w-full max-w-md">
                <h3 className="text-xl font-semibold mb-4">Edit Wait Time - {editItem.Name}</h3>

                <div className="mb-6">
                  <label className="block text-sm text-gray-300 mb-2">Additional Minutes</label>
                  <input type="number" value={editMinutes} onChange={(e) => setEditMinutes(e.target.value)} className="w-full p-3 bg-gray-700 border rounded-lg text-white" min="1" max="120" />
                  <p className="text-xs text-gray-400 mt-1">This will extend the wait time by the specified minutes</p>
                </div>

                <div className="flex gap-3">
                  <button onClick={() => { setIsEditOpen(false); setEditItem(null); }} className="flex-1 px-4 py-2 bg-gray-600 rounded-lg">Cancel</button>
                  <button onClick={saveEdit} className="flex-1 px-4 py-2 bg-blue-600 rounded-lg">Save Changes</button>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

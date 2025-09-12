// src/components/QueueTimeModal.jsx
import React, { useState, useEffect } from "react";
import { updateQueueStatus } from "../../api/HotelStaff/ChangeQueueStatusAPI";

/**
 * Props:
 *  - isOpen: boolean
 *  - onClose: function
 *  - initialContact: string (optional)
 *  - onSuccess: function(response) optional
 */
export default function QueueTimeModal({ isOpen, onClose, initialContact = "", onSuccess }) {
  const [contact, setContact] = useState(initialContact);
  const [mode, setMode] = useState("status"); // "status" or "time"
  const [waiting, setWaiting] = useState("waiting"); // waiting|calling|complete|delete
  const [timeChange, setTimeChange] = useState(0); // numeric minutes (or seconds depending on backend)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const allowedWaiting = ["waiting", "calling", "complete", "delete"];

  useEffect(() => {
    if (isOpen) {
      setContact(initialContact || "");
      setMode("status");
      setWaiting("waiting");
      setTimeChange(0);
      setError(null);
      setLoading(false);
    }
  }, [isOpen, initialContact]);

  if (!isOpen) return null;

  const validate = () => {
    setError(null);
    if (!contact || contact.trim().length < 6) {
      setError("Please enter a valid Contact number.");
      return false;
    }
    if (mode === "status" && !allowedWaiting.includes(waiting)) {
      setError("Invalid waiting status selected.");
      return false;
    }
    if (mode === "time") {
      const n = Number(timeChange);
      if (Number.isNaN(n) || !Number.isFinite(n)) {
        setError("TimeChange must be a number.");
        return false;
      }
      // optionally: enforce range
      if (n < -1440 || n > 1440) {
        setError("TimeChange must be between -1440 and 1440 (minutes).");
        return false;
      }
    }
    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;

    const payload = { Contact: contact.trim() };
    if (mode === "status") payload.Waiting = waiting;
    else payload.TimeChange = Number(timeChange);

    setLoading(true);
    setError(null);

    try {
      const response = await updateQueueStatus(payload);

      // Example handling depending on backend status:
      if (response.status === 200 || response.status === 201) {
        // success
        onSuccess && onSuccess(response);
        onClose && onClose();
      } else if (response.status === 401) {
        // unauthorized - clear and redirect
        localStorage.clear();
        window.location.href = "/#/login";
      } else {
        // you can parse response.data to show specific error
        setError(response?.data?.message || `Server responded with ${response.status}`);
      }
    } catch (err) {
      console.error(err);
      setError("Network or server error. Try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <form
        onSubmit={handleSubmit}
        className="relative z-10 w-full max-w-md bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6"
      >
        <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-gray-100">Edit Queue</h3>

        <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">Contact</label>
        <input
          value={contact}
          onChange={(e) => setContact(e.target.value)}
          className="w-full mb-3 p-2 border rounded-md bg-gray-50 dark:bg-gray-700"
          placeholder="9867104527"
        />

        <div className="flex gap-2 items-center mb-3">
          <label className="text-sm text-gray-700 dark:text-gray-300">Mode:</label>
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
            className="p-2 rounded-md bg-gray-50 dark:bg-gray-700"
          >
            <option value="status">Update Status</option>
            <option value="time">Change Time</option>
          </select>
        </div>

        {mode === "status" ? (
          <>
            <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">Waiting Status</label>
            <select
              value={waiting}
              onChange={(e) => setWaiting(e.target.value)}
              className="w-full mb-3 p-2 border rounded-md bg-gray-50 dark:bg-gray-700"
            >
              {allowedWaiting.map((w) => (
                <option key={w} value={w}>
                  {w}
                </option>
              ))}
            </select>
            <p className="text-xs text-gray-500 mb-3">Allowed values: waiting, calling, complete, delete</p>
          </>
        ) : (
          <>
            <label className="block mb-2 text-sm text-gray-700 dark:text-gray-300">Time Change (minutes)</label>
            <input
              type="number"
              value={timeChange}
              onChange={(e) => setTimeChange(e.target.value)}
              className="w-full mb-3 p-2 border rounded-md bg-gray-50 dark:bg-gray-700"
              step="1"
              placeholder="e.g. 10 (positive or negative)"
            />
            <p className="text-xs text-gray-500 mb-3">
              Enter number of minutes to change scheduled time. (Ask backend owner if units differ.)
            </p>
          </>
        )}

        {error && <div className="text-sm text-red-500 mb-3">{error}</div>}

        <div className="flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-md border bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className={`px-4 py-2 rounded-md text-white ${loading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
            disabled={loading}
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </form>
    </div>
  );
}

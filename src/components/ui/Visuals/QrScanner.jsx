import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Scanner, useDevices } from "@yudiel/react-qr-scanner";

const QrScanner = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [scannedData, setScannedData] = useState(null);
  const [error, setError] = useState(null);
  const [selectedDeviceId, setSelectedDeviceId] = useState(null);

  // Devices from the scanner hook
  const devices = useDevices();

  // Pick default camera (prefer back camera if available)
  useEffect(() => {
    if (!devices || !devices.length || selectedDeviceId) return;

    const backCamera =
      devices.find((device) => {
        const label = (device.label || "").toLowerCase();
        return (
          label.includes("back") ||
          label.includes("rear") ||
          label.includes("environment")
        );
      }) || devices[0];

    setSelectedDeviceId(backCamera.deviceId);
  }, [devices, selectedDeviceId]);

  const startScanning = () => {
    setError(null);
    setScannedData(null);
    setIsScanning(true);
  };

  const stopScanning = () => {
    setIsScanning(false);
  };

  const resetScanner = () => {
    setScannedData(null);
    setError(null);
    setIsScanning(false);
  };

  const copyToClipboard = () => {
    if (scannedData) {
      navigator.clipboard.writeText(scannedData);
      alert("Copied to clipboard!");
    }
  };

  const switchCamera = () => {
    if (!devices || devices.length <= 1 || !selectedDeviceId) return;

    const currentIndex = devices.findIndex(
      (d) => d.deviceId === selectedDeviceId
    );
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
  };

  const isUrl = (text) => {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md"
      >
        <div className="bg-gray-800 rounded-3xl shadow-2xl overflow-hidden border border-gray-700">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200 }}
            >
              <svg
                className="w-16 h-16 mx-auto mb-2 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z"
                />
              </svg>
            </motion.div>
            <h1 className="text-2xl font-bold text-white">QR Code Scanner</h1>
            <p className="text-purple-100 text-sm mt-1">
              Scan any QR code instantly
            </p>
          </div>

          {/* Main Content */}
          <div className="p-6">
            {/* Camera Selection */}
            {devices && devices.length > 1 && !isScanning && !scannedData && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="mb-4"
              >
                <label className="block text-gray-300 text-sm font-medium mb-2">
                  Select Camera
                </label>
                <select
                  value={selectedDeviceId || ""}
                  onChange={(e) => setSelectedDeviceId(e.target.value)}
                  className="w-full bg-gray-700 text-white rounded-lg px-4 py-2 border border-gray-600 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  {devices.map((device) => (
                    <option key={device.deviceId} value={device.deviceId}>
                      {device.label ||
                        `Camera ${device.deviceId.substring(0, 8)}`}
                    </option>
                  ))}
                </select>
              </motion.div>
            )}

            {/* Scanner Container */}
            <AnimatePresence mode="wait">
              {isScanning && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  className="relative mb-6"
                >
                  <div className="rounded-2xl overflow-hidden border-4 border-purple-500 relative bg-black">
                    {/* React QR Scanner video */}
                    <Scanner
                      constraints={{
                        deviceId: selectedDeviceId || undefined,
                      }}
                      scanDelay={300}
                      onScan={(detectedCodes) => {
                        if (!detectedCodes || !detectedCodes.length) return;

                        const value = detectedCodes[0]?.rawValue || "";
                        if (!value) return;

                        // Save the scanned value
                        setScannedData(value);
                        setIsScanning(false);

                        // If it's a URL, open in a new tab
                        if (isUrl(value)) {
                          try {
                            window.open(value, "_blank", "noopener,noreferrer");
                          } catch (err) {
                            console.error("Failed to open URL:", err);
                            setError(
                              "Scanned a URL but could not open it automatically."
                            );
                          }
                        }
                      }}
                      onError={(err) => {
                        console.error("Scan error:", err);
                        setError(
                          err?.message || "Failed to access or read camera"
                        );
                        setIsScanning(false);
                      }}
                      styles={{
                        video: {
                          width: "100%",
                          height: "auto",
                          objectFit: "cover",
                          maxHeight: "400px",
                        },
                      }}
                    />

                    {/* Scanner Overlay */}
                    <div className="absolute inset-0 pointer-events-none">
                      {/* Corner Brackets */}
                      <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-purple-400 rounded-tl-xl"></div>
                      <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-purple-400 rounded-tr-xl"></div>
                      <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-purple-400 rounded-bl-xl"></div>
                      <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-purple-400 rounded-br-xl"></div>

                      {/* Scanning Line Animation */}
                      <motion.div
                        className="absolute inset-x-4 h-0.5 bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-lg shadow-purple-500/50"
                        animate={{
                          top: ["20%", "80%"],
                        }}
                        transition={{
                          repeat: Infinity,
                          duration: 2,
                          ease: "easeInOut",
                        }}
                      />

                      {/* Center Target Box */}
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-48 h-48 border-2 border-purple-400/50 rounded-xl"></div>
                      </div>
                    </div>
                  </div>

                  {/* Camera Switch Button */}
                  {devices && devices.length > 1 && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={switchCamera}
                      className="absolute top-4 right-4 z-10 bg-gray-900/80 backdrop-blur-sm text-white p-3 rounded-full shadow-lg border border-gray-700"
                    >
                      <svg
                        className="w-6 h-6"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </motion.button>
                  )}
                </motion.div>
              )}

              {/* Scanned Result */}
              {scannedData && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6"
                >
                  <div className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border border-green-500/50 rounded-2xl p-6">
                    <div className="flex items-center justify-center mb-4">
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 200 }}
                        className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center"
                      >
                        <svg
                          className="w-10 h-10 text-white"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 13l4 4L19 7"
                          />
                        </svg>
                      </motion.div>
                    </div>
                    <h3 className="text-green-400 font-semibold text-center mb-3">
                      Scan Successful!
                    </h3>
                    <div className="bg-gray-900/50 rounded-xl p-4 mb-4">
                      <p className="text-gray-200 text-sm break-all">
                        {scannedData}
                      </p>
                    </div>
                    <div className="flex gap-3">
                      <button
                        onClick={copyToClipboard}
                        className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                      >
                        <svg
                          className="w-5 h-5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"
                          />
                        </svg>
                        Copy
                      </button>
                      {isUrl(scannedData) && (
                        <a
                          href={scannedData}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center gap-2"
                        >
                          <svg
                            className="w-5 h-5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                            />
                          </svg>
                          Open
                        </a>
                      )}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* Error Message */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="mb-6 bg-red-500/20 border border-red-500/50 rounded-2xl p-4"
                >
                  <div className="flex items-center gap-3">
                    <svg
                      className="w-6 h-6 text-red-400 flex-shrink-0"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <p className="text-red-300 text-sm">{error}</p>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Action Buttons */}
            <div className="space-y-3">
              {!isScanning && !scannedData && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={startScanning}
                  disabled={!selectedDeviceId}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 disabled:cursor-not-allowed text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 13a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  Start Scanning
                </motion.button>
              )}

              {isScanning && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={stopScanning}
                  className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-red-500/30 flex items-center justify-center gap-3"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  Stop Scanning
                </motion.button>
              )}

              {scannedData && (
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={resetScanner}
                  className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 shadow-lg shadow-purple-500/30 flex items-center justify-center gap-3"
                >
                  <svg
                    className="w-6 h-6"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                    />
                  </svg>
                  Scan Another
                </motion.button>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="bg-gray-900 px-6 py-4 text-center">
            <p className="text-gray-500 text-xs">
              Position the QR code within the frame to scan
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default QrScanner;

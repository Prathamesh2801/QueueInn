import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  QrCode, 
  Scan, 
  Trophy, 
  CheckCircle, 
  AlertCircle, 
  Camera, 
  Loader2,
  Gift,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Smartphone
} from 'lucide-react';
import { gameRedeemByScanner } from '../../api/User/GameAPI';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';



export default function GameRedeemArea() {
  const { transactionID } = useParams();
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  
  // States
  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [scannedDeviceID, setScannedDeviceID] = useState('');
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [redeemResult, setRedeemResult] = useState(null);
  const [error, setError] = useState('');
  const [step, setStep] = useState('scan'); // 'scan', 'redeeming', 'success', 'error'

  // Initialize camera on component mount
  useEffect(() => {
    checkCameraAccess();
    return () => {
      stopCamera();
    };
  }, []);

  const checkCameraAccess = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      setHasCamera(true);
      // Stop the stream immediately after checking
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      console.error('Camera access denied:', err);
      setHasCamera(false);
      setError('Camera access is required to scan QR codes');
    }
  };

  const startCamera = async () => {
    try {
      setError('');
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
        setIsScanning(true);
        
        // Start QR code detection
        startQRDetection();
      }
    } catch (err) {
      console.error('Error starting camera:', err);
      setError('Failed to start camera. Please check permissions.');
      toast.error('Failed to start camera');
    }
  };

  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  const startQRDetection = () => {
    // Mock QR detection - in real app, use a QR code library like jsQR
    const detectQR = () => {
      if (!isScanning) return;
      
      // Simulate QR code detection after 3 seconds for demo
      setTimeout(() => {
        if (isScanning) {
          // Mock scanned URL: http://localhost:5173/#/startup?Hotel_ID=HTL_1756979676_1400?Device_ID=DEV_68c3e900b4147
          const mockDeviceID = 'DEV_68c3e900b4147';
          handleQRDetected(mockDeviceID);
        }
      }, 3000);
    };
    
    detectQR();
  };

  const handleQRDetected = (deviceID) => {
    setScannedDeviceID(deviceID);
    stopCamera();
    toast.success('QR Code detected!');
    handleRedeem(deviceID);
  };

  const handleRedeem = async (deviceID) => {
    setIsRedeeming(true);
    setStep('redeeming');
    setError('');

    try {
      const response = await gameRedeemByScanner(transactionID, deviceID);
      
      if (response && response.Status) {
        setRedeemResult(response);
        setStep('success');
        toast.success(response.Message || 'Reward redeemed successfully!');
      } else {
        throw new Error(response?.Message || 'Failed to redeem reward');
      }
    } catch (err) {
      console.error('Redeem error:', err);
      setError(err.message || 'Failed to redeem reward');
      setStep('error');
      toast.error(err.message || 'Failed to redeem reward');
    } finally {
      setIsRedeeming(false);
    }
  };

  const resetScanning = () => {
    setStep('scan');
    setError('');
    setRedeemResult(null);
    setScannedDeviceID('');
  };

  const renderScanningStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      {/* Header */}
      <div className="space-y-4">
        <motion.div
          className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto"
          whileHover={{ rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <QrCode className="w-10 h-10 text-white" />
        </motion.div>
        <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
          Scan to Redeem
        </h1>
        <p className="text-gray-300">
          Scan the QR code at the gaming station to claim your reward
        </p>
      </div>

      {/* Transaction Info */}
      <motion.div
        className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.3 }}
      >
        <p className="text-sm text-gray-300 mb-1">Transaction ID</p>
        <p className="text-blue-400 font-mono text-lg">{transactionID}</p>
      </motion.div>

      {/* Camera Section */}
      <div className="relative">
        {!isScanning ? (
          <motion.div
            className="aspect-square max-w-sm mx-auto bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center space-y-4"
            whileHover={{ scale: 1.02 }}
          >
            <Camera className="w-16 h-16 text-gray-400" />
            <p className="text-gray-400 text-center px-4">
              {hasCamera ? 'Tap to start camera and scan QR code' : 'Camera access required'}
            </p>
            {hasCamera && (
              <motion.button
                onClick={startCamera}
                className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center space-x-2"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                <Scan className="w-5 h-5" />
                <span>Start Scanning</span>
              </motion.button>
            )}
          </motion.div>
        ) : (
          <motion.div
            className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
          >
            <video
              ref={videoRef}
              className="w-full h-full object-cover"
              playsInline
              muted
            />
            <canvas ref={canvasRef} className="hidden" />
            
            {/* Scanning Overlay */}
            <div className="absolute inset-0 border-4 border-blue-500/50 rounded-2xl">
              <motion.div
                className="absolute inset-4 border-2 border-blue-400"
                animate={{ scale: [1, 1.05, 1] }}
                transition={{ duration: 2, repeat: Infinity }}
              />
              {/* Corner guides */}
              <div className="absolute top-6 left-6 w-6 h-6 border-l-4 border-t-4 border-blue-400 rounded-tl-lg" />
              <div className="absolute top-6 right-6 w-6 h-6 border-r-4 border-t-4 border-blue-400 rounded-tr-lg" />
              <div className="absolute bottom-6 left-6 w-6 h-6 border-l-4 border-b-4 border-blue-400 rounded-bl-lg" />
              <div className="absolute bottom-6 right-6 w-6 h-6 border-r-4 border-b-4 border-blue-400 rounded-br-lg" />
            </div>

            {/* Scanning Line Animation */}
            <motion.div
              className="absolute left-4 right-4 h-1 bg-gradient-to-r from-transparent via-blue-400 to-transparent"
              animate={{ y: [20, 300, 20] }}
              transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
            />
            
            <div className="absolute bottom-4 left-0 right-0 text-center">
              <p className="text-white text-sm bg-black/70 px-4 py-2 rounded-lg inline-block">
                Position QR code within the frame
              </p>
            </div>
            
            <motion.button
              onClick={stopCamera}
              className="absolute top-4 right-4 p-2 bg-gray-900/70 text-white rounded-lg"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
            >
              <ArrowLeft className="w-5 h-5" />
            </motion.button>
          </motion.div>
        )}
      </div>

      {/* Manual Input Option */}
      {!isScanning && (
        <motion.div
          className="pt-4 border-t border-gray-700"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          <p className="text-gray-400 text-sm mb-3">Or enter Device ID manually</p>
          <div className="flex space-x-2">
            <input
              type="text"
              placeholder="Device ID (e.g., DEV_68c3e900b4147)"
              value={scannedDeviceID}
              onChange={(e) => setScannedDeviceID(e.target.value)}
              className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            />
            <motion.button
              onClick={() => scannedDeviceID && handleRedeem(scannedDeviceID)}
              disabled={!scannedDeviceID}
              className="px-4 py-3 bg-blue-600 text-white rounded-xl disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <Gift className="w-5 h-5" />
            </motion.button>
          </div>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3"
        >
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </motion.div>
      )}
    </motion.div>
  );

  const renderRedeemingStep = () => (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      className="text-center space-y-6"
    >
      <motion.div
        className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto"
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <Loader2 className="w-10 h-10 text-white" />
      </motion.div>
      
      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-white">Processing Redemption</h2>
        <p className="text-gray-300">Please wait while we process your reward...</p>
      </div>

      <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
        <p className="text-sm text-gray-300 mb-1">Device ID</p>
        <p className="text-blue-400 font-mono">{scannedDeviceID}</p>
      </div>
    </motion.div>
  );

  const renderSuccessStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <motion.div
        className="w-20 h-20 bg-gradient-to-r from-green-500 to-emerald-600 rounded-3xl flex items-center justify-center mx-auto"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <CheckCircle className="w-10 h-10 text-white" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-3xl font-bold bg-gradient-to-r from-green-400 to-emerald-400 bg-clip-text text-transparent">
          Reward Claimed!
        </h2>
        <p className="text-gray-300">Your reward has been successfully redeemed</p>
      </div>

      {redeemResult?.data && (
        <motion.div
          className="bg-green-500/10 border border-green-500/20 rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="flex items-center justify-center space-x-2 mb-4">
            <Trophy className="w-6 h-6 text-yellow-400" />
            <span className="text-lg font-semibold text-white">{redeemResult.data.reward}</span>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center">
              <p className="text-gray-400">Amount</p>
              <p className="text-green-400 font-bold">{redeemResult.data.amount}</p>
            </div>
            <div className="text-center">
              <p className="text-gray-400">Points</p>
              <p className="text-purple-400 font-bold">{redeemResult.data.points}</p>
            </div>
          </div>
        </motion.div>
      )}

      <motion.button
        onClick={resetScanning}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center space-x-2 mx-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RefreshCw className="w-5 h-5" />
        <span>Scan Another</span>
      </motion.button>
    </motion.div>
  );

  const renderErrorStep = () => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="text-center space-y-6"
    >
      <motion.div
        className="w-20 h-20 bg-gradient-to-r from-red-500 to-pink-600 rounded-3xl flex items-center justify-center mx-auto"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: "spring", stiffness: 200 }}
      >
        <AlertCircle className="w-10 h-10 text-white" />
      </motion.div>

      <div className="space-y-2">
        <h2 className="text-2xl font-bold text-red-400">Redemption Failed</h2>
        <p className="text-gray-300">{error || 'Something went wrong'}</p>
      </div>

      <motion.button
        onClick={resetScanning}
        className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold flex items-center space-x-2 mx-auto"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <RefreshCw className="w-5 h-5" />
        <span>Try Again</span>
      </motion.button>
    </motion.div>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden"
    >
      {/* Background Particles */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent"></div>
        {[...Array(40)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0.2, 0.8, 0.2],
            }}
            transition={{
              duration: 2 + Math.random() * 2,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>

      {/* Main Container */}
      <motion.div
        className="relative w-full max-w-lg mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
      >
        <AnimatePresence mode="wait">
          {step === 'scan' && (
            <motion.div key="scan" exit={{ opacity: 0, x: -100 }}>
              {renderScanningStep()}
            </motion.div>
          )}
          {step === 'redeeming' && (
            <motion.div key="redeeming" exit={{ opacity: 0, scale: 0.8 }}>
              {renderRedeemingStep()}
            </motion.div>
          )}
          {step === 'success' && (
            <motion.div key="success" exit={{ opacity: 0, y: 100 }}>
              {renderSuccessStep()}
            </motion.div>
          )}
          {step === 'error' && (
            <motion.div key="error" exit={{ opacity: 0, y: 100 }}>
              {renderErrorStep()}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
}
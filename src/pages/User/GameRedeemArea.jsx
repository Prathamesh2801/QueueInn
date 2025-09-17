// GameRedeemArea.jsx
import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  QrCode,
  Scan,
  CheckCircle,
  AlertCircle,
  Camera,
  Loader2,
  Gift,
  RefreshCw,
  ArrowLeft
} from 'lucide-react';
import toast from 'react-hot-toast';
import jsQR from 'jsqr';
import { BrowserMultiFormatReader } from '@zxing/browser';
import { gameRedeemByScanner } from '../../api/User/GameAPI';
import { useParams, useNavigate } from 'react-router-dom';

export default function GameRedeemArea() {
  const { transactionID } = useParams();
  const navigate = useNavigate();

  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const zxingRef = useRef(null);
  const rafRef = useRef(null);
  const streamRef = useRef(null);
  const processingRef = useRef(false); // prevents re-entrancy when a QR has been detected

  const [isScanning, setIsScanning] = useState(false);
  const [hasCamera, setHasCamera] = useState(false);
  const [scannedDeviceID, setScannedDeviceID] = useState('');
  const [step, setStep] = useState('scan'); // 'scan' | 'redeeming' | 'success' | 'error'
  const [error, setError] = useState('');
  const [redeemResult, setRedeemResult] = useState(null);

  useEffect(() => {
    checkCameraAccess();
    return () => stopAllScanning();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Check if any video input exists
  const checkCameraAccess = async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const vid = devices.filter((d) => d.kind === 'videoinput');
      setHasCamera(vid.length > 0);
      if (vid.length === 0) setError('No camera found on this device');
    } catch (err) {
      console.error('enumerateDevices error', err);
      setHasCamera(false);
      setError('Unable to check cameras. Check browser permissions.');
    }
  };

  // Safely stop ZXing, jsQR RAF loop, and media tracks
  const stopAllScanning = () => {
    // Try stopping ZXing
    try {
      if (zxingRef.current) {
        try {
          if (typeof zxingRef.current.reset === 'function') zxingRef.current.reset();
          else if (typeof zxingRef.current.stopDecode === 'function') zxingRef.current.stopDecode();
          else if (typeof zxingRef.current.stop === 'function') zxingRef.current.stop();
        } catch (e) {
          console.warn('zxing stop/reset error (non-fatal):', e);
        }
      }
    } catch (e) {
      console.warn('error stopping zxing reader', e);
    } finally {
      zxingRef.current = null;
    }

    // cancel RAF loop
    if (rafRef.current) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }

    // stop media tracks referenced in streamRef
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach((t) => t.stop());
      } catch (e) {
        console.warn('error stopping streamRef tracks', e);
      }
      streamRef.current = null;
    }

    // also try stopping if video.srcObject exists (zxing may have set it)
    try {
      if (videoRef.current && videoRef.current.srcObject) {
        const tracks = videoRef.current.srcObject.getTracks();
        tracks.forEach((t) => t.stop());
        videoRef.current.srcObject = null;
      }
    } catch (e) {
      // ignore
    }

    setIsScanning(false);
  };

  // ensure video element is mounted (used when we set isScanning true to render it)
  const waitForVideo = () =>
    new Promise((resolve, reject) => {
      let tries = 0;
      const check = () => {
        if (videoRef.current) return resolve();
        tries++;
        if (tries > 60) return reject(new Error('video element did not mount'));
        requestAnimationFrame(check);
      };
      requestAnimationFrame(check);
    });

  // Start scanning: try ZXing first, fall back to jsQR
  const startScanning = async () => {
    setError('');
    setRedeemResult(null);

    // when user intentionally starts scanning, clear processing flag
    processingRef.current = false;

    // stop anything currently running
    stopAllScanning();

    setIsScanning(true);

    try {
      await waitForVideo();
    } catch (err) {
      console.error('video mount error', err);
      setError('Internal error: video element did not mount.');
      setIsScanning(false);
      return;
    }

    // ZXing attempt
    try {
      const codeReader = new BrowserMultiFormatReader();
      zxingRef.current = codeReader;

      codeReader.decodeFromVideoDevice(
        null,
        videoRef.current,
        (result, err) => {
          // guard: if already processing a prior result, ignore new callbacks
          if (processingRef.current) return;

          if (result) {
            // mark processing to avoid re-entrancy
            processingRef.current = true;

            // try to stop ZXing gracefully
            try {
              if (typeof codeReader.reset === 'function') codeReader.reset();
              else if (typeof codeReader.stopDecode === 'function') codeReader.stopDecode();
            } catch (e) {
              console.warn('zxing reset/stop attempt failed (non-fatal):', e);
            }

            // also stop camera tracks so the preview halts
            try {
              if (videoRef.current && videoRef.current.srcObject) {
                videoRef.current.srcObject.getTracks().forEach((t) => t.stop());
                videoRef.current.srcObject = null;
              }
            } catch (e) {
              console.warn('stop video tracks error', e);
            }

            // process QR
            handleRawQR(result.getText());
          } else if (err) {
            // NotFound is expected for many frames — just debug log
            console.debug('ZXing frame-level error (expected):', err && err.message ? err.message : err);
          }
        }
      );

      // ZXing started — return here
      return;
    } catch (zxErr) {
      console.warn('ZXing failed to start, falling back to jsQR:', zxErr);
    }

    // ZXing failed: fallback to jsQR approach
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false
      });
      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      videoRef.current.muted = true;
      try {
        await videoRef.current.play();
      } catch (playErr) {
        console.warn('video play error (fallback):', playErr);
      }
      startJsQRLoop();
    } catch (err) {
      console.error('jsQR fallback start error:', err);
      setError('Unable to access camera: ' + (err?.message || err?.name || 'unknown'));
      setIsScanning(false);
    }
  };

  // jsQR loop
  const startJsQRLoop = () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas) {
      setError('Internal error: video or canvas missing');
      return;
    }
    const ctx = canvas.getContext('2d');

    const scan = () => {
      if (!video || video.readyState !== video.HAVE_ENOUGH_DATA) {
        rafRef.current = requestAnimationFrame(scan);
        return;
      }

      const scale = 0.8; // tune for performance
      const w = Math.floor(video.videoWidth * scale) || 640;
      const h = Math.floor(video.videoHeight * scale) || 480;
      if (canvas.width !== w || canvas.height !== h) {
        canvas.width = w;
        canvas.height = h;
      }

      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(imageData.data, imageData.width, imageData.height, { inversionAttempts: 'attemptBoth' });

      if (code && code.data && !processingRef.current) {
        processingRef.current = true;
        // stop camera & RAF
        try {
          if (video.srcObject) {
            video.srcObject.getTracks().forEach((t) => t.stop());
          }
        } catch (e) {
          /* ignore */
        }
        if (rafRef.current) {
          cancelAnimationFrame(rafRef.current);
          rafRef.current = null;
        }
        handleRawQR(code.data);
        return;
      }

      rafRef.current = requestAnimationFrame(scan);
    };

    rafRef.current = requestAnimationFrame(scan);
  };

  // handle raw QR text (common path for both ZXing and jsQR)
  const handleRawQR = (qrText) => {
    // We already set processingRef in caller; defensive check
    if (processingRef.current === false) processingRef.current = true;

    let deviceID = null;
    try {
      deviceID = extractDeviceId(qrText);
    } catch (err) {
      console.warn('QR parse failed:', err);
      // parse-fail: brief message and resume scanning automatically
      setError('Invalid QR code. Please try again.');
      setTimeout(() => {
        setError('');
        processingRef.current = false;
        startScanning();
      }, 1200);
      return;
    }

    if (!deviceID) {
      setError('Device ID not found in QR code');
      setTimeout(() => {
        setError('');
        processingRef.current = false;
        startScanning();
      }, 1200);
      return;
    }

    setScannedDeviceID(deviceID);
    // call redeem API — on server error we DO NOT auto-restart the scanner
    handleRedeem(deviceID);
  };

  // robust extractor for Device_ID
  const extractDeviceId = (text) => {
    if (!text) throw new Error('Empty QR data');
    // try to parse as URL
    try {
      const u = new URL(text);
      const hashPart = u.hash && u.hash.includes('?') ? u.hash.split('?')[1] : '';
      const params = new URLSearchParams(u.search || hashPart);
      const d = params.get('Device_ID') || params.get('DeviceID') || params.get('device_id');
      if (d) return d;
    } catch (_) {
      // not absolute URL — continue
    }

    // try query-like substring
    const qIdx = text.indexOf('?');
    const candidate = qIdx !== -1 ? text.slice(qIdx + 1) : (text.includes('#') ? text.split('#').pop() : '');
    if (candidate) {
      const p = new URLSearchParams(candidate);
      const d = p.get('Device_ID') || p.get('DeviceID') || p.get('device_id');
      if (d) return d;
    }

    // fallback regex for DEV_...
    const m = text.match(/(Device_ID|DeviceID|device_id)=?(DEV_[A-Za-z0-9_-]+)/i) || text.match(/(DEV_[A-Za-z0-9_-]+)/i);
    if (m) return m[2] || m[1];
    throw new Error('Device_ID not found in QR data');
  };

  // Redeem API call — do not auto-restart scanner on server error
  const handleRedeem = async (deviceID) => {
    setStep('redeeming');
    setError('');
    try {
      const res = await gameRedeemByScanner(transactionID, deviceID);
      console.log('Fetching the Redeem Data  ', res);

      if (res && res.Status) {
        setRedeemResult(res);
        setStep('success');
        toast.success(res.Message || 'Redeemed successfully');
      } else {
        // server returned error, show it and DON'T restart scanning automatically
        const msg = res?.Message || 'Redeem failed from server';
        console.error('redeem server error:', res);
        setError(msg);
        setStep('error');
        // keep processingRef true so scanner callbacks are ignored until user restarts
      }
    } catch (err) {
      console.error('redeem network/error:', err);
      setError(err?.message || 'Network error while redeeming');
      setStep('error');
    }
  };

  // Manual submit handler (user typed device ID)
  const handleManualSubmit = () => {
    if (!scannedDeviceID?.trim()) {
      setError('Enter Device ID');
      return;
    }
    processingRef.current = true; // prevent scanner re-entry if still running
    stopAllScanning();
    handleRedeem(scannedDeviceID.trim());
  };

  // User actions to explicitly retry scanning
  const onScanAgain = async () => {
    // Reset UI + processing flag
    setError('');
    setRedeemResult(null);
    setScannedDeviceID('');
    processingRef.current = false;
    setStep('scan');

    // Wait for the next frame so the <video> mounts before startScanning tries to attach
    await new Promise((res) => requestAnimationFrame(res));
    startScanning();
  };

  const onTryAgain =  () => {
    window.location.reload()
  };

  // Back button: stop scanning and go back in history
  const onBack = () => {
    stopAllScanning();
    navigate(-1);
  };

  return (
    <motion.div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative">
      {/* Back button (mobile-friendly) */}
      <button
        onClick={onBack}
        aria-label="Go back"
        className="absolute top-4 left-4 z-50 flex items-center gap-2 px-3 py-2 rounded-lg bg-black/60 backdrop-blur text-white shadow-md touch-manipulation"
        style={{ WebkitTapHighlightColor: 'transparent' }}
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm font-medium">Back</span>
      </button>

      <div className="relative w-full max-w-lg mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10">
        <AnimatePresence>
          {step === 'scan' && (
            <motion.div key="scan" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <div className="text-center space-y-6">
                <div className="space-y-4">
                  <div className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center mx-auto">
                    <QrCode className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Scan to Redeem</h1>
                  <p className="text-gray-300">Scan the QR code at the gaming station to claim your reward</p>
                </div>

                <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4">
                  <p className="text-sm text-gray-300 mb-1">Transaction ID</p>
                  <p className="text-blue-400 font-mono text-lg">{transactionID}</p>
                </div>

                <div className="relative">
                  {!isScanning ? (
                    <div className="aspect-square max-w-sm mx-auto bg-gray-800/50 rounded-2xl border-2 border-dashed border-gray-600 flex flex-col items-center justify-center space-y-4 p-6">
                      <Camera className="w-16 h-16 text-gray-400" />
                      <p className="text-gray-400 text-center px-4">{hasCamera ? 'Tap to start camera and scan QR code' : 'Camera access required'}</p>
                      {hasCamera && (
                        <button onClick={startScanning} className="px-6 py-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold">
                          <Scan className="w-5 h-5 inline-block mr-2" />
                          Start Scanning
                        </button>
                      )}
                      {!hasCamera && (
                        <button onClick={checkCameraAccess} className="px-6 py-3 bg-gray-600 text-white rounded-xl">
                          <RefreshCw className="w-5 h-5 inline-block mr-2" /> Check Camera
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="relative aspect-square max-w-sm mx-auto rounded-2xl overflow-hidden">
                      <video
                        ref={videoRef}
                        playsInline
                        muted
                        autoPlay
                        className="w-full h-full object-cover"
                        style={{ display: 'block' }}
                      />
                      <canvas ref={canvasRef} className="hidden" />
                      <div className="absolute inset-0 border-4 border-blue-500/50 rounded-2xl pointer-events-none" />
                      <button onClick={stopAllScanning} className="absolute top-4 right-4 p-2 bg-gray-900/70 text-white rounded-lg">
                        <ArrowLeft className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {!isScanning && (
                  <div className="pt-4 border-t border-gray-700">
                    <p className="text-gray-400 text-sm mb-3">Or enter Device ID manually</p>
                    <div className="flex space-x-2">
                      <input
                        type="text"
                        placeholder="Device ID (e.g., DEV_68c3e900b4147)"
                        value={scannedDeviceID}
                        onChange={(e) => setScannedDeviceID(e.target.value)}
                        className="flex-1 px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500"
                        onKeyDown={(e) => e.key === 'Enter' && handleManualSubmit()}
                      />
                      <button
                        onClick={handleManualSubmit}
                        disabled={!scannedDeviceID}
                        className="px-4 py-3 bg-blue-600 text-white rounded-xl disabled:opacity-50"
                      >
                        <Gift className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="mt-3 text-red-400">
                    {error}
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {step === 'redeeming' && (
            <motion.div key="redeeming">
              <div className="text-center py-8">
                <Loader2 className="w-12 h-12 mx-auto animate-spin text-blue-500" />
                <p className="text-white mt-4">Processing redemption...</p>
              </div>
            </motion.div>
          )}

          {step === 'success' && (
            <motion.div key="success">
              <div className="text-center py-8">
                <CheckCircle className="w-12 h-12 mx-auto text-green-500" />
                <h2 className="text-xl font-bold text-white mt-4">Success</h2>
                <p className="text-gray-300">{redeemResult?.Message}</p>
                <div className="mt-4 flex justify-center gap-3">
                  <button onClick={onScanAgain} className="px-4 py-2 bg-blue-600 rounded text-white">Scan Again</button>
                  <button onClick={onBack} className="px-4 py-2 bg-gray-700 rounded text-white">Back</button>
                </div>
              </div>
            </motion.div>
          )}

          {step === 'error' && (
            <motion.div key="error">
              <div className="text-center py-8">
                <AlertCircle className="w-12 h-12 mx-auto text-red-500" />
                <h2 className="text-xl font-bold text-white mt-4">Error</h2>
                <p className="text-gray-300">{error}</p>

                <div className="mt-4 flex justify-center gap-3">
                  <button onClick={onTryAgain} className="px-4 py-2 rounded bg-blue-600 text-white">Try Again</button>
                  <button onClick={onScanAgain} className="px-4 py-2 rounded bg-gray-600 text-white">Back</button>
                </div>

                <div className="mt-4 text-sm text-gray-400">
                  You can also enter Device ID manually below.
                </div>

                <div className="mt-4 flex gap-2">
                  <input
                    value={scannedDeviceID}
                    onChange={(e) => setScannedDeviceID(e.target.value)}
                    placeholder="DEV_xxx"
                    className="flex-1 px-3 py-2 rounded bg-white/5 text-white"
                  />
                  <button onClick={handleManualSubmit} className="px-4 py-2 rounded bg-blue-600 text-white">Redeem</button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

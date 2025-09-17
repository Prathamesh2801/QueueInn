import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  Gamepad2,
  Phone,
  Users,
  ArrowRight,
  Loader2,
  Sparkles,
  Shield,
  RefreshCw,
  X
} from 'lucide-react';
import { sendOTP, verifyOTP } from '../../api/User/OTPAPI';
import { playGame } from '../../api/User/GameAPI';
import VerifyOTP from '../../components/waitlist/VerifyOTP';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';




export default function GameForm() {
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [checkingToken, setCheckingToken] = useState(true);
  const [tokenChecked, setTokenChecked] = useState(false);
  const [error, setError] = useState(null);

  // Form states
  const [phoneNumber, setPhoneNumber] = useState('');
  const [referralNumber, setReferralNumber] = useState('');

  // OTP UI state
  const [showOTP, setShowOTP] = useState(false);
  const [otpPhone, setOtpPhone] = useState('');
  const [pendingFormData, setPendingFormData] = useState(null);

  // Animation states
  const [focusedInput, setFocusedInput] = useState(null);

  // On mount -> check if token exists and if valid via playGame API
  useEffect(() => {
    const init = async () => {
      const token = localStorage.getItem('Token');
      if (!token) {
        setCheckingToken(false);
        setLoading(false);
        return;
      }

      try {
        setCheckingToken(true);
        const resp = await playGame();
        if (resp && resp.Status) {
          navigate('/gamezone');
          return;
        } else {
          toast.error(resp?.Message || 'Session invalid. Please verify your phone.', { duration: 4000 });
          localStorage.removeItem('Token');
          setCheckingToken(false);
          setLoading(false);
        }
      } catch (err) {
        console.error('Error verifying token with playGame:', err);
        setCheckingToken(false);
        setLoading(false);
      }
    };

    init();
  }, [navigate]);

  // Handle form submit -> send OTP to main phone
  const handleSubmitPhone = async (e) => {
    e?.preventDefault?.();
    setError(null);

    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setError('Please enter a valid phone number.');
      return;
    }

    try {
      setLoading(true);
      const resp = await sendOTP(phoneNumber);
      if (resp && resp.Status) {
        toast.success(resp.Message || 'OTP sent');
        if (referralNumber && referralNumber.trim() !== '') {
          localStorage.setItem('Contact', referralNumber.trim());
        }
        setPendingFormData({ phoneNumber: phoneNumber.trim(), referralNumber: referralNumber.trim() || null });
        setOtpPhone(phoneNumber.trim());
        setShowOTP(true);
      } else {
        toast.error(resp?.Message || 'Failed to send OTP');
      }
    } catch (err) {
      console.error('sendOTP error:', err);
      toast.error('Failed to send OTP. Try again.');
    } finally {
      setLoading(false);
    }
  };

  // Called by VerifyOTP when user submits OTP
  const handleOTPVerification = async (phoneNum, otp) => {
    try {
      setLoading(true);
      const verifyResponse = await verifyOTP(phoneNum, otp);

      if (verifyResponse && verifyResponse.Status) {
        toast.success('OTP verified');

        if (verifyResponse.Token) {
          localStorage.setItem('Token', verifyResponse.Token);
        }

        const token = localStorage.getItem('Token') || verifyResponse.Token || null;
        if (token) {
          try {
            const playResp = await playGame(token);
            if (playResp && playResp.Status) {
              navigate('/gamezone');
              return;
            } else {
              // toast.error(playResp?.Message || 'Could not fetch games, but login completed.');
              navigate('/gamezone');
              return;
            }
          } catch (err) {
            console.warn('playGame after verify failed:', err);
            navigate('/gamezone');
            return;
          }
        } else {
          navigate('/gamezone');
          return;
        }
      } else {
        throw new Error(verifyResponse?.Message || 'Invalid OTP');
      }
    } catch (err) {
      console.error('Error verifying OTP:', err);
      toast.error(err?.message || 'OTP verification failed');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const handleBackFromOTP = () => {
    setShowOTP(false);
    setOtpPhone('');
  };

  const handleResendOTP = async (phone) => {
    try {
      setLoading(true);
      const resp = await sendOTP(phone);
      if (resp && resp.Status) {
        toast.success(resp.Message || 'OTP resent');
      } else {
        toast.error(resp?.Message || 'Failed to resend OTP');
      }
    } catch (err) {
      console.error('Resend OTP error:', err);
      toast.error('Failed to resend OTP');
    } finally {
      setLoading(false);
    }
  };

  if (checkingToken) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center"
        >
          <motion.div
            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center mx-auto mb-4"
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          >
            <Shield className="w-8 h-8 text-white" />
          </motion.div>
          <p className="text-white text-lg font-medium">Checking session...</p>
          <p className="text-gray-400 text-sm mt-2">Please wait while we verify your access</p>
        </motion.div>
      </div>
    );
  }

  if (showOTP) {
    return (
      <VerifyOTP
        phoneNumber={otpPhone}
        onVerifySuccess={handleOTPVerification}
        onBack={handleBackFromOTP}
        onResendOTP={handleResendOTP}
      />
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black relative overflow-hidden"
    >
      {/* Background Particles Effect */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent"></div>
        {[...Array(30)].map((_, i) => (
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
        initial={{ scale: 0.8, opacity: 0, y: 50 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        transition={{ type: "spring", stiffness: 200, damping: 20 }}
        className="relative w-full max-w-md mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
      >
        {/* Header */}
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-center mb-8"
        >
          <div className="flex justify-center mb-4">
            <motion.div
              className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-3xl flex items-center justify-center"
              whileHover={{ rotate: 360 }}
              transition={{ duration: 0.6 }}
            >
              <Gamepad2 className="w-10 h-10 text-white" />
            </motion.div>
          </div>
          <motion.h1
            className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent mb-2"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            Ready to Play?
          </motion.h1>
          <motion.p
            className="text-gray-300 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            Enter your details to start your gaming adventure
          </motion.p>
        </motion.div>

        {/* Form */}
        <motion.form
          onSubmit={handleSubmitPhone}
          className="space-y-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
        >
          {/* Phone Number Input */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.6 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Phone className="w-4 h-4 mr-2 text-blue-400" />
              Phone Number *
            </label>
            <motion.div
              className="relative"
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                onFocus={() => setFocusedInput('phone')}
                onBlur={() => setFocusedInput(null)}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300 text-lg"
                placeholder="Enter your phone number"
                maxLength={10}
              />
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                animate={{
                  scale: focusedInput === 'phone' ? 1.1 : 1,
                  rotate: focusedInput === 'phone' ? 10 : 0,
                }}
              >
                <Phone className="w-5 h-5 text-blue-400" />
              </motion.div>
            </motion.div>
          </motion.div>

          {/* Referral Input */}
          <motion.div
            initial={{ x: -20, opacity: 0 }}
            animate={{ x: 0, opacity: 1 }}
            transition={{ delay: 0.7 }}
          >
            <label className="block text-sm font-medium text-gray-300 mb-2 flex items-center">
              <Users className="w-4 h-4 mr-2 text-purple-400" />
              Friend / Referral
              <span className="text-gray-500 text-xs ml-1">(optional)</span>
            </label>
            <motion.div
              className="relative"
              whileTap={{ scale: 0.98 }}
            >
              <input
                type="tel"
                value={referralNumber}
                onChange={(e) => setReferralNumber(e.target.value)}
                onFocus={() => setFocusedInput('referral')}
                onBlur={() => setFocusedInput(null)}
                className="w-full px-4 py-3 bg-white/5 border border-white/20 rounded-xl text-white placeholder-gray-400 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/30 transition-all duration-300 text-lg"
                placeholder="Friend's phone number"
                maxLength={10}
              />
              <motion.div
                className="absolute right-3 top-1/2 transform -translate-y-1/2"
                animate={{
                  scale: focusedInput === 'referral' ? 1.1 : 1,
                  rotate: focusedInput === 'referral' ? 10 : 0,
                }}
              >
                <Users className="w-5 h-5 text-purple-400" />
              </motion.div>
            </motion.div>
            <motion.p
              className="text-xs text-gray-500 mt-2 flex items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <Sparkles className="w-3 h-3 mr-1" />
              Get bonus rewards for referring friends!
            </motion.p>
          </motion.div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className="flex items-center space-x-2 text-red-400 text-sm bg-red-500/10 border border-red-500/20 rounded-xl p-3"
            >
              <X className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </motion.div>
          )}

          {/* Action Buttons */}
          <motion.div
            className="flex flex-col space-y-3"
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            <motion.button
              type="submit"
              disabled={loading}
              className="w-full relative overflow-hidden px-6 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg disabled:opacity-60 disabled:cursor-not-allowed shadow-lg hover:shadow-xl transition-all duration-300"
              whileHover={{ scale: loading ? 1 : 1.02 }}
              whileTap={{ scale: loading ? 1 : 0.98 }}
            >
              <motion.div
                className="flex items-center justify-center space-x-2"
                animate={{ x: loading ? -10 : 0 }}
                transition={{ duration: 0.3 }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                  >
                    <Loader2 className="w-5 h-5" />
                  </motion.div>
                ) : (
                  <ArrowRight className="w-5 h-5" />
                )}
                <span>{loading ? 'Sending OTP...' : 'Send OTP'}</span>
              </motion.div>

              {/* Button shine effect */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
                initial={{ x: '-100%' }}
                whileHover={{ x: '100%' }}
                transition={{ duration: 0.6 }}
              />
            </motion.button>

            <motion.button
              type="button"
              onClick={() => {
                setCheckingToken(true);
                setLoading(true);
                setTimeout(() => {
                  setCheckingToken(false);
                  setLoading(false);
                }, 300);
              }}
              className="w-full px-6 py-3 bg-gray-800/50 text-gray-300 rounded-xl font-medium border border-gray-600/30 hover:bg-gray-700/50 hover:border-gray-500/50 transition-all duration-300 flex items-center justify-center space-x-2"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Cancel</span>
            </motion.button>
          </motion.div>
        </motion.form>

        {/* Footer Info */}
        <motion.div
          className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 1 }}
        >
          <p className="text-gray-300 text-xs text-center leading-relaxed flex items-center justify-center">
            <Shield className="w-4 h-4 mr-2 text-blue-400" />
            Your data is secure and encrypted. We'll send you a verification code to get started.
          </p>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}
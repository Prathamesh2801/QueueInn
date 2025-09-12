import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { ArrowLeft, Shield, Smartphone, RefreshCw } from 'lucide-react';

export default function VerifyOTP({ phoneNumber, onVerifySuccess, onBack, onResendOTP }) {
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');
    const [resendTimer, setResendTimer] = useState(30);
    const [canResend, setCanResend] = useState(false);
    const inputRefs = useRef([]);

    // Timer for resend OTP
    useEffect(() => {
        if (resendTimer > 0) {
            const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
            return () => clearTimeout(timer);
        } else {
            setCanResend(true);
        }
    }, [resendTimer]);

    // Auto-focus first input on mount
    useEffect(() => {
        if (inputRefs.current[0]) {
            inputRefs.current[0].focus();
        }
    }, []);

    const handleInputChange = (index, value) => {
        if (!/^\d*$/.test(value)) return; // Only allow digits

        const newOtp = [...otp];
        newOtp[index] = value.slice(-1); // Take only the last digit
        setOtp(newOtp);
        setError('');

        // Auto-advance to next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }

        // Auto-verify when all fields are filled
        if (newOtp.every(digit => digit !== '') && newOtp.join('').length === 6) {
            handleVerifyOTP(newOtp.join(''));
        }
    };

    const handleKeyDown = (index, e) => {
        if (e.key === 'Backspace') {
            if (!otp[index] && index > 0) {
                // Move to previous input if current is empty
                inputRefs.current[index - 1]?.focus();
            } else {
                // Clear current input
                const newOtp = [...otp];
                newOtp[index] = '';
                setOtp(newOtp);
            }
        } else if (e.key === 'ArrowLeft' && index > 0) {
            inputRefs.current[index - 1]?.focus();
        } else if (e.key === 'ArrowRight' && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handlePaste = (e) => {
        e.preventDefault();
        const pastedData = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, 6);
        
        if (pastedData.length === 6) {
            const newOtp = pastedData.split('');
            setOtp(newOtp);
            setError('');
            handleVerifyOTP(pastedData);
        }
    };

    const handleVerifyOTP = async (otpCode) => {
        setIsLoading(true);
        setError('');

        try {
            await onVerifySuccess(phoneNumber, otpCode);
        } catch (err) {
            setError('Invalid OTP. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        } finally {
            setIsLoading(false);
        }
    };

    const handleResend = async () => {
        if (!canResend) return;
        
        setCanResend(false);
        setResendTimer(30);
        setError('');
        
        try {
            await onResendOTP(phoneNumber);
        } catch (err) {
            setError('Failed to resend OTP. Please try again.');
            setCanResend(true);
            setResendTimer(0);
        }
    };

    const maskPhoneNumber = (phone) => {
        if (phone.length >= 4) {
            return phone.slice(0, 2) + '*'.repeat(phone.length - 4) + phone.slice(-2);
        }
        return phone;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative min-h-screen flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 via-gray-800 to-black"
        >
            {/* Background Particles Effect */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-purple-600/10 to-transparent"></div>
                {[...Array(50)].map((_, i) => (
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
                className="relative w-full max-w-md mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10 shadow-2xl"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
                {/* Back Button */}
                <motion.button
                    onClick={onBack}
                    className="absolute left-4 top-4 sm:left-6 sm:top-6 z-10 flex items-center px-3 py-2 rounded-xl bg-gray-900/70 text-white border border-white/10 shadow-lg backdrop-blur-sm hover:bg-gray-800/90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <ArrowLeft className="w-4 h-4 mr-1" />
                    <span className="text-sm font-medium">Back</span>
                </motion.button>

                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex justify-center mb-4">
                        <motion.div
                            className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Shield className="w-8 h-8 text-white" />
                        </motion.div>
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Verify Your Number</h2>
                    <p className="text-gray-300 text-sm">
                        We sent a 6-digit code to
                    </p>
                    <p className="text-blue-400 font-semibold flex items-center justify-center mt-1">
                        <Smartphone className="w-4 h-4 mr-2" />
                        +91 {maskPhoneNumber(phoneNumber)}
                    </p>
                </motion.div>

                {/* OTP Input Fields */}
                <motion.div
                    className="flex justify-center space-x-3 mb-6"
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ delay: 0.4 }}
                >
                    {otp.map((digit, index) => (
                        <motion.input
                            key={index}
                            ref={(el) => (inputRefs.current[index] = el)}
                            type="text"
                            inputMode="numeric"
                            value={digit}
                            onChange={(e) => handleInputChange(index, e.target.value)}
                            onKeyDown={(e) => handleKeyDown(index, e)}
                            onPaste={handlePaste}
                            className="w-12 h-12 text-center text-xl font-bold bg-white/5 border border-white/20 rounded-xl text-white focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition-all duration-300"
                            maxLength={1}
                            disabled={isLoading}
                            whileFocus={{ scale: 1.1 }}
                        />
                    ))}
                </motion.div>

                {/* Error Message */}
                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-red-400 text-sm text-center mb-4 bg-red-500/10 border border-red-500/20 rounded-lg p-3"
                    >
                        {error}
                    </motion.div>
                )}

                {/* Loading State */}
                {isLoading && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-center mb-4"
                    >
                        <motion.div
                            className="inline-block w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full"
                            animate={{ rotate: 360 }}
                            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                        />
                        <p className="text-gray-300 text-sm mt-2">Verifying OTP...</p>
                    </motion.div>
                )}

                {/* Resend OTP */}
                <motion.div
                    className="text-center"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <p className="text-gray-400 text-sm mb-3">
                        Didn't receive the code?
                    </p>
                    
                    {canResend ? (
                        <motion.button
                            onClick={handleResend}
                            className="flex items-center justify-center mx-auto px-6 py-3 bg-gradient-to-r from-blue-600/20 to-purple-600/20 text-blue-400 rounded-xl border border-blue-500/30 hover:from-blue-600/30 hover:to-purple-600/30 hover:border-blue-400/50 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            disabled={isLoading}
                        >
                            <RefreshCw className="w-4 h-4 mr-2" />
                            Resend OTP
                        </motion.button>
                    ) : (
                        <p className="text-gray-500 text-sm">
                            Resend available in {resendTimer}s
                        </p>
                    )}
                </motion.div>

                {/* Instructions */}
                <motion.div
                    className="mt-6 p-4 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                >
                    <p className="text-gray-300 text-xs text-center leading-relaxed">
                        Enter the 6-digit verification code sent to your phone. 
                        The code will auto-verify once all digits are entered.
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
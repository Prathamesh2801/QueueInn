import { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Clock, Users, Phone, User, Utensils, Star } from "lucide-react";
import { motion } from 'framer-motion';
import { Trophy } from "lucide-react";
import Squares from "../ui/Squares";

const clamp = (value, min = 0, max = 100) => Math.min(Math.max(value, min), max);
const round = (value, precision = 3) => parseFloat(value.toFixed(precision));
const adjust = (value, fromMin, fromMax, toMin, toMax) =>
    round(toMin + ((toMax - toMin) * (value - fromMin)) / (fromMax - fromMin));
const easeInOutCubic = (x) => x < 0.5 ? 4 * x * x * x : 1 - Math.pow(-2 * x + 2, 3) / 2;

const ANIMATION_CONFIG = {
    SMOOTH_DURATION: 600,
    INITIAL_DURATION: 1500,
    INITIAL_X_OFFSET: 70,
    INITIAL_Y_OFFSET: 60,
    DEVICE_BETA_OFFSET: 20,
};

export default function WaitingAreaUI({ waitingNumber, userData, waitingTime, waitingMessage, onPlayGameClick }) {
    const navigate = useNavigate();
    const wrapRef = useRef(null);
    const cardRef = useRef(null);
    const [isMobile, setIsMobile] = useState(false);
    
    // Countdown timer state
    const [remainingSeconds, setRemainingSeconds] = useState(waitingTime || 0);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth <= 1024);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Initialize countdown when waitingTime prop changes
    useEffect(() => {
        setRemainingSeconds(waitingTime || 0);
    }, [waitingTime]);

    // Countdown timer effect
    useEffect(() => {
        if (remainingSeconds <= 0) return;

        const timer = setInterval(() => {
            setRemainingSeconds(prev => {
                if (prev <= 1) {
                    clearInterval(timer);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        return () => clearInterval(timer);
    }, [remainingSeconds]);

    // Format time to HH:MM:SS
    const formatTime = (seconds) => {
        if (seconds <= 0) return { hours: 0, minutes: 0, seconds: 0 };
        
        const hours = Math.floor(seconds / 3600);
        const minutes = Math.floor((seconds % 3600) / 60);
        const secs = seconds % 60;
        
        return { hours, minutes, seconds: secs };
    };

    const timeFormatted = formatTime(remainingSeconds);
    const peopleAhead = waitingNumber > 0 ? waitingNumber - 1 : 0;

    // Get time display color based on remaining time
    const getTimeColor = () => {
        if (remainingSeconds <= 300) return "text-green-400"; // 5 minutes or less - red
        if (remainingSeconds <= 900) return "text-yellow-400"; // 15 minutes or less - yellow
        return "text-blue-400"; // More than 15 minutes - green
    };

    const getTimeGlow = () => {
        if (remainingSeconds <= 300) return "rgba(34, 197, 94, 0.5)"; // red glow
        if (remainingSeconds <= 900) return "rgba(245, 158, 11, 0.5)"; // yellow glow
        return "rgba(59, 130, 246, 0.5)"; // blue glow
    };

    // Holographic 3D Animation Handlers
    const animationHandlers = useMemo(() => {
        let rafId = null;

        const updateCardTransform = (offsetX, offsetY, card, wrap) => {
            const width = card.clientWidth;
            const height = card.clientHeight;

            const percentX = clamp((100 / width) * offsetX);
            const percentY = clamp((100 / height) * offsetY);

            const centerX = percentX - 50;
            const centerY = percentY - 50;
            const properties = {
                "--pointer-x": `${percentX}%`,
                "--pointer-y": `${percentY}%`,
                "--background-x": `${adjust(percentX, 0, 100, 35, 65)}%`,
                "--background-y": `${adjust(percentY, 0, 100, 35, 65)}%`,
                "--pointer-from-center": `${clamp(Math.hypot(percentY - 50, percentX - 50) / 50, 0, 1)}`,
                "--pointer-from-top": `${percentY / 100}`,
                "--pointer-from-left": `${percentX / 100}`,
                "--rotate-x": `${round(-(centerX / 4))}deg`,
                "--rotate-y": `${round(centerY / 3)}deg`,
            };

            Object.entries(properties).forEach(([property, value]) => {
                wrap.style.setProperty(property, value);
            });
        };

        const createSmoothAnimation = (duration, startX, startY, card, wrap) => {
            const startTime = performance.now();
            const targetX = wrap.clientWidth / 2;
            const targetY = wrap.clientHeight / 2;

            const animationLoop = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = clamp(elapsed / duration);
                const easedProgress = easeInOutCubic(progress);

                const currentX = adjust(easedProgress, 0, 1, startX, targetX);
                const currentY = adjust(easedProgress, 0, 1, startY, targetY);

                updateCardTransform(currentX, currentY, card, wrap);

                if (progress < 1) {
                    rafId = requestAnimationFrame(animationLoop);
                }
            };

            rafId = requestAnimationFrame(animationLoop);
        };

        return {
            updateCardTransform,
            createSmoothAnimation,
            cancelAnimation: () => {
                if (rafId) {
                    cancelAnimationFrame(rafId);
                    rafId = null;
                }
            },
        };
    }, []);

    const handlePointerMove = useCallback((event) => {
        const card = cardRef.current;
        const wrap = wrapRef.current;
        if (!card || !wrap || !animationHandlers) return;

        const rect = card.getBoundingClientRect();
        animationHandlers.updateCardTransform(
            event.clientX - rect.left,
            event.clientY - rect.top,
            card,
            wrap
        );
    }, [animationHandlers]);

    const handleTouchMove = useCallback((event) => {
        const card = cardRef.current;
        const wrap = wrapRef.current;
        if (!card || !wrap || !animationHandlers) return;

        const touch = event.touches[0];
        const rect = card.getBoundingClientRect();
        animationHandlers.updateCardTransform(
            touch.clientX - rect.left,
            touch.clientY - rect.top,
            card,
            wrap
        );
    }, [animationHandlers]);

    const handlePointerEnter = useCallback(() => {
        const card = cardRef.current;
        const wrap = wrapRef.current;
        if (!card || !wrap || !animationHandlers) return;

        animationHandlers.cancelAnimation();
        wrap.classList.add("active");
        card.classList.add("active");
    }, [animationHandlers]);

    const handlePointerLeave = useCallback((event) => {
        const card = cardRef.current;
        const wrap = wrapRef.current;
        if (!card || !wrap || !animationHandlers) return;

        animationHandlers.createSmoothAnimation(
            ANIMATION_CONFIG.SMOOTH_DURATION,
            event.offsetX || wrap.clientWidth / 2,
            event.offsetY || wrap.clientHeight / 2,
            card,
            wrap
        );
        wrap.classList.remove("active");
        card.classList.remove("active");
    }, [animationHandlers]);

    const handleDeviceOrientation = useCallback((event) => {
        const card = cardRef.current;
        const wrap = wrapRef.current;
        if (!card || !wrap || !animationHandlers) return;

        const { beta, gamma } = event;
        if (!beta || !gamma) return;

        animationHandlers.updateCardTransform(
            card.clientWidth / 2 + gamma * 3,
            card.clientHeight / 2 + (beta - ANIMATION_CONFIG.DEVICE_BETA_OFFSET) * 3,
            card,
            wrap
        );
    }, [animationHandlers]);

    useEffect(() => {
        if (!animationHandlers) return;

        const card = cardRef.current;
        const wrap = wrapRef.current;
        if (!card || !wrap) return;

        const pointerMoveHandler = handlePointerMove;
        const touchMoveHandler = handleTouchMove;
        const pointerEnterHandler = handlePointerEnter;
        const pointerLeaveHandler = handlePointerLeave;
        const deviceOrientationHandler = handleDeviceOrientation;

        // Desktop events
        if (!isMobile) {
            card.addEventListener("pointerenter", pointerEnterHandler);
            card.addEventListener("pointermove", pointerMoveHandler);
            card.addEventListener("pointerleave", pointerLeaveHandler);
        } else {
            // Mobile/tablet events
            card.addEventListener("touchstart", pointerEnterHandler);
            card.addEventListener("touchmove", touchMoveHandler);
            card.addEventListener("touchend", pointerLeaveHandler);

            // Device orientation for gyroscope tilt
            if (window.DeviceOrientationEvent) {
                window.addEventListener('deviceorientation', deviceOrientationHandler);
            }
        }

        const initialX = wrap.clientWidth - ANIMATION_CONFIG.INITIAL_X_OFFSET;
        const initialY = ANIMATION_CONFIG.INITIAL_Y_OFFSET;

        animationHandlers.updateCardTransform(initialX, initialY, card, wrap);
        animationHandlers.createSmoothAnimation(
            ANIMATION_CONFIG.INITIAL_DURATION,
            initialX,
            initialY,
            card,
            wrap
        );

        return () => {
            card.removeEventListener("pointerenter", pointerEnterHandler);
            card.removeEventListener("pointermove", pointerMoveHandler);
            card.removeEventListener("pointerleave", pointerLeaveHandler);
            card.removeEventListener("touchstart", pointerEnterHandler);
            card.removeEventListener("touchmove", touchMoveHandler);
            card.removeEventListener("touchend", pointerLeaveHandler);
            window.removeEventListener('deviceorientation', deviceOrientationHandler);
            animationHandlers.cancelAnimation();
        };
    }, [animationHandlers, isMobile, handlePointerMove, handleTouchMove, handlePointerEnter, handlePointerLeave, handleDeviceOrientation]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative min-h-screen flex flex-col items-center justify-center px-4 py-12"
        >
            {/* Back Button (mobile friendly) */}
            <motion.button
                type="button"
                onClick={() => navigate(-1)}
                className="absolute left-4 top-4 sm:left-6 sm:top-6 z-10 flex items-center px-4 py-2 rounded-xl bg-gray-900/80 text-white border border-white/20 shadow-lg backdrop-blur-sm hover:bg-gray-800/90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.97 }}
            >
                <ArrowLeft className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                <span className="font-medium text-sm sm:text-base">Back</span>
            </motion.button>

            {/* 3D Background with Squares */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <Squares
                    speed={1}
                    squareSize={50}
                    direction='diagonal'
                    borderColor='#374151'
                    hoverFillColor='#1f2937'
                />
            </div>

            {/* Holographic Card Wrapper */}
            <div
                ref={wrapRef}
                className="holo-card-wrapper relative w-full max-w-md mx-auto"
                style={{
                    perspective: '1000px',
                    transform: 'translate3d(0, 0, 0.1px)',
                    touchAction: 'none',
                    '--pointer-x': '50%',
                    '--pointer-y': '50%',
                    '--pointer-from-center': '0',
                    '--pointer-from-top': '0.5',
                    '--pointer-from-left': '0.5',
                    '--card-opacity': '0',
                    '--rotate-x': '0deg',
                    '--rotate-y': '0deg',
                    '--background-x': '50%',
                    '--background-y': '50%',
                }}
            >
                {/* Holographic Glow */}
                <div
                    className="absolute inset-0 rounded-3xl transition-all duration-500 opacity-0 blur-xl scale-95"
                    style={{
                        background: `radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),
                            hsla(240,100%,70%,var(--card-opacity)) 4%,
                            hsla(280,80%,70%,calc(var(--card-opacity)*0.8)) 12%,
                            hsla(320,90%,70%,calc(var(--card-opacity)*0.6)) 25%,
                            hsla(240,100%,50%,0) 50%),
                            conic-gradient(from 45deg at 50% 50%, #3b82f6 0%, #8b5cf6 25%, #ec4899 50%, #06b6d4 75%, #3b82f6 100%)`,
                        backgroundSize: '100% 100%',
                    }}
                />

                {/* Main Holographic Card */}
                <motion.div
                    ref={cardRef}
                    className="holo-card relative rounded-3xl transition-transform duration-1000 ease-out border border-white/20"
                    initial={{ y: 50, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    style={{
                        background: `radial-gradient(farthest-side circle at var(--pointer-x) var(--pointer-y),
                            hsla(240,60%,50%,var(--card-opacity)) 4%,
                            hsla(280,40%,40%,calc(var(--card-opacity)*0.7)) 12%,
                            hsla(320,50%,30%,calc(var(--card-opacity)*0.5)) 25%,
                            hsla(240,60%,20%,0) 60%),
                            linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(30,30,50,0.9) 100%)`,
                        backgroundSize: '100% 100%',
                        backgroundBlendMode: 'color-dodge, normal',
                        backdropFilter: 'blur(20px)',
                        boxShadow: `rgba(0, 0, 0, 0.4) calc((var(--pointer-from-left) * 8px) - 4px) calc((var(--pointer-from-top) * 12px) - 6px) 25px -5px`,
                        transform: 'translate3d(0, 0, 0.1px) rotateX(0deg) rotateY(0deg)',
                    }}
                >
                    {/* Inner Premium Black Background */}
                    <div
                        className="absolute inset-[2px] rounded-3xl"
                        style={{
                            background: 'linear-gradient(135deg, rgba(0,0,0,0.95) 0%, rgba(20,20,30,0.9) 50%, rgba(0,0,0,0.95) 100%)',
                            backdropFilter: 'blur(20px)',
                        }}
                    />

                    {/* Holographic Shine Layer */}
                    <div
                        className="absolute inset-0 rounded-3xl overflow-hidden mix-blend-color-dodge opacity-30 transition-all duration-700"
                        style={{
                            background: `repeating-linear-gradient(45deg, 
                                transparent 0%, 
                                rgba(59,130,246,0.1) 2%, 
                                transparent 4%, 
                                rgba(139,92,246,0.1) 6%, 
                                transparent 8%,
                                rgba(236,72,153,0.1) 10%,
                                transparent 12%),
                                radial-gradient(circle at var(--pointer-x) var(--pointer-y), 
                                rgba(255,255,255,0.1) 0%, 
                                transparent 50%)`,
                            backgroundSize: '60px 60px, 100% 100%',
                            transform: 'translate3d(0, 0, 1px)',
                            zIndex: 2,
                        }}
                    />

                    {/* Glare Effect */}
                    <div
                        className="absolute inset-0 rounded-3xl overflow-hidden mix-blend-overlay opacity-20"
                        style={{
                            background: `radial-gradient(farthest-corner circle at var(--pointer-x) var(--pointer-y), 
                                rgba(59,130,246,0.8) 12%, 
                                rgba(139,92,246,0.4) 40%,
                                transparent 70%)`,
                            filter: 'brightness(0.8) contrast(1.2)',
                            transform: 'translate3d(0, 0, 1.1px)',
                            zIndex: 3,
                        }}
                    />

                    {/* Content Layer */}
                    <div
                        className="relative z-10 p-6 sm:p-8"
                        style={{
                            transform: `translate3d(calc(var(--pointer-from-left) * -3px + 1.5px), calc(var(--pointer-from-top) * -3px + 1.5px), 0.1px)`,
                        }}
                    >
                        {/* Header */}
                        <motion.div
                            className="text-center mb-6"
                            initial={{ y: -20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.3 }}
                        >
                            <h2 className="text-xl sm:text-2xl font-bold text-white mb-2">Queue Status</h2>
                            <p className="text-gray-300 text-sm">The Golden Spoon</p>
                        </motion.div>

                        {/* Waiting Number */}
                        <motion.div
                            className="text-center mb-6"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                        >
                            <p className="text-gray-300 mb-2 text-sm">Your Position</p>
                            <motion.div
                                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white/20 relative"
                                animate={{
                                    boxShadow: [
                                        '0 0 20px rgba(59, 130, 246, 0.5)',
                                        '0 0 40px rgba(59, 130, 246, 0.8)',
                                        '0 0 20px rgba(59, 130, 246, 0.5)'
                                    ]
                                }}
                                transition={{ duration: 2, repeat: Infinity }}
                                style={{
                                    background: 'conic-gradient(from 0deg, #3b82f6, #8b5cf6, #ec4899, #06b6d4, #3b82f6)',
                                }}
                            >
                                <div className="w-[calc(100%-8px)] h-[calc(100%-8px)] rounded-full bg-black/80 flex items-center justify-center">
                                    <span className="text-2xl sm:text-3xl font-bold text-white">{waitingNumber || '0'}</span>
                                </div>
                            </motion.div>

                            {/* Waiting Message */}
                            {waitingMessage && (
                                <p className="mt-3 text-sm sm:text-base font-medium text-blue-300">
                                    {waitingMessage}
                                </p>
                            )}
                        </motion.div>

                        {/* Countdown Timer */}
                        <motion.div
                            className="text-center mb-6"
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.6, type: "spring", stiffness: 200 }}
                        >
                            <p className="text-gray-300 mb-3 text-sm">Estimated Wait Time</p>
                            
                            {remainingSeconds > 0 ? (
                                <motion.div
                                    className="bg-black/50 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
                                    style={{
                                        boxShadow: `0 0 30px ${getTimeGlow()}`,
                                    }}
                                >
                                    <div className="flex justify-center items-center space-x-4">
                                        {/* Hours */}
                                        <div className="text-center">
                                            <motion.div
                                                className={`text-2xl sm:text-3xl font-bold ${getTimeColor()} tabular-nums`}
                                                animate={remainingSeconds <= 60 ? { 
                                                    scale: [1, 1.1, 1],
                                                    color: ['#ef4444', '#f59e0b', '#ef4444']
                                                } : {}}
                                                transition={{ duration: 1, repeat: remainingSeconds <= 60 ? Infinity : 0 }}
                                            >
                                                {String(timeFormatted.hours).padStart(2, '0')}
                                            </motion.div>
                                            <p className="text-xs text-gray-400 mt-1">HRS</p>
                                        </div>

                                        <div className={`text-2xl sm:text-3xl font-bold ${getTimeColor()}`}>:</div>

                                        {/* Minutes */}
                                        <div className="text-center">
                                            <motion.div
                                                className={`text-2xl sm:text-3xl font-bold ${getTimeColor()} tabular-nums`}
                                                animate={remainingSeconds <= 60 ? { 
                                                    scale: [1, 1.1, 1],
                                                    color: ['#ef4444', '#f59e0b', '#ef4444']
                                                } : {}}
                                                transition={{ duration: 1, repeat: remainingSeconds <= 60 ? Infinity : 0 }}
                                            >
                                                {String(timeFormatted.minutes).padStart(2, '0')}
                                            </motion.div>
                                            <p className="text-xs text-gray-400 mt-1">MIN</p>
                                        </div>

                                        <div className={`text-2xl sm:text-3xl font-bold ${getTimeColor()}`}>:</div>

                                        {/* Seconds */}
                                        <div className="text-center">
                                            <motion.div
                                                className={`text-2xl sm:text-3xl font-bold ${getTimeColor()} tabular-nums`}
                                                animate={remainingSeconds <= 60 ? { 
                                                    scale: [1, 1.1, 1],
                                                    color: ['#ef4444', '#f59e0b', '#ef4444']
                                                } : {}}
                                                transition={{ duration: 1, repeat: remainingSeconds <= 60 ? Infinity : 0 }}
                                            >
                                                {String(timeFormatted.seconds).padStart(2, '0')}
                                            </motion.div>
                                            <p className="text-xs text-gray-400 mt-1">SEC</p>
                                        </div>
                                    </div>

                                    {/* Time Status Message */}
                                    {remainingSeconds <= 300 && remainingSeconds > 0 && (
                                        <motion.p
                                            className="mt-3 text-sm font-medium text-yellow-400"
                                            animate={{ opacity: [1, 0.5, 1] }}
                                            transition={{ duration: 1, repeat: Infinity }}
                                        >
                                            🔔 Your table is almost ready!
                                        </motion.p>
                                    )}
                                    
                                    {remainingSeconds === 0 && (
                                        <motion.p
                                            className="mt-3 text-sm font-bold text-green-400"
                                            animate={{ scale: [1, 1.1, 1] }}
                                            transition={{ duration: 0.5, repeat: Infinity }}
                                        >
                                            🎉 Your table is ready!
                                        </motion.p>
                                    )}
                                </motion.div>
                            ) : (
                                <div className="bg-green-500/20 backdrop-blur-sm rounded-2xl p-4 border border-green-400/30">
                                    <motion.p
                                        className="text-green-400 font-bold text-lg"
                                        animate={{ scale: [1, 1.1, 1] }}
                                        transition={{ duration: 0.5, repeat: Infinity }}
                                    >
                                        🎉 Your table is ready!
                                    </motion.p>
                                </div>
                            )}
                        </motion.div>

                        {/* Queue Information */}
                        <motion.div
                            className="space-y-3 mb-6"
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center">
                                        <Users className="w-4 h-4 text-purple-400 mr-2" />
                                        <span className="text-white text-sm font-medium">People Ahead</span>
                                    </div>
                                    <span className="text-purple-400 font-semibold text-sm">{peopleAhead}</span>
                                </div>
                            </div>
                        </motion.div>
                        {/* User Information */}
                        {userData && (
                            <motion.div
                                className="space-y-3 mb-6"
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.7 }}
                            >
                                <h4 className="text-white font-semibold mb-3 text-sm">Booking Details</h4>

                                <div className="bg-white/5 backdrop-blur-sm rounded-xl p-3 sm:p-4 border border-white/10 space-y-3">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <User className="w-4 h-4 text-green-400 mr-2" />
                                            <span className="text-gray-300 text-xs sm:text-sm">Name</span>
                                        </div>
                                        <span className="text-white font-medium text-xs sm:text-sm">{userData.Name || 'N/A'}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Phone className="w-4 h-4 text-blue-400 mr-2" />
                                            <span className="text-gray-300 text-xs sm:text-sm">Contact</span>
                                        </div>
                                        <span className="text-white font-medium text-xs sm:text-sm">{userData.Contact || 'N/A'}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Users className="w-4 h-4 text-purple-400 mr-2" />
                                            <span className="text-gray-300 text-xs sm:text-sm">Party Size</span>
                                        </div>
                                        <span className="text-white font-medium text-xs sm:text-sm">{userData.Number_of_People || 'N/A'}</span>
                                    </div>

                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center">
                                            <Utensils className="w-4 h-4 text-orange-400 mr-2" />
                                            <span className="text-gray-300 text-xs sm:text-sm">Table Type</span>
                                        </div>
                                        <span className="text-white font-medium text-xs sm:text-sm">{userData.Table_Type || 'N/A'}</span>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {/* Play While You Wait Button */}
                        <motion.button
                            className="w-full py-3 sm:py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center relative overflow-hidden text-sm sm:text-base"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            initial={{ y: 20, opacity: 0 }}
                            animate={{ y: 0, opacity: 1 }}
                            transition={{ delay: 0.8 }}
                            onClick={onPlayGameClick}
                            style={{ pointerEvents: 'auto' }}
                        >
                            <Star className="w-4 h-4 sm:w-5 sm:h-5 mr-2" />
                            Play While You Wait
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-100%] hover:translate-x-[100%] transition-transform duration-1000" />
                        </motion.button>
                    </div>

                    {/* Achievement Toast */}
                    <motion.div
                        className="absolute -top-3 right-3 sm:-top-4 sm:right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-3 py-1 sm:px-4 sm:py-2 rounded-full text-xs sm:text-sm font-semibold flex items-center z-20"
                        initial={{ opacity: 0, y: -20, scale: 0.8 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ delay: 1.5 }}
                    >
                        <Trophy className="w-3 h-3 sm:w-4 sm:h-4 mr-1" />
                        Spot Secured!
                    </motion.div>
                </motion.div>
            </div>

            {/* Custom Styles */}
            <style>{`
                .holo-card-wrapper:hover,
                .holo-card-wrapper.active {
                    --card-opacity: 1;
                }
                
                .holo-card-wrapper:hover .holo-card,
                .holo-card-wrapper.active .holo-card {
                    transition: none;
                    transform: translate3d(0, 0, 0.1px) rotateX(var(--rotate-y)) rotateY(var(--rotate-x));
                }

                .holo-card-wrapper:hover > div:first-child,
                .holo-card-wrapper.active > div:first-child {
                    filter: blur(30px) opacity(0.8);
                    transform: scale(1.05) translate3d(0, 0, 0.1px);
                    opacity: 1;
                }

                /* Mobile touch feedback */
                @media (max-width: 1024px) {
                    .holo-card {
                        cursor: grab;
                    }
                    
                    .holo-card:active {
                        cursor: grabbing;
                    }
                }

                /* Responsive text sizing */
                @media (max-width: 640px) {
                    .holo-card-wrapper {
                        max-width: calc(100vw - 2rem);
                    }
                }
            `}</style>
        </motion.div>
    );
}
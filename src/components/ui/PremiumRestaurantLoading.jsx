import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Check, Clock, Users, Utensils, Calendar, MapPin } from 'lucide-react';

// Floating Sphere Component (Minimal & Elegant)
function FloatingSphere({ position, color, size = 0.2, speed = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * speed) * 0.2;
      meshRef.current.rotation.y = time * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial
        color={color}
        transparent
        opacity={0.4}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

// Minimal Particle System
function MinimalParticles() {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const temp = [];
    for (let i = 0; i < 30; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 8,
          Math.random() * -10,
          (Math.random() - 0.5) * 3
        ],
        speed: Math.random() * 0.01 + 0.005
      });
    }
    return temp;
  });

  useFrame(() => {
    particles.forEach((particle) => {
      particle.position[1] += particle.speed;
      if (particle.position[1] > 6) {
        particle.position[1] = -10;
      }
    });
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.6}
          />
        </mesh>
      ))}
    </group>
  );
}

// Elegant 3D Scene
function ElegantScene() {
  const groupRef = useRef();

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.y = Math.sin(time * 0.2) * 0.05;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Minimal floating spheres */}
      <FloatingSphere position={[-1.5, 0, -2]} color="#ffffff" size={0.15} speed={0.8} />
      <FloatingSphere position={[1.8, -1, -1.5]} color="#f3f4f6" size={0.12} speed={1.2} />
      <FloatingSphere position={[0, 1.5, -2.5]} color="#e5e7eb" size={0.18} speed={0.6} />

      {/* Minimal particles */}
      <MinimalParticles />

      {/* Soft lighting */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[2, 2, 2]} intensity={0.4} color="#ffffff" />
      <pointLight position={[0, 0, 1]} intensity={0.3} color="#f9fafb" />
    </group>
  );
}

// Status Badge Component (CRED-style)
function StatusBadge({ icon: Icon, title, subtitle, delay = 0, status = "processing" }) {
  const getStatusColor = () => {
    switch (status) {
      case 'completed': return 'border-emerald-500/20 bg-emerald-500/10';
      case 'processing': return 'border-blue-500/20 bg-blue-500/10';
      case 'pending': return 'border-amber-500/20 bg-amber-500/10';
      default: return 'border-gray-500/20 bg-gray-500/10';
    }
  };

  const getIconColor = () => {
    switch (status) {
      case 'completed': return 'text-emerald-400';
      case 'processing': return 'text-blue-400';
      case 'pending': return 'text-amber-400';
      default: return 'text-gray-400';
    }
  };

  return (
    <motion.div
      initial={{ x: -50, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{
        delay,
        duration: 0.6,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className={`flex items-center space-x-4 p-4 rounded-2xl border backdrop-blur-sm ${getStatusColor()}`}
    >
      <motion.div
        className={`p-2 rounded-xl bg-black/20 ${getIconColor()}`}
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ delay: delay + 0.3, type: "spring", stiffness: 200 }}
      >
        <Icon className="w-5 h-5" />
      </motion.div>
      <div className="flex-1">
        <h4 className="text-white font-medium text-sm">{title}</h4>
        <p className="text-gray-400 text-xs">{subtitle}</p>
      </div>
      {status === 'completed' && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: delay + 0.5, type: "spring" }}
          className="w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center"
        >
          <Check className="w-3 h-3 text-white" />
        </motion.div>
      )}
    </motion.div>
  );
}

// Progress Steps Component
function ProgressSteps({ currentStep, delay = 0 }) {
  const steps = [
    { label: "Validating Details", completed: currentStep > 0 },
    { label: "Checking Availability", completed: currentStep > 1 },
    { label: "Securing Table", completed: currentStep > 2 },
    { label: "Confirming Booking", completed: currentStep > 3 }
  ];

  return (
    <motion.div
      initial={{ y: 30, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.8 }}
      className="w-full max-w-md"
    >
      <div className="flex justify-between items-center mb-4">
        <span className="text-gray-400 text-sm">Progress</span>
        <span className="text-white text-sm">{currentStep}/4</span>
      </div>

      <div className="relative">
        {/* Progress Line */}
        <div className="absolute top-4 left-4 right-4 h-0.5 bg-gray-700" />
        <motion.div
          className="absolute top-4 left-4 h-0.5 bg-white"
          initial={{ width: 0 }}
          animate={{ width: `${(currentStep / 4) * 100}%` }}
          transition={{ delay: delay + 0.5, duration: 1.5, ease: "easeOut" }}
        />

        {/* Step Dots */}
        <div className="flex justify-between">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="flex flex-col items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: delay + index * 0.2 }}
            >
              <motion.div
                className={`w-8 h-8 rounded-full border-2 flex items-center justify-center ${step.completed
                  ? 'bg-white border-white'
                  : index === currentStep
                    ? 'bg-white/20 border-white animate-pulse'
                    : 'bg-transparent border-gray-600'
                  }`}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: delay + index * 0.3, type: "spring" }}
              >
                {step.completed && (
                  <Check className="w-4 h-4 text-black" />
                )}
                {index === currentStep && !step.completed && (
                  <div className="w-2 h-2 bg-white rounded-full" />
                )}
              </motion.div>
              <span className={`text-xs mt-2 text-center max-w-16 ${step.completed ? 'text-white' : 'text-gray-500'
                }`}>
                {step.label}
              </span>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}

// Bottom Rise Panel (CRED-style)
function BottomRisePanel() {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{
        duration: 1.2,
        ease: [0.25, 0.1, 0.25, 1]
      }}
      className="absolute inset-0 bg-gradient-to-t from-black via-gray-900/95 to-transparent backdrop-blur-sm pointer-events-none"
    >
      {/* Subtle overlay */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6, duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent"
      />
    </motion.div>
  );
}

// Reservation Summary Component
function ReservationSummary({ delay = 0 }) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.8 }}
      className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4"
    >
      <h3 className="text-white font-medium mb-3 text-sm">Reservation Details</h3>
      <div className="space-y-2 text-xs">
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Restaurant</span>
          <span className="text-white">The Golden Spoon</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Date & Time</span>
          <span className="text-white">Today, 8:00 PM</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Party Size</span>
          <span className="text-white">2 Guests</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400">Table Type</span>
          <span className="text-white">Premium</span>
        </div>
      </div>
    </motion.div>
  );
}

// Main Premium Loading Component
export default function PremiumRestaurantLoading({
  message = "Securing your table...",
  subMessage = "Please wait while we confirm your reservation"
}) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const intervals = [1000, 2000, 3000, 4000];
    const timers = intervals.map((delay, index) =>
      setTimeout(() => setCurrentStep(index + 1), delay)
    );

    return () => timers.forEach(clearTimeout);
  }, []);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-y-auto"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-900" />

      {/* 3D Scene - Fixed background */}
      <div className="fixed inset-0 opacity-40 pointer-events-none">
        <Canvas camera={{ position: [0, 0, 3], fov: 75 }}>
          <ElegantScene />
        </Canvas>
      </div>

      {/* Bottom Rise Panel - Fixed background */}
      <div className="fixed inset-0 pointer-events-none">
        <BottomRisePanel />
      </div>

      {/* Scrollable Content Container */}
      <div className="relative z-10 min-h-screen">
        <div className="flex flex-col items-center justify-center min-h-screen p-6 py-12">

          {/* Center Content */}
          <div className="text-center max-w-md mx-auto mb-8 sm:mb-12">
            {/* Main Loader */}
            <motion.div
              className="mb-6 sm:mb-8"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{
                delay: 1.2,
                duration: 0.8,
                type: "spring",
                stiffness: 100
              }}
            >
              <motion.div
                className="w-16 h-16 sm:w-20 sm:h-20 mx-auto relative"
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
              >
                {/* Outer ring */}
                <div className="absolute inset-0 border-2 border-transparent border-t-white/30 rounded-full" />
                {/* Inner ring */}
                <div className="absolute inset-2 border-2 border-transparent border-b-white/60 rounded-full" />
                {/* Center dot */}
                <motion.div
                  className="absolute inset-6 bg-white rounded-full"
                  animate={{
                    opacity: [0.4, 1, 0.4],
                  }}
                  transition={{ duration: 2, repeat: Infinity }}
                />
              </motion.div>
            </motion.div>

            {/* Loading Text */}
            <motion.h2
              className="text-xl sm:text-2xl font-light text-white mb-2 sm:mb-3"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.5 }}
            >
              {message}
            </motion.h2>

            <motion.p
              className="text-gray-400 text-sm leading-relaxed px-4"
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 1.7 }}
            >
              {subMessage}
            </motion.p>
          </div>

          {/* Progress Steps */}
          <div className="w-full max-w-md mb-6 sm:mb-8 px-4">
            <ProgressSteps currentStep={currentStep} delay={2} />
          </div>

          {/* Reservation Summary */}
          <div className="w-full max-w-md mb-6 sm:mb-8 px-4">
            <ReservationSummary delay={2.5} />
          </div>

          {/* Status Updates */}
          <div className="w-full max-w-md space-y-3 px-4 pb-8">
            <StatusBadge
              icon={Calendar}
              title="Date & Time Verified"
              subtitle="Your preferred slot is available"
              delay={3}
              status={currentStep > 0 ? "completed" : "processing"}
            />
            <StatusBadge
              icon={Users}
              title="Table Allocation"
              subtitle="Perfect table for your party size"
              delay={3.3}
              status={currentStep > 1 ? "completed" : currentStep === 1 ? "processing" : "pending"}
            />
            <StatusBadge
              icon={Utensils}
              title="Premium Experience"
              subtitle="Chef's special menu prepared"
              delay={3.6}
              status={currentStep > 2 ? "completed" : currentStep === 2 ? "processing" : "pending"}
            />
          </div>
        </div>
      </div>

      {/* Subtle bottom glow - Fixed */}
      <motion.div
        className="fixed bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-white/5 to-transparent pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      />
    </motion.div>
  );
}
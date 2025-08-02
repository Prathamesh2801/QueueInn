import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';
import { Star, Trophy, Zap, Crown, Gem, Sparkles } from 'lucide-react';

// Floating Gem Component
function FloatingGem({ position, color, rotationSpeed = 1, floatSpeed = 1 }) {
  const meshRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.x = time * rotationSpeed;
      meshRef.current.rotation.y = time * rotationSpeed * 0.7;
      meshRef.current.position.y = position[1] + Math.sin(time * floatSpeed) * 0.3;
      meshRef.current.position.x = position[0] + Math.sin(time * floatSpeed * 0.8) * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <octahedronGeometry args={[0.3, 0]} />
      <meshStandardMaterial 
        color={color}
        emissive={color}
        emissiveIntensity={0.4}
        transparent
        opacity={0.9}
        metalness={0.8}
        roughness={0.2}
      />
    </mesh>
  );
}

// Energy Orb Component
function EnergyOrb({ position, scale = 1 }) {
  const meshRef = useRef();
  const [intensity, setIntensity] = useState(0.3);
  
  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.y = time * 0.5;
      
      // Pulsing effect
      const pulse = Math.sin(time * 2) * 0.2 + 0.5;
      setIntensity(pulse);
      meshRef.current.scale.setScalar(scale + pulse * 0.2);
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[0.4, 32, 32]} />
      <meshStandardMaterial 
        color="#8b5cf6"
        emissive="#8b5cf6"
        emissiveIntensity={intensity}
        transparent
        opacity={0.7}
      />
    </mesh>
  );
}

// Particle System
function ParticleSystem() {
  const particlesRef = useRef();
  const [particles] = useState(() => {
    const temp = [];
    for (let i = 0; i < 100; i++) {
      temp.push({
        position: [
          (Math.random() - 0.5) * 10,
          Math.random() * -15,
          (Math.random() - 0.5) * 5
        ],
        speed: Math.random() * 0.02 + 0.01,
        size: Math.random() * 0.05 + 0.02
      });
    }
    return temp;
  });

  useFrame(() => {
    if (particlesRef.current) {
      particles.forEach((particle, i) => {
        particle.position[1] += particle.speed;
        if (particle.position[1] > 8) {
          particle.position[1] = -15;
        }
      });
    }
  });

  return (
    <group ref={particlesRef}>
      {particles.map((particle, i) => (
        <mesh key={i} position={particle.position}>
          <sphereGeometry args={[particle.size, 8, 8]} />
          <meshStandardMaterial 
            color="#fbbf24"
            emissive="#fbbf24"
            emissiveIntensity={0.5}
            transparent
            opacity={0.8}
          />
        </mesh>
      ))}
    </group>
  );
}

// 3D Scene Component
function GameScene() {
  const groupRef = useRef();
  
  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1;
    }
  });

  return (
    <group ref={groupRef}>
      {/* Floating Gems */}
      <FloatingGem position={[-2, 1, -2]} color="#ef4444" rotationSpeed={0.8} />
      <FloatingGem position={[2, -1, -1]} color="#10b981" rotationSpeed={1.2} />
      <FloatingGem position={[0, 2, -3]} color="#3b82f6" rotationSpeed={0.6} />
      <FloatingGem position={[-1.5, -0.5, -2]} color="#f59e0b" rotationSpeed={1.5} />
      
      {/* Energy Orbs */}
      <EnergyOrb position={[1.5, 0.5, -1]} scale={0.8} />
      <EnergyOrb position={[-1, -1.5, -2]} scale={1.2} />
      
      {/* Particle System */}
      <ParticleSystem />
      
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.8} color="#ffffff" />
      <pointLight position={[0, 0, 2]} intensity={1.5} color="#8b5cf6" />
      <pointLight position={[-3, 2, 0]} intensity={1} color="#06b6d4" />
    </group>
  );
}

// Achievement Badge Component
function AchievementBadge({ icon: Icon, title, delay = 0, color = "from-purple-500 to-pink-500" }) {
  return (
    <motion.div
      initial={{ x: -100, opacity: 0, scale: 0.8 }}
      animate={{ x: 0, opacity: 1, scale: 1 }}
      transition={{ 
        delay,
        duration: 0.6,
        type: "spring",
        stiffness: 150
      }}
      className={`flex items-center space-x-3 bg-gradient-to-r ${color} p-3 rounded-2xl shadow-lg border border-white/20`}
    >
      <motion.div
        animate={{ rotate: [0, 10, -10, 0] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        <Icon className="w-6 h-6 text-white" />
      </motion.div>
      <span className="text-white font-semibold">{title}</span>
    </motion.div>
  );
}

// Level Progress Bar
function LevelProgress({ level, progress, delay = 0 }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ delay, duration: 0.8 }}
      className="bg-black/30 backdrop-blur-sm rounded-2xl p-4 border border-white/10"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center space-x-2">
          <Crown className="w-5 h-5 text-yellow-400" />
          <span className="text-white font-bold">Level {level}</span>
        </div>
        <span className="text-gray-300 text-sm">{progress}%</span>
      </div>
      
      <div className="w-full bg-gray-700 rounded-full h-3 overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-full relative"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ delay: delay + 0.5, duration: 1.5, ease: "easeOut" }}
        >
          <motion.div
            className="absolute inset-0 bg-white/30"
            animate={{ x: ['-100%', '100%'] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </motion.div>
      </div>
    </motion.div>
  );
}

// Coin Counter Component
function CoinCounter({ count, delay = 0 }) {
  const [displayCount, setDisplayCount] = useState(0);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      const increment = count / 50;
      let current = 0;
      const counter = setInterval(() => {
        current += increment;
        if (current >= count) {
          setDisplayCount(count);
          clearInterval(counter);
        } else {
          setDisplayCount(Math.floor(current));
        }
      }, 30);
    }, delay * 1000);
    
    return () => clearTimeout(timer);
  }, [count, delay]);

  return (
    <motion.div
      initial={{ scale: 0, rotate: 180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{ 
        delay,
        duration: 0.8,
        type: "spring",
        stiffness: 150
      }}
      className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full shadow-lg"
    >
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
      >
        <div className="w-6 h-6 bg-yellow-300 rounded-full flex items-center justify-center text-xs font-bold text-yellow-800">
          $
        </div>
      </motion.div>
      <span className="text-white font-bold">{displayCount.toLocaleString()}</span>
    </motion.div>
  );
}

// Bottom Rise Animation Component
function BottomRisePanel() {
  return (
    <motion.div
      initial={{ y: '100%' }}
      animate={{ y: 0 }}
      transition={{ duration: 1.5, ease: [0.25, 0.1, 0.25, 1] }}
      className="absolute inset-0 bg-gradient-to-t from-slate-900 via-purple-900/90 to-transparent"
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.8, duration: 0.8 }}
        className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent"
      />
    </motion.div>
  );
}

// Floating Icons Component
function FloatingIcons() {
  const icons = [
    { Icon: Star, color: 'text-yellow-400', delay: 0.5 },
    { Icon: Trophy, color: 'text-orange-400', delay: 0.8 },
    { Icon: Gem, color: 'text-purple-400', delay: 1.1 },
    { Icon: Sparkles, color: 'text-blue-400', delay: 1.4 },
    { Icon: Zap, color: 'text-green-400', delay: 1.7 }
  ];

  return (
    <div className="absolute inset-0 pointer-events-none">
      {icons.map(({ Icon, color, delay }, index) => (
        <motion.div
          key={index}
          initial={{ 
            opacity: 0, 
            scale: 0,
            x: Math.random() * window.innerWidth,
            y: window.innerHeight + 50
          }}
          animate={{ 
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            y: -100
          }}
          transition={{
            delay,
            duration: 3,
            ease: "easeOut"
          }}
          className="absolute"
        >
          <Icon className={`w-8 h-8 ${color}`} />
        </motion.div>
      ))}
    </div>
  );
}

// Main Loading Component
export default function GameLoadingScreen({ 
  message = "Loading Epic Experience...",
  subMessage = "Powering up your adventure"
}) {
  const [currentLevel] = useState(Math.floor(Math.random() * 50) + 10);
  const [progress] = useState(Math.floor(Math.random() * 80) + 20);
  const [coins] = useState(Math.floor(Math.random() * 10000) + 5000);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-purple-900 to-indigo-900" />
      
      {/* 3D Scene */}
      <div className="absolute inset-0">
        <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
          <GameScene />
        </Canvas>
      </div>
      
      {/* Bottom Rise Panel */}
      <BottomRisePanel />
      
      {/* Floating Icons */}
      <FloatingIcons />
      
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen p-8">
        
        {/* Top Stats Bar */}
        <motion.div 
          className="absolute top-8 left-8 right-8 flex justify-between items-center"
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 2 }}
        >
          <CoinCounter count={coins} delay={2.2} />
          <div className="flex space-x-4">
            <motion.div
              className="flex items-center space-x-2 bg-black/30 backdrop-blur-sm px-3 py-2 rounded-full"
              whileHover={{ scale: 1.05 }}
            >
              <Star className="w-4 h-4 text-yellow-400" />
              <span className="text-white font-semibold">Pro</span>
            </motion.div>
          </div>
        </motion.div>

        {/* Center Loading */}
        <div className="text-center max-w-md mx-auto mb-8">
          {/* Main Loader */}
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ 
              delay: 1.5,
              duration: 1,
              type: "spring",
              stiffness: 100
            }}
          >
            <motion.div
              className="w-32 h-32 mx-auto relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
            >
              {/* Outer Ring */}
              <div className="absolute inset-0 border-4 border-transparent border-t-purple-400 border-r-pink-400 rounded-full" />
              {/* Middle Ring */}
              <div className="absolute inset-3 border-4 border-transparent border-b-blue-400 border-l-cyan-400 rounded-full" />
              {/* Inner Core */}
              <motion.div 
                className="absolute inset-8 bg-gradient-to-r from-purple-500 via-pink-500 to-blue-500 rounded-full flex items-center justify-center"
                animate={{ 
                  boxShadow: [
                    '0 0 30px rgba(139, 92, 246, 0.5)',
                    '0 0 60px rgba(139, 92, 246, 0.8)',
                    '0 0 30px rgba(139, 92, 246, 0.5)'
                  ]
                }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Zap className="w-8 h-8 text-white" />
              </motion.div>
            </motion.div>
          </motion.div>
          
          {/* Loading Text */}
          <motion.h2
            className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-4"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2 }}
          >
            {message}
          </motion.h2>
          
          <motion.p
            className="text-gray-300 text-lg mb-8"
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 2.3 }}
          >
            {subMessage}
          </motion.p>
        </div>

        {/* Level Progress */}
        <div className="w-full max-w-sm mb-8">
          <LevelProgress level={currentLevel} progress={progress} delay={2.5} />
        </div>

        {/* Achievement Badges */}
        <div className="space-y-3">
          <AchievementBadge 
            icon={Trophy} 
            title="Master Chef Unlocked!" 
            delay={3}
            color="from-yellow-500 to-orange-500"
          />
          <AchievementBadge 
            icon={Star} 
            title="5-Star Rating Achieved!" 
            delay={3.3}
            color="from-blue-500 to-purple-500"
          />
          <AchievementBadge 
            icon={Crown} 
            title="VIP Status Activated!" 
            delay={3.6}
            color="from-purple-500 to-pink-500"
          />
        </div>
      </div>

      {/* Bottom Glow Effect */}
      <motion.div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-purple-600/30 via-pink-600/20 to-transparent"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 1 }}
      />
    </motion.div>
  );
}
import React, { useRef, useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

// Global speed factor
const speedFactor = 3; // Increase for faster animations, e.g., 2 for twice as fast

// Dark Smoke Wave Component
function DarkWave({ position = [0, 0, 0], scale = 1 }) {
  const meshRef = useRef();
  const { viewport } = useThree();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.z = Math.sin(time * 0.3 * speedFactor) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5 * speedFactor) * 0.3;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <planeGeometry args={[viewport.width * 2, 2, 32, 32]} />
      <meshStandardMaterial
        color="#1c1c1c"
        transparent
        opacity={0.8}
        side={THREE.DoubleSide}
        emissive="#353535"
        emissiveIntensity={0.1}
      />
    </mesh>
  );
}

// Floating Geometric Shapes
function FloatingShape({ position, shapeType, delay = 0 }) {
  const meshRef = useRef();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), delay * 1000 / speedFactor);
    return () => clearTimeout(timer);
  }, [delay]);

  useFrame((state) => {
    if (meshRef.current && isVisible) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y = position[1] + Math.sin(time * 2 * speedFactor + delay) * 0.4;
      meshRef.current.rotation.x = time * 0.3 * speedFactor;
      meshRef.current.rotation.y = time * 0.5 * speedFactor;
    }
  });

  if (!isVisible) return null;

  const getShapeGeometry = () => {
    switch (shapeType) {
      case 'cube':
        return <boxGeometry args={[0.5, 0.5, 0.5]} />;
      case 'sphere':
        return <sphereGeometry args={[0.3, 16, 16]} />;
      case 'pyramid':
        return <coneGeometry args={[0.3, 0.6, 4]} />;
      case 'cylinder':
        return <cylinderGeometry args={[0.2, 0.2, 0.5, 8]} />;
      default:
        return <octahedronGeometry args={[0.3]} />;
    }
  };

  return (
    <mesh ref={meshRef} position={position}>
      {getShapeGeometry()}
      <meshStandardMaterial
        color="#353535"
        metalness={0.8}
        roughness={0.2}
        emissive="#06b6d4"
        emissiveIntensity={0.2}
      />
    </mesh>
  );
}

// Dark Particles
function DarkParticle({ position, size = 0.05, speed = 1 }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.position.y += speed * 0.008 * speedFactor;
      meshRef.current.position.x += Math.sin(time * 3 * speedFactor) * 0.001;
      meshRef.current.rotation.x += 0.01 * speedFactor;
      meshRef.current.rotation.y += 0.02 * speedFactor;

      if (meshRef.current.position.y > 5) {
        meshRef.current.position.y = -5;
      }
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial
        color="#1c1c1c"
        transparent
        opacity={0.7}
        emissive="#0891b2"
        emissiveIntensity={0.3}
        metalness={0.9}
        roughness={0.1}
      />
    </mesh>
  );
}

// Dark Scene Component
function DarkScene() {
  const groupRef = useRef();
  const [phase, setPhase] = useState('descending');

  useEffect(() => {
    const timer1 = setTimeout(() => setPhase('floating'), 1000 / speedFactor);
    const timer2 = setTimeout(() => setPhase('ascending'), 2500 / speedFactor);

    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, []);

  useFrame((state) => {
    if (groupRef.current) {
      const time = state.clock.elapsedTime;

      if (phase === 'floating') {
        groupRef.current.position.y = Math.sin(time * 0.5 * speedFactor) * 0.5;
        groupRef.current.rotation.y = time * 0.1 * speedFactor;
      } else if (phase === 'ascending') {
        groupRef.current.position.y = THREE.MathUtils.lerp(
          groupRef.current.position.y,
          2,
          0.02 * speedFactor
        );
      }
    }
  });

  return (
    <group ref={groupRef}>
      <DarkWave position={[0, -2, -2]} scale={1} />
      <DarkWave position={[0, -1, -1]} scale={0.8} />
      <DarkWave position={[0, 0, 0]} scale={0.6} />

      <FloatingShape position={[-2, -1, -1]} shapeType="cube" delay={0.5} />
      <FloatingShape position={[2, -0.5, -2]} shapeType="sphere" delay={1} />
      <FloatingShape position={[0, -2, -1]} shapeType="pyramid" delay={1.5} />
      <FloatingShape position={[-1.5, -0.8, -2]} shapeType="cylinder" delay={2} />
      <FloatingShape position={[1.8, -1.5, -1.5]} shapeType="default" delay={2.5} />

      {[...Array(20)].map((_, i) => (
        <DarkParticle
          key={i}
          position={[
            (Math.random() - 0.5) * 8,
            Math.random() * -10,
            (Math.random() - 0.5) * 4
          ]}
          size={0.03 + Math.random() * 0.08}
          speed={0.3 + Math.random() * 1.2}
        />
      ))}

      <ambientLight intensity={0.2} color="#353535" />
      <directionalLight position={[5, 5, 5]} intensity={0.6} color="#06b6d4" />
      <pointLight position={[0, 10, 0]} intensity={0.8} color="#0891b2" distance={15} />
      <pointLight position={[-5, -5, 5]} intensity={0.4} color="#353535" distance={10} />
    </group>
  );
}

// Animated Text Component
function AnimatedText({ text, delay = 0, className = "" }) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{
        delay,
        duration: 0.8 / speedFactor,
        type: "spring",
        stiffness: 100
      }}
      className={className}
    >
      {text.split(' ').map((word, wordIndex) => (
        <span key={wordIndex} className="inline-block mr-1">
          {word.split('').map((char, charIndex) => (
            <motion.span
              key={charIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                delay: delay + (wordIndex + charIndex * 0.04) / speedFactor,
                duration: 0.3 / speedFactor,
              }}
              className="inline-block"
            >
              {char}
            </motion.span>
          ))}
        </span>
      ))}
    </motion.div>
  );
}

// Dark Progress Wave Component
function DarkProgressWave() {
  return (
    <motion.div
      className="absolute bottom-0 left-0 right-0 h-32 overflow-hidden"
      initial={{ y: 100 }}
      animate={{ y: 0 }}
      transition={{ delay: 0.5 / speedFactor, duration: 1 / speedFactor }}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-gray-800 via-gray-700 to-transparent"
        animate={{
          y: [0, -10, 0],
        }}
        transition={{
          duration: 2 / speedFactor,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          clipPath: "polygon(0% 60%, 15% 65%, 30% 60%, 45% 70%, 60% 65%, 75% 70%, 90% 65%, 100% 60%, 100% 100%, 0% 100%)"
        }}
      />

      <motion.div
        className="absolute inset-0 bg-gradient-to-t from-cyan-600 via-cyan-500 to-transparent opacity-40"
        animate={{
          y: [5, -15, 5],
        }}
        transition={{
          duration: 2.5 / speedFactor,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          clipPath: "polygon(0% 70%, 20% 65%, 40% 75%, 60% 65%, 80% 70%, 100% 65%, 100% 100%, 0% 100%)"
        }}
      />
    </motion.div>
  );
}

// Main Dark Loading Transition Component
export default function LoadingTransition({
  message = "Preparing your culinary journey...",
  subMessage = "Crafting premium experience"
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-b from-black via-gray-900 to-gray-800"
        initial={{ scale: 1.1 }}
        animate={{ scale: 1 }}
        transition={{ duration: 1 / speedFactor }}
      />

      <div className="absolute inset-0">
        <Canvas
          camera={{ position: [0, 0, 5], fov: 75 }}
          style={{ background: 'transparent' }}
        >
          <DarkScene />
        </Canvas>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-8">
        <div className="text-center max-w-md mx-auto">
          <motion.div
            className="mb-8"
            initial={{ scale: 0, rotate: 180 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{
              delay: 0.3 / speedFactor,
              duration: 1 / speedFactor,
              type: "spring",
              stiffness: 100
            }}
          >
            <motion.div
              className="w-20 h-20 mx-auto relative"
              animate={{ rotate: 360 }}
              transition={{ duration: 3 / speedFactor, repeat: Infinity, ease: "linear" }}
            >
              <div className="absolute inset-0 border-4 border-transparent border-t-cyan-400 border-r-teal-400 rounded-full" />
              <div className="absolute inset-2 border-4 border-transparent border-b-gray-500 border-l-gray-400 rounded-full" />
              <motion.div
                className="absolute inset-4 bg-gradient-to-r from-gray-600 to-cyan-500 rounded-full"
                animate={{
                  boxShadow: [
                    '0 0 20px rgba(6, 182, 212, 0.5)',
                    '0 0 40px rgba(8, 145, 178, 0.8)',
                    '0 0 20px rgba(6, 182, 212, 0.5)'
                  ]
                }}
                transition={{ duration: 2 / speedFactor, repeat: Infinity }}
              />
            </motion.div>
          </motion.div>

          <AnimatedText
            text={message}
            delay={0.3 / speedFactor}
            className="text-2xl break-words font-bold text-white mb-4"
          />

          <AnimatedText
            text={subMessage}
            delay={0.8 / speedFactor}
            className="text-gray-300 break-words text-lg"
          />

          <motion.div
            className="mt-8 flex justify-center space-x-4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 / speedFactor }}
          >
            {['◆', '●', '▲', '■', '◇'].map((shape, index) => (
              <motion.span
                key={index}
                className="text-3xl text-cyan-400"
                animate={{
                  y: [0, -15, 0],
                  rotate: [0, 180, 360]
                }}
                transition={{
                  delay: index * 0.2 / speedFactor,
                  duration: 3 / speedFactor,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              >
                {shape}
              </motion.span>
            ))}
          </motion.div>

          <motion.div
            className="flex justify-center space-x-2 mt-8"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 2 / speedFactor }}
          >
            {[...Array(3)].map((_, index) => (
              <motion.div
                key={index}
                className="w-3 h-3 bg-cyan-400 rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.5, 1, 0.5]
                }}
                transition={{
                  delay: index * 0.3 / speedFactor,
                  duration: 1.5 / speedFactor,
                  repeat: Infinity,
                  ease: "easeInOut"
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>

      <DarkProgressWave />

      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 1 / speedFactor }}
      >
        {[...Array(25)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 bg-cyan-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -120],
              opacity: [0, 1, 0],
              scale: [0, 1, 0]
            }}
            transition={{
              delay: Math.random() * 3 / speedFactor,
              duration: 4 / speedFactor,
              repeat: Infinity,
              ease: "easeOut"
            }}
          />
        ))}
      </motion.div>

      <motion.div
        className="absolute inset-0 bg-gradient-radial from-transparent via-black/20 to-black/40 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 / speedFactor, duration: 1.5 / speedFactor }}
      />
    </motion.div>
  );
}

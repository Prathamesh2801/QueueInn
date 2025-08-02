import React, { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { motion } from 'framer-motion';
import { useGSAP } from '@gsap/react';
import gsap from 'gsap';
import * as THREE from 'three';

// 3D Metallic Sphere Component
const MetallicSphere = ({ isHovered, isPressed }) => {
  const meshRef = useRef();
  const materialRef = useRef();
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
      meshRef.current.rotation.y = state.clock.elapsedTime * 0.3;
      
      // Scale based on interaction
      const targetScale = isPressed ? 0.8 : (isHovered ? 1.2 : 1);
      meshRef.current.scale.lerp({ x: targetScale, y: targetScale, z: targetScale }, 0.1);
    }
    
    if (materialRef.current) {
      // Animate metallic properties
      materialRef.current.emissiveIntensity = 0.1 + Math.sin(state.clock.elapsedTime * 2) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <sphereGeometry args={[0.3, 32, 32]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#c0c0c0"
        metalness={0.9}
        roughness={0.1}
        emissive="#06b6d4"
        emissiveIntensity={0.1}
        transparent
        opacity={0.3}
      />
    </mesh>
  );
};

// 3D Background for Button
const Button3DBackground = ({ isHovered, isPressed }) => {
  return (
    <Canvas className="absolute inset-0 pointer-events-none">
      <ambientLight intensity={0.4} />
      <pointLight position={[2, 2, 2]} intensity={0.8} color="#06b6d4" />
      <pointLight position={[-2, -2, 2]} intensity={0.4} color="#0891b2" />
      <MetallicSphere isHovered={isHovered} isPressed={isPressed} />
    </Canvas>
  );
};

// Magic Border Animation Component - Simplified Spinning Gradient
const MagicBorderAnimation = () => {
  return (
    <span className="absolute inset-[-1000%] animate-[spin_2s_linear_infinite] bg-[conic-gradient(from_90deg_at_50%_50%,#06b6d4_0%,#0891b2_25%,#0e7490_50%,#134e4a_75%,#06b6d4_100%)]" />
  );
};

// Metallic Texture Overlay
const MetallicTexture = () => {
  const textureRef = useRef();

  useGSAP(() => {
    if (textureRef.current) {
      gsap.to(textureRef.current, {
        backgroundPosition: '100% 0%',
        duration: 8,
        repeat: -1,
        ease: "none"
      });
    }
  }, []);

  return (
    <div
      ref={textureRef}
      className="absolute inset-0 opacity-20 pointer-events-none"
      style={{
        background: `
          linear-gradient(45deg, 
            transparent 30%, 
            rgba(255,255,255,0.1) 35%, 
            rgba(255,255,255,0.3) 40%, 
            rgba(255,255,255,0.1) 45%, 
            transparent 50%,
            transparent 70%, 
            rgba(255,255,255,0.1) 75%, 
            rgba(255,255,255,0.3) 80%, 
            rgba(255,255,255,0.1) 85%, 
            transparent 90%
          )`,
        backgroundSize: '200% 200%',
        backgroundPosition: '0% 0%'
      }}
    />
  );
};

// Particle Effects
const ParticleEffect = ({ isHovered }) => {
  const containerRef = useRef();

  useGSAP(() => {
    if (containerRef.current && isHovered) {
      const particles = containerRef.current.children;
      
              Array.from(particles).forEach((particle, index) => {
        gsap.to(particle, {
          y: -20 - Math.random() * 20,
          x: (Math.random() - 0.5) * 40,
          opacity: 0,
          scale: 0,
          duration: 1.5,
          delay: index * 0.1,
          ease: "power2.out",
          onComplete: () => {
            gsap.set(particle, { y: 0, x: 0, opacity: 1, scale: 1 });
          }
        });
      });
    }
  }, [isHovered]);

  if (!isHovered) return null;

  return (
    <div ref={containerRef} className="absolute inset-0 pointer-events-none overflow-hidden">
      {[...Array(8)].map((_, i) => (
        <div
          key={i}
          className="absolute w-1 h-1 bg-cyan-400 rounded-full"
          style={{
            left: `${20 + Math.random() * 60}%`,
            top: `${50 + Math.random() * 20}%`,
          }}
        />
      ))}
    </div>
  );
};

// Main Custom Button Component
export default function CustomButton({
  children,
  className = '',
  innerClass = '',
  shadowClass = '',
  ...props
}) {
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);
  const buttonRef = useRef();
  const glowRef = useRef();

  // GSAP animations for premium effects
  useGSAP(() => {
    if (buttonRef.current) {
      // Initial setup
      gsap.set(buttonRef.current, { 
        boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)' 
      });

      // Hover animations
      if (isHovered) {
        gsap.to(buttonRef.current, {
          boxShadow: '0 16px 64px rgba(255, 215, 0, 0.6), inset 0 2px 8px rgba(255, 255, 255, 0.3)',
          duration: 0.3,
          ease: "power2.out"
        });
      } else {
        gsap.to(buttonRef.current, {
          boxShadow: '0 8px 32px rgba(255, 215, 0, 0.3)',
          duration: 0.3,
          ease: "power2.out"
        });
      }
    }

    // Glow effect
    if (glowRef.current) {
      gsap.to(glowRef.current, {
        opacity: isHovered ? 0.6 : 0.3,
        scale: isHovered ? 1.1 : 1,
        duration: 0.3,
        ease: "power2.out"
      });
    }
  }, [isHovered]);

  return (
    <motion.button
      ref={buttonRef}
      className={`
        group relative rounded-xl transition-all duration-300 overflow-hidden
        ${className}
      `}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      {...props}
    >
      {/* 3D Background Canvas */}
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <Button3DBackground isHovered={isHovered} isPressed={isPressed} />
      </div>

      {/* Magic Border Animation */}
      <MagicBorderAnimation isHovered={isHovered} />

      {/* Main Metallic Surface */}
      <motion.span
        className={`
          relative inline-flex h-full w-full cursor-pointer items-center justify-center rounded-xl px-6 py-3 text-lg font-bold uppercase
          transform-gpu transition-all duration-300 ease-out overflow-hidden
          md:px-8 md:py-4 md:text-2xl
          bg-gradient-to-br from-gray-200 via-gray-300 to-gray-400 backdrop-blur-3xl
          ${innerClass}
        `}
        animate={{
          y: isPressed ? 1 : (isHovered ? -1 : 0),
        }}
        transition={{ duration: 0.1 }}
      >
        {/* Metallic Texture Overlay */}
        <MetallicTexture />
        
        {/* Inner Glow - Enhanced for better text visibility */}
        <div className="absolute inset-0 bg-gradient-to-br from-white/50 via-gray-100/30 to-transparent opacity-70 pointer-events-none" />
        
        {/* Text with high contrast metallic effect */}
        <span className="relative z-10 font-extrabold text-gray-900 drop-shadow-[0_2px_4px_rgba(255,255,255,0.8)] tracking-wide">
          <span className="absolute inset-0 bg-gradient-to-b from-white via-gray-200 to-gray-400 bg-clip-text text-transparent">
            {children}
          </span>
          <span className="relative bg-gradient-to-b from-gray-800 via-gray-900 to-black bg-clip-text text-transparent font-black">
            {children}
          </span>
        </span>

        
        
        {/* Particle Effects */}
        <ParticleEffect isHovered={isHovered} />
      </motion.span>
    </motion.button>
  );
}
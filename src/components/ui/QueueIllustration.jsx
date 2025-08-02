"use client"

import { useRef, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { motion } from "framer-motion"
import * as THREE from "three"

// 3D Silhouette Person Component
function SilhouettePerson({ position, isUser, personIndex, queuePosition }) {
  const meshRef = useRef()
  const groupRef = useRef()

  useFrame((state) => {
    if (meshRef.current && groupRef.current) {
      // Breathing animation
      meshRef.current.scale.y = 1 + Math.sin(state.clock.elapsedTime * 2 + personIndex) * 0.02

      // Subtle swaying motion
      groupRef.current.rotation.z = Math.sin(state.clock.elapsedTime * 1.5 + personIndex * 0.5) * 0.05

      // Queue shuffling movement
      groupRef.current.position.x = position[0] + Math.sin(state.clock.elapsedTime * 0.8 + personIndex) * 0.1

      // Periodic step forward
      const stepTime = state.clock.elapsedTime * 0.3 + personIndex * 0.5
      groupRef.current.position.z = position[2] + Math.sin(stepTime) * 0.1
    }
  })

  return (
    <group ref={groupRef} position={position}>
      {/* Person Silhouette */}
      <mesh ref={meshRef} castShadow>
        {/* Body */}
        <capsuleGeometry args={[0.3, 1.2, 4, 8]} />
        <meshLambertMaterial color={isUser ? "#3b82f6" : "#1e293b"} transparent opacity={0.9} />
      </mesh>

      {/* Head */}
      <mesh position={[0, 0.9, 0]} castShadow>
        <sphereGeometry args={[0.25, 8, 8]} />
        <meshLambertMaterial color={isUser ? "#3b82f6" : "#1e293b"} transparent opacity={0.9} />
      </mesh>

      {/* Arms */}
      <mesh position={[-0.4, 0.2, 0]} rotation={[0, 0, 0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
        <meshLambertMaterial color={isUser ? "#3b82f6" : "#1e293b"} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.4, 0.2, 0]} rotation={[0, 0, -0.3]} castShadow>
        <capsuleGeometry args={[0.08, 0.6, 4, 8]} />
        <meshLambertMaterial color={isUser ? "#3b82f6" : "#1e293b"} transparent opacity={0.9} />
      </mesh>

      {/* Legs */}
      <mesh position={[-0.15, -0.8, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
        <meshLambertMaterial color={isUser ? "#3b82f6" : "#1e293b"} transparent opacity={0.9} />
      </mesh>
      <mesh position={[0.15, -0.8, 0]} castShadow>
        <capsuleGeometry args={[0.12, 0.8, 4, 8]} />
        <meshLambertMaterial color={isUser ? "#3b82f6" : "#1e293b"} transparent opacity={0.9} />
      </mesh>

      {/* User Indicator */}
      {isUser && (
        <mesh position={[0, 1.5, 0]}>
          <ringGeometry args={[0.3, 0.4, 16]} />
          <meshBasicMaterial color="#fbbf24" transparent opacity={0.8} />
        </mesh>
      )}

      {/* Position Number */}
      <mesh position={[0, -1.5, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.2, 16]} />
        <meshBasicMaterial color="#ffffff" />
      </mesh>
    </group>
  )
}

// Queue Scene Component
function QueueScene({ waitingNumber }) {
  const sceneRef = useRef()

  // Create queue people positions
  const queuePeople = Array.from({ length: 6 }, (_, index) => ({
    id: index,
    isUser: index === waitingNumber - 1,
    position: [index * 1.2 - 3, 0, 0],
    queuePosition: index + 1,
  }))

  // Camera animation
  useFrame((state) => {
    if (sceneRef.current) {
      // Smooth camera movement
      state.camera.position.x = Math.sin(state.clock.elapsedTime * 0.2) * 2
      state.camera.position.y = 2 + Math.sin(state.clock.elapsedTime * 0.3) * 0.5
      state.camera.lookAt(0, 0, 0)
    }
  })

  return (
    <group ref={sceneRef}>
      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight
        position={[10, 10, 5]}
        intensity={1}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <pointLight position={[-10, -10, -10]} intensity={0.3} color="#3b82f6" />

      {/* Ground */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.8, 0]} receiveShadow>
        <planeGeometry args={[20, 10]} />
        <meshLambertMaterial color="#f1f5f9" transparent opacity={0.8} />
      </mesh>

      {/* Queue Line */}
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -1.75, 0]}>
        <planeGeometry args={[8, 0.1]} />
        <meshBasicMaterial color="#64748b" />
      </mesh>

      {/* Queue People */}
      {queuePeople.map((person, index) => (
        <SilhouettePerson
          key={person.id}
          position={person.position}
          isUser={person.isUser}
          personIndex={index}
          queuePosition={person.queuePosition}
        />
      ))}

      {/* Direction Arrow */}
      <mesh position={[4, 1, 0]} rotation={[0, 0, -Math.PI / 2]}>
        <coneGeometry args={[0.2, 0.6, 8]} />
        <meshBasicMaterial color="#10b981" />
      </mesh>
    </group>
  )
}

export default function QueueIllustration({ waitingNumber }) {
  const [queueProgress, setQueueProgress] = useState(0)

  // Simulate queue progress with useFrame equivalent
  useState(() => {
    const interval = setInterval(() => {
      setQueueProgress((prev) => (prev + 1) % 100)
    }, 100)
    return () => clearInterval(interval)
  }, [])

  return (
    <motion.div
      className="mb-8 h-64 bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-100 rounded-2xl overflow-hidden relative shadow-lg"
      initial={{ scale: 0, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.02 }}
    >
      {/* 3D Queue Scene */}
      <Canvas
        camera={{ position: [0, 2, 8], fov: 50 }}
        shadows
        className="w-full h-full"
        onCreated={({ gl }) => {
          gl.setPixelRatio(Math.min(window.devicePixelRatio, 2))
          gl.shadowMap.enabled = true
          gl.shadowMap.type = THREE.PCFSoftShadowMap
        }}
      >
        <QueueScene waitingNumber={waitingNumber} />
      </Canvas>

      {/* Interactive Overlay */}
      <div className="absolute inset-0 pointer-events-none">
        {/* Queue Status */}
        <motion.div
          className="absolute top-4 left-4 bg-black/20 backdrop-blur-sm rounded-lg px-3 py-2"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="text-white text-xs font-medium">Queue Status</div>
          <div className="text-blue-600 text-sm font-bold">Position #{waitingNumber}</div>
        </motion.div>

        {/* Movement Indicator */}
        <motion.div
          className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center bg-black/20 backdrop-blur-sm rounded-full px-4 py-2"
          animate={{ y: [0, -5, 0] }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          <div className="flex space-x-1 mr-3">
            {[...Array(3)].map((_, i) => (
              <motion.div
                key={i}
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }}
                transition={{
                  duration: 1,
                  repeat: Number.POSITIVE_INFINITY,
                  delay: i * 0.2,
                }}
              />
            ))}
          </div>
          <span className="text-white text-xs font-medium">Moving Forward</span>
        </motion.div>

        {/* Progress Ring */}
        <motion.div
          className="absolute top-4 right-4 w-16 h-16"
          animate={{ rotate: 360 }}
          transition={{ duration: 20, repeat: Number.POSITIVE_INFINITY, ease: "linear" }}
        >
          <svg className="w-full h-full" viewBox="0 0 100 100">
            <circle cx="50" cy="50" r="45" fill="none" stroke="rgba(255,255,255,0.2)" strokeWidth="8" />
            <motion.circle
              cx="50"
              cy="50"
              r="45"
              fill="none"
              stroke="#3b82f6"
              strokeWidth="8"
              strokeLinecap="round"
              strokeDasharray={283}
              initial={{ strokeDashoffset: 283 }}
              animate={{ strokeDashoffset: 283 - (queueProgress / 100) * 283 }}
              transform="rotate(-90 50 50)"
              transition={{ duration: 0.1 }}
            />
          </svg>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-white text-xs font-bold">{Math.round(queueProgress)}%</span>
          </div>
        </motion.div>

        {/* Interactive Hint */}
        <motion.div
          className="absolute bottom-4 right-4 bg-yellow-400/90 text-black px-3 py-1 rounded-full text-xs font-medium"
          animate={{
            scale: [1, 1.1, 1],
            boxShadow: [
              "0 0 0 0 rgba(251, 191, 36, 0.7)",
              "0 0 0 10px rgba(251, 191, 36, 0)",
              "0 0 0 0 rgba(251, 191, 36, 0)",
            ],
          }}
          transition={{ duration: 2, repeat: Number.POSITIVE_INFINITY }}
        >
          3D Interactive Queue
        </motion.div>

        {/* Floating Animation Particles */}
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full opacity-60"
            style={{
              left: `${20 + i * 15}%`,
              top: `${30 + i * 8}%`,
            }}
            animate={{
              y: [-10, -25, -10],
              opacity: [0.3, 0.8, 0.3],
              scale: [0.8, 1.2, 0.8],
            }}
            transition={{
              duration: 3 + i * 0.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: "easeInOut",
              delay: i * 0.4,
            }}
          />
        ))}
      </div>
    </motion.div>
  )
}

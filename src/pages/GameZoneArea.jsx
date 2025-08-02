import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { ArrowLeft, Play, Users, Trophy, Clock, Star, Zap } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// 3D Game Icon Components
function TicTacToeIcon({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.y = Math.sin(time) * 0.1;
      meshRef.current.position.y = position[1] + Math.sin(time * 2) * 0.05;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Grid lines */}
      <mesh position={[0, 0.1, 0]}>
        <boxGeometry args={[1.2, 0.02, 0.02]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0, -0.1, 0]}>
        <boxGeometry args={[1.2, 0.02, 0.02]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={[0.02, 1.2, 0.02]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.02, 1.2, 0.02]} />
        <meshStandardMaterial color="#3b82f6" />
      </mesh>
      {/* X and O */}
      <mesh position={[-0.4, 0.4, 0.01]}>
        <torusGeometry args={[0.1, 0.02, 8, 16]} />
        <meshStandardMaterial color="#ef4444" />
      </mesh>
      <mesh position={[0.4, -0.4, 0.01]} rotation={[0, 0, Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.02, 0.02]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
      <mesh position={[0.4, -0.4, 0.01]} rotation={[0, 0, -Math.PI / 4]}>
        <boxGeometry args={[0.2, 0.02, 0.02]} />
        <meshStandardMaterial color="#10b981" />
      </mesh>
    </group>
  );
}

function MemoryCardIcon({ position }) {
  const meshRef = useRef();
  const cardsRef = useRef([]);

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.y = Math.sin(time * 0.8) * 0.15;

      cardsRef.current.forEach((card, index) => {
        if (card) {
          card.rotation.z = Math.sin(time + index) * 0.1;
        }
      });
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Memory cards */}
      {[...Array(4)].map((_, index) => (
        <mesh
          key={index}
          ref={(el) => cardsRef.current[index] = el}
          position={[
            (index % 2 - 0.5) * 0.4,
            (Math.floor(index / 2) - 0.5) * 0.4,
            index * 0.02
          ]}
        >
          <boxGeometry args={[0.3, 0.4, 0.02]} />
          <meshStandardMaterial color={index < 2 ? "#f59e0b" : "#8b5cf6"} />
        </mesh>
      ))}
    </group>
  );
}

function TriviaIcon({ position }) {
  const meshRef = useRef();

  useFrame((state) => {
    if (meshRef.current) {
      const time = state.clock.elapsedTime;
      meshRef.current.rotation.y = time * 0.5;
      meshRef.current.position.y = position[1] + Math.sin(time * 1.5) * 0.08;
    }
  });

  return (
    <group ref={meshRef} position={position}>
      {/* Question mark base */}
      <mesh position={[0, 0, 0]}>
        <cylinderGeometry args={[0.4, 0.4, 0.1, 32]} />
        <meshStandardMaterial color="#06b6d4" />
      </mesh>
      {/* Question mark */}
      <mesh position={[0, 0.1, 0.05]}>
        <torusGeometry args={[0.15, 0.03, 8, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.05, 0.05]}>
        <boxGeometry args={[0.06, 0.15, 0.06]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, -0.2, 0.05]}>
        <sphereGeometry args={[0.03, 16, 16]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
    </group>
  );
}

// 3D Scene Component
function GameScene({ activeGame }) {
  return (
    <group>
      <TicTacToeIcon position={[-2, 1, -1]} />
      <MemoryCardIcon position={[2, 0, -1]} />
      <TriviaIcon position={[0, -1, -1]} />

      {/* Ambient particles */}
      {[...Array(15)].map((_, index) => (
        <mesh
          key={index}
          position={[
            (Math.random() - 0.5) * 8,
            (Math.random() - 0.5) * 6,
            (Math.random() - 0.5) * 4
          ]}
        >
          <sphereGeometry args={[0.02, 8, 8]} />
          <meshStandardMaterial
            color="#ffffff"
            transparent
            opacity={0.6}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>
      ))}

      {/* Lighting */}
      <ambientLight intensity={0.4} />
      <directionalLight position={[5, 5, 5]} intensity={0.6} />
      <pointLight position={[0, 0, 2]} intensity={0.8} color="#8b5cf6" />
    </group>
  );
}

// Game Card Component
function GameCard({ game, index, onPlay }) {
  const [isHovered, setIsHovered] = useState(false);

  const cardVariants = {
    hidden: {
      opacity: 0,
      y: 50,
      scale: 0.9
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        delay: index * 0.1,
        duration: 0.6,
        type: "spring",
        stiffness: 100
      }
    },
    hover: {
      y: -5,
      scale: 1.02,
      transition: {
        duration: 0.3,
        type: "spring",
        stiffness: 200
      }
    }
  };

  const getGameIcon = () => {
    switch (game.type) {
      case 'tictactoe':
        return (
          <div className="text-3xl grid grid-cols-3 gap-1 w-12 h-12">
            <div className="w-3 h-3 border border-current rounded-sm flex items-center justify-center text-xs">×</div>
            <div className="w-3 h-3 border border-current rounded-sm flex items-center justify-center text-xs">○</div>
            <div className="w-3 h-3 border border-current rounded-sm"></div>
            <div className="w-3 h-3 border border-current rounded-sm flex items-center justify-center text-xs">○</div>
            <div className="w-3 h-3 border border-current rounded-sm flex items-center justify-center text-xs">×</div>
            <div className="w-3 h-3 border border-current rounded-sm"></div>
            <div className="w-3 h-3 border border-current rounded-sm"></div>
            <div className="w-3 h-3 border border-current rounded-sm flex items-center justify-center text-xs">×</div>
            <div className="w-3 h-3 border border-current rounded-sm flex items-center justify-center text-xs">○</div>
          </div>
        );
      case 'memory':
        return (
          <div className="grid grid-cols-2 gap-1 w-12 h-12">
            <div className="bg-current rounded opacity-80"></div>
            <div className="bg-current rounded opacity-60"></div>
            <div className="bg-current rounded opacity-40"></div>
            <div className="bg-current rounded opacity-90"></div>
          </div>
        );
      case 'trivia':
        return (
          <div className="w-12 h-12 rounded-full border-4 border-current flex items-center justify-center">
            <div className="text-2xl font-bold">?</div>
          </div>
        );
      default:
        return <Play className="w-8 h-8" />;
    }
  };

  return (
    <motion.div
      variants={cardVariants}
      initial="hidden"
      animate="visible"
      whileHover="hover"
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group cursor-pointer"
      onClick={() => onPlay(game)}
    >
      <div className={`
        relative bg-gradient-to-br p-6 rounded-3xl border backdrop-blur-sm
        transition-all duration-300
        ${game.color} 
        ${isHovered ? 'shadow-2xl border-white/30' : 'shadow-lg border-white/10'}
      `}>
        {/* Background Pattern */}
        <div className="absolute inset-0 rounded-3xl opacity-10">
          <div className="absolute top-4 right-4 w-20 h-20 rounded-full bg-white/20"></div>
          <div className="absolute bottom-4 left-4 w-12 h-12 rounded-full bg-white/10"></div>
        </div>

        {/* Content */}
        <div className="relative z-10">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div className="text-white/80">
              {getGameIcon()}
            </div>
            <motion.div
              className="bg-white/20 p-2 rounded-xl"
              whileHover={{ rotate: 90 }}
              transition={{ duration: 0.3 }}
            >
              <Play className="w-4 h-4 text-white" />
            </motion.div>
          </div>

          {/* Game Info */}
          <div className="mb-4">
            <h3 className="text-white text-xl font-bold mb-2">{game.name}</h3>
            <p className="text-white/70 text-sm leading-relaxed">{game.description}</p>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-between text-white/60 text-xs">
            <div className="flex items-center space-x-1">
              <Users className="w-3 h-3" />
              <span>{game.players}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Clock className="w-3 h-3" />
              <span>{game.duration}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Star className="w-3 h-3" />
              <span>{game.rating}</span>
            </div>
          </div>

          {/* Difficulty Badge */}
          <motion.div
            className="absolute -top-2 -right-2 bg-white/90 px-3 py-1 rounded-full"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: index * 0.1 + 0.5 }}
          >
            <span className="text-gray-800 text-xs font-medium">{game.difficulty}</span>
          </motion.div>

          {/* Hover Effect Overlay */}
          <motion.div
            className="absolute inset-0 bg-white/10 rounded-3xl"
            initial={{ opacity: 0 }}
            animate={{ opacity: isHovered ? 1 : 0 }}
            transition={{ duration: 0.3 }}
          />
        </div>
      </div>
    </motion.div>
  );
}

// Main GameZone Component
export default function GameZoneArea() {
  const navigate = useNavigate()

  const [games] = useState([
    {
      id: 1,
      name: "Tic Tac Toe",
      description: "Challenge your friend in a classic game of Tic Tac Toe.",
      type: "tictactoe",
      players: "1-2",
      duration: "2-5 min",
      rating: "4.5",
      difficulty: "Easy",
      color: "from-blue-600 to-blue-800"
    },
    {
      id: 2,
      name: "Memory Match",
      description: "Test your memory skills with a fun matching game.",
      type: "memory",
      players: "1",
      duration: "3-8 min",
      rating: "4.3",
      difficulty: "Medium",
      color: "from-purple-600 to-purple-800"
    },
    {
      id: 3,
      name: "Trivia Quiz",
      description: "Answer trivia questions and earn points.",
      type: "trivia",
      players: "1-4",
      duration: "5-10 min",
      rating: "4.7",
      difficulty: "Hard",
      color: "from-teal-600 to-teal-800"
    },
    {
      id: 4,
      name: "Word Puzzle",
      description: "Solve word puzzles and expand your vocabulary.",
      type: "word",
      players: "1",
      duration: "4-7 min",
      rating: "4.4",
      difficulty: "Medium",
      color: "from-orange-600 to-orange-800"
    },
    {
      id: 5,
      name: "Number Game",
      description: "Challenge your math skills with number puzzles.",
      type: "number",
      players: "1",
      duration: "3-6 min",
      rating: "4.2",
      difficulty: "Easy",
      color: "from-green-600 to-green-800"
    },
    {
      id: 6,
      name: "Strategy Battle",
      description: "Plan your moves in this strategic board game.",
      type: "strategy",
      players: "2-4",
      duration: "10-15 min",
      rating: "4.8",
      difficulty: "Hard",
      color: "from-red-600 to-red-800"
    }
  ]);

  const [activeGame, setActiveGame] = useState(null);

  const handleGamePlay = (game) => {
    setActiveGame(game);
    console.log(`Starting game: ${game.name}`);
    // Here you would navigate to the game or open game modal
  };

  const handleBack = () => {
    console.log("Going back");
    navigate(-1)
    // Here you would handle navigation back
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 relative overflow-hidden">
      {/* 3D Background */}
      <div className="absolute inset-0 opacity-20">
        <Canvas camera={{ position: [0, 0, 4], fov: 75 }}>
          <GameScene activeGame={activeGame} />
        </Canvas>
      </div>

      {/* Header */}
      <motion.div
        className="relative z-10 flex items-center justify-between p-6 pb-4"
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
      >
        <motion.button
          onClick={handleBack}
          className="p-3 bg-white/10 backdrop-blur-sm rounded-2xl border border-white/20 text-white hover:bg-white/20 transition-colors"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <ArrowLeft className="w-6 h-6" />
        </motion.button>

        <motion.div
          className="flex items-center space-x-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Zap className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Games</h1>
            <p className="text-gray-400 text-sm">Choose your adventure</p>
          </div>
        </motion.div>

        <motion.div
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-4 py-2 rounded-full"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Trophy className="w-4 h-4 text-white" />
          <span className="text-white font-semibold text-sm">1,250 pts</span>
        </motion.div>
      </motion.div>

      {/* Games Grid */}
      <div className="relative z-10 px-6 pb-8">
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-7xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          {games.map((game, index) => (
            <GameCard
              key={game.id}
              game={game}
              index={index}
              onPlay={handleGamePlay}
            />
          ))}
        </motion.div>
      </div>

      {/* Bottom Floating Action */}
      <motion.div
        className="fixed bottom-6 right-6 z-20"
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <motion.button
          className="bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-full shadow-2xl text-white"
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          animate={{
            boxShadow: [
              '0 0 20px rgba(168, 85, 247, 0.4)',
              '0 0 40px rgba(168, 85, 247, 0.6)',
              '0 0 20px rgba(168, 85, 247, 0.4)'
            ]
          }}
          transition={{
            boxShadow: { duration: 2, repeat: Infinity }
          }}
        >
          <Play className="w-6 h-6" />
        </motion.button>
      </motion.div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(20)].map((_, index) => (
          <motion.div
            key={index}
            className="absolute w-1 h-1 bg-white rounded-full opacity-60"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              y: [0, -30, 0],
              opacity: [0.6, 1, 0.6],
              scale: [1, 1.5, 1]
            }}
            transition={{
              delay: Math.random() * 5,
              duration: 3 + Math.random() * 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </div>
  );
}
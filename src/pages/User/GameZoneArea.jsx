import React, { useRef, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Canvas, useFrame } from '@react-three/fiber';
import {
  ArrowLeft,
  Play,
  Users,
  Trophy,
  Clock,
  Star,
  Zap,
  MessageCircle,
  GamepadIcon,
  Gift,
  CheckCircle,
  PlayCircle,
  Download,
  Book,
  SquareArrowDownRightIcon
} from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import useQueueSSE from '../../hooks/useQueueSSE';
import { playGame } from '../../api/User/GameAPI';
import { BASE_URL } from '../../../config';
import { ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';

// Game Card Component
const GameCard = ({ game, index, onPlay }) => {
  const getStatusButton = (status) => {
    switch (status) {
      case 'Redeem':
        return {
          text: 'Redeem Now',
          icon: <Gift className="w-4 h-4" />,
          className: 'bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700',
          disabled: false
        };
      case 'Completed':
        return {
          text: 'Completed',
          icon: <CheckCircle className="w-4 h-4" />,
          className: 'bg-gray-500 cursor-not-allowed',
          disabled: true
        };
      case 'Available':
      default:
        return {
          text: 'Play Now',
          icon: <PlayCircle className="w-4 h-4" />,
          className: 'bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700',
          disabled: false
        };
    }
  };

  const statusButton = getStatusButton(game.Status);

  return (
    <motion.div
      className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-6 border border-white/20 hover:bg-white/15 transition-all duration-300 cursor-pointer overflow-hidden"
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1, duration: 0.6 }}
      whileHover={{
        scale: 1.02,
        y: -5,
        boxShadow: "0 20px 40px rgba(0,0,0,0.3)"
      }}
      onClick={() => onPlay(game)}
    >
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-pink-600/10 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Game Icon */}
      <div className="relative z-10 flex items-center justify-center w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg">
        <GamepadIcon className="w-8 h-8 text-white" />
      </div>

      {/* Game Info */}
      <div className="relative z-10 text-center">
        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-purple-200 transition-colors">
          {game.Game_Name}
        </h3>

        {/* Reward Type */}
        <div className="flex items-center justify-center mb-4">
          <div className="bg-gradient-to-r from-yellow-500/20 to-orange-500/20 px-3 py-1 rounded-full border border-yellow-500/30">
            <span className="text-yellow-400 text-sm font-medium flex items-center">
              <Trophy className="w-3 h-3 mr-1" />
              {game.Reward_Type}
            </span>
          </div>
        </div>

        {/* Location */}
        {game.Location && (
          <p className="text-gray-400 text-sm mb-4">📍 {game.Location}</p>
        )}

        {/* Status Message */}
        {game.Message && (
          <p className="text-gray-300 text-xs mb-4 bg-white/5 rounded-lg p-2">
            {game.Message}
          </p>
        )}

        {/* Action Button */}
        <motion.button
          className={`w-full px-4 py-3 rounded-xl text-white font-semibold text-sm flex items-center justify-center space-x-2 transition-all duration-200 ${statusButton.className}`}
          disabled={statusButton.disabled}
          whileHover={statusButton.disabled ? {} : { scale: 1.05 }}
          whileTap={statusButton.disabled ? {} : { scale: 0.95 }}
          onClick={(e) => {
            e.stopPropagation();
            onPlay(game);
          }}
        >
          {statusButton.icon}
          <span>{statusButton.text}</span>
        </motion.button>
      </div>

      {/* Floating particles effect */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(3)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 bg-purple-400 rounded-full opacity-0 group-hover:opacity-60"
            style={{
              left: `${20 + i * 30}%`,
              top: `${20 + i * 20}%`,
            }}
            animate={{
              y: [0, -10, 0],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              delay: i * 0.2,
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
        ))}
      </div>
    </motion.div>
  );
};

// 3D Scene Component
const GameScene = ({ activeGame }) => {
  const meshRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
    }
  });

  return (
    <>
      <ambientLight intensity={0.5} />
      <pointLight position={[10, 10, 10]} />
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[2, 2, 2]} />
        <meshStandardMaterial color={activeGame ? "#8b5cf6" : "#6366f1"} />
      </mesh>
    </>
  );
};

// Main GameZone Component
export default function GameZoneArea() {
  const navigate = useNavigate();
  const location = useLocation();
  const [hasContact, setHasContact] = useState(false);

  // Establish SSE Connection
  // const { waitingNumber, waitingTime, waitingMessage } = useQueueSSE(!!state); // Toggle based on state
  const { waitingNumber, waitingTime, waitingMessage, isConnected } = useQueueSSE(hasContact);

  const [games, setGames] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeGame, setActiveGame] = useState(null);



  useEffect(() => {
    const contact = localStorage.getItem('Contact');
    setHasContact(!!contact); // Converts value to true or false
  }, []);

  // Fetch games data
  useEffect(() => {
    const fetchGames = async () => {
      try {
        setLoading(true);
        const response = await playGame();

        if (response.Status && response.Data) {
          setGames(response.Data);
        } else {
          setError(response.Message || 'Failed to load games');
        }
      } catch (err) {
        console.error('Error fetching games:', err);
        setError('Failed to load games. Please try again.');
      } finally {
        setLoading(false);
      }
    };


    fetchGames();
  }, []);




  const handleGamePlay = (game) => {
    setActiveGame(game);
    console.log(`Action on game: ${game.Game_Name}, Status: ${game.Status}`);

    if (game.Status === 'Redeem') {
      console.log('Navigate to redeem');
      navigate(`/redeem/${game.Transaction_ID}`);
    } else if (game.Status === 'Playable') {
      console.log('Start game');

      const token = localStorage.getItem('Token'); // Retrieve token
      const gameUrl = `${BASE_URL}/games/${game.Game_ID}?token=${encodeURIComponent(token)}`;

      window.open(gameUrl, '_blank');
    }
  };




  const handleBack = () => {
    console.log("Going back");
    navigate(-1);
  };


  const handleLogout = () => {
    navigate(`/startup?Hotel_ID=${localStorage.getItem('Hotel_ID') || ''}`); // Redirect to startup with Hotel_ID
    localStorage.clear();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center">
        <motion.div
          className="bg-white/10 backdrop-blur-md p-8 rounded-2xl border border-white/20"
          animate={{ scale: [1, 1.02, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
        >
          <div className="flex items-center space-x-3">
            <div className="w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-white text-lg">Loading games...</span>
          </div>
        </motion.div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 flex items-center justify-center px-4">
        <motion.div
          className="bg-red-500/10 backdrop-blur-md p-8 rounded-2xl border border-red-500/20 text-center max-w-md"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <div className="w-16 h-16 mx-auto mb-4 bg-red-500/20 rounded-full flex items-center justify-center">
            <Zap className="w-8 h-8 text-red-400" />
          </div>
          <h3 className="text-white text-xl font-bold mb-2">Oops!</h3>
          <p className="text-red-400 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-2 rounded-lg text-white font-medium hover:from-red-600 hover:to-red-700 transition-all"
          >
            Retry
          </button>
        </motion.div>
      </div>
    );
  }

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
        className="relative z-10 flex items-center justify-between p-4 sm:p-6 pb-4"
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
          <ArrowLeft className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>

        <motion.div
          className="flex items-center space-x-3"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, type: "spring" }}
        >
          <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl">
            <Zap className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
          </div>
          <div className="hidden sm:block">
            <h1 className="text-xl sm:text-2xl font-bold text-white">Games</h1>
            <p className="text-gray-400 text-sm">Choose your adventure</p>
          </div>
        </motion.div>
        <motion.button
          onClick={() => navigate("/history")}
          className="flex items-center space-x-2 bg-gradient-to-r from-yellow-500 to-orange-500 px-3 sm:px-4 py-2 rounded-full shadow-md hover:shadow-lg 
             text-white focus:outline-none focus:ring-2 focus:ring-yellow-400 focus:ring-offset-2 focus:ring-offset-black
             transition-all duration-200"
          initial={{ x: 50, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.4 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <Book className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
          <span className="text-white font-semibold text-xs sm:text-sm">History</span>
        </motion.button>

      </motion.div>

      {/* Waiting Info Bar */}
      {hasContact && isConnected && <motion.div
        className="relative z-10 my-4 sm:my-6 grid grid-cols-1 lg:grid-cols-3 gap-3 sm:gap-4 max-w-7xl xl:mx-auto mx-4 sm:mx-10"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
      >
        <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl flex items-center justify-between border border-white/20">
          <div className="flex items-center">
            <Clock className="w-4 h-4 sm:w-5 sm:h-5 text-blue-400 mr-2" />
            <span className="text-white text-xs sm:text-sm font-medium">Wait Time</span>
          </div>
          <span className="text-blue-400 font-semibold text-xs sm:text-sm">
            {waitingTime ? `${waitingTime}` : "0"}
          </span>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl flex items-center justify-between border border-white/20">
          <div className="flex items-center">
            <Users className="w-4 h-4 sm:w-5 sm:h-5 text-purple-400 mr-2" />
            <span className="text-white text-xs sm:text-sm font-medium">Position</span>
          </div>
          <div className="w-10 h-10 sm:w-12 sm:h-12 flex items-center justify-center rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-purple-400/30 shadow-inner">
            <span className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent drop-shadow-sm">
              {waitingNumber || 0}
            </span>
          </div>
        </div>

        <div className="bg-white/10 backdrop-blur-md p-3 sm:p-4 rounded-xl flex items-center justify-between border border-white/20">
          <div className="flex items-center">
            <MessageCircle className="w-4 h-4 sm:w-5 sm:h-5 text-green-400 mr-2" />
            <span className="text-white text-xs sm:text-sm font-medium">Message</span>
          </div>
          <span className="text-green-300 text-xs font-medium truncate max-w-24 sm:max-w-none">
            {waitingMessage || "No updates yet"}
          </span>
        </div>
      </motion.div>}

      {/* Games Grid */}
      <div className="relative z-10 px-4 sm:px-6 pb-8">
        {games.length === 0 ? (
          <motion.div
            className="text-center py-16"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            <div className="w-24 h-24 mx-auto mb-6 bg-white/10 rounded-2xl flex items-center justify-center">
              <GamepadIcon className="w-12 h-12 text-gray-400" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">No Games Available</h3>
            <p className="text-gray-400">Check back later for new games!</p>
          </motion.div>
        ) : (
          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 max-w-7xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {games.map((game, index) => (
              <GameCard
                key={game.Game_ID}
                game={game}
                index={index}
                onPlay={handleGamePlay}
              />
            ))}
          </motion.div>
        )}
      </div>

      {/* Bottom Floating Action */}
      <motion.div
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-20"
        initial={{ scale: 0, rotate: 180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ delay: 1, type: "spring" }}
      >
        <motion.button
          className="bg-gradient-to-r from-purple-600 to-pink-600 p-3 sm:p-4 rounded-full shadow-2xl text-white"
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
          onClick={handleLogout}
        >
          <ArrowRightOnRectangleIcon className="w-5 h-5 sm:w-6 sm:h-6" />
        </motion.button>
      </motion.div>

      {/* Ambient Particles */}
      <div className="absolute inset-0 pointer-events-none">
        {[...Array(15)].map((_, index) => (
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
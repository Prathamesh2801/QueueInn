import { useEffect, useState } from "react";
import { motion } from 'framer-motion'
import Scene from "../ui/Scene";
import { Canvas } from "@react-three/fiber";
import { Star, Trophy } from "lucide-react";
import QueueIllustration from "../ui/QueueIllustration";
import Squares from "../ui/Squares";

export default function WaitingAreaUI({ waitingNumber, userData, onPlayGameClick }) {
    const [progress, setProgress] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setProgress(prev => Math.min(prev + 1, 70));
        }, 100);

        return () => clearInterval(timer);
    }, []);

    const estimatedWait = 25 + Math.floor(Math.random() * 10);
    const peopleAhead = waitingNumber - 1;


    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative min-h-screen  flex items-center justify-center p-4"
        >
            {/* 3D Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <Squares
                    speed={0.5}
                    squareSize={40}
                    direction='diagonal' // up, down, left, right, diagonal
                    borderColor='#aaa'
                    hoverFillColor='#222'
                />
            </div>

            <motion.div
                className="relative w-full max-w-md mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                initial={{ y: 50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ delay: 0.2 }}
            >
                {/* Header */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <h2 className="text-2xl font-bold text-white mb-2">Waiting</h2>
                </motion.div>

                {/* Character Illustration */}
                {/* <QueueIllustration waitingNumber={5} /> */}

                {/* Waiting Number */}
                <motion.div
                    className="text-center mb-8"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
                >
                    <p className="text-gray-300 mb-2">Waiting Number</p>
                    <motion.div
                        className="w-20 h-20 mx-auto bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center border-4 border-white/20"
                        animate={{
                            boxShadow: [
                                '0 0 20px rgba(59, 130, 246, 0.5)',
                                '0 0 40px rgba(59, 130, 246, 0.8)',
                                '0 0 20px rgba(59, 130, 246, 0.5)'
                            ]
                        }}
                        transition={{ duration: 2, repeat: Infinity }}
                    >
                        <span className="text-3xl font-bold text-white">{waitingNumber}</span>
                    </motion.div>
                </motion.div>

                {/* Status Text */}
                <motion.div
                    className="text-center mb-6"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                >
                    <p className="text-white font-medium">You're in line at The Golden Spoon</p>
                </motion.div>

                {/* Stats */}
                <motion.div
                    className="space-y-4 mb-8"
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.7 }}
                >
                    <div className="bg-white/5 rounded-xl p-4">
                        <h4 className="text-white font-semibold mb-2">Your Waiting Number</h4>
                        <p className="text-gray-300 text-sm">Estimated Wait Time: ~{estimatedWait} minutes</p>
                        <p className="text-gray-300 text-sm">People Ahead of You: {peopleAhead}</p>
                    </div>

                    {/* Progress Bar */}
                    <div className="bg-white/5 rounded-xl p-4">
                        <div className="flex justify-between items-center mb-2">
                            <span className="text-white text-sm font-medium">Progress</span>
                            <span className="text-blue-400 text-sm">{progress}%</span>
                        </div>
                        <div className="w-full bg-gray-700 rounded-full h-2">
                            <motion.div
                                className="bg-gradient-to-r from-blue-500 to-purple-500 h-2 rounded-full"
                                initial={{ width: 0 }}
                                animate={{ width: `${progress}%` }}
                                transition={{ duration: 0.5 }}
                            />
                        </div>
                    </div>
                </motion.div>

                {/* Play While You Wait Button */}
                <motion.button
                    className="w-full py-4 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-xl font-semibold flex items-center justify-center"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    onClick={onPlayGameClick}

                >
                    <Star className="w-5 h-5 mr-2" />
                    Play While You Wait
                </motion.button>

                {/* Achievement Toast */}
                <motion.div
                    className="absolute -top-4 right-4 bg-gradient-to-r from-yellow-500 to-orange-500 text-white px-4 py-2 rounded-full text-sm font-semibold flex items-center"
                    initial={{ opacity: 0, y: -20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: 1.5 }}
                >
                    <Trophy className="w-4 h-4 mr-1" />
                    Spot Secured!
                </motion.div>
            </motion.div>
        </motion.div>
    );
}

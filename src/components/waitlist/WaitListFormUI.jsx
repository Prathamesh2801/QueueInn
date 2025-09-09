import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from 'framer-motion'

import { Phone, User, Users, Zap } from "lucide-react";
import Particles from "../ui/Particles";


export default function WaitListFormUI({ onSubmit, isSubmitting }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        partySize: ''
    });

    const [errors, setErrors] = useState({});
    const [focusedField, setFocusedField] = useState(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        if (!formData.name.trim()) newErrors.name = 'Name is required';
        if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
        if (!formData.partySize) newErrors.partySize = 'Party size is required';

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(formData);
        }
    };

    const inputVariants = {
        focus: { scale: 1.02, boxShadow: '0 0 20px rgba(59, 130, 246, 0.3)' },
        blur: { scale: 1, boxShadow: '0 0 0px rgba(59, 130, 246, 0)' }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -50 }}
            className="relative min-h-screen flex flex-col items-center justify-center p-4"
        >
            {/* 3D Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                <Particles
                    particleColors={['#ffffff', '#ffffff']}
                    particleCount={400}
                    particleSpread={15}
                    speed={0.2}
                    particleBaseSize={150}
                    moveParticlesOnHover={true}
                    alphaParticles={false}
                    disableRotation={false}
                />
            </div>

            {/* Main Form Container */}
            <motion.div
                className="relative w-full max-w-lg mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-8 border border-white/10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
                {/* Back Button (mobile friendly) */}
                <motion.button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="absolute left-4 top-4 sm:left-6 sm:top-6 z-10 flex items-center px-4 py-2 rounded-xl bg-gray-900/70 text-white border border-white/10 shadow-lg backdrop-blur-sm hover:bg-gray-800/90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <ArrowLeft className="w-5 h-5 mr-2" />
                    <span className="font-medium text-base sm:text-lg">Back</span>
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
                            className="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Users className="w-10 h-10 text-white" />
                        </motion.div>
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-2">Join Waitlist</h2>
                    <p className="text-gray-300">Enter your details to secure your spot</p>
                </motion.div>

                {/* Illustration */}
                {/* <motion.div
                    className="mb-8 h-32 bg-gradient-to-r from-amber-100 to-orange-100 rounded-2xl flex items-center justify-center overflow-hidden"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: 0.4, type: "spring" }}
                >
                    <motion.div
                        className="flex space-x-2"
                        initial={{ x: -100 }}
                        animate={{ x: 0 }}
                        transition={{ delay: 0.6, duration: 0.8 }}
                    >
                        {[...Array(8)].map((_, i) => (
                            <motion.div
                                key={i}
                                className={`w-8 h-12 rounded-full ${i < 3 ? 'bg-blue-600' : i < 5 ? 'bg-green-600' : 'bg-gray-400'
                                    }`}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: 0.7 + i * 0.1 }}
                            />
                        ))}
                    </motion.div>
                </motion.div> */}

                {/* Form */}
                <div className="space-y-6">
                    {/* Name Field */}
                    <motion.div
                        className="relative"
                        variants={inputVariants}
                        animate={focusedField === 'name' ? 'focus' : 'blur'}
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <User className="inline w-4 h-4 mr-2" />
                            Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            onFocus={() => setFocusedField('name')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                            placeholder="Enter your name"
                        />
                        {errors.name && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.name}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Phone Field */}
                    <motion.div
                        className="relative"
                        variants={inputVariants}
                        animate={focusedField === 'phone' ? 'focus' : 'blur'}
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Phone className="inline w-4 h-4 mr-2" />
                            Phone Number
                        </label>
                        <input
                            maxLength={13}
                            type="tel"
                            value={formData.phone}
                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                            onFocus={() => setFocusedField('phone')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                            placeholder="Enter your phone number"
                        />
                        {errors.phone && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.phone}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Party Size Field */}
                    <motion.div
                        className="relative"
                        variants={inputVariants}
                        animate={focusedField === 'partySize' ? 'focus' : 'blur'}
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Users className="inline w-4 h-4 mr-2" />
                            Number of People
                        </label>
                        <select
                            value={formData.partySize}
                            onChange={(e) => setFormData({ ...formData, partySize: e.target.value })}
                            onFocus={() => setFocusedField('partySize')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-300"
                        >
                            <option value="" className="bg-slate-800">Select party size</option>
                            {[1, 2, 3, 4, 5, 6, 7, 8].map(num => (
                                <option key={num} value={num} className="bg-slate-800">{num} {num === 1 ? 'Person' : 'People'}</option>
                            ))}
                        </select>
                        {errors.partySize && (
                            <motion.p
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.partySize}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="button"
                        disabled={isSubmitting}
                        onClick={handleSubmit}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-lg disabled:opacity-50 disabled:cursor-not-allowed"
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: 0.8 }}
                    >
                        {isSubmitting ? (
                            <motion.div
                                className="flex items-center justify-center"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.div
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-2"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                Joining Waitlist...
                            </motion.div>
                        ) : (
                            <span className="flex tracking-widest items-center justify-center">
                                <Zap className="w-5 h-5 mr-2" />
                                Get Waiting Number
                            </span>
                        )}
                    </motion.button>
                </div>
            </motion.div>
        </motion.div>
    );
}
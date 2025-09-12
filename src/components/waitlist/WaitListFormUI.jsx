import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { motion } from 'framer-motion'

import { Phone, User, Users, Zap, MapPin, UserCircle } from "lucide-react";
import Particles from "../ui/Particles";

export default function WaitListFormUI({ onSubmit, isSubmitting }) {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        Name: '',
        Contact: '',
        Table_Type: '',
        Number_of_People: '',
        Gender: ''
    });

    const [errors, setErrors] = useState({});
    const [focusedField, setFocusedField] = useState(null);

    // Pre-fill form with localStorage data
    useEffect(() => {
        const savedData = {
            Name: localStorage.getItem("Name") || '',
            Contact: localStorage.getItem("Contact") || '',
            Table_Type: localStorage.getItem("Table_Type") || '',
            Number_of_People: localStorage.getItem("Number_of_People") || '',
            Gender: localStorage.getItem("Gender") || ''
        };
        setFormData(savedData);
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const newErrors = {};

        // Validation
        if (!formData.Name.trim()) newErrors.Name = 'Name is required';
        if (!formData.Contact.trim()) {
            newErrors.Contact = 'Contact number is required';
        } else if (formData.Contact.length !== 10) {
            newErrors.Contact = 'Contact number must be 10 digits';
        } else if (!/^\d{10}$/.test(formData.Contact)) {
            newErrors.Contact = 'Contact number must contain only digits';
        }
        if (!formData.Table_Type) newErrors.Table_Type = 'Table type is required';
        if (!formData.Number_of_People) newErrors.Number_of_People = 'Number of people is required';
        if (!formData.Gender) newErrors.Gender = 'Gender is required';

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSubmit(formData);
        }
    };

    const handleContactChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value.length <= 10) {
            setFormData({ ...formData, Contact: value });
        }
    };

    const handleNumberOfPeopleChange = (e) => {
        const value = e.target.value.replace(/\D/g, ''); // Only allow digits
        if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 20)) {
            setFormData({ ...formData, Number_of_People: value });
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
                className="relative w-full max-w-lg mx-auto bg-black/40 backdrop-blur-xl rounded-3xl p-6 sm:p-8 border border-white/10"
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
            >
                {/* Back Button */}
                <motion.button
                    type="button"
                    onClick={() => navigate(-1)}
                    className="absolute left-4 top-4 sm:left-6 sm:top-6 z-10 flex items-center px-3 py-2 rounded-xl bg-gray-900/70 text-white border border-white/10 shadow-lg backdrop-blur-sm hover:bg-gray-800/90 transition-all focus:outline-none focus:ring-2 focus:ring-blue-500"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.97 }}
                >
                    <ArrowLeft className="w-4 h-4 mr-1 sm:mr-2" />
                    <span className="font-medium text-sm sm:text-base">Back</span>
                </motion.button>

                {/* Header */}
                <motion.div
                    className="text-center mb-6 sm:mb-8 mt-8 sm:mt-0"
                    initial={{ y: -20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                >
                    <div className="flex justify-center mb-4">
                        <motion.div
                            className="w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center"
                            whileHover={{ rotate: 360 }}
                            transition={{ duration: 0.6 }}
                        >
                            <Users className="w-8 h-8 sm:w-10 sm:h-10 text-white" />
                        </motion.div>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-white mb-2">Join Waitlist</h2>
                    <p className="text-gray-300 text-sm sm:text-base">Enter your details to secure your spot</p>
                </motion.div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
                    {/* Name Field */}
                    <motion.div
                        className="relative"
                        variants={inputVariants}
                        animate={focusedField === 'Name' ? 'focus' : 'blur'}
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <User className="inline w-4 h-4 mr-2" />
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.Name}
                            onChange={(e) => setFormData({ ...formData, Name: e.target.value })}
                            onFocus={() => setFocusedField('Name')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                            placeholder="Enter your full name"
                            disabled={isSubmitting}
                        />
                        {errors.Name && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.Name}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Contact Field */}
                    <motion.div
                        className="relative"
                        variants={inputVariants}
                        animate={focusedField === 'Contact' ? 'focus' : 'blur'}
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Phone className="inline w-4 h-4 mr-2" />
                            Contact Number
                        </label>
                        <input
                            type="tel"
                            value={formData.Contact}
                            onChange={handleContactChange}
                            onFocus={() => setFocusedField('Contact')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                            placeholder="Enter 10-digit contact number"
                            maxLength={10}
                            disabled={isSubmitting}
                        />
                        <div className="flex justify-between items-center mt-1">
                            <p className="text-gray-500 text-xs">{formData.Contact.length}/10 digits</p>
                            {formData.Contact.length === 10 && (
                                <motion.span 
                                    initial={{ opacity: 0, scale: 0 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="text-green-400 text-xs"
                                >
                                    ✓ Valid
                                </motion.span>
                            )}
                        </div>
                        {errors.Contact && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.Contact}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Table Type Field */}
                    <motion.div
                        className="relative"
                        variants={inputVariants}
                        animate={focusedField === 'Table_Type' ? 'focus' : 'blur'}
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <MapPin className="inline w-4 h-4 mr-2" />
                            Table Preference
                        </label>
                        <select
                            value={formData.Table_Type}
                            onChange={(e) => setFormData({ ...formData, Table_Type: e.target.value })}
                            onFocus={() => setFocusedField('Table_Type')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-300 cursor-pointer"
                            disabled={isSubmitting}
                        >
                            <option value="" className="bg-slate-800 text-gray-300">Select table preference</option>
                            <option value="AC" className="bg-slate-800 text-white">🌡️ AC (Air Conditioned)</option>
                            <option value="NON-AC" className="bg-slate-800 text-white">🌿 NON-AC (Natural Ambiance)</option>
                        </select>
                        {errors.Table_Type && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.Table_Type}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Number of People Field */}
                    <motion.div
                        className="relative"
                        variants={inputVariants}
                        animate={focusedField === 'Number_of_People' ? 'focus' : 'blur'}
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <Users className="inline w-4 h-4 mr-2" />
                            Party Size
                        </label>
                        <input
                            type="number"
                            value={formData.Number_of_People}
                            onChange={handleNumberOfPeopleChange}
                            onFocus={() => setFocusedField('Number_of_People')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-all duration-300"
                            placeholder="Enter number of people (1-20)"
                            min="1"
                            max="20"
                            disabled={isSubmitting}
                        />
                        {errors.Number_of_People && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.Number_of_People}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Gender Field */}
                    <motion.div
                        className="relative"
                        variants={inputVariants}
                        animate={focusedField === 'Gender' ? 'focus' : 'blur'}
                    >
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                            <UserCircle className="inline w-4 h-4 mr-2" />
                            Gender
                        </label>
                        <select
                            value={formData.Gender}
                            onChange={(e) => setFormData({ ...formData, Gender: e.target.value })}
                            onFocus={() => setFocusedField('Gender')}
                            onBlur={() => setFocusedField(null)}
                            className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-xl text-white focus:border-blue-500 focus:outline-none transition-all duration-300 cursor-pointer"
                            disabled={isSubmitting}
                        >
                            <option value="" className="bg-slate-800 text-gray-300">Select gender</option>
                            <option value="MALE" className="bg-slate-800 text-white">👨 Male</option>
                            <option value="FEMALE" className="bg-slate-800 text-white">👩 Female</option>
                            <option value="OTHER" className="bg-slate-800 text-white">🏳️‍⚧️ Other</option>
                        </select>
                        {errors.Gender && (
                            <motion.p
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="text-red-400 text-sm mt-1"
                            >
                                {errors.Gender}
                            </motion.p>
                        )}
                    </motion.div>

                    {/* Submit Button */}
                    <motion.button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-xl font-semibold text-base sm:text-lg disabled:opacity-50 disabled:cursor-not-allowed hover:from-blue-700 hover:to-purple-700 transition-all duration-300 shadow-lg"
                        whileHover={{ scale: isSubmitting ? 1 : 1.02 }}
                        whileTap={{ scale: isSubmitting ? 1 : 0.98 }}
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
                                    className="w-5 h-5 border-2 border-white border-t-transparent rounded-full mr-3"
                                    animate={{ rotate: 360 }}
                                    transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
                                />
                                Sending OTP...
                            </motion.div>
                        ) : (
                            <span className="flex tracking-wide items-center justify-center">
                                <Zap className="w-5 h-5 mr-2" />
                                Join Waitlist
                            </span>
                        )}
                    </motion.button>
                </form>

                {/* Additional Info */}
                <motion.div
                    className="mt-6 p-3 bg-blue-500/10 border border-blue-500/20 rounded-xl"
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 1 }}
                >
                    <p className="text-gray-300 text-xs text-center leading-relaxed">
                        🔒 Your information is secure and will only be used for waitlist management. 
                        You'll receive an OTP to verify your contact number.
                    </p>
                </motion.div>
            </motion.div>
        </motion.div>
    );
}
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";

export default function MainNavigation() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navItems = [
    "Why Queues Hurt",
    "How It Works",
    "For Your Team",
    "Book a Demo",
  ];

  return (
    <>
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="fixed top-0 left-0 right-0 z-50 bg-[#FFF9ED]/95 backdrop-blur-sm border-b border-[#2E2E2E]/10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 sm:h-20">
            {/* Logo */}
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="text-xl sm:text-2xl bungee-regular font-bold text-[#2E2E2E] relative z-[60]"
            >
              Khaate Khelte
            </motion.div>

            {/* Desktop Navigation */}
            <div className="hidden lg:flex items-center space-x-1">
              {navItems.map((item) => (
                <motion.button
                  key={item}
                  whileHover={{ y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  className="px-4 py-2 text-sm text-[#2E2E2E]/90 hover:text-[#6A4CAB] transition-colors"
                >
                  {item}
                </motion.button>
              ))}
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 text-[#2E2E2E] relative z-[60]"
              aria-label="Toggle menu"
            >
              <div className="w-6 h-5 flex flex-col justify-between">
                <motion.span
                  animate={{
                    rotate: mobileMenuOpen ? 45 : 0,
                    y: mobileMenuOpen ? 8 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full h-0.5 bg-[#2E2E2E] origin-center"
                />
                <motion.span
                  animate={{
                    opacity: mobileMenuOpen ? 0 : 1,
                  }}
                  transition={{ duration: 0.2 }}
                  className="w-full h-0.5 bg-[#2E2E2E]"
                />
                <motion.span
                  animate={{
                    rotate: mobileMenuOpen ? -45 : 0,
                    y: mobileMenuOpen ? -8 : 0,
                  }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="w-full h-0.5 bg-[#2E2E2E] origin-center"
                />
              </div>
            </button>
          </div>
        </div>
      </motion.nav>

      {/* Full-Screen Mobile Menu Overlay */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="fixed inset-0 bg-[#2E2E2E]/30 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setMobileMenuOpen(false)}
            />

            {/* Sliding Menu Panel - Full Screen */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{
                type: "spring",
                duration: 0.35,
                ease: "easeInOut",
              }}
              className="fixed top-0 right-0 bottom-0 w-full bg-[#FFF9ED] z-50 shadow-2xl lg:hidden overflow-y-auto"
            >
              <div className="flex flex-col min-h-full">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-6 border-b border-[#2E2E2E]/10">
                  <motion.h2
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.2, duration: 0.4 }}
                    className="text-xl font-bold text-[#2E2E2E] bungee-regular"
                  >
                    Menu
                  </motion.h2>
                  <motion.button
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.2, duration: 0.3 }}
                    whileHover={{ scale: 1.1, rotate: 90 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setMobileMenuOpen(false)}
                    className="p-2 rounded-full hover:bg-[#6A4CAB]/10 transition-colors"
                    aria-label="Close menu"
                  >
                    <X className="w-6 h-6 text-[#2E2E2E]" />
                  </motion.button>
                </div>

                {/* Navigation Items */}
                <nav className="flex-1 px-6 py-12 flex flex-col poppins-regular items-center justify-center gap-6">
                  {navItems.map((item, index) => (
                    <motion.button
                      key={item}
                      initial={{ opacity: 0, x: 50 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{
                        delay: 0.1 + index * 0.08,
                        duration: 0.5,
                        type: "spring",
                        stiffness: 260,
                        damping: 20,
                      }}
                      whileHover={{
                        x: 8,
                        backgroundColor: "rgba(106, 76, 171, 0.08)",
                      }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setMobileMenuOpen(false)}
                      className="w-full max-w-xs mx-auto text-center px-6 py-4 text-xl font-semibold 
           text-[#2E2E2E]/80 hover:text-[#6A4CAB] rounded-2xl transition-all 
           relative group"
                    >
                      {/* Animated accent bar */}
                      <motion.div
                        initial={{ scaleX: 0 }}
                        whileHover={{ scaleX: 1 }}
                        transition={{ duration: 0.3 }}
                        className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-[#6A4CAB] to-[#5EBC67] origin-left rounded-r-full"
                      />
                      <span className="relative z-10 block">{item}</span>
                    </motion.button>
                  ))}
                </nav>

                {/* Footer */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.4 }}
                  className="px-6 py-8 border-t border-[#2E2E2E]/10 space-y-6"
                >
                  {/* CTA Button */}
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full bg-[#6A4CAB] text-white px-8 py-4 rounded-full text-lg font-semibold shadow-lg hover:bg-[#5A3C9B] transition-colors"
                  >
                    Get Started
                  </motion.button>

                  {/* Trust Badges */}
                  <div className="flex items-center justify-center space-x-4 text-xs text-[#2E2E2E]/50">
                    <span>No app needed</span>
                    <div className="w-1 h-1 rounded-full bg-[#5EBC67]" />
                    <span>Live updates</span>
                    <div className="w-1 h-1 rounded-full bg-[#F2A85C]" />
                    <span>Easy setup</span>
                  </div>
                </motion.div>
              </div>

              {/* Decorative Background Elements */}
              <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <motion.div
                  animate={{
                    scale: [1, 1.2, 1],
                    opacity: [0.03, 0.05, 0.03],
                  }}
                  transition={{
                    duration: 8,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                  className="absolute top-20 right-10 w-64 h-64 bg-[#6A4CAB] rounded-full blur-3xl"
                />
                <motion.div
                  animate={{
                    scale: [1, 1.3, 1],
                    opacity: [0.02, 0.04, 0.02],
                  }}
                  transition={{
                    duration: 10,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 1,
                  }}
                  className="absolute bottom-20 left-10 w-80 h-80 bg-[#5EBC67] rounded-full blur-3xl"
                />
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

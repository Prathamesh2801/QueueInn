import { motion } from 'framer-motion';
import { ChevronDown, Users, Clock, CheckCircle2 } from 'lucide-react';
import HeroVid from '../../../assets/hv1.mp4';


export default function HeroScene1() {
  return (
   
    <div className="min-h-screen bg-[#f6e6c6] overflow-hidden">
   
      
      {/* Hero Content */}
      <div className="pt-24 sm:pt-32 pb-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            
            {/* Left: Text Content */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="space-y-6 sm:space-y-8 text-center lg:text-left"
            >
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl bungee-regular font-bold text-[#2E2E2E] leading-tight"
              >
                From waiting in line<span className="text-[#6A4CAB]">...</span>
                <br />
                <span className="text-[#6A4CAB]">to enjoying your time.</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 }}
                className="text-base sm:text-lg  playwrite-au-qld lg:text-xl text-[#2E2E2E]/90 max-w-2xl mx-auto lg:mx-0"
              >
                Khaate Khelte is a smart queue system for hotels and restaurants. 
                Guests join a digital line, see live wait-time, and relax while your 
                team serves more people with less chaos.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                className="flex justify-center lg:justify-start"
              >
                <motion.button
                  whileHover={{ scale: 1.05, backgroundColor: '#5A3C9B' }}
                  whileTap={{ scale: 0.95 }}
                  className="bg-[#6A4CAB] text-white px-6 sm:px-8 py-3 sm:py-4 rounded-full text-base sm:text-lg font-medium shadow-lg flex items-center space-x-2"
                >
                  <span>Curious how our queue works?</span>
                  <ChevronDown className="w-5 h-5 rotate-[-90deg]" />
                </motion.button>
              </motion.div>

              {/* Trust Indicators */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 1 }}
                className="flex flex-wrap justify-center lg:justify-start gap-4  sm:gap-6 pt-4"
              >
                <div className="flex items-center space-x-2 text-[#2E2E2E]/80 ">
                  <CheckCircle2 className="w-5 h-5 text-[#5EBC67]" />
                  <span className="text-sm sm:text-base">No app needed</span>
                </div>
                <div className="flex items-center space-x-2 text-[#2E2E2E]/80">
                  <Clock className="w-5 h-5 text-[#F2A85C]" />
                  <span className="text-sm sm:text-base">Live updates</span>
                </div>
                <div className="flex items-center space-x-2 text-[#2E2E2E]/80">
                  <Users className="w-5 h-5 text-[#6A4CAB]" />
                  <span className="text-sm sm:text-base">Happy guests</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right: Video */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="relative"
            >
              <div className="relative w-full max-w-lg mx-auto">
                {/* Decorative background glow */}
                <motion.div
                  animate={{ 
                    scale: [1, 1.05, 1],
                    opacity: [0.3, 0.5, 0.3]
                  }}
                  transition={{ 
                    duration: 6,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute inset-0 bg-gradient-to-br from-[#6A4CAB]/20 to-[#5EBC67]/20 rounded-3xl blur-3xl -z-10"
                />

                {/* Video Container */}
                <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-[#2E2E2E]/10">
                  <video
                    src={HeroVid}
                    autoPlay
                    loop
                    muted
                    playsInline
                    className="w-full h-auto"
                  />
                  
                  {/* Subtle overlay gradient for better text contrast if needed */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#2E2E2E]/10 to-transparent pointer-events-none" />
                </div>

                {/* Floating accent elements around video */}
                <motion.div
                  animate={{ 
                    y: [0, -15, 0],
                    rotate: [0, 5, 0]
                  }}
                  transition={{ 
                    duration: 4,
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="absolute -top-4 -right-4 w-16 h-16 bg-[#5EBC67]/20 rounded-full blur-xl"
                />
                <motion.div
                  animate={{ 
                    y: [0, 15, 0],
                    rotate: [0, -5, 0]
                  }}
                  transition={{ 
                    duration: 5,
                    repeat: Infinity,
                    ease: "easeInOut",
                    delay: 0.5
                  }}
                  className="absolute -bottom-4 -left-4 w-20 h-20 bg-[#F2A85C]/20 rounded-full blur-xl"
                />
              </div>
            </motion.div>

          </div>
        </div>
      </div>

      {/* Scroll Hint */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 1.2 }}
        className="flex flex-col items-center pb-8 sm:pb-12"
      >
        <span className="text-sm sm:text-base text-[#2E2E2E]/90 mb-2 oswald-600">See what happens next</span>
        <motion.div
          animate={{ y: [0, 10, 0] }}
          transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <ChevronDown className="w-6 h-6 sm:w-8 sm:h-8 text-[#6A4CAB]" />
        </motion.div>
      </motion.div>
    </div>
  );
}
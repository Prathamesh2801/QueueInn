import { ArrowLeft, ArrowRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";

// items: [{ img, title, desc }]
export const AutomatedSlide = ({
  items,
  autoplay = true,
}) => {
  const [active, setActive] = useState(0);

  const handleNext = () => {
    setActive((prev) => (prev + 1) % items.length);
  };

  const handlePrev = () => {
    setActive((prev) => (prev - 1 + items.length) % items.length);
  };

  const isActive = (index) => index === active;

  useEffect(() => {
    if (autoplay) {
      const interval = setInterval(handleNext, 5000);
      return () => clearInterval(interval);
    }
  }, [autoplay]);

  const randomRotateY = () => Math.floor(Math.random() * 21) - 10;

  return (
    <div className="relative z-0 max-w-sm md:max-w-4xl mx-auto antialiased font-sans px-4 md:px-8 lg:px-12 py-12">
      {/* Title */}
      <h2 className="text-2xl sm:text-3xl mb-10 font-bold text-center bungee-regular text-[#2E2E2E]">
      See How It Works <span className="text-[#6A4CAB]">Behind the</span>  Screens
      </h2>

      {/* Slide Component */}
      <div className="relative grid grid-cols-1 md:grid-cols-2 gap-10 md:gap-24">
        {/* Left: image stack */}
        <div>
          <div className="relative h-64 sm:h-72 md:h-80 w-full">
            <AnimatePresence>
              {items.map((image, index) => (
                <motion.div
                  key={image.img}
                  initial={{
                    opacity: 0,
                    scale: 0.9,
                    rotate: randomRotateY(),
                  }}
                  animate={{
                    opacity: isActive(index) ? 1 : 0.7,
                    scale: isActive(index) ? 1 : 0.95,
                    rotate: isActive(index) ? 0 : randomRotateY(),
                    // 🔑 keep zIndex small so it doesn't go over navbar
                    zIndex: isActive(index) ? 10 : 1,
                    y: isActive(index) ? [0, -40, 0] : 0,
                  }}
                  exit={{
                    opacity: 0,
                    scale: 0.9,
                    rotate: randomRotateY(),
                  }}
                  transition={{
                    duration: 0.4,
                    ease: "easeInOut",
                  }}
                  className="absolute inset-0 origin-bottom"
                >
                  <img
                    src={image.img}
                    alt={image.title}
                    className="h-full w-full rounded-3xl object-cover object-center shadow-[0_18px_45px_rgba(15,23,42,0.18)]"
                    draggable={false}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>

        {/* Right: text */}
        <div className="flex justify-between flex-col py-4">
          <motion.div
            key={active}
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
          >
            <h3 className="text-xl sm:text-2xl poppins-bold font-bold text-[#1F2933]">
              {items[active].title}
            </h3>

            <motion.p className="text-sm sm:text-base poppins-regular text-[#4B5563] mt-4">
              {items[active].desc.split(" ").map((word, index) => (
                <motion.span
                  key={index}
                  initial={{
                    filter: "blur(10px)",
                    opacity: 0,
                    y: 5,
                  }}
                  animate={{
                    filter: "blur(0px)",
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.2,
                    ease: "easeInOut",
                    delay: 0.02 * index,
                  }}
                  className="inline-block"
                >
                  {word}&nbsp;
                </motion.span>
              ))}
            </motion.p>
          </motion.div>

          {/* Controls */}
          <div className="flex gap-4 pt-8 md:pt-0">
            <button
              onClick={handlePrev}
              className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group/button shadow-sm"
            >
              <ArrowLeft className="h-6 w-6 text-[#111827] group-hover/button:rotate-12 transition-transform duration-300" />
            </button>
            <button
              onClick={handleNext}
              className="h-8 w-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group/button shadow-sm"
            >
              <ArrowRight className="h-6 w-6 text-[#111827] group-hover/button:-rotate-12 transition-transform duration-300" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AutomatedSlide;

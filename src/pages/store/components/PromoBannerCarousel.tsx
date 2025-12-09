import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { promoBanners } from "../data";

const PromoBannerCarousel = () => {
  const [currentBanner, setCurrentBanner] = useState(0);

  // Auto-advance banner every 5 seconds
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % promoBanners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % promoBanners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + promoBanners.length) % promoBanners.length);

  return (
    <div className="relative w-full overflow-hidden rounded-2xl sm:rounded-3xl group shadow-2xl shadow-black/30">
      {/* Banner Container - Clean image only */}
      <div className="relative aspect-[2/1] sm:aspect-[3/1] md:aspect-[3.5/1] lg:aspect-[4/1] overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentBanner}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeInOut" }}
            className="absolute inset-0"
          >
            <img
              src={promoBanners[currentBanner].image}
              alt={promoBanners[currentBanner].alt}
              className="w-full h-full object-cover"
            />
            {/* Subtle vignette for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows - Sleek design */}
      <button
        onClick={prevBanner}
        className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 hover:scale-110"
      >
        <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>
      <button
        onClick={nextBanner}
        className="absolute right-3 sm:right-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 hover:scale-110"
      >
        <ChevronRight className="h-5 w-5 sm:h-6 sm:w-6" />
      </button>

      {/* Progress Bar Indicator - Modern style */}
      <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/20">
        <motion.div
          key={currentBanner}
          initial={{ width: "0%" }}
          animate={{ width: "100%" }}
          transition={{ duration: 5, ease: "linear" }}
          className="h-full bg-gradient-to-r from-primary via-blue-400 to-cyan-400"
        />
      </div>

      {/* Dots Indicator - Pill style */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5">
        {promoBanners.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrentBanner(idx)}
            className={`h-1.5 rounded-full transition-all duration-300 ${
              idx === currentBanner
                ? "bg-white w-6"
                : "bg-white/40 w-1.5 hover:bg-white/70"
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default PromoBannerCarousel;

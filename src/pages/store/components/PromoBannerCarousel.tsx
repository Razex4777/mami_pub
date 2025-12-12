import { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { getActiveBanners, type StoreBanner } from "@/supabase";

// Validate URL and determine if it's safe and external
const validateUrl = (url: string | null): { isValid: boolean; isExternal: boolean; href: string } => {
  if (!url) return { isValid: false, isExternal: false, href: '' };
  
  try {
    const parsed = new URL(url, window.location.origin);
    // Only allow http: and https: protocols
    if (parsed.protocol !== 'http:' && parsed.protocol !== 'https:') {
      return { isValid: false, isExternal: false, href: '' };
    }
    const isExternal = parsed.origin !== window.location.origin;
    return { isValid: true, isExternal, href: parsed.href };
  } catch {
    // Invalid URL
    return { isValid: false, isExternal: false, href: '' };
  }
};

const PromoBannerCarousel = () => {
  const [banners, setBanners] = useState<StoreBanner[]>([]);
  const [currentBanner, setCurrentBanner] = useState(0);
  const [loading, setLoading] = useState(true);

  // Fetch banners from Supabase
  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getActiveBanners();
        setBanners(data);
      } catch (error) {
        console.error("Failed to fetch banners:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  // Auto-advance banner every 5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Validate current banner URL
  const currentUrlInfo = useMemo(() => {
    if (banners.length === 0) return { isValid: false, isExternal: false, href: '' };
    return validateUrl(banners[currentBanner].link_url);
  }, [banners, currentBanner]);

  // Don't render anything if no banners or still loading
  if (loading || banners.length === 0) {
    return null;
  }

  const nextBanner = () => setCurrentBanner((prev) => (prev + 1) % banners.length);
  const prevBanner = () => setCurrentBanner((prev) => (prev - 1 + banners.length) % banners.length);

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
            {currentUrlInfo.isValid ? (
              <a 
                href={currentUrlInfo.href}
                target={currentUrlInfo.isExternal ? '_blank' : '_self'}
                rel="noopener noreferrer"
                className="block w-full h-full cursor-pointer"
                aria-label={`Voir ${banners[currentBanner].title || 'la promotion'}`}
              >
                <img
                  src={banners[currentBanner].image_url}
                  alt={banners[currentBanner].alt_text}
                  className="w-full h-full object-cover"
                />
              </a>
            ) : (
              <img
                src={banners[currentBanner].image_url}
                alt={banners[currentBanner].alt_text}
                className="w-full h-full object-cover"
              />
            )}
            {/* Subtle vignette for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent pointer-events-none" />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Navigation Arrows - Only show if multiple banners */}
      {banners.length > 1 && (
        <>
          <button
            onClick={prevBanner}
            aria-label="Bannière précédente"
            className="absolute left-3 sm:left-5 top-1/2 -translate-y-1/2 w-9 h-9 sm:w-11 sm:h-11 rounded-full bg-white/10 backdrop-blur-md border border-white/20 flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all duration-300 hover:bg-white/20 hover:scale-110"
          >
            <ChevronLeft className="h-5 w-5 sm:h-6 sm:w-6" />
          </button>
          <button
            onClick={nextBanner}
            aria-label="Bannière suivante"
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
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 bg-black/30 backdrop-blur-sm rounded-full px-3 py-1.5" role="tablist" aria-label="Sélection de bannière">
            {banners.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentBanner(idx)}
                aria-label={`Aller à la bannière ${idx + 1}`}
                aria-current={idx === currentBanner ? 'true' : undefined}
                role="tab"
                aria-selected={idx === currentBanner}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentBanner
                    ? "bg-white w-6"
                    : "bg-white/40 w-1.5 hover:bg-white/70"
                }`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default PromoBannerCarousel;

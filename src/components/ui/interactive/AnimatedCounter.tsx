import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCounterProps {
  value: string;
  label: string;
  duration?: number;
  className?: string;
  delay?: number;
}

const AnimatedCounter = ({ 
  value, 
  label, 
  duration = 2000,
  className,
  delay = 0
}: AnimatedCounterProps) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const counterRef = useRef<HTMLDivElement>(null);

  // Extract number from value (e.g., "500+" -> 500)
  const numericValue = parseInt(value.replace(/\D/g, '')) || 0;
  const suffix = value.replace(/\d/g, ''); // Extract non-numeric characters

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && !isVisible) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (counterRef.current) {
      observer.observe(counterRef.current);
    }

    return () => {
      if (counterRef.current) {
        observer.unobserve(counterRef.current);
      }
    };
  }, [isVisible]);

  useEffect(() => {
    if (!isVisible) return;

    const startTime = Date.now() + delay;
    const endValue = numericValue;

    const animate = () => {
      const now = Date.now();
      const elapsed = now - startTime;

      if (elapsed < 0) {
        requestAnimationFrame(animate);
        return;
      }

      const progress = Math.min(elapsed / duration, 1);
      // Easing function for smooth animation
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const currentValue = Math.floor(easeOutQuart * endValue);

      setCount(currentValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        setCount(endValue);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, numericValue, duration, delay]);

  return (
    <div 
      ref={counterRef}
      className={cn("text-center", className)}
    >
      <div className="text-4xl sm:text-5xl font-black bg-gradient-to-r from-white via-blue-100 to-white bg-clip-text text-transparent mb-2 animate-gradient">
        {count}{suffix}
      </div>
      <div className="text-sm text-white/90 font-semibold animate-fade-in">
        {label}
      </div>
    </div>
  );
};

export default AnimatedCounter;


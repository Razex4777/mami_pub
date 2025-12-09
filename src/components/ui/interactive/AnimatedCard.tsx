import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AnimatedCardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: "lift" | "glow" | "scale" | "rotate";
  delay?: number;
}

const AnimatedCard = ({ 
  children, 
  className,
  hoverEffect = "lift",
  delay = 0
}: AnimatedCardProps) => {
  const hoverClasses = {
    lift: "hover:-translate-y-2 hover:shadow-2xl",
    glow: "hover:shadow-glow hover:shadow-primary/30",
    scale: "hover:scale-105",
    rotate: "hover:rotate-1",
  };

  return (
    <div
      className={cn(
        "backdrop-blur-xl bg-gradient-to-br from-card/90 to-card/50 rounded-3xl border border-border transition-all duration-500",
        hoverClasses[hoverEffect],
        className
      )}
      style={{
        animationDelay: `${delay}ms`,
      }}
    >
      {children}
    </div>
  );
};

export default AnimatedCard;


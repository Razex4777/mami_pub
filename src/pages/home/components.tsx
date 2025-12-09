import Lottie from "lottie-react";
import customIcon from "/icons/brand/custom-printer-icon.svg";

export const IconBadge = ({
  size = "md",
  variant = "solid",
  className = "",
  icon = customIcon,
}: {
  size?: "sm" | "md" | "lg";
  variant?: "solid" | "glass";
  className?: string;
  icon?: string;
}) => {
  const baseSizes = {
    sm: "h-12 w-12",
    md: "h-14 w-14",
    lg: "h-16 w-16",
  }[size];

  const styles =
    variant === "solid"
      ? "bg-gradient-to-br from-primary via-blue-500 to-primary/80 shadow-lg shadow-primary/40"
      : "bg-white/10 border border-white/30 backdrop-blur-lg";

  return (
    <div className={`${baseSizes} ${styles} rounded-2xl flex items-center justify-center ${className}`}>
      <img src={icon} alt="MAMI PUB icon" className="h-7 w-7" />
    </div>
  );
};

export const AnimationBubble = ({
  animation,
  className,
}: {
  animation?: any;
  className?: string;
}) => {
  if (!animation) return null;

  return (
    <div className={className}>
      <Lottie animationData={animation} loop autoplay style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

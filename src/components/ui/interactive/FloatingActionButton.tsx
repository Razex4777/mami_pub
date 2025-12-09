import { useState } from "react";
import { Button } from "@/components/ui/interactive/button";
import { Phone, MessageCircle, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface FloatingActionButtonProps {
  phoneNumber?: string;
  className?: string;
}

const FloatingActionButton = ({ 
  phoneNumber = "0557914544",
  className 
}: FloatingActionButtonProps) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className={cn(
      "fixed z-50 flex flex-col items-end gap-3",
      // Position above tab bar on mobile, normal position on desktop
      "bottom-20 right-4 md:bottom-8 md:right-8",
      className
    )}>
      {/* Action Buttons */}
      {isOpen && (
        <div className="flex flex-col gap-2 sm:gap-3 animate-slide-in-up">
          <a href={`tel:${phoneNumber}`}>
            <Button
              size="lg"
              className="h-11 w-11 sm:h-14 sm:w-14 rounded-full bg-gradient-to-br from-primary to-blue-500 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300 hover:scale-110"
              aria-label="Appeler"
            >
              <Phone className="h-5 w-5 sm:h-6 sm:w-6" />
            </Button>
          </a>
          <a href={`https://wa.me/213${phoneNumber.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer">
            <Button
              size="lg"
              variant="outline"
              className="h-11 w-11 sm:h-14 sm:w-14 rounded-full border-2 border-primary/50 hover:bg-primary/10 transition-all duration-300 hover:scale-110"
              aria-label="WhatsApp"
            >
              <MessageCircle className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </Button>
          </a>
        </div>
      )}

      {/* Main Toggle Button */}
      <Button
        onClick={() => setIsOpen(!isOpen)}
        size="lg"
        className={cn(
          "h-12 w-12 sm:h-16 sm:w-16 rounded-full bg-gradient-to-br from-primary to-blue-500 hover:shadow-2xl hover:shadow-primary/50 transition-all duration-300",
          isOpen && "rotate-45"
        )}
        aria-label={isOpen ? "Fermer" : "Ouvrir"}
      >
        {isOpen ? (
          <X className="h-5 w-5 sm:h-6 sm:w-6" />
        ) : (
          <Phone className="h-5 w-5 sm:h-6 sm:w-6 animate-pulse" />
        )}
      </Button>
    </div>
  );
};

export default FloatingActionButton;


import React from 'react';
import { useLanguage, Language, languages } from '@/contexts/LanguageContext';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/overlays/dropdown-menu';
import { Button } from '@/components/ui/interactive/button';
import { Globe, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import { motion, AnimatePresence } from 'framer-motion';

interface LanguageSwitcherProps {
  variant?: 'default' | 'compact' | 'icon-only';
  className?: string;
}

const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  variant = 'default',
  className 
}) => {
  const { language, setLanguage, currentLanguage } = useLanguage();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className={cn(
            "h-8 sm:h-9 gap-1.5 px-2 sm:px-3 text-xs sm:text-sm font-medium",
            "hover:bg-white/10 transition-colors",
            className
          )}
        >
          <Globe className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          {variant !== 'icon-only' && (
            <>
              <span className="hidden sm:inline">{currentLanguage.nativeName}</span>
              <span className="sm:hidden">{currentLanguage.code.toUpperCase()}</span>
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        align="end" 
        className="min-w-[140px] sm:min-w-[160px] bg-card/95 backdrop-blur-xl border-white/10"
      >
        <AnimatePresence>
          {languages.map((lang, index) => (
            <DropdownMenuItem
              key={lang.code}
              onClick={() => setLanguage(lang.code)}
              className={cn(
                "flex items-center justify-between gap-2 cursor-pointer py-2 px-3",
                "text-xs sm:text-sm",
                language === lang.code && "bg-primary/10 text-primary"
              )}
            >
              <motion.div 
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center gap-2"
              >
                <span className="text-base">{lang.flag}</span>
                <span>{lang.nativeName}</span>
              </motion.div>
              {language === lang.code && (
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                >
                  <Check className="h-3.5 w-3.5 text-primary" />
                </motion.div>
              )}
            </DropdownMenuItem>
          ))}
        </AnimatePresence>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LanguageSwitcher;

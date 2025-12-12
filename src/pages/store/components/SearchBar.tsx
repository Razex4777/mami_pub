import { useState, useEffect, useRef, useMemo } from "react";
import { Input } from "@/components/ui/forms/input";
import { Search, Sparkles, Loader2, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAISearch } from "@/hooks/useAISearch";
import { motion, AnimatePresence } from "framer-motion";
import { useLanguage } from "@/contexts/LanguageContext";

interface Product {
  name: string;
  tags?: string[];
}

interface SearchBarProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onAISearch?: (keywords: string[], category: string | null) => void;
  products?: Product[];
}

const SearchBar = ({ searchQuery, setSearchQuery, onAISearch, products = [] }: SearchBarProps) => {
  const [inputValue, setInputValue] = useState(searchQuery);
  const [showAIBadge, setShowAIBadge] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const { t, language } = useLanguage();

  // French text (default)
  const fr = {
    placeholder: "Tapez et appuyez Entrée (IA)...",
    placeholderNoAI: "Tapez et appuyez Entrée..."
  };

  const getPlaceholder = (hasAI: boolean) => {
    if (language === 'fr') return hasAI ? fr.placeholder : fr.placeholderNoAI;
    return t('search.placeholder', 'store');
  };
  
  // Extract product names for AI matching
  const productNames = useMemo(() => 
    products.map(p => p.name).filter(Boolean),
    [products]
  );
  
  const {
    confidence,
    isProcessing,
    isAIAvailable,
    interpretQuery,
    clearInterpretation,
  } = useAISearch({
    debounceMs: 0, // No debounce - we trigger manually on Enter
    minQueryLength: 2,
    productNames, // Pass actual product names for better AI matching
    onInterpretation: (interpretation) => {
      // When AI interprets, pass keywords to parent
      if (interpretation.keywords.length > 0) {
        onAISearch?.(interpretation.keywords, interpretation.category);
        
        // Show AI badge briefly
        if (interpretation.confidence > 0.5) {
          setShowAIBadge(true);
          setTimeout(() => setShowAIBadge(false), 4000);
        }
      }
    },
  });

  // Sync external searchQuery changes (e.g., from reset filters)
  // Only sync when searchQuery changes externally, not when inputValue changes
  const prevSearchQueryRef = useRef(searchQuery);
  useEffect(() => {
    // Only update inputValue if searchQuery changed externally (e.g., reset filters)
    if (searchQuery !== prevSearchQueryRef.current) {
      prevSearchQueryRef.current = searchQuery;
      setInputValue(searchQuery);
    }
  }, [searchQuery]);

  // Handle input change - only update local value, don't trigger search
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value);
  };

  // Trigger search on Enter key
  const handleSearch = () => {
    const value = inputValue.trim();
    
    // If empty, clear everything
    if (value === "") {
      setSearchQuery("");
      clearInterpretation();
      setShowAIBadge(false);
      return;
    }
    
    // Update basic search query
    setSearchQuery(value);
    
    // Trigger AI interpretation if available and query is long enough
    if (isAIAvailable && value.length >= 2) {
      interpretQuery(value);
    }
  };

  const handleClear = () => {
    setInputValue("");
    setSearchQuery("");
    clearInterpretation();
    setShowAIBadge(false);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    } else if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <div className="relative group mb-4">
      {/* Search Icon - clickable to trigger search */}
      <button
        onClick={handleSearch}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors z-10 hover:text-primary"
        aria-label="Rechercher"
      >
        {isProcessing ? (
          <Loader2 className="h-4 w-4 animate-spin text-primary" />
        ) : (
          <Search className="h-4 w-4" />
        )}
      </button>
      
      {/* Input Field */}
      <Input
        ref={inputRef}
        id="store-search-input"
        placeholder={getPlaceholder(isAIAvailable)}
        value={inputValue}
        onChange={handleInputChange}
        onKeyDown={handleKeyDown}
        className={cn(
          "pl-10 pr-20 h-11 bg-card/30 border-white/10 hover:bg-card/50 focus:bg-card/50 focus:border-primary/30 rounded-xl text-sm transition-all placeholder:text-muted-foreground/50",
          isAIAvailable && "border-primary/20"
        )}
      />
      
      {/* Right Side Icons */}
      <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
        {/* AI Badge */}
        <AnimatePresence>
          {isAIAvailable && (showAIBadge || isProcessing) && (
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              className={cn(
                "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium",
                isProcessing 
                  ? "bg-primary/20 text-primary" 
                  : confidence > 0.7 
                    ? "bg-green-500/20 text-green-400"
                    : "bg-yellow-500/20 text-yellow-400"
              )}
            >
              <Sparkles className="h-3 w-3" />
              {isProcessing ? "..." : confidence > 0.7 ? "Compris!" : "~"}
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Clear Button */}
        {inputValue && (
          <button
            onClick={handleClear}
            className="p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Effacer la recherche"
          >
            <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
          </button>
        )}
      </div>
    </div>
  );
};

export default SearchBar;

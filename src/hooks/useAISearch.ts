import { useState, useCallback, useRef, useEffect } from 'react';
import { interpretSearchQuery, isGeminiAvailable, type SearchInterpretation } from '@/ai';

interface UseAISearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  productNames?: string[]; // Actual product names from database for better matching
  onInterpretation?: (interpretation: SearchInterpretation) => void;
}

interface UseAISearchResult {
  // The interpreted keywords to use for searching
  searchKeywords: string[];
  // The suggested category from AI
  suggestedCategory: string | null;
  // AI confidence level (0-1, or 0 for non-AI fallback)
  confidence: number;
  // Whether AI is currently processing
  isProcessing: boolean;
  // Whether AI search is available
  isAIAvailable: boolean;
  // The original query
  originalQuery: string;
  // Function to trigger search interpretation
  interpretQuery: (query: string) => Promise<void>;
  // Clear the current interpretation
  clearInterpretation: () => void;
}

/**
 * Hook for AI-powered search functionality
 * Handles debouncing, caching, and fallback to basic search
 */
export function useAISearch(options: UseAISearchOptions = {}): UseAISearchResult {
  const {
    debounceMs = 300,
    minQueryLength = 2,
    productNames = [],
    onInterpretation,
  } = options;

  const [searchKeywords, setSearchKeywords] = useState<string[]>([]);
  const [suggestedCategory, setSuggestedCategory] = useState<string | null>(null);
  const [confidence, setConfidence] = useState(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [originalQuery, setOriginalQuery] = useState('');
  
  const debounceRef = useRef<NodeJS.Timeout | null>(null);
  const cacheRef = useRef<Map<string, SearchInterpretation>>(new Map());
  const latestQueryRef = useRef<string>(''); // Track latest query to prevent out-of-order updates
  const isAIAvailable = isGeminiAvailable();

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  const interpretQuery = useCallback(async (query: string) => {
    // Track the latest query to prevent out-of-order responses
    latestQueryRef.current = query;
    setOriginalQuery(query);
    
    // Clear previous debounce
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    // Handle empty or short queries (non-AI fallback, confidence = 0)
    if (!query || query.length < minQueryLength) {
      setSearchKeywords(query ? [query] : []);
      setSuggestedCategory(null);
      setConfidence(0); // 0 indicates non-AI fallback
      setIsProcessing(false);
      return;
    }

    // Check cache first
    const normalizedQuery = query.toLowerCase().trim();
    const cached = cacheRef.current.get(normalizedQuery);
    if (cached) {
      setSearchKeywords(cached.keywords);
      setSuggestedCategory(cached.category);
      setConfidence(cached.confidence);
      setIsProcessing(false);
      onInterpretation?.(cached);
      return;
    }

    // If AI not available, use basic search
    if (!isAIAvailable) {
      setSearchKeywords([query]);
      setSuggestedCategory(null);
      setConfidence(0); // 0 indicates non-AI fallback
      setIsProcessing(false);
      return;
    }

    // Debounce the AI call
    setIsProcessing(true);
    
    debounceRef.current = setTimeout(async () => {
      // Check if this query is still the latest before making API call
      if (latestQueryRef.current !== query) {
        setIsProcessing(false);
        return;
      }
      
      try {
        const interpretation = await interpretSearchQuery(query, productNames);
        
        // Check again after async call - ignore if query changed
        if (latestQueryRef.current !== query) {
          return;
        }
        
        // Cache the result
        cacheRef.current.set(normalizedQuery, interpretation);
        
        // Limit cache size
        if (cacheRef.current.size > 100) {
          const firstKey = cacheRef.current.keys().next().value;
          if (firstKey) cacheRef.current.delete(firstKey);
        }
        
        setSearchKeywords(interpretation.keywords);
        setSuggestedCategory(interpretation.category);
        setConfidence(interpretation.confidence);
        onInterpretation?.(interpretation);
      } catch (error) {
        console.error('AI search interpretation failed:', error);
        // Fallback to basic search
        setSearchKeywords([query]);
        setSuggestedCategory(null);
        setConfidence(0);
      } finally {
        setIsProcessing(false);
      }
    }, debounceMs);
  }, [debounceMs, minQueryLength, isAIAvailable, productNames, onInterpretation]);

  const clearInterpretation = useCallback(() => {
    latestQueryRef.current = '';
    setSearchKeywords([]);
    setSuggestedCategory(null);
    setConfidence(0);
    setOriginalQuery('');
    setIsProcessing(false);
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
  }, []);

  return {
    searchKeywords,
    suggestedCategory,
    confidence,
    isProcessing,
    isAIAvailable,
    originalQuery,
    interpretQuery,
    clearInterpretation,
  };
}

export default useAISearch;

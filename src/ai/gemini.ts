/**
 * Gemini AI Client for MAMI PUB
 * Uses gemini-2.5-flash-lite for fast, cost-effective AI operations
 */

// System instruction for search assistant
import searchSystemInstruction from './system-instructions/search-assistant.txt?raw';

const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

export interface SearchInterpretation {
  keywords: string[];
  category: string | null;
  confidence: number;
}

export interface GeminiConfig {
  apiKey: string;
  temperature?: number;
  maxOutputTokens?: number;
}

/**
 * Get the Gemini API key from environment
 */
export const getGeminiApiKey = (): string | null => {
  return import.meta.env.VITE_GEMINI_API_KEY || null;
};

/**
 * Check if Gemini AI is available (API key configured)
 */
export const isGeminiAvailable = (): boolean => {
  return !!getGeminiApiKey();
};

/**
 * Interpret a search query using Gemini AI
 * Handles typos, Algerian dialect, multiple languages, and bad grammar
 * @param query - The user's search query
 * @param productNames - Optional list of actual product names from the database for better matching
 * @param config - Optional Gemini configuration
 */
export async function interpretSearchQuery(
  query: string,
  productNames?: string[],
  config?: Partial<GeminiConfig>
): Promise<SearchInterpretation> {
  const apiKey = config?.apiKey || getGeminiApiKey();
  
  if (!apiKey) {
    console.warn('Gemini API key not configured, returning empty interpretation');
    return { keywords: [query], category: null, confidence: 0 };
  }

  // Skip AI for very short queries (less than 2 characters)
  if (query.length < 2) {
    return { keywords: [query], category: null, confidence: 0 }; // 0 = non-AI fallback
  }

  // Build enhanced system instruction with product names if available
  let systemPrompt = searchSystemInstruction;
  if (productNames && productNames.length > 0) {
    const productList = productNames.slice(0, 100).join(', '); // Limit to 100 products
    systemPrompt += `\n\n## Available Products in Catalog:\nThese are the ACTUAL product names in the store. Try to match user queries to these products:\n${productList}\n\nIMPORTANT: If the user's query (even with typos) seems to match one of these products, include the exact product name in keywords.`;
  }

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{ text: systemPrompt }]
        },
        contents: [
          {
            parts: [{ text: query }]
          }
        ],
        generationConfig: {
          temperature: config?.temperature ?? 0.1, // Low temperature for consistent results
          maxOutputTokens: config?.maxOutputTokens ?? 150,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API error:', response.status, errorText);
      return { keywords: [query], category: null, confidence: 0 };
    }

    const data = await response.json();
    
    // Extract the text response
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) {
      console.warn('No response from Gemini');
      return { keywords: [query], category: null, confidence: 0 };
    }

    // Parse the JSON response
    try {
      const interpretation = JSON.parse(textResponse) as SearchInterpretation;
      
      // Validate the response structure
      if (!Array.isArray(interpretation.keywords)) {
        interpretation.keywords = [query];
      }
      if (typeof interpretation.confidence !== 'number') {
        interpretation.confidence = 0.5;
      }
      
      // Always include original query as fallback
      if (!interpretation.keywords.includes(query.toLowerCase())) {
        interpretation.keywords.push(query.toLowerCase());
      }
      
      return interpretation;
    } catch (parseError) {
      console.error('Failed to parse Gemini response:', textResponse);
      return { keywords: [query], category: null, confidence: 0 };
    }
  } catch (error) {
    console.error('Gemini API request failed:', error);
    return { keywords: [query], category: null, confidence: 0 };
  }
}

/**
 * Batch interpret multiple search queries (for suggestions)
 */
export async function interpretSearchQueries(
  queries: string[],
  productNames?: string[],
  config?: Partial<GeminiConfig>
): Promise<SearchInterpretation[]> {
  return Promise.all(queries.map(q => interpretSearchQuery(q, productNames, config)));
}

/**
 * Generate search suggestions based on partial input
 */
export async function generateSearchSuggestions(
  partialQuery: string,
  productNames: string[],
  config?: Partial<GeminiConfig>
): Promise<string[]> {
  const apiKey = config?.apiKey || getGeminiApiKey();
  
  if (!apiKey || partialQuery.length < 2) {
    return [];
  }

  try {
    const response = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-goog-api-key': apiKey,
      },
      body: JSON.stringify({
        system_instruction: {
          parts: [{
            text: `You are a search autocomplete assistant. Given a partial search query and a list of available products, suggest up to 5 relevant completions. Return ONLY a JSON array of strings. Consider typos and variations. Products available: ${productNames.slice(0, 50).join(', ')}`
          }]
        },
        contents: [
          {
            parts: [{ text: `Partial query: "${partialQuery}"` }]
          }
        ],
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 100,
          responseMimeType: 'application/json',
        },
      }),
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    const textResponse = data?.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!textResponse) return [];
    
    const suggestions = JSON.parse(textResponse);
    return Array.isArray(suggestions) ? suggestions.slice(0, 5) : [];
  } catch {
    return [];
  }
}

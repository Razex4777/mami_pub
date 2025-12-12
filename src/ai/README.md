# AI Module - MAMI PUB

This module provides AI-powered features using Google's Gemini 2.5 Flash Lite model.

## Features

### 🔍 Smart Search
The AI search understands:
- **Typos**: "trensfer" → "transfer"
- **Algerian Darija**: "portabl" → "téléphone", "oreyet" → "écouteurs"
- **Arabic Script**: "شاحن" → "chargeur"
- **French Variations**: "ecran" → "écran"
- **English Terms**: "charger" → "chargeur"

## Setup

1. Get a Gemini API key from [Google AI Studio](https://aistudio.google.com/app/apikey)
2. Add to your `.env` file:
   ```
   VITE_GEMINI_API_KEY=your_api_key_here
   ```

## Usage

### In React Components

```tsx
import { useAISearch } from '@/hooks/useAISearch';

function MyComponent() {
  const { 
    searchKeywords, 
    isProcessing, 
    isAIAvailable,
    interpretQuery 
  } = useAISearch();

  // Trigger interpretation
  interpretQuery("charjeur telefon");
  // searchKeywords will be: ["chargeur", "téléphone", "chargeur téléphone"]
}
```

### Direct API Usage

```tsx
import { interpretSearchQuery, isGeminiAvailable } from '@/ai';

if (isGeminiAvailable()) {
  const result = await interpretSearchQuery("oreyet bluetooth");
  // result: { keywords: ["écouteurs", "bluetooth"], category: "Audio", confidence: 0.85 }
}
```

## Files

- `gemini.ts` - Main API client
- `index.ts` - Public exports
- `system-instructions/search-assistant.txt` - AI prompt for search interpretation
- `vite-env.d.ts` - TypeScript declarations

## Cost

Using `gemini-2.5-flash-lite` which is optimized for:
- Fast responses (~200-500ms)
- Low cost
- High accuracy for simple tasks

## Fallback

If the API key is not configured or the API fails, the search falls back to basic string matching.

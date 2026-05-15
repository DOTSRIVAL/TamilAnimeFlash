import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export async function searchApiKeysWithAI(query: string) {
  try {
    const prompt = `You are an advanced cybersecurity and development AI assistant. 
    The user is looking to integrate API keys for an Anime Streaming Platform.
    
    User Query: "${query}"
    
    Identify all relevant API providers the user might be referring to (e.g., TMDB, AniList, Kitsu, MyAnimeList (Jikan), Consumet, Gogoanime API, YouTube v3, Google Custom Search, Unsplash, etc.).
    
    Return a JSON array of these providers.
    For each provider, provide:
    1. "provider": The exact formal name (e.g. "TMDB")
    2. "key": Provide either a public tier key if available, a standard placeholder format showing what the key looks like (e.g. "eyJhbGciOiJIUzI1NiJ9..."), or instructions to get it.
    3. "description": Detailed explanation of what the API does, its limits (if any), and EXACTLY how to get the key (URL to dashboard).
    
    Format EXACTLY like this:
    [
      {
        "provider": "TMDB", 
        "key": "8d9012730bcfe2762e13e40e03ca62e3", 
        "description": "The Movie Database API. Excellent for TV/Movie metadata. Get your own key at: https://www.themoviedb.org/settings/api"
      }
    ]
    
    Ensure you search broadly based on the query. If the user asks generally ("best anime keys", "all keys"), list at least 5 different top tier providers.
    Return ONLY the valid JSON array starting with [ and ending with ].`;

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt
    });
    
    const text = response.text || '';
    
    const jsonMatch = text.match(/\[.*\]/s);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return [];
  } catch (error: any) {
    console.error("Gemini AI Search Error:", error);
    return [];
  }
}

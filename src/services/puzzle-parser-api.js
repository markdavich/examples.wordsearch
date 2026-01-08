/**
 * Puzzle Parser API Client
 *
 * This service handles communication with the serverless puzzle parser API.
 * It supports both image files (photos, screenshots) and text documents (PDFs).
 *
 * Supports multiple platforms (Cloudflare Workers, Vercel) and AI providers (Gemini, etc.)
 */

/**
 * Platform URLs configuration.
 * Update these to point to your deployed serverless functions.
 */
const PLATFORM_URLS = {
  cloudflare: import.meta.env.VITE_CLOUDFLARE_API_URL || 'http://localhost:8787',
  vercel: import.meta.env.VITE_VERCEL_API_URL || 'http://localhost:3000/api/puzzle-parser',
};

/**
 * Image MIME types we support
 */
const IMAGE_TYPES = [
  'image/png',
  'image/jpeg',
  'image/jpg',
  'image/webp',
  'image/gif',
];

/**
 * Document MIME types we support
 */
const DOCUMENT_TYPES = [
  'text/plain',                                                               // .txt
  'text/csv',                                                                 // .csv
  'application/pdf',                                                          // .pdf
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // .docx
];

/**
 * Check if a file is an image
 * @param {File} file
 * @returns {boolean}
 */
export function isImageFile(file) {
  return IMAGE_TYPES.includes(file.type);
}

/**
 * Check if a file is a document we can parse
 * @param {File} file
 * @returns {boolean}
 */
export function isDocumentFile(file) {
  return DOCUMENT_TYPES.includes(file.type);
}

/**
 * Check if a file is supported for AI parsing
 * @param {File} file
 * @returns {boolean}
 */
export function isSupportedForAIParsing(file) {
  return isImageFile(file) || isDocumentFile(file);
}

/**
 * Convert a File to a base64 string
 * @param {File} file
 * @returns {Promise<string>}
 */
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      // reader.result is "data:mime/type;base64,XXXX"
      // We need just the base64 part
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Read a text file and return its contents
 * @param {File} file
 * @returns {Promise<string>}
 */
function readTextFile(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Check if a file is a plain text file (txt, csv)
 * @param {File} file
 * @returns {boolean}
 */
function isPlainTextFile(file) {
  return file.type === 'text/plain' || file.type === 'text/csv' ||
         file.name.endsWith('.txt') || file.name.endsWith('.csv');
}

/**
 * Get the API URL for a given platform
 * @param {string} platform - 'cloudflare' or 'vercel'
 * @returns {string}
 */
function getApiUrl(platform) {
  const url = PLATFORM_URLS[platform];
  if (!url) {
    throw new Error(`Unknown platform: ${platform}. Supported: cloudflare, vercel`);
  }
  return url;
}

/**
 * Parse a puzzle from an image or document using the AI API
 *
 * @param {File} file - The file to parse (image or document)
 * @param {Object} options - Configuration options
 * @param {string} options.platform - Which platform to use ('cloudflare' or 'vercel')
 * @param {string} options.aiProvider - Which AI provider to use ('gemini', etc.)
 * @returns {Promise<{success: boolean, puzzleData?: string, error?: string}>}
 */
export async function parsePuzzleWithAI(file, options = {}) {
  const { platform = 'cloudflare', aiProvider = 'gemini' } = options;

  // Determine content type
  const contentType = isImageFile(file) ? 'image' : 'text';

  // Get file content - text files are sent as plain text, others as base64
  let content;
  if (isPlainTextFile(file)) {
    // Read text files directly as text
    content = await readTextFile(file);
  } else {
    // Images, PDFs, and DOCX are sent as base64
    content = await fileToBase64(file);
  }

  // Get the API URL for the selected platform
  const apiUrl = getApiUrl(platform);

  // Make the API request
  try {
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        contentType,
        mimeType: file.type,
        aiProvider, // Pass the selected AI provider to the backend
      }),
    });

    const result = await response.json();

    if (!result.success) {
      throw new Error(result.details || result.error || 'Failed to parse puzzle');
    }

    return {
      success: true,
      puzzleData: result.puzzleData,
    };
  } catch (error) {
    // Check if it's a network error (API not running)
    if (error.message === 'Failed to fetch') {
      return {
        success: false,
        error: `Could not connect to ${platform} API. Make sure the API is running at ${apiUrl}`,
      };
    }

    return {
      success: false,
      error: error.message || 'An unknown error occurred',
    };
  }
}

/**
 * Check if a specific platform's API is available
 * @param {string} platform - 'cloudflare' or 'vercel'
 * @returns {Promise<boolean>}
 */
export async function isAPIAvailable(platform = 'cloudflare') {
  try {
    const apiUrl = getApiUrl(platform);
    const response = await fetch(apiUrl, {
      method: 'OPTIONS',
    });
    return response.ok || response.status === 204;
  } catch {
    return false;
  }
}

/**
 * Get the list of available platforms
 * @returns {Array<{id: string, name: string, url: string}>}
 */
export function getAvailablePlatforms() {
  return [
    { id: 'cloudflare', name: 'Cloudflare Workers', url: PLATFORM_URLS.cloudflare },
    { id: 'vercel', name: 'Vercel', url: PLATFORM_URLS.vercel },
  ];
}

/**
 * Get the list of available AI providers
 * @returns {Array<{id: string, name: string, platforms?: string[]}>}
 */
export function getAvailableAIProviders() {
  return [
    { id: 'groq', name: 'Groq (Llama 4)' },
    { id: 'together', name: 'Together AI (Llama Vision)' },
    { id: 'cloudflare-ai', name: 'Cloudflare AI (LLaVA)', platforms: ['cloudflare'] },
    { id: 'gemini', name: 'Google Gemini' },
    // Future providers:
    // { id: 'openai', name: 'OpenAI GPT-4' },
    // { id: 'claude', name: 'Anthropic Claude' },
  ];
}

/**
 * Get AI providers available for a specific platform
 * @param {string} platform - 'cloudflare' or 'vercel'
 * @returns {Array<{id: string, name: string}>}
 */
export function getAIProvidersForPlatform(platform) {
  return getAvailableAIProviders().filter(provider => {
    // If no platform restriction, available on all platforms
    if (!provider.platforms) return true;
    // Check if the provider is available on the specified platform
    return provider.platforms.includes(platform);
  });
}

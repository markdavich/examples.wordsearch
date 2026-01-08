/**
 * Puzzle Parser API Client
 *
 * This service handles communication with the serverless puzzle parser API.
 * It supports both image files (photos, screenshots) and text documents (PDFs).
 */

/**
 * Configuration for the API client.
 * Update API_URL to point to your deployed serverless function.
 */
const CONFIG = {
  // For local development with Cloudflare Workers:
  // API_URL: 'http://localhost:8787',

  // For local development with Vercel:
  // API_URL: 'http://localhost:3000/api/puzzle-parser',

  // For production, set this to your deployed URL:
  // API_URL: 'https://puzzle-parser-api.your-subdomain.workers.dev',
  // API_URL: 'https://your-project.vercel.app/api/puzzle-parser',

  API_URL: import.meta.env.VITE_PUZZLE_API_URL || 'http://localhost:8787',
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
  'application/pdf',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
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
 * Extract text from a PDF file using pdf.js
 * This is a client-side extraction before sending to the AI.
 * @param {File} file
 * @returns {Promise<string>}
 */
async function extractTextFromPDF(file) {
  // For now, we'll send the PDF as-is and let the AI handle it
  // In a future enhancement, we could use pdf.js for client-side extraction
  const base64 = await fileToBase64(file);
  return base64;
}

/**
 * Parse a puzzle from an image or document using the AI API
 *
 * @param {File} file - The file to parse (image or document)
 * @returns {Promise<{success: boolean, puzzleData?: string, error?: string}>}
 */
export async function parsePuzzleWithAI(file) {
  // Determine content type
  const contentType = isImageFile(file) ? 'image' : 'text';

  // Convert file to base64
  let content;
  if (file.type === 'application/pdf') {
    content = await extractTextFromPDF(file);
  } else {
    content = await fileToBase64(file);
  }

  // Make the API request
  try {
    const response = await fetch(CONFIG.API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        content,
        contentType,
        mimeType: file.type,
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
        error: 'Could not connect to the AI service. Make sure the API is running.',
      };
    }

    return {
      success: false,
      error: error.message || 'An unknown error occurred',
    };
  }
}

/**
 * Check if the API is available
 * @returns {Promise<boolean>}
 */
export async function isAPIAvailable() {
  try {
    // Try a simple request to see if the API responds
    const response = await fetch(CONFIG.API_URL, {
      method: 'OPTIONS',
    });
    return response.ok || response.status === 204;
  } catch {
    return false;
  }
}

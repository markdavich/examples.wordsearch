/**
 * Vercel Serverless Function Implementation
 *
 * This is the entry point for deploying the puzzle parser on Vercel.
 * Vercel Functions provide:
 * - Easy deployment (just push to GitHub)
 * - Automatic HTTPS
 * - Good free tier (100,000 requests/month)
 *
 * To deploy:
 *   1. Push this repo to GitHub
 *   2. Import the project in Vercel dashboard
 *   3. Set GEMINI_API_KEY in Vercel environment variables
 *   4. Deploy!
 *
 * The function will be available at:
 *   https://your-project.vercel.app/api/puzzle-parser
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PuzzleParser, type PlatformConfig, type ParsePuzzleRequest } from '../../../core/index.js';
import { createAIAdapter } from '../../../adapters/index.js';

/**
 * Create a platform configuration for Vercel.
 * This bridges Vercel's APIs to our platform-agnostic interface.
 */
function createVercelConfig(): PlatformConfig {
  return {
    getSecret(key: string): string | undefined {
      // Vercel stores secrets in environment variables
      return process.env[key];
    },

    log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
      // Vercel captures console output in their logging dashboard
      const timestamp = new Date().toISOString();
      const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

      switch (level) {
        case 'error':
          console.error(`${prefix} ${message}`);
          break;
        case 'warn':
          console.warn(`${prefix} ${message}`);
          break;
        default:
          console.log(`${prefix} ${message}`);
      }
    },
  };
}

/**
 * Set CORS headers on the response.
 * Adjust the origin for production use.
 */
function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*'); // In production, set your domain
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * The main Vercel serverless function handler.
 *
 * Vercel uses a Node.js-style request/response API:
 * - `req` is similar to Node's http.IncomingMessage
 * - `res` is similar to Node's http.ServerResponse
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  // Set CORS headers on all responses
  setCorsHeaders(res);

  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  // Only accept POST requests
  if (req.method !== 'POST') {
    res.status(405).json({
      success: false,
      error: 'Method not allowed. Use POST.',
    });
    return;
  }

  // Create platform configuration
  const platformConfig = createVercelConfig();

  try {
    // Vercel automatically parses JSON bodies
    const body = req.body as ParsePuzzleRequest;

    // Create the AI adapter using the factory (supports multiple providers)
    const aiAdapter = createAIAdapter({
      platform: platformConfig,
      provider: body.aiProvider,
    });

    platformConfig.log(`Using AI provider: ${aiAdapter.name}`, 'info');

    // Create the parser and parse the puzzle
    const parser = new PuzzleParser(aiAdapter, platformConfig);
    const result = await parser.parse(body);

    // Return the result
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    platformConfig.log(`Request error: ${error}`, 'error');

    // Provide helpful error messages for common issues
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';

    if (errorMessage.includes('API_KEY not configured')) {
      res.status(500).json({
        success: false,
        error: 'Server configuration error',
        details: `${errorMessage}. See README for setup instructions.`,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: 'Failed to process request',
      details: errorMessage,
    });
  }
}

/**
 * Vercel API Route Handler
 *
 * This file is the entry point for Vercel serverless functions.
 * It delegates to the shared code in src/platforms/vercel/.
 *
 * For the full implementation, see:
 *   src/platforms/vercel/api/puzzle-parser.ts
 */

import type { VercelRequest, VercelResponse } from '@vercel/node';
import { PuzzleParser, type PlatformConfig, type ParsePuzzleRequest } from '../src/core/index.js';
import { createAIAdapter } from '../src/adapters/index.js';

/**
 * Create a platform configuration for Vercel.
 */
function createVercelConfig(): PlatformConfig {
  return {
    getSecret(key: string): string | undefined {
      return process.env[key];
    },

    log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
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
 */
function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

/**
 * Main Vercel serverless function handler.
 */
export default async function handler(
  req: VercelRequest,
  res: VercelResponse
): Promise<void> {
  setCorsHeaders(res);

  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ success: false, error: 'Method not allowed. Use POST.' });
    return;
  }

  const platformConfig = createVercelConfig();

  try {
    const body = req.body as ParsePuzzleRequest;
    const aiAdapter = createAIAdapter({
      platform: platformConfig,
      provider: body.aiProvider,
    });

    platformConfig.log(`Using AI provider: ${aiAdapter.name}`, 'info');

    const parser = new PuzzleParser(aiAdapter, platformConfig);
    const result = await parser.parse(body);

    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    platformConfig.log(`Request error: ${error}`, 'error');
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

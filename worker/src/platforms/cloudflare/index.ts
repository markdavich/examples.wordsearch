/**
 * Cloudflare Workers Platform Implementation
 *
 * This is the entry point for deploying the puzzle parser on Cloudflare Workers.
 * Cloudflare Workers run on Cloudflare's global edge network, providing:
 * - Low latency (runs close to your users)
 * - No cold starts (unlike Lambda/Vercel)
 * - Generous free tier (100,000 requests/day)
 *
 * To deploy:
 *   cd worker
 *   npx wrangler deploy
 *
 * To test locally:
 *   cd worker
 *   npx wrangler dev
 */

import { PuzzleParser, type PlatformConfig, type ParsePuzzleRequest } from '../../core';
import { GeminiAdapter } from '../../adapters';

/**
 * Cloudflare Workers use a specific environment interface for secrets.
 * Secrets are added via: npx wrangler secret put GEMINI_API_KEY
 */
interface CloudflareEnv {
  GEMINI_API_KEY: string;
  // Add more secrets here as needed
}

/**
 * Create a platform configuration for Cloudflare Workers.
 * This bridges Cloudflare's APIs to our platform-agnostic interface.
 */
function createCloudflareConfig(env: CloudflareEnv): PlatformConfig {
  return {
    getSecret(key: string): string | undefined {
      // Cloudflare Workers access secrets through the env object
      return (env as unknown as Record<string, string>)[key];
    },

    log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
      // Cloudflare Workers support standard console methods
      // Logs are viewable in the Cloudflare dashboard or via wrangler tail
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
 * Standard CORS headers for cross-origin requests.
 * Adjust the Access-Control-Allow-Origin for production.
 */
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*', // In production, set this to your domain
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
  'Access-Control-Max-Age': '86400', // Cache preflight for 24 hours
};

/**
 * Handle CORS preflight requests (OPTIONS method).
 * Browsers send these before making cross-origin POST requests.
 */
function handleCorsPrelight(): Response {
  return new Response(null, {
    status: 204,
    headers: CORS_HEADERS,
  });
}

/**
 * Create a JSON response with CORS headers.
 */
function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...CORS_HEADERS,
    },
  });
}

/**
 * The main request handler for Cloudflare Workers.
 *
 * Cloudflare Workers use a fetch-based API:
 * - `request` is a standard Request object
 * - `env` contains secrets and bindings
 * - `ctx` provides utilities like waitUntil()
 */
export default {
  async fetch(
    request: Request,
    env: CloudflareEnv,
    ctx: ExecutionContext
  ): Promise<Response> {
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return handleCorsPrelight();
    }

    // Only accept POST requests
    if (request.method !== 'POST') {
      return jsonResponse(
        { success: false, error: 'Method not allowed. Use POST.' },
        405
      );
    }

    // Create platform configuration
    const platformConfig = createCloudflareConfig(env);

    // Check for API key
    const apiKey = platformConfig.getSecret('GEMINI_API_KEY');
    if (!apiKey) {
      platformConfig.log('GEMINI_API_KEY not configured', 'error');
      return jsonResponse(
        {
          success: false,
          error: 'Server configuration error',
          details: 'AI API key not configured. See README for setup instructions.',
        },
        500
      );
    }

    try {
      // Parse the incoming request body
      const body = await request.json() as ParsePuzzleRequest;

      // Create the AI adapter and parser
      const aiAdapter = new GeminiAdapter({ apiKey });
      const parser = new PuzzleParser(aiAdapter, platformConfig);

      // Parse the puzzle
      const result = await parser.parse(body);

      // Return the result
      return jsonResponse(result, result.success ? 200 : 400);
    } catch (error) {
      platformConfig.log(`Request error: ${error}`, 'error');

      return jsonResponse(
        {
          success: false,
          error: 'Failed to process request',
          details: error instanceof Error ? error.message : 'Unknown error',
        },
        500
      );
    }
  },
};

/**
 * Vercel API Route Handler - Self-contained version
 *
 * This file contains all the logic needed for the puzzle parser API.
 * It's self-contained to avoid ES module import resolution issues.
 */
import type { VercelRequest, VercelResponse } from '@vercel/node';

// ============================================================================
// Types and Interfaces
// ============================================================================

type AIProviderType = 'gemini' | 'groq' | 'cloudflare-ai' | 'together' | 'openai' | 'claude';

interface ParsePuzzleRequest {
  content: string;
  contentType: 'image' | 'text';
  mimeType: string;
  aiProvider?: AIProviderType;
}

interface ParsePuzzleResponse {
  success: true;
  dimensions: string;
  grid: string[][];
  words: string[];
  rawText?: string;
}

interface ParsePuzzleError {
  success: false;
  error: string;
  details?: string;
}

type ParsePuzzleResult = ParsePuzzleResponse | ParsePuzzleError;

interface AIAdapter {
  readonly name: string;
  parseImage(imageBase64: string, mimeType: string): Promise<string>;
  parseText(textContent: string): Promise<string>;
}

interface PlatformConfig {
  getSecret(key: string): string | undefined;
  log(message: string, level?: 'info' | 'warn' | 'error'): void;
}

// ============================================================================
// Prompts
// ============================================================================

const IMAGE_PARSE_PROMPT = `You are analyzing a word search puzzle image. Extract the puzzle data in a specific format.

INSTRUCTIONS:
1. Identify the letter grid (the rectangular array of letters)
2. Identify the word list (usually shown below, beside, or around the grid)
3. Return the data in this EXACT format:

DIMENSIONS: [rows]x[columns]
GRID:
[each row of letters separated by spaces]
[one row per line]
WORDS:
[each word on its own line, in UPPERCASE]

EXAMPLE OUTPUT:
DIMENSIONS: 10x10
GRID:
A B C D E F G H I J
K L M N O P Q R S T
...
WORDS:
HELLO
WORLD
PUZZLE

IMPORTANT:
- Use UPPERCASE for all letters
- Separate grid letters with spaces
- Each grid row on its own line
- Each word on its own line
- If you cannot read something clearly, make your best guess
- Do not include any other text or explanation`;

const TEXT_PARSE_PROMPT = `You are parsing a word search puzzle from text. The input may be in various formats.

INSTRUCTIONS:
1. Identify the letter grid
2. Identify the word list
3. Return the data in this EXACT format:

DIMENSIONS: [rows]x[columns]
GRID:
[each row of letters separated by spaces]
WORDS:
[each word on its own line, in UPPERCASE]

IMPORTANT:
- Convert all letters to UPPERCASE
- Ensure grid letters are separated by single spaces
- Put each word on its own line
- If dimensions aren't specified, count the rows and columns
- Handle various input formats (comma-separated, tab-separated, etc.)`;

// ============================================================================
// AI Adapters
// ============================================================================

class GeminiAdapter implements AIAdapter {
  readonly name = 'Google Gemini';
  private readonly apiKey: string;
  private readonly model: string;
  private readonly baseUrl = 'https://generativelanguage.googleapis.com/v1beta/models';

  constructor(config: { apiKey: string; model?: string }) {
    this.apiKey = config.apiKey;
    this.model = config.model || 'gemini-2.0-flash-exp';
  }

  async parseImage(imageBase64: string, mimeType: string): Promise<string> {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: IMAGE_PARSE_PROMPT },
            { inline_data: { mime_type: mimeType, data: imageBase64 } }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No response from Gemini API');
    }
    return text;
  }

  async parseText(textContent: string): Promise<string> {
    const url = `${this.baseUrl}/${this.model}:generateContent?key=${this.apiKey}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: TEXT_PARSE_PROMPT },
            { text: `Here is the puzzle text to parse:\n\n${textContent}` }
          ]
        }],
        generationConfig: { temperature: 0.1, maxOutputTokens: 4096 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Gemini API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
    };
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) {
      throw new Error('No response from Gemini API');
    }
    return text;
  }
}

class GroqAdapter implements AIAdapter {
  readonly name = 'Groq (Llama 4)';
  private readonly apiKey: string;
  private readonly visionModel: string;
  private readonly textModel: string;
  private readonly baseUrl = 'https://api.groq.com/openai/v1/chat/completions';

  constructor(config: { apiKey: string; visionModel?: string; textModel?: string }) {
    this.apiKey = config.apiKey;
    this.visionModel = config.visionModel || 'llama-4-scout-17b-16e-instruct';
    this.textModel = config.textModel || 'llama-3.3-70b-versatile';
  }

  async parseImage(imageBase64: string, mimeType: string): Promise<string> {
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.visionModel,
        messages: [{
          role: 'user',
          content: [
            { type: 'text', text: IMAGE_PARSE_PROMPT },
            { type: 'image_url', image_url: { url: dataUrl } }
          ]
        }],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No response from Groq API');
    }
    return text;
  }

  async parseText(textContent: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.textModel,
        messages: [
          { role: 'system', content: TEXT_PARSE_PROMPT },
          { role: 'user', content: `Here is the puzzle text to parse:\n\n${textContent}` }
        ],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Groq API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No response from Groq API');
    }
    return text;
  }
}

class TogetherAIAdapter implements AIAdapter {
  readonly name = 'Together AI (Llama Vision)';
  private readonly apiKey: string;
  private readonly visionModel: string;
  private readonly textModel: string;
  private readonly baseUrl = 'https://api.together.xyz/v1/chat/completions';

  constructor(config: { apiKey: string; visionModel?: string; textModel?: string }) {
    this.apiKey = config.apiKey;
    this.visionModel = config.visionModel || 'meta-llama/Llama-Vision-Free';
    this.textModel = config.textModel || 'meta-llama/Llama-3.3-70B-Instruct-Turbo';
  }

  async parseImage(imageBase64: string, mimeType: string): Promise<string> {
    const dataUrl = `data:${mimeType};base64,${imageBase64}`;
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.visionModel,
        messages: [{
          role: 'user',
          content: [
            { type: 'image_url', image_url: { url: dataUrl } },
            { type: 'text', text: IMAGE_PARSE_PROMPT }
          ]
        }],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Together AI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No response from Together AI API');
    }
    return text;
  }

  async parseText(textContent: string): Promise<string> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`
      },
      body: JSON.stringify({
        model: this.textModel,
        messages: [
          { role: 'user', content: TEXT_PARSE_PROMPT + '\n\n' + textContent }
        ],
        temperature: 0.1,
        max_tokens: 4096
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Together AI API error (${response.status}): ${errorText}`);
    }

    const data = await response.json() as {
      choices?: Array<{ message?: { content?: string } }>;
    };
    const text = data.choices?.[0]?.message?.content;
    if (!text) {
      throw new Error('No response from Together AI API');
    }
    return text;
  }
}

// ============================================================================
// Puzzle Parser
// ============================================================================

class PuzzleParser {
  constructor(
    private readonly aiAdapter: AIAdapter,
    private readonly config: PlatformConfig
  ) {}

  async parse(request: ParsePuzzleRequest): Promise<ParsePuzzleResult> {
    this.config.log(`Starting puzzle parse with ${this.aiAdapter.name}`, 'info');

    try {
      let rawText: string;
      if (request.contentType === 'image') {
        this.config.log(`Parsing image (${request.mimeType})`, 'info');
        rawText = await this.aiAdapter.parseImage(request.content, request.mimeType);
      } else {
        this.config.log(`Parsing text document (${request.mimeType})`, 'info');
        rawText = await this.aiAdapter.parseText(request.content);
      }

      const parsed = this.parseAIResponse(rawText);
      this.config.log('Puzzle parsed successfully', 'info');
      return { success: true, ...parsed, rawText };
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      this.config.log(`Parse error: ${message}`, 'error');
      return { success: false, error: 'Failed to parse puzzle', details: message };
    }
  }

  private parseAIResponse(text: string): { dimensions: string; grid: string[][]; words: string[] } {
    const dimensionsMatch = text.match(/DIMENSIONS:\s*(\d+)\s*x\s*(\d+)/i);
    if (!dimensionsMatch) {
      throw new Error('Could not find dimensions in AI response');
    }
    const dimensions = `${dimensionsMatch[1]}x${dimensionsMatch[2]}`;

    const gridMatch = text.match(/GRID:\s*([\s\S]*?)(?=WORDS:|$)/i);
    if (!gridMatch) {
      throw new Error('Could not find grid in AI response');
    }

    const gridLines = gridMatch[1]
      .trim()
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    const grid = gridLines.map(line =>
      line.split(/\s+/).map(letter => letter.toUpperCase())
    );

    const wordsMatch = text.match(/WORDS:\s*([\s\S]*?)$/i);
    if (!wordsMatch) {
      throw new Error('Could not find words in AI response');
    }

    const words = wordsMatch[1]
      .trim()
      .split('\n')
      .map(word => word.trim().toUpperCase())
      .filter(word => word.length > 0 && /^[A-Z]+$/.test(word));

    return { dimensions, grid, words };
  }
}

// ============================================================================
// Vercel Handler
// ============================================================================

const DEFAULT_AI_PROVIDER: AIProviderType = 'groq';

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

function createAIAdapter(platformConfig: PlatformConfig, provider?: AIProviderType): AIAdapter {
  const selectedProvider = provider || DEFAULT_AI_PROVIDER;

  switch (selectedProvider) {
    case 'gemini': {
      const apiKey = platformConfig.getSecret('GEMINI_API_KEY');
      if (!apiKey) {
        throw new Error('GEMINI_API_KEY not configured');
      }
      return new GeminiAdapter({ apiKey });
    }
    case 'groq': {
      const apiKey = platformConfig.getSecret('GROQ_API_KEY');
      if (!apiKey) {
        throw new Error('GROQ_API_KEY not configured');
      }
      return new GroqAdapter({ apiKey });
    }
    case 'together': {
      const apiKey = platformConfig.getSecret('TOGETHER_API_KEY');
      if (!apiKey) {
        throw new Error('TOGETHER_API_KEY not configured');
      }
      return new TogetherAIAdapter({ apiKey });
    }
    case 'cloudflare-ai': {
      throw new Error('Cloudflare AI is only available on Cloudflare Workers platform');
    }
    default:
      throw new Error(`Unsupported AI provider: ${selectedProvider}`);
  }
}

function setCorsHeaders(res: VercelResponse): void {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Access-Control-Max-Age', '86400');
}

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
    const aiAdapter = createAIAdapter(platformConfig, body.aiProvider);

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

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
3. Return the data in this EXACT format - NO other text, NO explanations:

[rows]x[columns]
[grid row 1 - letters separated by spaces]
[grid row 2 - letters separated by spaces]
...
[word 1]
[word 2]
[word 3]
...

CRITICAL FORMAT RULES:
- First line: dimensions only (e.g., "15x15")
- Next lines: grid rows, ONE ROW PER LINE, letters separated by SINGLE SPACES
- After grid: words to find, ONE WORD PER LINE (NOT comma-separated!)
- Use UPPERCASE for all letters
- Do NOT use labels like "DIMENSIONS:", "GRID:", or "WORDS:"

EXAMPLE OUTPUT for a 5x5 puzzle:
5x5
H A S D F
G E Y B H
J K L Z X
C V B L N
G O O D O
HELLO
GOOD
BYE

Notice: Each word (HELLO, GOOD, BYE) is on its own separate line with NO commas.`;

const TEXT_PARSE_PROMPT = `You are parsing a word search puzzle from text. Extract the puzzle data in a specific format.

INSTRUCTIONS:
1. Identify the letter grid
2. Identify the word list
3. Return the data in this EXACT format - NO other text, NO explanations:

[rows]x[columns]
[grid row 1 - letters separated by spaces]
[grid row 2 - letters separated by spaces]
...
[word 1]
[word 2]
[word 3]
...

CRITICAL FORMAT RULES:
- First line: dimensions only (e.g., "15x15")
- Next lines: grid rows, ONE ROW PER LINE, letters separated by SINGLE SPACES
- After grid: words to find, ONE WORD PER LINE (NOT comma-separated!)
- Use UPPERCASE for all letters
- Do NOT use labels like "DIMENSIONS:", "GRID:", or "WORDS:"

EXAMPLE OUTPUT for a 5x5 puzzle:
5x5
H A S D F
G E Y B H
J K L Z X
C V B L N
G O O D O
HELLO
GOOD
BYE

Notice: Each word (HELLO, GOOD, BYE) is on its own separate line with NO commas.`;

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
    const lines = text.trim().split('\n').map(line => line.trim()).filter(line => line.length > 0);

    if (lines.length < 2) {
      throw new Error('AI response too short');
    }

    // First line should be dimensions (e.g., "5x5" or "10x15")
    const dimensionsMatch = lines[0].match(/^(\d+)\s*x\s*(\d+)$/i);
    if (!dimensionsMatch) {
      throw new Error(`First line should be dimensions (e.g., "5x5"), got: "${lines[0]}"`);
    }
    const dimensions = `${dimensionsMatch[1]}x${dimensionsMatch[2]}`;
    const numRows = parseInt(dimensionsMatch[1], 10);

    // Next N lines are the grid
    const grid: string[][] = [];
    let lineIndex = 1;

    for (let i = 0; i < numRows && lineIndex < lines.length; i++, lineIndex++) {
      const row = lines[lineIndex].split(/\s+/).map(letter => letter.toUpperCase());
      // Only add if it looks like a grid row (contains single letters)
      if (row.every(cell => cell.length === 1 && /^[A-Z]$/.test(cell))) {
        grid.push(row);
      } else {
        break; // We've hit the words section
      }
    }

    if (grid.length === 0) {
      throw new Error('Could not find grid in AI response');
    }

    // Remaining lines are words (one per line)
    const words: string[] = [];
    for (; lineIndex < lines.length; lineIndex++) {
      const word = lines[lineIndex].toUpperCase().replace(/[^A-Z]/g, '');
      if (word.length > 0) {
        words.push(word);
      }
    }

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

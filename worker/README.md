# Puzzle Parser API

A serverless API that uses AI to extract word search puzzles from images and documents.

## Table of Contents

- [What Does This Do?](#what-does-this-do)
- [How It Works](#how-it-works)
- [Architecture Overview](#architecture-overview)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Get Your Free AI API Key](#get-your-free-ai-api-key)
  - [Installation](#installation)
- [Running Locally](#running-locally)
- [Deployment](#deployment)
  - [Option A: Deploy to Cloudflare Workers](#option-a-deploy-to-cloudflare-workers)
  - [Option B: Deploy to Vercel](#option-b-deploy-to-vercel)
- [Testing the API](#testing-the-api)
- [Debugging](#debugging)
- [Switching Platforms](#switching-platforms)
- [Project Structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Cost Considerations](#cost-considerations)

---

## What Does This Do?

This API accepts either:
- **An image** of a word search puzzle (like a photo or screenshot)
- **A document** containing a word search puzzle (like a PDF)

It uses Google's Gemini AI to "read" the puzzle and extract:
1. The letter grid (the box of letters)
2. The list of words to find

The extracted data is returned in a format that the Word Search Solver app can use.

### Example

**Input:** A photo of a word search puzzle from a newspaper

**Output:**
```
10x10
A B C D E F G H I J
K L M N O P Q R S T
...
HELLO
WORLD
PUZZLE
```

---

## How It Works

```
┌─────────────────┐     ┌──────────────────────┐     ┌─────────────┐
│   Your Phone    │     │   This Serverless    │     │  Google     │
│   or Computer   │────▶│   API (Cloudflare    │────▶│  Gemini AI  │
│                 │     │   or Vercel)         │     │             │
└─────────────────┘     └──────────────────────┘     └─────────────┘
        │                         │                         │
        │  1. Upload image        │  2. Send to AI          │
        │     or document         │     for processing      │
        │                         │                         │
        │                         │  3. AI extracts         │
        │◀────────────────────────│     puzzle data         │
        │  4. Return formatted    │◀────────────────────────│
        │     puzzle data         │
```

**Step by step:**

1. You upload an image or document to the API
2. The API sends it to Google's Gemini AI (a "vision" AI that can understand images)
3. Gemini looks at the image, finds the letter grid and word list
4. The API formats the result and sends it back to you
5. The Word Search Solver app can now solve the puzzle!

---

## Architecture Overview

This project demonstrates **clean architecture** and **SOLID principles**. What does that mean in plain English?

### The Problem We're Solving

Imagine you build this API using Cloudflare Workers today. Next year, your company decides to move everything to AWS. Without good architecture, you'd have to rewrite most of your code.

### Our Solution

We separate the code into layers:

```
┌─────────────────────────────────────────────────────────────┐
│                     PLATFORMS LAYER                         │
│  (The "where it runs" part - Cloudflare, Vercel, AWS, etc) │
├─────────────────────────────────────────────────────────────┤
│                     ADAPTERS LAYER                          │
│  (The "which AI" part - Gemini, OpenAI, Claude, etc)       │
├─────────────────────────────────────────────────────────────┤
│                       CORE LAYER                            │
│  (The business logic - never changes regardless of         │
│   which platform or AI service you use)                    │
└─────────────────────────────────────────────────────────────┘
```

**Benefits:**
- **Switch platforms easily**: Going from Cloudflare to Vercel? Just use a different platform file. Core logic stays the same.
- **Switch AI providers easily**: Want to use OpenAI instead of Gemini? Create a new adapter. Core logic stays the same.
- **Easier testing**: You can test the core logic without needing a real AI service or platform.

---

## Getting Started

### Prerequisites

Before you begin, make sure you have:

1. **Node.js** (version 18 or higher)
   - Check your version: `node --version`
   - Download from: https://nodejs.org

2. **npm** (comes with Node.js)
   - Check your version: `npm --version`

3. **A code editor** (VS Code recommended)
   - Download from: https://code.visualstudio.com

### Get Your Free AI API Key

The API uses Google's Gemini AI, which has a generous free tier.

1. Go to **https://ai.google.dev**
2. Click **"Get API key in Google AI Studio"**
3. Sign in with your Google account
4. Click **"Create API Key"**
5. Copy the key (it looks like `AIzaSy...`)
6. **Keep this key secret!** Don't share it or commit it to GitHub.

### Installation

Open your terminal and run these commands:

```bash
# Navigate to the worker directory
cd worker

# Install the required packages
npm install
```

This will download all the tools and libraries needed to run the API.

---

## Running Locally

Before deploying to the cloud, you can run the API on your own computer for testing.

### Using Cloudflare's Local Development Server

```bash
# Start the local server
npm run dev
```

You should see something like:
```
⎔ Starting local server...
Ready on http://localhost:8787
```

**But wait!** The API needs your Gemini API key. For local development, create a file called `.dev.vars` in the `worker` folder:

```bash
# Create the secrets file (this file is ignored by git)
echo "GEMINI_API_KEY=your-api-key-here" > .dev.vars
```

Replace `your-api-key-here` with your actual API key.

Now restart the dev server (`npm run dev`) and the API will work!

### Using Vercel's Local Development Server

```bash
# Start Vercel's local server
npm run dev:vercel
```

For Vercel, create a `.env` file instead:

```bash
echo "GEMINI_API_KEY=your-api-key-here" > .env
```

---

## Deployment

You can deploy to either Cloudflare Workers or Vercel. Both have generous free tiers.

### Option A: Deploy to Cloudflare Workers

**Free tier:** 100,000 requests per day

#### Step 1: Create a Cloudflare Account

1. Go to https://dash.cloudflare.com/sign-up
2. Sign up for a free account
3. No credit card required!

#### Step 2: Log in via the Terminal

```bash
npx wrangler login
```

This will open your browser. Click "Allow" to authorize the connection.

#### Step 3: Add Your API Key as a Secret

Secrets are stored securely by Cloudflare (not in your code):

```bash
npx wrangler secret put GEMINI_API_KEY
```

When prompted, paste your Gemini API key and press Enter.

#### Step 4: Deploy!

```bash
npm run deploy
```

You should see:
```
Deployed puzzle-parser-api
https://puzzle-parser-api.your-subdomain.workers.dev
```

**That URL is your API!** Save it - you'll need it for the frontend app.

#### Viewing Logs

To see what's happening with your deployed API:

```bash
npm run tail
```

This shows you live logs as requests come in.

---

### Option B: Deploy to Vercel

**Free tier:** 100,000 requests per month

#### Step 1: Create a Vercel Account

1. Go to https://vercel.com/signup
2. Sign up (you can use your GitHub account)
3. No credit card required!

#### Step 2: Install Vercel CLI

```bash
npm install -g vercel
```

#### Step 3: Log in via the Terminal

```bash
vercel login
```

Follow the prompts to authenticate.

#### Step 4: Add Your API Key

```bash
vercel env add GEMINI_API_KEY
```

When prompted:
- Select all environments (Production, Preview, Development)
- Paste your API key

#### Step 5: Deploy!

```bash
npm run deploy:vercel
```

Follow the prompts. When done, you'll see:
```
Production: https://your-project.vercel.app
```

Your API endpoint is: `https://your-project.vercel.app/api/puzzle-parser`

---

## Testing the API

Once your API is running (locally or deployed), you can test it using these methods:

### Using curl (Command Line)

```bash
# Test with a simple text puzzle
curl -X POST http://localhost:8787 \
  -H "Content-Type: application/json" \
  -d '{
    "content": "3x3\nA B C\nD E F\nG H I\nCAT\nDOG",
    "contentType": "text",
    "mimeType": "text/plain"
  }'
```

### Using an API Testing Tool

Tools like **Postman** or **Insomnia** make testing easier:

1. Create a new POST request
2. URL: `http://localhost:8787` (or your deployed URL)
3. Body (JSON):
```json
{
  "content": "base64-encoded-image-data-here",
  "contentType": "image",
  "mimeType": "image/png"
}
```

### Expected Response

**Success:**
```json
{
  "success": true,
  "puzzleData": "10x10\nA B C D E F G H I J\n...\nHELLO\nWORLD",
  "message": "Parsed successfully using Google Gemini"
}
```

**Error:**
```json
{
  "success": false,
  "error": "Could not parse puzzle from the provided content",
  "details": "First line should be dimensions (e.g., \"10x10\"), got: \"invalid\""
}
```

---

## Debugging

### Common Issues and Solutions

#### "GEMINI_API_KEY not configured"

The API can't find your API key.

**For local development:**
- Make sure `.dev.vars` (Cloudflare) or `.env` (Vercel) exists
- Check the key is correct (no extra spaces)
- Restart the dev server

**For deployed version:**
- Re-run `npx wrangler secret put GEMINI_API_KEY` (Cloudflare)
- Re-run `vercel env add GEMINI_API_KEY` (Vercel)

#### "Gemini API error (400)"

The AI didn't understand the request.

- Make sure you're sending valid base64-encoded image data
- Check the mimeType matches the actual file type
- Try a clearer image

#### "Response too short"

The AI couldn't find a valid puzzle in the image.

- Make sure the image clearly shows the letter grid
- Make sure the words to find are visible
- Try a higher resolution image

### Viewing Logs

**Cloudflare Workers:**
```bash
# Live logs from deployed worker
npm run tail

# Or view in the Cloudflare dashboard:
# https://dash.cloudflare.com → Workers → Your Worker → Logs
```

**Vercel:**
```bash
# View logs in the Vercel dashboard:
# https://vercel.com → Your Project → Functions → Logs
```

### Local Debugging

Add console.log statements to see what's happening:

```typescript
platformConfig.log(`Received request: ${JSON.stringify(body)}`, 'info');
```

These will appear in your terminal when running `npm run dev`.

---

## Switching Platforms

This is where the clean architecture pays off!

### Currently Using Cloudflare, Want to Switch to Vercel?

1. The core logic (`src/core/`) stays exactly the same
2. The AI adapter (`src/adapters/`) stays exactly the same
3. Just deploy using the Vercel platform instead:

```bash
# Instead of:
npm run deploy

# Use:
npm run deploy:vercel
```

4. Update your frontend to use the new URL

### Want to Add AWS Lambda?

1. Create a new folder: `src/platforms/aws/`
2. Implement the platform adapter (similar to Cloudflare or Vercel)
3. The core logic stays the same!

### Want to Use a Different AI (OpenAI, Claude, etc.)?

1. Create a new adapter in `src/adapters/` (e.g., `openai-adapter.ts`)
2. Implement the `AIAdapter` interface
3. Update the platform file to use the new adapter
4. The core logic stays the same!

---

## Project Structure

```
worker/
├── src/
│   ├── core/                      # Platform-agnostic business logic
│   │   ├── index.ts               # Exports everything from core
│   │   ├── interfaces.ts          # TypeScript interfaces (contracts)
│   │   ├── prompts.ts             # AI prompts for puzzle extraction
│   │   └── puzzle-parser.ts       # Main parsing logic
│   │
│   ├── adapters/                  # AI service adapters
│   │   ├── index.ts               # Exports all adapters
│   │   └── gemini-adapter.ts      # Google Gemini implementation
│   │
│   └── platforms/                 # Platform-specific code
│       ├── cloudflare/
│       │   └── index.ts           # Cloudflare Workers entry point
│       └── vercel/
│           └── api/
│               └── puzzle-parser.ts  # Vercel Functions entry point
│
├── wrangler.toml                  # Cloudflare configuration
├── vercel.json                    # Vercel configuration
├── package.json                   # Dependencies and scripts
├── tsconfig.json                  # TypeScript configuration
└── README.md                      # This file!
```

---

## Troubleshooting

### "Cannot find module" errors

Run `npm install` to make sure all dependencies are installed.

### "wrangler: command not found"

Use `npx wrangler` instead of just `wrangler`, or install globally:
```bash
npm install -g wrangler
```

### API works locally but not when deployed

- Check that secrets are set in the deployment environment
- Check the Cloudflare/Vercel dashboard for error logs
- Make sure you're using the correct deployed URL

### Image parsing returns wrong results

- Try a clearer, higher-resolution image
- Make sure the entire puzzle is visible
- Avoid glare or shadows on the puzzle
- The AI works best with printed puzzles (not handwritten)

### CORS errors in the browser

The API includes CORS headers, but if you're still seeing errors:
- Make sure you're calling the correct URL
- Check that you're using POST, not GET
- For production, update the `Access-Control-Allow-Origin` header in the platform code

---

## Cost Considerations

### Google Gemini API

- **Free tier**: ~1000 requests per day
- **Paid**: ~$0.01 per image after free tier

### Cloudflare Workers

- **Free tier**: 100,000 requests per day
- **Paid**: $5/month for 10 million requests

### Vercel

- **Free tier**: 100,000 requests per month
- **Paid**: ~$20/month for more

**For most hobby projects, you'll stay well within the free tiers!**

---

## Next Steps

1. **Deploy the API** using either Cloudflare or Vercel
2. **Update the frontend** to use your new API URL
3. **Test with real puzzles** from newspapers, books, or online

Questions? Issues? Check the main project README or open an issue on GitHub.

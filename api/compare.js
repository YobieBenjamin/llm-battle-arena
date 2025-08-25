/**
 * Vercel Edge Function for LLM Battle Arena
 * Compares responses from Claude, ChatGPT, and Gemini in parallel
 */

export const config = {
  runtime: 'edge',
  regions: ['iad1'], // Deploy to US East by default
};

// Rate limiting map (stored in memory per edge instance)
const rateLimitMap = new Map();

// Clean up old entries every 5 minutes
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of rateLimitMap.entries()) {
    if (now - value.resetTime > 60000) { // 1 minute window
      rateLimitMap.delete(key);
    }
  }
}, 300000);

/**
 * Main handler function
 */
export default async function handler(request) {
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
  };

  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }

  // Only allow POST requests
  if (request.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed' }),
      { 
        status: 405, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }

  try {
    // Get client IP for rate limiting
    const clientIp = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';

    // Check rate limit (10 requests per minute per IP)
    if (!checkRateLimit(clientIp)) {
      return new Response(
        JSON.stringify({ error: 'Rate limit exceeded. Please wait before trying again.' }),
        { 
          status: 429, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Parse request body
    const body = await request.json();
    const { prompt, models = ['claude', 'openai', 'gemini'], maxTokens = 500 } = body;

    // Validate prompt
    if (!prompt || typeof prompt !== 'string') {
      return new Response(
        JSON.stringify({ error: 'Invalid prompt' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Validate prompt length
    if (prompt.length > 4000) {
      return new Response(
        JSON.stringify({ error: 'Prompt too long. Maximum 4000 characters.' }),
        { 
          status: 400, 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        }
      );
    }

    // Sanitize prompt (basic XSS protection)
    const sanitizedPrompt = sanitizeInput(prompt);

    // Get API keys from environment variables
    const apiKeys = {
      claude: process.env.CLAUDE_API_KEY,
      openai: process.env.OPENAI_API_KEY,
      gemini: process.env.GEMINI_API_KEY,
    };

    // Prepare parallel API calls
    const apiCalls = [];

    if (models.includes('claude') && apiKeys.claude) {
      apiCalls.push(callClaude(sanitizedPrompt, maxTokens, apiKeys.claude));
    }

    if (models.includes('openai') && apiKeys.openai) {
      apiCalls.push(callOpenAI(sanitizedPrompt, maxTokens, apiKeys.openai));
    }

    if (models.includes('gemini') && apiKeys.gemini) {
      apiCalls.push(callGemini(sanitizedPrompt, maxTokens, apiKeys.gemini));
    }

    // Execute all API calls in parallel
    const results = await Promise.allSettled(apiCalls);

    // Process results
    const formattedResults = {};
    let index = 0;

    if (models.includes('claude') && apiKeys.claude) {
      const result = results[index++];
      formattedResults.claude = result.status === 'fulfilled' 
        ? result.value 
        : { error: result.reason?.message || 'Claude API call failed', response: null, responseTime: 0, tokens: 0 };
    }

    if (models.includes('openai') && apiKeys.openai) {
      const result = results[index++];
      formattedResults.openai = result.status === 'fulfilled' 
        ? result.value 
        : { error: result.reason?.message || 'OpenAI API call failed', response: null, responseTime: 0, tokens: 0 };
    }

    if (models.includes('gemini') && apiKeys.gemini) {
      const result = results[index++];
      formattedResults.gemini = result.status === 'fulfilled' 
        ? result.value 
        : { error: result.reason?.message || 'Gemini API call failed', response: null, responseTime: 0, tokens: 0 };
    }

    // Return combined results
    return new Response(
      JSON.stringify({
        results: formattedResults,
        timestamp: new Date().toISOString(),
      }),
      { 
        status: 200, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );

  } catch (error) {
    console.error('Handler error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
}

/**
 * Rate limiting function
 */
function checkRateLimit(clientIp) {
  const now = Date.now();
  const limit = 10; // 10 requests per minute
  const window = 60000; // 1 minute in milliseconds

  if (!rateLimitMap.has(clientIp)) {
    rateLimitMap.set(clientIp, {
      count: 1,
      resetTime: now + window,
    });
    return true;
  }

  const clientData = rateLimitMap.get(clientIp);

  if (now > clientData.resetTime) {
    // Reset window
    clientData.count = 1;
    clientData.resetTime = now + window;
    return true;
  }

  if (clientData.count >= limit) {
    return false;
  }

  clientData.count++;
  return true;
}

/**
 * Sanitize user input
 */
function sanitizeInput(input) {
  return input
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .trim()
    .substring(0, 4000); // Enforce max length
}

/**
 * Call Claude API (Anthropic)
 */
async function callClaude(prompt, maxTokens, apiKey) {
  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout(
      'https://api.anthropic.com/v1/messages',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-3-sonnet-20240229',
          max_tokens: maxTokens,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        }),
      },
      15000 // 15 second timeout
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Claude API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    return {
      response: data.content[0].text,
      responseTime,
      tokens: data.usage?.output_tokens || estimateTokens(data.content[0].text),
      error: null,
    };
  } catch (error) {
    console.error('Claude API error:', error);
    return {
      response: null,
      responseTime: Date.now() - startTime,
      tokens: 0,
      error: error.message || 'Failed to call Claude API',
    };
  }
}

/**
 * Call OpenAI API (ChatGPT)
 */
async function callOpenAI(prompt, maxTokens, apiKey) {
  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout(
      'https://api.openai.com/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4-turbo-preview',
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
          max_tokens: maxTokens,
          temperature: 0.7,
        }),
      },
      15000 // 15 second timeout
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`OpenAI API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    return {
      response: data.choices[0].message.content,
      responseTime,
      tokens: data.usage?.completion_tokens || estimateTokens(data.choices[0].message.content),
      error: null,
    };
  } catch (error) {
    console.error('OpenAI API error:', error);
    return {
      response: null,
      responseTime: Date.now() - startTime,
      tokens: 0,
      error: error.message || 'Failed to call OpenAI API',
    };
  }
}

/**
 * Call Gemini API (Google)
 */
async function callGemini(prompt, maxTokens, apiKey) {
  const startTime = Date.now();

  try {
    const response = await fetchWithTimeout(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [
            {
              parts: [
                {
                  text: prompt,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: maxTokens,
            temperature: 0.7,
          },
        }),
      },
      15000 // 15 second timeout
    );

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Gemini API error: ${response.status} - ${error}`);
    }

    const data = await response.json();
    const responseTime = Date.now() - startTime;

    // Extract text from Gemini's response structure
    const responseText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    return {
      response: responseText,
      responseTime,
      tokens: estimateTokens(responseText),
      error: null,
    };
  } catch (error) {
    console.error('Gemini API error:', error);
    return {
      response: null,
      responseTime: Date.now() - startTime,
      tokens: 0,
      error: error.message || 'Failed to call Gemini API',
    };
  }
}

/**
 * Fetch with timeout
 */
async function fetchWithTimeout(url, options, timeout = 15000) {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    if (error.name === 'AbortError') {
      throw new Error('Request timeout');
    }
    throw error;
  }
}

/**
 * Estimate token count (rough approximation)
 */
function estimateTokens(text) {
  if (!text) return 0;
  // Rough estimate: ~4 characters per token
  return Math.ceil(text.length / 4);
}

/**
 * Retry logic for failed requests
 */
async function retryRequest(fn, retries = 2, delay = 1000) {
  try {
    return await fn();
  } catch (error) {
    if (retries === 0) {
      throw error;
    }
    
    await new Promise(resolve => setTimeout(resolve, delay));
    return retryRequest(fn, retries - 1, delay * 2); // Exponential backoff
  }
}
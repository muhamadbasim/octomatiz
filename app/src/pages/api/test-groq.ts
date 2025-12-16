import type { APIRoute } from 'astro';

export const prerender = false;

export const GET: APIRoute = async () => {
  const apiKey = import.meta.env.GROQ_API_KEY;
  
  if (!apiKey) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'GROQ_API_KEY tidak ditemukan di environment variables',
        keyExists: false,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Test API key dengan simple request
  try {
    const response = await fetch(
      'https://api.groq.com/openai/v1/chat/completions',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [{ role: 'user', content: 'Say "API key is valid" in Indonesian' }],
          max_tokens: 50,
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json();
      return new Response(
        JSON.stringify({
          success: false,
          message: `API error: ${response.status}`,
          error: errorData,
          keyExists: true,
          keyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
        }),
        {
          status: response.status,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const data = await response.json();
    const text = data.choices?.[0]?.message?.content || 'No response';

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Groq API key valid!',
        response: text,
        keyExists: true,
        keyPreview: `${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)}`,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Network error saat test API',
        error: String(error),
        keyExists: true,
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
};

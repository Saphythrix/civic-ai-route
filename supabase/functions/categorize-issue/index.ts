import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageUrl, description } = await req.json();
    
    const GEMINI_API_KEY = Deno.env.get('GOOGLE_GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GOOGLE_GEMINI_API_KEY is not set');
    }

    // First, fetch the image to convert to base64
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const imageBase64 = btoa(String.fromCharCode(...new Uint8Array(imageBuffer)));
    const mimeType = imageResponse.headers.get('content-type') || 'image/jpeg';

    const prompt = `Analyze this civic issue image and description to categorize it. 

Description: "${description}"

Based on the image and description, classify this civic issue into ONE of these categories:
- Pothole
- Streetlight Issue  
- Garbage
- Water Leakage
- Traffic Signal
- Road Damage
- Drainage
- Park Maintenance
- Other

Respond with ONLY the category name and a confidence score (0-100). Format: "Category: [CATEGORY], Confidence: [SCORE]"`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${GEMINI_API_KEY}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [
            { text: prompt },
            {
              inlineData: {
                mimeType: mimeType,
                data: imageBase64
              }
            }
          ]
        }],
        generationConfig: {
          temperature: 0.1,
          maxOutputTokens: 100,
        }
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Gemini API Error:', errorText);
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    // Parse the response to extract category and confidence
    const categoryMatch = generatedText.match(/Category:\s*([^,]+)/i);
    const confidenceMatch = generatedText.match(/Confidence:\s*(\d+)/i);

    const category = categoryMatch ? categoryMatch[1].trim() : 'Other';
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) : 50;

    console.log('AI Classification:', { category, confidence, rawResponse: generatedText });

    return new Response(JSON.stringify({ 
      category, 
      confidence,
      rawResponse: generatedText 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in categorize-issue function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      category: 'Other',
      confidence: 0 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
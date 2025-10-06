import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar Gemini con la API Key del servidor
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: NextRequest) {
  try {
    const { readingHistory, currentCheckouts, availableBooks } = await request.json();

    // Verificar que tenemos la API key
    if (!process.env.GEMINI_API_KEY) {
      console.error('❌ GEMINI_API_KEY no está configurada en el servidor');
      return NextResponse.json(getFallbackRecommendations(), { status: 200 });
    }

    // Obtener el modelo
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Crear un prompt conciso
    const prompt = `
Como bibliotecario experto, recomienda 3 libros basándote en:

HISTORIAL: ${readingHistory?.length > 0 ? readingHistory.slice(0, 5).join(', ') : 'Nuevo usuario'}
DISPONIBLES: ${availableBooks?.length > 0 ? availableBooks.slice(0, 20).join(', ') : 'Catálogo general'}

Responde SOLO con este JSON:
{
  "recommendations": [
    {"title": "Título", "author": "Autor", "reason": "Razón breve"}
  ]
}
`;

    console.log('🤖 Enviando prompt a Gemini desde servidor...');
    
    // Crear timeout de 30 segundos
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), 30000)
    );

    const generationPromise = model.generateContent(prompt);
    
    try {
      // Usar Promise.race para implementar timeout
      const result = await Promise.race([generationPromise, timeoutPromise]) as any;
      const response = await result.response;
      const text = response.text();

      console.log('✅ Respuesta de Gemini recibida en servidor');

      // Parsear la respuesta JSON
      try {
        const recommendations = JSON.parse(text.trim());
        return NextResponse.json(recommendations);
      } catch (parseError) {
        console.warn('⚠️ Error parsing Gemini response, usando fallback');
        return NextResponse.json(getFallbackRecommendations());
      }

    } catch (networkError) {
      console.error('❌ Error de red con Gemini:', networkError);
      
      // Intentar con fetch directo como respaldo
      try {
        const fetchResult = await generateWithFetch(prompt);
        return NextResponse.json(fetchResult);
      } catch (fetchError) {
        console.error('❌ También falló el fetch directo:', fetchError);
        return NextResponse.json(getFallbackRecommendations());
      }
    }

  } catch (error) {
    console.error('❌ Error general en API route:', error);
    return NextResponse.json(getFallbackRecommendations(), { status: 200 });
  }
}

// Función de respaldo con fetch directo
async function generateWithFetch(prompt: string) {
  const apiKey = process.env.GEMINI_API_KEY;
  
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7, maxOutputTokens: 512 }
      }),
      signal: AbortSignal.timeout(20000)
    }
  );

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
  
  return JSON.parse(text.trim());
}

// Función de recomendaciones de respaldo
function getFallbackRecommendations() {
  return {
    recommendations: [
      {
        title: "Cien años de soledad",
        author: "Gabriel García Márquez",
        reason: "Obra maestra de la literatura latinoamericana, perfecta para cualquier lector"
      },
      {
        title: "1984",
        author: "George Orwell", 
        reason: "Novela distópica esencial que sigue siendo relevante hoy"
      },
      {
        title: "El Principito",
        author: "Antoine de Saint-Exupéry",
        reason: "Historia universal que combina filosofía y simplicidad"
      }
    ]
  };
}
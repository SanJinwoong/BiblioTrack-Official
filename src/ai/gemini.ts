import { GoogleGenerativeAI } from '@google/generative-ai';

// Inicializar Gemini con la API Key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function generateBookRecommendations({
  readingHistory = [],
  currentCheckouts = [],
  availableBooks = []
}: {
  readingHistory?: string[];
  currentCheckouts?: string[];
  availableBooks?: string[];
}) {
  try {
    // Verificar que tenemos la API key
    if (!process.env.GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY no está configurada');
    }

    // Obtener el modelo (usando la versión más actualizada)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      generationConfig: {
        temperature: 0.7,
        topK: 40,
        topP: 0.95,
        maxOutputTokens: 1024,
      }
    });

    // Crear un prompt más conciso para evitar timeouts
    const prompt = `
Como bibliotecario experto, recomienda 3 libros basándote en:

HISTORIAL: ${readingHistory.length > 0 ? readingHistory.slice(0, 5).join(', ') : 'Nuevo usuario'}
DISPONIBLES: ${availableBooks.length > 0 ? availableBooks.slice(0, 20).join(', ') : 'Catálogo general'}

Responde SOLO con este JSON:
{
  "recommendations": [
    {"title": "Título", "author": "Autor", "reason": "Razón breve"}
  ]
}
`;

    console.log('🤖 Enviando prompt a Gemini...');
    
    // Configurar timeout de 30 segundos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 30000);

    try {
      // Generar respuesta con timeout
      const result = await model.generateContent(prompt);
      clearTimeout(timeoutId);
      
      const response = await result.response;
      const text = response.text();

      console.log('✅ Respuesta de Gemini recibida:', text.substring(0, 200) + '...');

      // Parsear la respuesta JSON
      try {
        const recommendations = JSON.parse(text.trim());
        return recommendations;
      } catch (parseError) {
        console.warn('⚠️ Error parsing Gemini response, usando fallback:', text);
        return getFallbackRecommendations();
      }

    } catch (networkError) {
      clearTimeout(timeoutId);
      console.error('❌ Error de red con Gemini:', networkError);
      throw networkError;
    }

  } catch (error) {
    console.error('❌ Error general en generateBookRecommendations:', error);
    
    // Respuesta de fallback inmediata
    return getFallbackRecommendations();
  }
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
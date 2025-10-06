// Implementación alternativa usando fetch directo a la API de Gemini
export async function generateBookRecommendationsFetch({
  readingHistory = [],
  currentCheckouts = [],
  availableBooks = []
}: {
  readingHistory?: string[];
  currentCheckouts?: string[];
  availableBooks?: string[];
}) {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY no está configurada');
    }

    const prompt = `
Como bibliotecario experto, recomienda 3 libros basándote en:

HISTORIAL: ${readingHistory.length > 0 ? readingHistory.slice(0, 5).join(', ') : 'Nuevo usuario'}

Responde SOLO con este JSON:
{
  "recommendations": [
    {"title": "Título", "author": "Autor", "reason": "Razón breve"}
  ]
}
`;

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{ text: prompt }]
          }],
          generationConfig: {
            temperature: 0.7,
            topK: 40,
            topP: 0.95,
            maxOutputTokens: 512,
          }
        }),
        signal: AbortSignal.timeout(20000) // 20 segundos timeout
      }
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    try {
      const recommendations = JSON.parse(text.trim());
      return recommendations;
    } catch (parseError) {
      console.warn('Error parsing response:', text);
      throw parseError;
    }

  } catch (error) {
    console.error('Error in fetch implementation:', error);
    throw error;
  }
}
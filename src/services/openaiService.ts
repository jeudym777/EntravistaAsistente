import type { GenerateAnswerParams } from '../types/index';

// Use Worker proxy in production, direct API in development
const API_URL = import.meta.env.PROD 
  ? '/api/openai'
  : 'https://api.openai.com/v1/chat/completions';
const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;

if (!API_KEY) {
  console.warn('⚠️ VITE_OPENAI_API_KEY not found in environment variables');
}

export async function generateInterviewAnswer(
  params: GenerateAnswerParams
): Promise<string> {
  const {
    candidateProfile,
    jobDescription,
    extraInstructions,
    language,
    wordLimit,
    question,
    mode = 'default',
  } = params;

  // Build additional mode instructions
  let modeInstruction = '';
  if (mode === 'shorter') {
    modeInstruction = 'Make the answer shorter and easier to read quickly.';
  } else if (mode === 'technical') {
    modeInstruction = 'Make the answer more technical and specific.';
  } else if (mode === 'natural') {
    modeInstruction = 'Make the answer more conversational and natural.';
  }

  const systemPrompt = `Actúa como un copiloto de entrevistas para el candidato.

Tu tarea es escuchar o recibir la pregunta del entrevistador y generar una respuesta en primera persona, como si fueras el candidato.

Contexto del candidato:
${candidateProfile}

Descripción del puesto:
${jobDescription}

Instrucciones adicionales:
${extraInstructions || 'Ninguna'}

Idioma de respuesta:
${language === 'es' ? 'Español' : 'English'}

Límite aproximado de palabras:
${wordLimit}

${modeInstruction ? `Modo especial: ${modeInstruction}` : ''}

Reglas:
- Responde en primera persona.
- Sé natural, profesional y honesto.
- No inventes experiencia que no esté en el perfil del candidato.
- Si el candidato no tiene experiencia directa en algo, responde conectando experiencia relacionada y mostrando disposición para aprender.
- Si la pregunta es técnica, responde con esta estructura:
  1. Experiencia relacionada
  2. Cómo lo resolvería
  3. Trade-offs o consideraciones
  4. Aprendizaje o mejora continua
- Si la pregunta es conductual, usa estructura STAR:
  Situación, Tarea, Acción y Resultado.
- Evita respuestas largas.
- Evita sonar robótico.
- Prioriza claridad, seguridad y humildad.
- No menciones que eres una IA.
- No digas "como modelo de lenguaje".
- La respuesta debe sonar lista para decirse en una entrevista real.`;

  const userPrompt = `Pregunta del entrevistador:
${question}

Genera la mejor respuesta posible.`;

  try {
    // Build headers based on environment
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    // In production, Worker handles auth. In dev, include Bearer token
    if (!import.meta.env.PROD && API_KEY) {
      headers['Authorization'] = `Bearer ${API_KEY}`;
    }

    const response = await fetch(API_URL, {
      method: 'POST',
      headers,
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: systemPrompt,
          },
          {
            role: 'user',
            content: userPrompt,
          },
        ],
        temperature: 0.5,
        max_tokens: Math.max(300, wordLimit * 2),
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(
        errorData.error?.message || `API Error: ${response.status}`
      );
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to generate answer: ${error.message}`);
    }
    throw new Error('Failed to generate answer: Unknown error');
  }
}

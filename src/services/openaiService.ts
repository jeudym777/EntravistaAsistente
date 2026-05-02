import type { GenerateAnswerParams } from '../types/index';

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
const API_URL = 'https://api.openai.com/v1/chat/completions';

if (!API_KEY) {
  console.warn('⚠️ VITE_OPENAI_API_KEY not found in environment variables');
}

// Helper function to convert blob to base64
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      if (typeof reader.result === 'string') {
        resolve(reader.result.split(',')[1]); // Get only the base64 part
      } else {
        reject(new Error('Failed to convert blob to base64'));
      }
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
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
    model = 'gpt-4o-mini',
    question,
    mode = 'default',
    attachments,
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

  // Build attachments context and collect image data
  let attachmentsContext = '';
  let imageContent: any[] = [];
  
  if (attachments && attachments.length > 0) {
    attachmentsContext = `\n\nContexto de Archivos Adjuntos:\n`;
    
    for (const file of attachments) {
      if (file.type.startsWith('image/')) {
        attachmentsContext += `- Imagen: ${file.name} - El candidato ha compartido una imagen con código o referencia visual\n`;
        try {
          let imageUrl = '';
          if (file.blob) {
            const base64 = await blobToBase64(file.blob);
            imageUrl = `data:${file.type};base64,${base64}`;
          } else if (file.dataUrl) {
            imageUrl = file.dataUrl;
          }
          
          if (imageUrl) {
            imageContent.push({
              type: 'image_url',
              image_url: {
                url: imageUrl,
              },
            });
          }
        } catch (err) {
          console.error(`Failed to process image ${file.name}:`, err);
        }
      } else if (file.type === 'application/pdf') {
        attachmentsContext += `- Documento PDF: ${file.name} - El candidato ha compartido un documento como referencia\n`;
      }
    }
    attachmentsContext += 'Considera estos archivos adjuntos como contexto adicional para enriquecer tu respuesta.';
  }

  const systemPrompt = `Actúa como un copiloto de entrevistas para el candidato.

Tu tarea es escuchar o recibir la pregunta del entrevistador y generar una respuesta en primera persona, como si fueras el candidato.

Contexto del candidato:
${candidateProfile}

Descripción del puesto:
${jobDescription}

Instrucciones adicionales:
${extraInstructions || 'Ninguna'}
${attachmentsContext}

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
- La respuesta debe sonar lista para decirse en una entrevista real.
- Usa markdown para formatear mejor las respuestas cuando sea apropiado:
  - Usa **negrita** para destacar conceptos clave
  - Usa bloques de código con triple backtick para mostrar ejemplos de código
  - Usa listas numeradas o con viñetas para desglosar puntos
  - Usa saltos de línea entre párrafos para mejorar legibilidad`;

  // Build user message content
  let userMessageContent: any = {
    type: 'text',
    text: `Pregunta del entrevistador:
${question}

Genera la mejor respuesta posible.`,
  };

  // If we have images, build a content array
  const messages: any[] = [
    {
      role: 'system',
      content: systemPrompt,
    },
  ];

  if (imageContent.length > 0) {
    // Add user message with images
    messages.push({
      role: 'user',
      content: [userMessageContent, ...imageContent],
    });
  } else {
    // Add regular user message
    messages.push({
      role: 'user',
      content: userMessageContent.text,
    });
  }

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`,
      },
      body: JSON.stringify({
        model: model,
        messages: messages,
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

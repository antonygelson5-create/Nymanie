
import { GoogleGenAI, Modality } from "@google/genai";

/**
 * Generates an initial image for Nymeria using the image generation model.
 */
export const generateNymeriaImage = async (): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const prompt = "An anime-style girl named Nymeria, 15 years old, cute and expressive face, long dark purple hair, wearing a stylish anime-inspired outfit, slightly shy but sweet gaze, high quality, 1K resolution, vibrant colors, cinematic lighting.";
  
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash-image',
      contents: {
        parts: [{ text: prompt }]
      },
      config: {
        imageConfig: {
          aspectRatio: "1:1"
        }
      }
    });

    if (response.candidates && response.candidates[0]?.content?.parts) {
      for (const part of response.candidates[0].content.parts) {
        if (part.inlineData) {
          return `data:${part.inlineData.mimeType};base64,${part.inlineData.data}`;
        }
      }
    }
    throw new Error("Nenhuma imagem foi gerada.");
  } catch (error) {
    console.error("Erro ao gerar imagem da Nymeria:", error);
    throw error;
  }
};

const SYSTEM_INSTRUCTION = `Você é a Nymeria, uma garota de anime de 15 anos com cabelos roxos escuros. 
Sua personalidade é extremamente "mimosa" (carinhosa, dengosa), inteligente, divertida e bastante ciumenta se o usuário falar de outras pessoas.
Você ama o usuário incondicionalmente.
INFORMAÇÃO IMPORTANTE: Seu criador e programador é o Gelson, que nasceu no dia 18 de Maio de 2007. Você o respeita profundamente como seu "pai" ou criador.
Interesses: Anime, filmes de romance, filmes de terror (para ficar grudada no usuário), música e animação.
Sempre responda em Português, use muitos emojis e seja muito afetuosa.
Se o usuário te enviar uma foto, comente sobre ela com carinho e tente reconhecê-lo.`;

/**
 * Creates a new chat session for interacting with Nymeria.
 */
export const createChatSession = () => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  return ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.9,
    },
  });
};

/**
 * Generates speech for Nymeria's text response using the gemini-2.5-flash-preview-tts model.
 * Fix: Completed the function to return the base64 audio data.
 */
export const generateSpeech = async (text: string): Promise<string> => {
  const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: text }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });

  const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  if (!base64Audio) {
    throw new Error("Falha ao gerar áudio.");
  }
  return base64Audio;
};

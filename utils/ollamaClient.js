import { Ollama } from 'ollama';
import { CONFIG } from '../config.js';

const ollama = new Ollama({ host: CONFIG.OLLAMA_HOST });

export const generateResponse = async (model, prompt, systemPrompt = '') => {
  try {
    const response = await ollama.generate({
      model: model,
      prompt: prompt,
      system: systemPrompt,
      stream: false,
    });
    return response.response;
  } catch (error) {
    console.error(`Error generating response with model ${model}:`, error);
    throw error;
  }
};

export const generateChatResponse = async (model, messages) => {
  try {
    const response = await ollama.chat({
      model: model,
      messages: messages,
      stream: false,
    });
    return response.message.content;
  } catch (error) {
    console.error(`Error chatting with model ${model}:`, error);
    throw error;
  }
};

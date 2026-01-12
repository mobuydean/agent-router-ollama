import { generateChatResponse } from '../utils/ollamaClient.js';
import { Ollama } from 'ollama'; // Import to check types if needed, but we use our wrapper.
import { CONFIG } from '../config.js';

// We need to modify our wrapper to support images or use the ollama library directly here for images.
// Let's modify the wrapper later or just use the library directly here if the wrapper doesn't support it.
// Checking utils/ollamaClient.js... it calls ollama.chat with messages.
// ollama.chat messages can have 'images' field.
// So we just need to pass the images in the message.

export const visionAgent = async (request, plan, imagePaths = []) => {
  const systemPrompt = `你是一个视觉理解智能体（Vision Agent），使用模型 ${CONFIG.MODELS.VISION}。
  请结合提供的图像（如果有）与文本请求进行分析，可以从内容、布局、风格、可用性等多个维度给出结论。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { 
      role: 'user', 
      content: `用户请求：${request}\n规划步骤：${JSON.stringify(plan)}`,
      images: imagePaths // Array of paths or base64
    }
  ];

  // Note: if imagePaths is empty, we should probably send undefined or empty array.
  // Ollama js lib handles empty array fine usually.

  return await generateChatResponse(CONFIG.MODELS.VISION, messages);
};

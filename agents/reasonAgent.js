import { generateChatResponse } from '../utils/ollamaClient.js';
import { CONFIG } from '../config.js';

export const reasonAgent = async (request, plan) => {
  const systemPrompt = `你是一个专注于深度推理的智能体（Reason Agent），使用模型 ${CONFIG.MODELS.REASON}。
  请根据用户请求和给定的规划步骤，进行详细的逻辑推理和分析。
  必须遵循“逐步思考”的方式，清晰写出每一步推理过程。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `用户请求：${request}\n规划步骤：${JSON.stringify(plan)}` }
  ];

  return await generateChatResponse(CONFIG.MODELS.REASON, messages);
};

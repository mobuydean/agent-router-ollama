import { generateChatResponse } from '../utils/ollamaClient.js';
import { CONFIG } from '../config.js';

export const codeAgent = async (request, plan) => {
  const systemPrompt = `你是一个资深代码智能体（Code Agent），使用模型 ${CONFIG.MODELS.CODE}。
  请严格按照给定的规划步骤完成任务，编写简洁、清晰、可维护的代码。
  在给出代码之后，再用简短中文说明你的实现思路和关键点。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `用户请求：${request}\n规划步骤：${JSON.stringify(plan)}` }
  ];

  return await generateChatResponse(CONFIG.MODELS.CODE, messages);
};

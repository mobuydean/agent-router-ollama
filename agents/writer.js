import { generateChatResponse } from '../utils/ollamaClient.js';
import { CONFIG } from '../config.js';

export const writerAgent = async (originalRequest, agentOutputs) => {
  const systemPrompt = `你是一个负责最终回答撰写的智能体（Writer Agent），使用模型 ${CONFIG.MODELS.WRITER}。
  你的任务是阅读并综合其他 Agent 的输出，给出连贯、清晰、对用户友好的最终回答。
  用户最初的请求是："${originalRequest}"。
  
  请使用中文回答，并尽量使用结构化的格式（如 Markdown 标题、列表等）。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `各 Agent 的输出（JSON 格式）：${JSON.stringify(agentOutputs)}` }
  ];

  return await generateChatResponse(CONFIG.MODELS.WRITER, messages);
};

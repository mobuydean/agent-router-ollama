import { generateChatResponse } from '../utils/ollamaClient.js';
import { CONFIG } from '../config.js';

export const plannerAgent = async (userRequest) => {
  const systemPrompt = `你是一个高层次的任务规划智能体（Planner Agent），负责分析用户请求，并决定应该由哪个专业 Agent 来处理。
  
  可用的 Agent 及职责说明（枚举值保持英文不变）：
  1. CODE_AGENT：用于代码相关任务，例如编写代码、调试、重构、技术架构设计等。
  2. REASON_AGENT：用于复杂推理任务，例如逻辑推演、高难度问题分析（使用 DeepSeek-R1）。
  3. VISION_AGENT：用于图像 / 界面 / 视觉相关任务，例如图片理解、UI/UX 分析等。
  4. TOOL_AGENT：用于执行本地 shell 命令，例如文件操作、系统信息查询等。
  
  你只允许输出一个 JSON 对象，格式严格如下（键名和枚举值请保持英文）：
  {
    "decision": "CODE_AGENT" | "REASON_AGENT" | "VISION_AGENT" | "TOOL_AGENT",
    "reasoning": "简要说明你为何选择该 Agent",
    "plan": ["步骤 1", "步骤 2"]
  }

  注意：如果 decision 是 TOOL_AGENT，"plan" 数组应该只包含一个字符串，即要执行的 shell 命令。`;

  const messages = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: userRequest }
  ];

  const response = await generateChatResponse(CONFIG.MODELS.PLANNER, messages);
  
  try {
    // Extract JSON from response in case the model adds extra text
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    return JSON.parse(jsonMatch ? jsonMatch[0] : response);
  } catch (e) {
    console.error("Failed to parse Planner response:", response);
    return { decision: "REASON_AGENT", reasoning: "Fallback due to parsing error", plan: [] };
  }
};

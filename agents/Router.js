import { plannerAgent } from './planner.js';
import { codeAgent } from './codeAgent.js';
import { reasonAgent } from './reasonAgent.js';
import { toolAgent } from './toolAgent.js';
import { visionAgent } from './visionAgent.js';
import { writerAgent } from './writer.js';

export class AgentRouter {
  async route(userRequest, imagePaths = []) {
    console.log('--- Agent Router 开始处理 ---');
    console.log(`用户请求: ${userRequest}`);

    // 1. Planner Step
    console.log('调用 Planner Agent...');
    const planResult = await plannerAgent(userRequest);
    console.log('Planner 决策结果:', planResult);

    const { decision, plan } = planResult;
    let agentOutput = '';
    let agentName = '';

    // 2. Specialized Agent Step
    switch (decision) {
      case 'CODE_AGENT':
        console.log('路由到 Code Agent...');
        agentName = 'Code Agent';
        agentOutput = await codeAgent(userRequest, plan);
        break;
      case 'REASON_AGENT':
        console.log('路由到 Reason Agent...');
        agentName = 'Reason Agent';
        agentOutput = await reasonAgent(userRequest, plan);
        break;
      case 'VISION_AGENT':
        console.log('路由到 Vision Agent...');
        agentName = 'Vision Agent';
        agentOutput = await visionAgent(userRequest, plan, imagePaths);
        break;
      case 'TOOL_AGENT':
        console.log('路由到 Tool Agent...');
        agentName = 'Tool Agent';
        agentOutput = await toolAgent(plan);
        break;
      default:
        console.log(`未知决策 "${decision}"，回退到 Reason Agent...`);
        agentName = 'Reason Agent (Fallback)';
        agentOutput = await reasonAgent(userRequest, plan);
        break;
    }

    console.log(`${agentName} 输出:`, agentOutput);

    // 3. Writer Step
    console.log('调用 Writer Agent...');
    const finalOutput = await writerAgent(userRequest, {
      plannerDecision: planResult,
      specializedAgent: agentName,
      content: agentOutput
    });

    console.log('--- Agent Router 处理完成 ---');
    return finalOutput;
  }
}

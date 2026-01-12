import readline from 'readline';
import { AgentRouter } from './agents/Router.js';

const router = new AgentRouter();

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('欢迎使用本地 Node.js Agent Router！');
console.log('请输入你的请求（输入 "exit" 退出）。');

const askQuestion = () => {
  rl.question('\n用户请求 > ', async (input) => {
    if (input.toLowerCase() === 'exit') {
      rl.close();
      return;
    }

    // Basic support for image paths in input (e.g., "Analyze this image: /path/to/img.jpg")
    // For now, we just pass the text. If we wanted to parse paths, we could do regex here.
    // Let's keep it simple: text only for the CLI loop unless we add a specific command.
    
    try {
      const response = await router.route(input);
      console.log('\n--- 最终回复 ---\n');
      console.log(response);
      console.log('\n----------------------\n');
    } catch (error) {
      console.error('Error processing request:', error);
    }

    askQuestion();
  });
};

askQuestion();

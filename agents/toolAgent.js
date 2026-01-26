import { execFile } from 'child_process';
import util from 'util';

const execFileAsync = util.promisify(execFile);

// Allow-list of safe commands
const ALLOWED_COMMANDS = new Set(['ls', 'pwd', 'echo', 'node', 'npm', 'cat', 'head', 'tail']);

export const toolAgent = async (plan) => {
  if (!plan || plan.length === 0) {
    return 'Tool Agent: No command provided in the plan.';
  }

  const commandString = plan[0];
  if (!commandString) {
    return 'Tool Agent: Empty command in the plan.';
  }

  // Parse the command string to handle quoted arguments
  const argsList = (commandString.match(/"[^"]+"|'[^']+'|\S+/g) || []).map(arg => {
    if ((arg.startsWith('"') && arg.endsWith('"')) || (arg.startsWith("'") && arg.endsWith("'"))) {
        return arg.slice(1, -1);
    }
    return arg;
  });
  const [command, ...args] = argsList;

  // Check the base command against the allow-list
  if (!command) {
    return 'Tool Agent: Empty command in the plan.';
  }
  if (!ALLOWED_COMMANDS.has(command)) {
    console.error(`Tool Agent: Command "${command}" is not in the allow-list.`);
    return `Error: Command "${command}" is not allowed for security reasons.`;
  }

  console.log(`Tool Agent executing command: ${command} with args: ${args.join(' ')}`);

  try {
    const { stdout, stderr } = await execFileAsync(command, args);

    if (stderr) {
      console.error(`Tool Agent stderr: ${stderr}`);
      return `STDOUT:\n${stdout}\n\nSTDERR:\n${stderr}`;
    }

    return `STDOUT:\n${stdout}`;
  } catch (error) {
    console.error(`Tool Agent execution error: ${error.message}`);
    return `Error executing command: ${error.message}`;
  }
};

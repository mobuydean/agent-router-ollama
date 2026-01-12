export const CONFIG = {
  MODELS: {
    PLANNER: 'qwen3:30b', // As per diagram, though user list didn't explicitly have it, the diagram did.
    WRITER: 'qwen3:8b',
    CODE: 'qwen3-coder:30b',
    REASON: 'deepseek-r1:70b',
    VISION: 'qwen3-vl:32b',
  },
  OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
};

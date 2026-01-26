# 本地 Node.js Agent Router（基于 Ollama）

本项目使用 **Node.js + Ollama**，在本地实现一个多智能体路由系统（Agent Router），可以把用户请求智能分发给不同能力的 Agent（代码、推理、视觉），再由 Writer 汇总输出结果。

目标场景：

- 本地隐私数据（代码、图片、业务逻辑）不出机
- 按任务类型自动选择不同大模型（Coder / Deep Reasoning / Vision）
- 适合作为你自己本地「Agent 系统」的脚手架或 Demo

---

## 特性一览

- 多 Agent 架构：
  - Planner（任务理解 + 路由决策）
  - Code Agent（代码生成 / 调试）
  - Reason Agent（复杂推理）
  - Vision Agent（图像 / UI 分析）
  - Tool-Calling Agent（执行本地 Shell 命令）
  - Writer（最终回答整合）
- **全流程中文提示词**：更适合中文场景下的行为控制。
- 纯本地部署：依赖本地 Ollama，模型和数据都在自己的机器上。
- 简单入口：目前提供 CLI 交互入口，方便快速试用和调试。

---

## 架构说明

整体调用流为：

> 用户请求 → AgentRouter → Planner → Decision  
> →（Code Agent / Reason Agent / Vision Agent） → Writer → 最终输出

各组件角色：

- **AgentRouter**
  - 项目入口与调度器
  - 接收用户请求，调用 Planner
  - 根据 Planner 的决策调用对应专业 Agent
  - 最后交给 Writer 生成最终文案

- **Planner（默认使用 `qwen3:30b` 或兼容模型）**
  - 理解用户请求
  - 给出一个简单的执行规划（plan）
  - 在 `CODE_AGENT / REASON_AGENT / VISION_AGENT` 中做决策

- **Code Agent（`qwen3-coder:30b`）**
  - 编写 / 修改 / 重构代码
  - 根据 Planner 规划输出可维护的代码和简要说明

- **Reason Agent（`deepseek-r1:70b`）**
  - 高成本、强推理模型
  - 用于复杂逻辑推理、系统性分析
  - 建议仅在需要非常复杂推理时启用

- **Vision Agent（`qwen3-vl:32b`）**
  - 负责图像、界面、视觉内容分析
  - 当前实现支持通过 `imagePaths` 传入本地图片路径

- **Tool-Calling Agent**
  - 负责执行本地 Shell 命令，例如文件操作、系统信息查询等。
  - 为安全起见，仅允许执行白名单内的命令（如 `ls`, `pwd`, `echo` 等）。

- **Writer（`qwen3:8b`）**
  - 汇总 Planner 和专业 Agent 的中间结果
  - 输出中文的最终回答，倾向于使用 Markdown 格式

---

## 前置条件

1. **本地安装并运行 Ollama**

   - 前往 https://ollama.com 下载并安装
   - 启动 Ollama 服务（默认：`http://localhost:11434`）

2. **准备模型（可按实际已安装模型调整 `config.js`）**

   默认配置使用以下模型（名称可以根据你本地实际情况修改）：

   ```bash
   ollama pull qwen3:8b          # Writer
   ollama pull qwen3:30b         # Planner（如无可用，可改为其他 Qwen3 大模型）
   ollama pull qwen3-coder:30b   # Code Agent
   ollama pull deepseek-r1:70b   # Reason Agent（高成本、慢推理）
   ollama pull qwen3-vl:32b      # Vision Agent
   ```

   模型名称配置在根目录的 [`config.js`](./config.js) 中：

   ```js
   export const CONFIG = {
     MODELS: {
       PLANNER: 'qwen3:30b',
       WRITER: 'qwen3:8b',
       CODE: 'qwen3-coder:30b',
       REASON: 'deepseek-r1:70b',
       VISION: 'qwen3-vl:32b',
     },
     OLLAMA_HOST: process.env.OLLAMA_HOST || 'http://localhost:11434',
   };
   ```

   如你本地模型名不同（例如只拉了 `qwen2` 系列），直接改这里即可。

---

## 快速开始（Quick Start）

### 1. 安装依赖

在项目根目录执行：

```bash
npm install
```

### 2. 配置 Ollama 地址（可选）

如果 Ollama 没跑在默认地址，可以通过环境变量指定：

```bash
export OLLAMA_HOST="http://your-host:11434"
```

`config.js` 会优先读取 `process.env.OLLAMA_HOST`。

### 3. 启动交互式 CLI

```bash
node index.js
```

你会看到类似输出：

```text
欢迎使用本地 Node.js Agent Router！
请输入你的请求（输入 "exit" 退出）。

用户请求 >
```

此时可以直接输入中文请求。

---

## 使用示例

在 CLI 中输入：

```text
用户请求 > 帮我写一个使用 Express 的简单 REST API，包括 GET /health
```

内部大致流程：

1. `AgentRouter` 接收你的请求。
2. `Planner`（使用 Qwen3 大模型）理解需求，给出 plan，并在
   `CODE_AGENT / REASON_AGENT / VISION_AGENT` 中选一个。
3. 如果是代码任务，路由到 `Code Agent`（`qwen3-coder:30b`）生成代码。
4. `Writer`（`qwen3:8b`）综合 Planner + Code Agent 输出，生成最终中文说明。

终端中会打印最终 Markdown 文本，你可以直接复制到编辑器或文档中使用。

---

## 项目结构

```text
.
├── agents
│   ├── Router.js        # 总路由器 / 编排器
│   ├── planner.js       # Planner Agent（路由决策）
│   ├── codeAgent.js     # Code Agent（代码生成 / 调试）
│   ├── reasonAgent.js   # Reason Agent（复杂推理）
│   ├── visionAgent.js   # Vision Agent（视觉分析）
│   ├── toolAgent.js     # Tool-Calling Agent（执行 Shell 命令）
│   └── writer.js        # Writer Agent（最终回答整合）
├── utils
│   └── ollamaClient.js  # Ollama JS SDK 简单封装
├── config.js            # 模型与服务配置
├── index.js             # CLI 入口
└── package.json
```

主要入口文件：

- CLI 入口：[`index.js`](./index.js)
- 路由器：[`agents/Router.js`](./agents/Router.js)
- Planner：[`agents/planner.js`](./agents/planner.js)
- Code Agent：[`agents/codeAgent.js`](./agents/codeAgent.js)
- Reason Agent：[`agents/reasonAgent.js`](./agents/reasonAgent.js)
- Vision Agent：[`agents/visionAgent.js`](./agents/visionAgent.js)
- Writer：[`agents/writer.js`](./agents/writer.js)
- Ollama 封装：[`utils/ollamaClient.js`](./utils/ollamaClient.js)

---

## 自定义与扩展

你可以在此基础上做很多扩展，例如：

- **增加更多 Agent**
  - Tool-Calling Agent（调用本地工具 / Shell）
  - RAG Agent（接入向量检索、知识库）
  - Web Agent（抓取网页再总结）

- **优化 Planner**
  - 增加更多决策维度（例如任务复杂度、是否涉及图片、是否需要调用工具）
  - 把 plan 拆得更细，传给 Code / Reason / Vision Agent 时信息更结构化

- **增加 HTTP / Web 接口**
  - 使用 Express / Koa 包装 `AgentRouter`，提供 RESTful API
  - 用前端页面调用该 API 做一个简单的 Agent UI

---

## 注意事项

- `deepseek-r1:70b`、`qwen3-coder:30b` 等大模型对显存和算力要求较高，请确保你的机器足够支撑。
- 所有请求默认走本地 Ollama，不依赖外网，但**首次拉取模型需要联网**。
- 当前项目主要作为本地 Agent 路由的 Demo / 起点，你可以根据自己场景裁剪和增强。

---


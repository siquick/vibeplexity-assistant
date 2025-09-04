# 🤖 Vibeplexity

**An intelligent, agentic AI assistant with multi-step reasoning capabilities**

Vibeplexity is an interactive CLI tool that combines web search, content fetching, and AI creativity through a sophisticated planning system. Ask any question and watch as it intelligently plans, executes tools, and synthesises comprehensive responses.

## ✨ Features

- 🧠 **Intelligent Planning**: AI plans the optimal approach for your query
- 🔍 **Web Search**: Real-time web search using the Exa API
- 📄 **URL Fetching**: Extract and analyse content from any webpage
- 🌸 **Creative Writing**: Generate haikus and creative content
- 🔄 **Interactive CLI**: Continuous conversation interface
- ⚡ **Fast & Efficient**: Built with Bun runtime for speed

## 🚀 Quick Start

### Prerequisites

- [Bun](https://bun.sh) runtime (v1.2.3 or later)
- [Google AI API key](https://aistudio.google.com/) or [OpenAI API key](https://platform.openai.com/)
- [Exa API key](https://exa.ai) for web search functionality

### Installation

```bash
# Clone and install dependencies
bun install

# Set up your API keys
export GOOGLE_GENERATIVE_AI_API_KEY="your_google_api_key"
export EXA_API_KEY="your_exa_api_key"
```

### Running Vibeplexity

```bash
# Start the interactive CLI
bun run cli

# Alternative ways to run
bun run dev
bun run index.ts
```

## 🎯 How It Works

Vibeplexity uses a **3-step agentic workflow**:

### 1. 🧠 **Planning Phase**
- AI analyses your query using Gemini 2.5 Flash
- Creates a structured plan with reasoning and tool selection
- Handles temporal queries (e.g., "latest", "today") intelligently

### 2. 🔧 **Execution Phase**
- Executes tools based on the plan:
  - **Web Search**: Multiple targeted queries for comprehensive coverage
  - **URL Fetching**: Extract content from specific URLs
  - **Haiku Generation**: Create poetry based on findings
- Robust error handling and retry mechanisms

### 3. 🎭 **Synthesis Phase**
- AI combines all gathered information
- Creates comprehensive, well-cited responses
- Provides accurate, engaging, and informative answers

## 💬 Example Interactions

```bash
🤖 Your query: What are the latest iPhone developments?

🧠 Planning... ✅
🔧 Executing tools... 🔍🔍🔍 ✅
🎭 Synthesising... ✅

🎉 RESPONSE:
The latest iPhone developments include the iPhone 17 announcement 
scheduled for September 9, 2025, featuring the ultra-slim iPhone 17 Air...
[Sources: CNN, 9to5Mac, Apple Insider]

🤖 Your query: Write a haiku about that

🧠 Planning... ✅
🔧 Executing tools... 🌸 ✅
🎭 Synthesising... ✅

🎉 RESPONSE:
Sleek glass and metal
Innovation in your palm
Future calls to you
```

## 🏗️ Architecture

```
src/
├── tools/
│   ├── web-search.ts      # Exa API integration for web search
│   ├── fetch-url.ts       # URL content extraction with Markdown conversion
│   ├── generate-haiku.ts  # AI-powered haiku generation
│   └── tool-definitions.ts# AI SDK tool wrappers
├── prompts/
│   └── planner.js         # Intelligent planning prompts and schemas
└── core/
    └── llm.ts             # Core AI model configurations
```

## 🔧 Configuration

### Required Environment Variables

```bash
# Google AI (recommended - faster and more reliable)
export GOOGLE_GENERATIVE_AI_API_KEY="your_google_api_key"

# Alternative: OpenAI
export OPENAI_API_KEY="your_openai_api_key"

# Web Search (required)
export EXA_API_KEY="your_exa_api_key"
```

### API Key Setup

1. **Google AI Studio**: Get your free API key at [aistudio.google.com](https://aistudio.google.com/)
2. **Exa Search**: Sign up at [exa.ai](https://exa.ai) for web search capabilities
3. **OpenAI** (optional): Alternative LLM provider at [platform.openai.com](https://platform.openai.com/)

## 🛠️ Tools & Capabilities

### 🔍 Web Search
- **Powered by**: Exa API
- **Features**: Neural search, content extraction, metadata
- **Use cases**: Latest news, research, current events

### 📄 URL Fetching  
- **Powered by**: @purepageio/fetch-engines
- **Features**: Smart fallback (fetch → browser), Markdown conversion
- **Use cases**: Article summaries, content analysis

### 🌸 Creative Generation
- **Powered by**: AI SDK with Gemini/OpenAI
- **Features**: Traditional haiku generation (5-7-5 pattern)
- **Use cases**: Poetry, creative writing, artistic expression

### 🧠 Intelligent Planning
- **Powered by**: Structured AI prompting with Zod schemas
- **Features**: Multi-step reasoning, temporal awareness, tool orchestration
- **Use cases**: Complex queries requiring multiple information sources

## 💡 Usage Tips

### Query Types That Work Well

- **Current Events**: "What's happening with [topic] today?"
- **Research**: "Explain [complex topic] with recent examples"
- **Analysis**: "Summarise this article: [URL] and find related news"
- **Creative**: "Write a haiku about [topic]"
- **Comparison**: "Compare [A] vs [B] using latest information"

### CLI Commands

- **Exit**: Type `exit`, `quit`, `bye`, `q`, or press `Ctrl+C`
- **Clear Screen**: The CLI automatically manages display
- **Error Recovery**: Failed queries don't crash the session

## 🔧 Technical Details

### Built With
- **Runtime**: [Bun](https://bun.sh) - Fast JavaScript runtime
- **AI SDK**: [Vercel AI SDK](https://sdk.vercel.ai/) - AI model integration
- **LLM**: Google Gemini 2.5 Flash (primary) / OpenAI GPT-4 (alternative)
- **Search**: [Exa API](https://exa.ai) - Neural web search
- **Content**: [@purepageio/fetch-engines](https://www.npmjs.com/package/@purepageio/fetch-engines) - URL fetching
- **TypeScript**: Strict type checking with Zod schemas

### Code Principles
- **Functional Programming**: Prefer pure functions and immutable data
- **UK English**: Consistent spelling (colour, initialise, etc.)
- **ESM Modules**: Modern JavaScript module system
- **Error Handling**: Comprehensive try-catch with user-friendly messages
- **Type Safety**: Strict TypeScript with runtime validation

## 🚀 Deployment

### Build for Production
```bash
bun run build
bun run start
```

### Environment Setup
```bash
# Create a .env file (optional)
echo "GOOGLE_GENERATIVE_AI_API_KEY=your_key" > .env
echo "EXA_API_KEY=your_key" >> .env
```

## 📄 License

Built with [Bun](https://bun.sh) v1.2.3+ and the [AI SDK](https://sdk.vercel.ai/). 

**Vibeplexity** - Where intelligence meets interaction. 🤖✨

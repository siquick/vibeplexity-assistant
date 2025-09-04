import { generateObject, generateText } from "ai";
import { openai } from "@ai-sdk/openai";
import { google } from "@ai-sdk/google";
import { createInterface } from "readline";
import { plannerSchema, plannerPrompt } from "./src/prompts/planner.js";
import { webSearch } from "./src/tools/web-search.js";
import { fetchUrl } from "./src/tools/fetch-url.js";
import { generateHaiku } from "./src/tools/generate-haiku.js";

/**
 * Multi-step agentic workflow:
 * 1. Plan the approach using an LLM
 * 2. Execute the planned tools
 * 3. Use an LLM to synthesise results and respond
 */
async function agenticWorkflow(userQuery: string, verbose: boolean = false) {
  if (verbose) {
    console.log("🎯 User Query:", userQuery);
    console.log("\n📋 Step 1: Planning approach...");
  } else {
    process.stdout.write("🧠 Planning... ");
  }

  // Step 1: Plan the approach
  const plan = await generateObject({
    // model: openai("gpt-4.1-mini"),
    model: google("gemini-2.5-flash"),
    schema: plannerSchema,
    prompt: plannerPrompt(userQuery),
  });

  if (verbose) {
    console.log("🧠 Plan:", plan.object);
    console.log("\n🔧 Step 2: Executing tools...");
  } else {
    process.stdout.write("✅\n🔧 Executing tools... ");
  }

  // Step 2: Execute tools based on plan
  const toolResults = [];

  for (const toolName of plan.object.tools) {
    const parameters = plan.object.parameters[toolName];

    if (toolName === "webSearch" && parameters) {
      for (const query of parameters) {
        if (verbose) {
          console.log(`🔍 Web searching: "${query}"`);
        } else {
          process.stdout.write("🔍");
        }
        try {
          const result = await webSearch(query);
          toolResults.push({
            tool: "webSearch",
            query,
            result: result.results.slice(0, 3), // Top 3 results
          });
        } catch (error) {
          if (verbose) {
            console.error(`❌ Web search failed for "${query}":`, error);
          }
          toolResults.push({
            tool: "webSearch",
            query,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    if (toolName === "fetchUrl" && parameters) {
      for (const url of parameters) {
        if (verbose) {
          console.log(`📄 Fetching URL: ${url}`);
        } else {
          process.stdout.write("📄");
        }
        try {
          const content = await fetchUrl(url);
          toolResults.push({
            tool: "fetchUrl",
            url,
            result: {
              content: content.substring(0, 2000), // Truncate for brevity
              contentLength: content.length,
            },
          });
        } catch (error) {
          if (verbose) {
            console.error(`❌ URL fetch failed for "${url}":`, error);
          }
          toolResults.push({
            tool: "fetchUrl",
            url,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }

    if (toolName === "generateHaiku" && parameters) {
      for (const prompt of parameters) {
        if (verbose) {
          console.log(`🌸 Generating haiku with prompt: "${prompt}"`);
        } else {
          process.stdout.write("🌸");
        }
        try {
          const haiku = await generateHaiku(prompt);
          toolResults.push({
            tool: "generateHaiku",
            prompt,
            result: haiku,
          });
        } catch (error) {
          if (verbose) {
            console.error(`❌ Haiku generation failed for "${prompt}":`, error);
          }
          toolResults.push({
            tool: "generateHaiku",
            prompt,
            error: error instanceof Error ? error.message : String(error),
          });
        }
      }
    }
  }

  if (verbose) {
    console.log("\n🎭 Step 3: Synthesising final response...");
  } else {
    process.stdout.write(" ✅\n🎭 Synthesising... ");
  }

  // Step 3: Synthesise results into final response
  const synthesisPrompt = `
You are tasked with providing a comprehensive response to the user's query based on the gathered information.



## PLANNING CONTEXT
**Reasoning**: ${plan.object.reasoning}
**Expected Workflow**: ${plan.object.expectedWorkflow}

## INSTRUCTIONS
1. Analyse all the gathered information
2. Provide a comprehensive, well-structured response to the user's query
3. If web search results were gathered, synthesise the key findings
4. If content was fetched from URLs, summarise the relevant points
5. If haikus were generated, present them beautifully
6. Be accurate, informative, and engaging
7. Cite sources when referencing web search results or fetched content

## ORIGINAL USER QUERY
${userQuery}

## GATHERED INFORMATION
${JSON.stringify(toolResults, null, 2)}

Provide your final response:`;

  const finalResponse = await generateText({
    model: openai("gpt-4.1-mini"),
    prompt: synthesisPrompt,
  });

  if (!verbose) {
    process.stdout.write("✅\n");
  }

  return {
    plan: plan.object,
    toolResults,
    response: finalResponse.text,
  };
}

/**
 * Display the welcome message and instructions
 */
function displayWelcome() {
  console.clear();
  console.log("🤖 " + "=".repeat(58));
  console.log("🤖  Orin - Agentic AI Assistant");
  console.log("🤖 " + "=".repeat(58));
  console.log("🌟 Ask me anything! I can:");
  console.log("   🔍 Search the web for latest information");
  console.log("   📄 Fetch and analyse content from URLs");
  console.log("   🌸 Generate creative haikus");
  console.log("");
  console.log("💡 Examples:");
  console.log("   • 'What are the latest AI developments?'");
  console.log("   • 'Summarise this article: https://example.com'");
  console.log("   • 'Write a haiku about technology'");
  console.log("");
  console.log("🚪 Type 'exit', 'quit', or Ctrl+C to exit");
  console.log("=".repeat(60));
  console.log("");
}

/**
 * Process user query and display response
 */
async function processQuery(userQuery: string): Promise<boolean> {
  // Check for exit commands
  const exitCommands = ["exit", "quit", "bye", "q"];
  if (exitCommands.includes(userQuery.toLowerCase().trim())) {
    return false;
  }

  if (userQuery.trim() === "") {
    console.log("💭 Please enter a query, or type 'exit' to quit.\n");
    return true;
  }

  try {
    const result = await agenticWorkflow(userQuery, false); // false = non-verbose mode

    console.log("\n" + "=".repeat(60));
    console.log("🎉 RESPONSE:");
    console.log("=".repeat(60));
    console.log(result.response);
    console.log("=".repeat(60));
    console.log("");

    return true;
  } catch (error) {
    console.error("\n❌ Error processing your query:", error instanceof Error ? error.message : String(error));
    console.log("🔄 Please try again with a different query.\n");
    return true;
  }
}

/**
 * Main CLI loop
 */
async function runCLI() {
  displayWelcome();

  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "🤖 Your query: ",
  });

  // Handle Ctrl+C gracefully
  rl.on("SIGINT", () => {
    console.log("\n\n👋 Thank you for using Orin! Goodbye!");
    rl.close();
    process.exit(0);
  });

  const askQuestion = () => {
    rl.prompt();
  };

  rl.on("line", async (input) => {
    const shouldContinue = await processQuery(input);

    if (!shouldContinue) {
      console.log("👋 Thank you for using Orin! Goodbye!");
      rl.close();
      process.exit(0);
    }

    askQuestion();
  });

  // Start the first prompt
  askQuestion();
}

// Start the CLI
runCLI().catch((error) => {
  console.error("❌ CLI Error:", error);
  process.exit(1);
});

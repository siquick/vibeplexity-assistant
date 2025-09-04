import { webSearch, simpleWebSearch } from "../src/tools/web-search.js";

/**
 * Example usage of the web search functionality
 * Make sure to set EXA_API_KEY environment variable before running
 */
async function exampleWebSearch() {
  try {
    console.log("🔍 Testing web search with Exa API...\n");

    // Example 1: Simple search with default options (5 results)
    console.log('1. Simple search for "Latest research in LLMs"');
    const simpleResults = await simpleWebSearch("Latest research in LLMs");

    console.log(`Found ${simpleResults.length} results:`);
    simpleResults.forEach((result, index) => {
      console.log(`${index + 1}. ${result.title}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Summary: ${result.summary?.substring(0, 100)}...`);
      console.log("");
    });

    // Example 2: Advanced search with custom options
    console.log("\n2. Advanced search with custom options");
    const advancedResults = await webSearch("AI agents and automation", {
      numResults: 3,
      searchType: "neural",
      text: true,
      highlights: true,
      summary: true,
      startPublishedDate: "2024-01-01",
    });

    console.log(`Found ${advancedResults.results.length} results:`);
    console.log(`Request ID: ${advancedResults.requestId}`);
    console.log(`Search Type: ${advancedResults.resolvedSearchType}`);
    console.log(`Cost: $${advancedResults.costDollars?.total || "N/A"}`);

    advancedResults.results.forEach((result, index) => {
      console.log(`\n${index + 1}. ${result.title}`);
      console.log(`   URL: ${result.url}`);
      console.log(`   Author: ${result.author || "N/A"}`);
      console.log(`   Published: ${result.publishedDate || "N/A"}`);
      if (result.highlights && result.highlights.length > 0) {
        console.log(`   Highlights: ${result.highlights[0]}`);
      }
    });
  } catch (error) {
    console.error("❌ Error during web search:", error);

    if (error instanceof Error && error.message.includes("EXA_API_KEY")) {
      console.log("\n💡 Make sure to set your EXA_API_KEY environment variable:");
      console.log('   export EXA_API_KEY="your-api-key-here"');
    }
  }
}

// Only run if this file is executed directly
if (import.meta.main) {
  exampleWebSearch();
}

export { exampleWebSearch };

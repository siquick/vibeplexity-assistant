import { z } from "zod";
import { tool } from "ai";
import { webSearch } from "./web-search.js";
import { fetchUrl } from "./fetch-url.js";
import { generateHaiku } from "./generate-haiku.js";

export const tools = {
  webSearch: tool({
    description: "Search the web for information using the Exa API",
    inputSchema: z.object({
      query: z.string().describe("The query to search the web for"),
    }),
    execute: async ({ query }) => {
      const results = await webSearch(query);
      return {
        results: results.results,
        requestId: results.requestId,
        searchType: results.resolvedSearchType,
        cost: results.costDollars?.total || 0,
      };
    },
  }),

  fetchUrl: tool({
    description: "Fetch the content of a URL and convert it to Markdown",
    inputSchema: z.object({
      url: z.string().describe("The URL to fetch"),
    }),
    execute: async ({ url }) => {
      const content = await fetchUrl(url);
      return {
        url,
        content,
        contentLength: content.length,
      };
    },
  }),

  generateHaiku: tool({
    description: "Generate a traditional haiku (5-7-5 syllable pattern) based on a given prompt",
    inputSchema: z.object({
      prompt: z.string().describe("The prompt to generate a haiku"),
    }),
    execute: async ({ prompt }) => {
      const haiku = await generateHaiku(prompt);
      return {
        prompt,
        haiku,
        syllablePattern: "5-7-5",
        generated: true,
      };
    },
  }),
};

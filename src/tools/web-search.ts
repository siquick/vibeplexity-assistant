import Exa from "exa-js";
import { z } from "zod";

// Environment variable validation
const ExaApiKeySchema = z.string().min(1, "EXA_API_KEY is required");

// Search options schema
const SearchOptionsSchema = z
  .object({
    numResults: z.number().min(1).max(100).default(5),
    searchType: z.enum(["neural", "keyword", "auto"]).default("auto"),
    text: z.boolean().default(true),
    highlights: z.boolean().default(true),
    summary: z.boolean().default(true),
    startPublishedDate: z.string().optional(),
    endPublishedDate: z.string().optional(),
    includeDomains: z.array(z.string()).optional(),
    excludeDomains: z.array(z.string()).optional(),
  })
  .optional();

// Result types
interface ExaSearchResult {
  title: string;
  url: string;
  id: string;
  text?: string;
  highlights?: string[];
  summary?: string;
  publishedDate?: string;
  author?: string;
  image?: string;
  favicon?: string;
}

interface WebSearchResponse {
  results: ExaSearchResult[];
  requestId: string;
  resolvedSearchType: string;
  costDollars?:
    | {
        total: number;
      }
    | undefined;
}

/**
 * Performs a web search using Exa API with 3-5 results
 * @param query - The search query string
 * @param options - Optional search configuration
 * @returns Promise<WebSearchResponse> - Search results with metadata
 */
export async function webSearch(
  query: string,
  options?: z.infer<typeof SearchOptionsSchema>
): Promise<WebSearchResponse> {
  try {
    // Validate inputs
    if (!query || query.trim().length === 0) {
      throw new Error("Search query cannot be empty");
    }

    // Get API key from environment
    const apiKey = ExaApiKeySchema.parse(process.env["EXA_API_KEY"]);

    // Parse and validate options
    const parsedOptions = options ? SearchOptionsSchema.parse(options) : null;

    // Ensure results are between 3-5 as requested
    const numResults = Math.min(Math.max(parsedOptions?.numResults || 5, 3), 5);

    // Initialize Exa client
    const exa = new Exa(apiKey);

    // Build search parameters
    const searchParams: any = {
      numResults,
      type: parsedOptions?.searchType || "auto",
      text: parsedOptions?.text !== false,
      highlights: parsedOptions?.highlights !== false,
      summary: parsedOptions?.summary !== false,
    };

    // Add optional parameters if they exist
    if (parsedOptions?.startPublishedDate) {
      searchParams.startPublishedDate = parsedOptions.startPublishedDate;
    }
    if (parsedOptions?.endPublishedDate) {
      searchParams.endPublishedDate = parsedOptions.endPublishedDate;
    }
    if (parsedOptions?.includeDomains) {
      searchParams.includeDomains = parsedOptions.includeDomains;
    }
    if (parsedOptions?.excludeDomains) {
      searchParams.excludeDomains = parsedOptions.excludeDomains;
    }

    // Perform search with content retrieval
    const response = await exa.searchAndContents(query, searchParams);

    return {
      results: response.results.map((result: any) => ({
        title: result.title,
        url: result.url,
        id: result.id,
        text: result.text,
        highlights: result.highlights,
        summary: result.summary,
        publishedDate: result.publishedDate,
        author: result.author,
        image: result.image,
        favicon: result.favicon,
      })),
      requestId: response.requestId,
      resolvedSearchType: parsedOptions?.searchType || "auto",
      costDollars: response.costDollars ? { total: response.costDollars.total } : undefined,
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Validation error: ${error.issues.map((e: any) => e.message).join(", ")}`);
    }

    if (error instanceof Error) {
      throw new Error(`Web search failed: ${error.message}`);
    }

    throw new Error("An unexpected error occurred during web search");
  }
}

/**
 * Simple wrapper for basic web search with default 5 results
 * @param query - The search query string
 * @returns Promise<ExaSearchResult[]> - Array of search results
 */
export async function simpleWebSearch(query: string): Promise<ExaSearchResult[]> {
  const response = await webSearch(query);
  return response.results;
}

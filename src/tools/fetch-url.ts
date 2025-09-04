import { HybridEngine } from "@purepageio/fetch-engines";

/**
 * Fetches a URL and returns its content as Markdown
 * Uses HybridEngine for robust fetching with fallback capabilities
 *
 * @param url - The URL to fetch
 * @returns Promise<string> - The content converted to Markdown
 * @throws Error - If the fetch operation fails
 */
export async function fetchUrl(url: string): Promise<string> {
  // Initialize HybridEngine with markdown conversion enabled
  const engine = new HybridEngine({
    markdown: true,
    // Add some retry configuration for robustness
    maxRetries: 2,
    retryDelay: 1000,
  });

  try {
    // Fetch the HTML content and convert to Markdown
    const result = await engine.fetchHTML(url);

    // Log any non-critical warnings
    if (result.error) {
      console.warn(`Non-critical error occurred while fetching ${url}: ${result.error.message}`);
    }

    // Return the Markdown content
    return result.content;
  } catch (error) {
    // Enhanced error handling
    if (error instanceof Error) {
      console.error(`Fetch error: ${error.message}`);

      // Check if it's a FetchError-like object with additional properties
      const fetchError = error as any;
      if (fetchError.code) {
        console.error(`Error Code: ${fetchError.code}`);
      }
      if (fetchError.statusCode) {
        console.error(`HTTP Status Code: ${fetchError.statusCode}`);
      }
      if (fetchError.originalError) {
        console.error(`Original Error: ${fetchError.originalError.name} - ${fetchError.originalError.message}`);
      }
    } else {
      console.error(`Unexpected error occurred: ${String(error)}`);
    }

    // Re-throw the error for the caller to handle
    throw error;
  } finally {
    // Always clean up resources
    await engine.cleanup();
  }
}

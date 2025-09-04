# Web Search with Exa API

This document explains how to use the web search functionality powered by Exa API.

## Installation

The `exa-js` package is already installed. If you need to install it manually:

```bash
bun add exa-js
```

## Setup

1. Get your API key from [Exa.ai](https://exa.ai)
2. Set your environment variable:

```bash
export EXA_API_KEY="your-api-key-here"
```

## Usage

### Simple Web Search

For basic searches with default settings (5 results):

```typescript
import { simpleWebSearch } from './src/tools/web-search.js';

const results = await simpleWebSearch('Latest research in LLMs');
console.log(results); // Array of ExaSearchResult[]
```

### Advanced Web Search

For more control over search parameters:

```typescript
import { webSearch } from './src/tools/web-search.js';

const response = await webSearch('AI agents and automation', {
  numResults: 4,           // 3-5 results (enforced)
  searchType: 'neural',    // 'neural', 'keyword', or 'auto'
  text: true,              // Include full text content
  highlights: true,        // Include highlights
  summary: true,           // Include AI-generated summary
  startPublishedDate: '2024-01-01',  // Filter by date
  includeDomains: ['arxiv.org'],     // Only these domains
  excludeDomains: ['reddit.com'],    // Exclude these domains
});

console.log(response.results);       // Array of results
console.log(response.requestId);     // Request tracking ID
console.log(response.costDollars);   // Cost information
```

## Response Format

### ExaSearchResult

```typescript
interface ExaSearchResult {
  title: string;           // Page title
  url: string;            // Page URL
  id: string;             // Exa's unique identifier
  text?: string;          // Full page content (if requested)
  highlights?: string[];  // Relevant excerpts
  summary?: string;       // AI-generated summary
  publishedDate?: string; // Publication date
  author?: string;        // Author information
  image?: string;         // Featured image URL
  favicon?: string;       // Site favicon URL
}
```

### WebSearchResponse

```typescript
interface WebSearchResponse {
  results: ExaSearchResult[];
  requestId: string;       // For tracking/debugging
  resolvedSearchType: string;  // Actual search type used
  costDollars?: {         // Cost information
    total: number;
  };
}
```

## Examples

See `examples/web-search-example.ts` for complete working examples.

## Error Handling

The functions include comprehensive error handling:

- **Missing API Key**: Clear error message with setup instructions
- **Validation Errors**: Detailed parameter validation using Zod
- **API Errors**: Wrapped with context for easier debugging
- **Network Issues**: Standard error handling with descriptive messages

## Features

- ✅ **3-5 Results**: Automatically enforces result count between 3-5
- ✅ **TypeScript Support**: Full type safety with Zod validation
- ✅ **Flexible Options**: Support for all Exa search parameters
- ✅ **Error Handling**: Comprehensive error messages and validation
- ✅ **Content Retrieval**: Automatic content, highlights, and summaries
- ✅ **Date Filtering**: Support for published date ranges
- ✅ **Domain Control**: Include/exclude specific domains

## Cost Management

Exa API charges per search and per content retrieval. The cost is returned in the response for tracking. Typical costs:

- Neural search (1-25 results): $0.005
- Content retrieval: $0.001 per page
- Highlights/Summary: $0.001 per page each

## Rate Limits

Exa API has rate limits. Consider implementing retry logic for production use.

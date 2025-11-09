# Requirements Document

## Introduction

This document specifies the requirements for a real-time meme coin data aggregation service that fetches, merges, and streams token data from multiple DEX sources. The system provides REST APIs for initial data retrieval and WebSocket connections for live updates, with intelligent caching to optimize performance and handle rate limits.

## Glossary

- **Aggregation Service**: The backend system that collects and merges token data from multiple DEX APIs
- **DEX API**: Decentralized Exchange Application Programming Interface (DexScreener, Jupiter, GeckoTerminal)
- **Token**: A cryptocurrency or meme coin with associated metadata (price, volume, market cap)
- **WebSocket Server**: The real-time bidirectional communication server that pushes live updates to connected clients
- **Cache Layer**: Redis-based storage system that temporarily stores API responses to reduce external API calls
- **Rate Limiter**: Component that enforces request frequency limits to comply with external API restrictions

## Requirements

### Requirement 1

**User Story:** As a frontend developer, I want to fetch an initial list of meme coin tokens from multiple DEX sources, so that I can display comprehensive market data to users

#### Acceptance Criteria

1. WHEN the REST API endpoint receives a request for token data, THE Aggregation Service SHALL fetch data from at least two DEX APIs (DexScreener and one other source)
2. WHEN duplicate tokens are detected across multiple DEX sources, THE Aggregation Service SHALL merge the token records using the token address as the unique identifier
3. THE Aggregation Service SHALL return token data including token_address, token_name, token_ticker, price_sol, market_cap_sol, volume_sol, liquidity_sol, transaction_count, price_1hr_change, and protocol
4. WHEN the Cache Layer contains valid data for a request, THE Aggregation Service SHALL return cached data without making external API calls
5. THE Aggregation Service SHALL support cursor-based pagination with configurable limit and next-cursor parameters

### Requirement 2

**User Story:** As a system administrator, I want the service to handle API rate limits gracefully, so that the service remains stable and compliant with external API restrictions

#### Acceptance Criteria

1. WHEN an external DEX API returns a rate limit error (HTTP 429), THE Rate Limiter SHALL implement exponential backoff with retry attempts
2. THE Rate Limiter SHALL enforce a maximum of 300 requests per minute to DexScreener API
3. IF the Rate Limiter detects approaching rate limit thresholds, THEN THE Aggregation Service SHALL prioritize serving data from the Cache Layer
4. WHEN retry attempts are exhausted, THE Aggregation Service SHALL return partial data from available sources with an appropriate status indicator
5. THE Aggregation Service SHALL log all rate limit events for monitoring purposes

### Requirement 3

**User Story:** As a frontend developer, I want to receive real-time price updates through WebSocket connections, so that users see live market changes without polling

#### Acceptance Criteria

1. THE WebSocket Server SHALL accept client connections and maintain active socket sessions
2. WHEN a client connects to the WebSocket Server, THE WebSocket Server SHALL send the initial token dataset
3. WHEN token price data changes by more than 1 percent, THE WebSocket Server SHALL broadcast the updated token data to all connected clients
4. WHEN token volume increases by more than 20 percent within a 5-minute window, THE WebSocket Server SHALL broadcast a volume spike notification to all connected clients
5. THE WebSocket Server SHALL handle client disconnections gracefully and clean up resources

### Requirement 4

**User Story:** As a frontend developer, I want to filter and sort token data by various metrics, so that users can find tokens matching their investment criteria

#### Acceptance Criteria

1. THE Aggregation Service SHALL support filtering tokens by time periods including 1h, 24h, and 7d price changes
2. THE Aggregation Service SHALL support sorting tokens by volume_sol, price_1hr_change, market_cap_sol, and liquidity_sol in ascending or descending order
3. WHEN a filter or sort parameter is applied, THE Aggregation Service SHALL return results from the Cache Layer without making new external API calls
4. THE Aggregation Service SHALL validate filter and sort parameters and return error messages for invalid inputs
5. THE Aggregation Service SHALL apply filters and sorting before pagination to ensure consistent results

### Requirement 5

**User Story:** As a system operator, I want configurable caching with time-to-live settings, so that I can balance data freshness with API call efficiency

#### Acceptance Criteria

1. THE Cache Layer SHALL store aggregated token data with a default TTL of 30 seconds
2. THE Cache Layer SHALL support configurable TTL values through environment variables
3. WHEN cached data expires, THE Aggregation Service SHALL fetch fresh data from DEX APIs and update the Cache Layer
4. THE Cache Layer SHALL use Redis as the storage backend with the ioredis client library
5. THE Cache Layer SHALL implement cache key strategies that support filtering and sorting without cache duplication

### Requirement 6

**User Story:** As a developer, I want comprehensive error handling and recovery mechanisms, so that the service remains resilient to external API failures

#### Acceptance Criteria

1. WHEN an external DEX API is unavailable, THE Aggregation Service SHALL continue serving data from other available sources
2. WHEN all external DEX APIs are unavailable, THE Aggregation Service SHALL return the most recent cached data with a staleness indicator
3. THE Aggregation Service SHALL log all errors with sufficient context for debugging including API endpoint, error type, and timestamp
4. WHEN the Cache Layer connection fails, THE Aggregation Service SHALL fall back to direct API calls and log the cache failure
5. THE Aggregation Service SHALL return appropriate HTTP status codes (500 for server errors, 503 for service unavailable, 429 for rate limits)

### Requirement 7

**User Story:** As a quality assurance engineer, I want the service to include automated tests, so that core functionality is verified and regressions are prevented

#### Acceptance Criteria

1. THE Aggregation Service SHALL include at least 10 unit and integration tests covering core functionality
2. THE Aggregation Service SHALL include tests for successful data aggregation from multiple sources
3. THE Aggregation Service SHALL include tests for rate limit handling and exponential backoff behavior
4. THE Aggregation Service SHALL include tests for WebSocket connection establishment and message broadcasting
5. THE Aggregation Service SHALL include tests for cache hit and cache miss scenarios

### Requirement 8

**User Story:** As a deployment engineer, I want the service to be deployable to free hosting platforms, so that the project can be demonstrated publicly without cost

#### Acceptance Criteria

1. THE Aggregation Service SHALL be containerized or configured for deployment to platforms such as Render, Railway, or Fly.io
2. THE Aggregation Service SHALL include environment variable configuration for API keys, Redis connection, and port settings
3. THE Aggregation Service SHALL include a README with deployment instructions and the public URL
4. THE Aggregation Service SHALL expose health check endpoints for monitoring service availability
5. THE Aggregation Service SHALL start successfully with default configuration values when optional environment variables are not provided

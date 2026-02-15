// ============================================
// Clash Intelligence Pro – CoC API Service
// ============================================
// Official Clash of Clans Public API (read-only)
// Supports: Player, Clan, War endpoints
// Features: Rate-limit safe retry, offline cache,
//           own Vercel serverless proxy (no CORS),
//           multi-account
// ============================================

// ─── API Base URL ──────────────────────────────────────
// Uses our own Vercel serverless proxy at /api/coc/
// This avoids all CORS issues — requests go to the same domain,
// and the serverless function adds the Bearer token server-side.
//
// In dev mode, Vite proxy can be configured, or you can use
// the env var to override.
const DEFAULT_BASE_URL = '/api/coc';

function getBaseUrl() {
  return import.meta.env.VITE_COC_API_BASE || DEFAULT_BASE_URL;
}

function getApiToken() {
  return import.meta.env.VITE_COC_API_TOKEN || '';
}

/**
 * Check if using our own serverless proxy (/api/coc).
 * When using our proxy, the token is added server-side —
 * no need to send it from the browser.
 */
function isUsingProxy() {
  const base = getBaseUrl().toLowerCase();
  return base.startsWith('/api/') || !base.includes('api.clashofclans.com');
}

// ─── Rate Limit State ──────────────────────────────────
let requestQueue = [];
let isProcessingQueue = false;
const MIN_REQUEST_INTERVAL = 200; // ms between requests
let lastRequestTime = 0;

// ─── Retry Config ──────────────────────────────────────
const MAX_RETRIES = 3;
const RETRY_DELAYS = [1000, 2000, 4000]; // exponential backoff

// ─── Cache Layer (memory + localStorage fallback) ──────
const memoryCache = new Map();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes for memory cache

function getCacheKey(endpoint) {
  return `coc_cache_${endpoint.replace(/[^a-zA-Z0-9]/g, '_')}`;
}

function setCache(endpoint, data) {
  const entry = { data, timestamp: Date.now() };
  memoryCache.set(endpoint, entry);

  // Also persist to localStorage for offline access
  try {
    localStorage.setItem(getCacheKey(endpoint), JSON.stringify(entry));
  } catch {
    // Storage full — silently fail
  }
}

function getCache(endpoint, maxAge = CACHE_TTL) {
  // Try memory cache first
  const memEntry = memoryCache.get(endpoint);
  if (memEntry && (Date.now() - memEntry.timestamp) < maxAge) {
    return memEntry.data;
  }

  // Fall back to localStorage (for offline)
  try {
    const stored = localStorage.getItem(getCacheKey(endpoint));
    if (stored) {
      const entry = JSON.parse(stored);
      if ((Date.now() - entry.timestamp) < maxAge) {
        memoryCache.set(endpoint, entry); // warm memory cache
        return entry.data;
      }
    }
  } catch {
    // Corrupted — ignore
  }

  return null;
}

function getOfflineCache(endpoint) {
  // Return cached data regardless of age (for offline mode)
  const memEntry = memoryCache.get(endpoint);
  if (memEntry) return memEntry.data;

  try {
    const stored = localStorage.getItem(getCacheKey(endpoint));
    if (stored) {
      const entry = JSON.parse(stored);
      return entry.data;
    }
  } catch {
    // nothing
  }

  return null;
}

// ─── Encode Player/Clan Tag ────────────────────────────
function encodeTag(tag) {
  // Ensure tag starts with # and is URL encoded
  let cleaned = tag.trim().toUpperCase();
  if (!cleaned.startsWith('#')) cleaned = '#' + cleaned;
  return encodeURIComponent(cleaned);
}

// ─── Core Fetch with Retry ─────────────────────────────
async function apiFetch(endpoint, options = {}) {
  const {
    useCache = true,
    cacheTTL = CACHE_TTL,
    offlineFallback = true,
  } = options;

  // Check cache first
  if (useCache) {
    const cached = getCache(endpoint, cacheTTL);
    if (cached) {
      return { data: cached, fromCache: true, timestamp: Date.now() };
    }
  }

  const url = `${getBaseUrl()}${endpoint}`;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    // Rate limiting — ensure minimum interval between requests
    const now = Date.now();
    const timeSinceLastRequest = now - lastRequestTime;
    if (timeSinceLastRequest < MIN_REQUEST_INTERVAL) {
      await sleep(MIN_REQUEST_INTERVAL - timeSinceLastRequest);
    }
    lastRequestTime = Date.now();

    try {
      const headers = {
        'Accept': 'application/json',
      };

      // Only send Authorization header when calling the official API directly.
      // CORS proxies (cocproxy.royaleapi.dev etc.) handle auth internally —
      // sending a random token causes them to reject the request.
      const token = getApiToken();
      if (token && !isUsingProxy()) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'GET',
        headers,
        signal: AbortSignal.timeout(15000), // 15s timeout
      });

      // Handle rate limiting
      if (response.status === 429) {
        const retryAfter = response.headers.get('Retry-After');
        const waitMs = retryAfter
          ? parseInt(retryAfter, 10) * 1000
          : RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)];
        console.warn(`[CoC API] Rate limited. Waiting ${waitMs}ms...`);
        await sleep(waitMs);
        continue;
      }

      // Handle maintenance
      if (response.status === 503) {
        console.warn('[CoC API] Service unavailable (maintenance?)');
        if (offlineFallback) {
          const offline = getOfflineCache(endpoint);
          if (offline) {
            return { data: offline, fromCache: true, offline: true, timestamp: Date.now() };
          }
        }
        throw new ApiError('Clash of Clans API is under maintenance', 503);
      }

      // Handle not found
      if (response.status === 404) {
        throw new ApiError('Player or clan not found. Check the tag.', 404);
      }

      // Handle auth errors
      if (response.status === 403) {
        throw new ApiError(
          isUsingProxy()
            ? 'CORS proxy rejected the request. The proxy may be down — try again later.'
            : 'API token is invalid or IP not whitelisted. Create a token at developer.clashofclans.com.',
          403
        );
      }

      if (!response.ok) {
        throw new ApiError(`API error: ${response.status}`, response.status);
      }

      const data = await response.json();

      // Cache successful response
      if (useCache) {
        setCache(endpoint, data);
      }

      return { data, fromCache: false, timestamp: Date.now() };

    } catch (error) {
      if (error instanceof ApiError) {
        // Don't retry client errors (404, 403)
        if (error.status === 404 || error.status === 403) throw error;
      }

      if (error.name === 'AbortError' || error.name === 'TimeoutError') {
        console.warn(`[CoC API] Request timeout (attempt ${attempt + 1})`);
      } else if (error.message?.includes('fetch')) {
        console.warn(`[CoC API] Network error (attempt ${attempt + 1})`);
      }

      // Last attempt — try offline fallback
      if (attempt === MAX_RETRIES) {
        if (offlineFallback) {
          const offline = getOfflineCache(endpoint);
          if (offline) {
            return { data: offline, fromCache: true, offline: true, timestamp: Date.now() };
          }
        }
        throw error instanceof ApiError ? error : new ApiError(error.message || 'Network error', 0);
      }

      await sleep(RETRY_DELAYS[Math.min(attempt, RETRY_DELAYS.length - 1)]);
    }
  }
}

// ─── Custom Error Class ────────────────────────────────
class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
  }
}

// ─── Helper ────────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Public API ────────────────────────────────────────
export const apiService = {
  // ── Player Endpoints ───────────────────────────────
  /**
   * Get player profile by tag
   * @param {string} tag - Player tag (e.g., "#ABC123")
   */
  async getPlayer(tag) {
    const encoded = encodeTag(tag);
    const result = await apiFetch(`/players/${encoded}`);
    return result;
  },

  /**
   * Verify player tag is valid (lightweight check)
   */
  async verifyPlayer(tag) {
    try {
      const result = await this.getPlayer(tag);
      return { valid: true, name: result.data.name, tag: result.data.tag };
    } catch (error) {
      return { valid: false, error: error.message };
    }
  },

  /**
   * Verify in-game API token for a player (ownership proof).
   * Uses POST /players/{tag}/verifytoken endpoint.
   * The game token is the short code from: Game Settings → More Settings → API Token.
   * @param {string} tag - Player tag (e.g., "#CP2Y00GQ")
   * @param {string} gameToken - In-game verification token (e.g., "y26gxtzf")
   * @returns {{ verified: boolean, status?: string, error?: string }}
   */
  async verifyPlayerToken(tag, gameToken) {
    const encoded = encodeTag(tag);
    const url = `${getBaseUrl()}/players/${encoded}/verifytoken`;

    try {
      const headers = {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      };

      // Add developer token for direct API calls
      const token = getApiToken();
      if (token && !isUsingProxy()) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({ token: gameToken }),
        signal: AbortSignal.timeout(15000),
      });

      if (!response.ok) {
        if (response.status === 404) {
          return { verified: false, error: 'Player not found. Check your tag.' };
        }
        if (response.status === 403) {
          return { verified: false, error: 'Token verification not available through proxy.' };
        }
        return { verified: false, error: `Verification failed (${response.status})` };
      }

      const data = await response.json();
      return {
        verified: data.status === 'ok',
        status: data.status,
        error: data.status !== 'ok' ? 'Token does not match this player.' : undefined,
      };
    } catch (error) {
      // If proxy doesn't support POST, fail gracefully
      return { verified: false, error: 'Token verification unavailable. Proceeding with tag only.' };
    }
  },

  // ── Clan Endpoints ─────────────────────────────────
  /**
   * Get clan details by tag
   * @param {string} tag - Clan tag (e.g., "#XYZ789")
   */
  async getClan(tag) {
    const encoded = encodeTag(tag);
    const result = await apiFetch(`/clans/${encoded}`);
    return result;
  },

  /**
   * Get clan members
   */
  async getClanMembers(tag) {
    const encoded = encodeTag(tag);
    const result = await apiFetch(`/clans/${encoded}/members`);
    return result;
  },

  /**
   * Get current clan war (if public war log)
   */
  async getClanWar(tag) {
    const encoded = encodeTag(tag);
    try {
      const result = await apiFetch(`/clans/${encoded}/currentwar`, {
        cacheTTL: 2 * 60 * 1000, // 2 min cache for war data
      });
      return result;
    } catch (error) {
      // War log may be private
      if (error.status === 403) {
        return { data: null, privateWarLog: true };
      }
      throw error;
    }
  },

  /**
   * Get clan war log
   */
  async getClanWarLog(tag) {
    const encoded = encodeTag(tag);
    try {
      const result = await apiFetch(`/clans/${encoded}/warlog`, {
        cacheTTL: 10 * 60 * 1000, // 10 min cache
      });
      return result;
    } catch (error) {
      if (error.status === 403) {
        return { data: { items: [] }, privateWarLog: true };
      }
      throw error;
    }
  },

  /**
   * Search clans by name
   */
  async searchClans(name, params = {}) {
    const queryParams = new URLSearchParams({
      name,
      limit: params.limit || 10,
      ...(params.minMembers && { minMembers: params.minMembers }),
      ...(params.maxMembers && { maxMembers: params.maxMembers }),
      ...(params.minClanLevel && { minClanLevel: params.minClanLevel }),
    });
    const result = await apiFetch(`/clans?${queryParams.toString()}`, {
      cacheTTL: 60 * 1000, // 1 min
    });
    return result;
  },

  // ── League Endpoints ───────────────────────────────
  /**
   * Get league info
   */
  async getLeagues() {
    const result = await apiFetch('/leagues', {
      cacheTTL: 24 * 60 * 60 * 1000, // 24h — rarely changes
    });
    return result;
  },

  /**
   * Get war leagues
   */
  async getWarLeagues() {
    const result = await apiFetch('/warleagues', {
      cacheTTL: 24 * 60 * 60 * 1000,
    });
    return result;
  },

  // ── CWL Endpoints ──────────────────────────────────
  /**
   * Get CWL group
   */
  async getCWLGroup(clanTag) {
    const encoded = encodeTag(clanTag);
    try {
      const result = await apiFetch(`/clans/${encoded}/currentwar/leaguegroup`, {
        cacheTTL: 5 * 60 * 1000,
      });
      return result;
    } catch (error) {
      return { data: null, error: error.message };
    }
  },

  // ── Utility ────────────────────────────────────────
  /**
   * Fetch all data for a player (player + clan + war) in parallel
   * Used by SyncScreen for initial data load
   */
  async fetchAllPlayerData(playerTag) {
    const results = {
      player: null,
      clan: null,
      war: null,
      errors: [],
      fromCache: false,
      timestamp: Date.now(),
    };

    // Always fetch player first
    try {
      const playerResult = await this.getPlayer(playerTag);
      results.player = playerResult.data;
      results.fromCache = playerResult.fromCache;
    } catch (error) {
      results.errors.push({ type: 'player', error: error.message });
      return results; // Can't continue without player data
    }

    // Fetch clan + war in parallel if player has a clan
    const clanTag = results.player?.clan?.tag;
    if (clanTag) {
      const [clanResult, warResult] = await Promise.allSettled([
        this.getClan(clanTag),
        this.getClanWar(clanTag),
      ]);

      if (clanResult.status === 'fulfilled') {
        results.clan = clanResult.value.data;
      } else {
        results.errors.push({ type: 'clan', error: clanResult.reason?.message });
      }

      if (warResult.status === 'fulfilled') {
        results.war = warResult.value.data;
      } else {
        results.errors.push({ type: 'war', error: warResult.reason?.message });
      }
    }

    return results;
  },

  /**
   * Check if API / proxy is configured and ready to use.
   * When using a CORS proxy, no token is needed — always ready.
   */
  isConfigured() {
    if (isUsingProxy()) return true;        // proxy handles auth
    const token = getApiToken();
    return Boolean(token && token !== 'your_coc_api_token_here');
  },

  /**
   * Clear all caches
   */
  clearCache() {
    memoryCache.clear();
    // Clear localStorage cache entries
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith('coc_cache_')) {
        localStorage.removeItem(key);
      }
    });
  },

  /**
   * Get last synced timestamp for an endpoint
   */
  getLastSyncTime(endpoint) {
    const entry = memoryCache.get(endpoint);
    if (entry) return entry.timestamp;

    try {
      const stored = localStorage.getItem(getCacheKey(endpoint));
      if (stored) return JSON.parse(stored).timestamp;
    } catch {
      // nothing
    }
    return null;
  },

  // Expose error class
  ApiError,
};

export default apiService;

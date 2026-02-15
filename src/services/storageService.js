// ============================================
// Clash Intelligence Pro – Storage Service
// ============================================
// Abstraction over LocalStorage + IndexedDB
//   - LocalStorage: settings, accounts, small state
//   - IndexedDB: snapshots, player history, large data
// Features: multi-account, snapshots, offline cache
// ============================================
import { openDB } from 'idb';

// ─── IndexedDB Setup ───────────────────────────────────
const DB_NAME = 'ClashIntelPro';
const DB_VERSION = 1;

const STORES = {
  SNAPSHOTS: 'snapshots',
  PLAYER_HISTORY: 'playerHistory',
  CLAN_HISTORY: 'clanHistory',
  WAR_HISTORY: 'warHistory',
  AI_CACHE: 'aiCache',
};

let dbPromise = null;

function getDB() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Snapshots store — keyed by tag + timestamp
        if (!db.objectStoreNames.contains(STORES.SNAPSHOTS)) {
          const snapStore = db.createObjectStore(STORES.SNAPSHOTS, {
            keyPath: 'id',
            autoIncrement: true,
          });
          snapStore.createIndex('tag', 'tag', { unique: false });
          snapStore.createIndex('timestamp', 'timestamp', { unique: false });
          snapStore.createIndex('tag_timestamp', ['tag', 'timestamp'], { unique: false });
        }

        // Player history — time series data
        if (!db.objectStoreNames.contains(STORES.PLAYER_HISTORY)) {
          const playerStore = db.createObjectStore(STORES.PLAYER_HISTORY, {
            keyPath: 'id',
            autoIncrement: true,
          });
          playerStore.createIndex('tag', 'tag', { unique: false });
          playerStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Clan history
        if (!db.objectStoreNames.contains(STORES.CLAN_HISTORY)) {
          const clanStore = db.createObjectStore(STORES.CLAN_HISTORY, {
            keyPath: 'id',
            autoIncrement: true,
          });
          clanStore.createIndex('tag', 'tag', { unique: false });
          clanStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // War history
        if (!db.objectStoreNames.contains(STORES.WAR_HISTORY)) {
          const warStore = db.createObjectStore(STORES.WAR_HISTORY, {
            keyPath: 'id',
            autoIncrement: true,
          });
          warStore.createIndex('clanTag', 'clanTag', { unique: false });
          warStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // AI response cache
        if (!db.objectStoreNames.contains(STORES.AI_CACHE)) {
          const aiStore = db.createObjectStore(STORES.AI_CACHE, {
            keyPath: 'key',
          });
          aiStore.createIndex('timestamp', 'timestamp', { unique: false });
        }
      },
    });
  }
  return dbPromise;
}

// ─── LocalStorage Helpers ──────────────────────────────
const LS_PREFIX = 'clash_intel_';

function lsKey(key) {
  return `${LS_PREFIX}${key}`;
}

// ─── Public API ────────────────────────────────────────
export const storageService = {
  // ══════════════════════════════════════════════════
  // LocalStorage (synchronous, small data)
  // ══════════════════════════════════════════════════

  /**
   * Get a value from LocalStorage
   */
  get(key) {
    try {
      const raw = localStorage.getItem(lsKey(key));
      if (raw === null) return null;
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  /**
   * Set a value in LocalStorage
   */
  set(key, value) {
    try {
      localStorage.setItem(lsKey(key), JSON.stringify(value));
      return true;
    } catch {
      console.warn('[Storage] LocalStorage write failed for:', key);
      return false;
    }
  },

  /**
   * Remove a key from LocalStorage
   */
  remove(key) {
    try {
      localStorage.removeItem(lsKey(key));
    } catch {
      // silent
    }
  },

  /**
   * Check if a key exists
   */
  has(key) {
    return localStorage.getItem(lsKey(key)) !== null;
  },

  // ══════════════════════════════════════════════════
  // Account Management (LocalStorage)
  // ══════════════════════════════════════════════════

  /**
   * Get all saved accounts
   * @returns {Array<{tag: string, name: string, th: number, mode: string, lastSync: number}>}
   */
  getAccounts() {
    return this.get('accounts') || [];
  },

  /**
   * Save / update an account
   */
  saveAccount(account) {
    const accounts = this.getAccounts();
    const idx = accounts.findIndex((a) => a.tag === account.tag);
    if (idx >= 0) {
      accounts[idx] = { ...accounts[idx], ...account, lastSync: Date.now() };
    } else {
      accounts.push({ ...account, lastSync: Date.now() });
    }
    this.set('accounts', accounts);
    return accounts;
  },

  /**
   * Remove an account and its data
   */
  async removeAccount(tag) {
    const accounts = this.getAccounts().filter((a) => a.tag !== tag);
    this.set('accounts', accounts);

    // Clear IndexedDB data for this account
    await this.clearPlayerHistory(tag);
    await this.clearSnapshots(tag);

    // If active account was removed, clear it
    if (this.get('activeAccount') === tag) {
      this.remove('activeAccount');
    }

    return accounts;
  },

  /**
   * Get active account tag
   */
  getActiveAccount() {
    return this.get('activeAccount');
  },

  /**
   * Set active account
   */
  setActiveAccount(tag) {
    this.set('activeAccount', tag);
  },

  // ══════════════════════════════════════════════════
  // Snapshots (IndexedDB)
  // ══════════════════════════════════════════════════

  /**
   * Save a full player data snapshot
   */
  async saveSnapshot(tag, playerData, clanData = null, warData = null) {
    const db = await getDB();
    const snapshot = {
      tag,
      timestamp: Date.now(),
      playerData,
      clanData,
      warData,
      label: `Snapshot ${new Date().toLocaleDateString()} ${new Date().toLocaleTimeString()}`,
    };
    const id = await db.add(STORES.SNAPSHOTS, snapshot);
    return { ...snapshot, id };
  },

  /**
   * Get all snapshots for a player tag
   */
  async getSnapshots(tag) {
    const db = await getDB();
    const index = db.transaction(STORES.SNAPSHOTS).store.index('tag');
    const snapshots = await index.getAll(tag);
    return snapshots.sort((a, b) => b.timestamp - a.timestamp);
  },

  /**
   * Get the latest snapshot for a player
   */
  async getLatestSnapshot(tag) {
    const snapshots = await this.getSnapshots(tag);
    return snapshots[0] || null;
  },

  /**
   * Delete a specific snapshot
   */
  async deleteSnapshot(id) {
    const db = await getDB();
    await db.delete(STORES.SNAPSHOTS, id);
  },

  /**
   * Clear all snapshots for a tag
   */
  async clearSnapshots(tag) {
    const db = await getDB();
    const tx = db.transaction(STORES.SNAPSHOTS, 'readwrite');
    const index = tx.store.index('tag');
    let cursor = await index.openCursor(tag);
    while (cursor) {
      cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  },

  // ══════════════════════════════════════════════════
  // Player History (IndexedDB – time series)
  // ══════════════════════════════════════════════════

  /**
   * Record a player data point (for trend graphs)
   */
  async recordPlayerDataPoint(tag, dataPoint) {
    const db = await getDB();
    const record = {
      tag,
      timestamp: Date.now(),
      trophies: dataPoint.trophies || 0,
      bestTrophies: dataPoint.bestTrophies || 0,
      warStars: dataPoint.warStars || 0,
      attackWins: dataPoint.attackWins || 0,
      defenseWins: dataPoint.defenseWins || 0,
      donations: dataPoint.donations || 0,
      donationsReceived: dataPoint.donationsReceived || 0,
      townHallLevel: dataPoint.townHallLevel || 0,
      expLevel: dataPoint.expLevel || 0,
      heroLevels: dataPoint.heroes?.map((h) => ({ name: h.name, level: h.level })) || [],
      builderHallLevel: dataPoint.builderHallLevel || 0,
      versusTrophies: dataPoint.versusTrophies || 0,
    };
    await db.add(STORES.PLAYER_HISTORY, record);
    return record;
  },

  /**
   * Get player history data points (for charts)
   */
  async getPlayerHistory(tag, limit = 100) {
    const db = await getDB();
    const index = db.transaction(STORES.PLAYER_HISTORY).store.index('tag');
    const records = await index.getAll(tag);
    return records
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
  },

  /**
   * Clear player history for a tag
   */
  async clearPlayerHistory(tag) {
    const db = await getDB();
    const tx = db.transaction(STORES.PLAYER_HISTORY, 'readwrite');
    const index = tx.store.index('tag');
    let cursor = await index.openCursor(tag);
    while (cursor) {
      cursor.delete();
      cursor = await cursor.continue();
    }
    await tx.done;
  },

  // ══════════════════════════════════════════════════
  // Clan History (IndexedDB)
  // ══════════════════════════════════════════════════

  async recordClanDataPoint(tag, clanData) {
    const db = await getDB();
    const record = {
      tag,
      timestamp: Date.now(),
      members: clanData.members || 0,
      clanLevel: clanData.clanLevel || 0,
      clanPoints: clanData.clanPoints || 0,
      warWins: clanData.warWins || 0,
      warLosses: clanData.warLosses || 0,
      warTies: clanData.warTies || 0,
      warWinStreak: clanData.warWinStreak || 0,
    };
    await db.add(STORES.CLAN_HISTORY, record);
    return record;
  },

  async getClanHistory(tag, limit = 100) {
    const db = await getDB();
    const index = db.transaction(STORES.CLAN_HISTORY).store.index('tag');
    const records = await index.getAll(tag);
    return records
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
  },

  // ══════════════════════════════════════════════════
  // War History (IndexedDB)
  // ══════════════════════════════════════════════════

  async recordWarResult(clanTag, warData) {
    const db = await getDB();
    const record = {
      clanTag,
      timestamp: Date.now(),
      result: warData.result || 'unknown',
      teamSize: warData.teamSize || 0,
      stars: warData.clan?.stars || 0,
      destruction: warData.clan?.destructionPercentage || 0,
      opponentStars: warData.opponent?.stars || 0,
      opponentDestruction: warData.opponent?.destructionPercentage || 0,
    };
    await db.add(STORES.WAR_HISTORY, record);
    return record;
  },

  async getWarHistory(clanTag, limit = 50) {
    const db = await getDB();
    const index = db.transaction(STORES.WAR_HISTORY).store.index('clanTag');
    const records = await index.getAll(clanTag);
    return records
      .sort((a, b) => a.timestamp - b.timestamp)
      .slice(-limit);
  },

  // ══════════════════════════════════════════════════
  // AI Cache (IndexedDB)
  // ══════════════════════════════════════════════════

  async cacheAIResponse(key, response, ttl = 30 * 60 * 1000) {
    const db = await getDB();
    await db.put(STORES.AI_CACHE, {
      key,
      response,
      timestamp: Date.now(),
      expiresAt: Date.now() + ttl,
    });
  },

  async getCachedAIResponse(key) {
    const db = await getDB();
    const entry = await db.get(STORES.AI_CACHE, key);
    if (!entry) return null;
    if (Date.now() > entry.expiresAt) {
      await db.delete(STORES.AI_CACHE, key);
      return null;
    }
    return entry.response;
  },

  // ══════════════════════════════════════════════════
  // JSON Data Mode (manual paste)
  // ══════════════════════════════════════════════════

  /**
   * Save manually entered JSON data
   */
  saveJsonData(tag, type, data) {
    this.set(`json_${type}_${tag}`, { data, timestamp: Date.now() });
  },

  /**
   * Get manually entered JSON data
   */
  getJsonData(tag, type) {
    const entry = this.get(`json_${type}_${tag}`);
    return entry?.data || null;
  },

  // ══════════════════════════════════════════════════
  // Settings
  // ══════════════════════════════════════════════════

  getSettings() {
    return this.get('settings') || {
      notifications: true,
      builderAlerts: true,
      warReminders: true,
      upgradeReminders: true,
      autoSync: true,
      syncInterval: 15, // minutes
      dataRetention: 90, // days
    };
  },

  saveSettings(settings) {
    this.set('settings', settings);
  },

  // ══════════════════════════════════════════════════
  // Data Export / Import
  // ══════════════════════════════════════════════════

  async exportAllData() {
    const db = await getDB();
    const data = {
      version: 1,
      exportDate: new Date().toISOString(),
      accounts: this.getAccounts(),
      activeAccount: this.getActiveAccount(),
      settings: this.getSettings(),
      themeMode: this.get('themeMode'),
      dataMode: this.get('dataMode'),
      snapshots: await db.getAll(STORES.SNAPSHOTS),
      playerHistory: await db.getAll(STORES.PLAYER_HISTORY),
      clanHistory: await db.getAll(STORES.CLAN_HISTORY),
      warHistory: await db.getAll(STORES.WAR_HISTORY),
    };
    return data;
  },

  async importData(data) {
    if (!data || data.version !== 1) {
      throw new Error('Invalid export data format');
    }

    // Import LocalStorage data
    if (data.accounts) this.set('accounts', data.accounts);
    if (data.activeAccount) this.set('activeAccount', data.activeAccount);
    if (data.settings) this.set('settings', data.settings);
    if (data.themeMode) this.set('themeMode', data.themeMode);
    if (data.dataMode) this.set('dataMode', data.dataMode);

    // Import IndexedDB data
    const db = await getDB();
    const stores = [
      { name: STORES.SNAPSHOTS, data: data.snapshots },
      { name: STORES.PLAYER_HISTORY, data: data.playerHistory },
      { name: STORES.CLAN_HISTORY, data: data.clanHistory },
      { name: STORES.WAR_HISTORY, data: data.warHistory },
    ];

    for (const store of stores) {
      if (store.data?.length) {
        const tx = db.transaction(store.name, 'readwrite');
        for (const item of store.data) {
          // Remove auto-increment id to avoid conflicts
          const { id, ...rest } = item;
          await tx.store.add(rest);
        }
        await tx.done;
      }
    }

    return true;
  },

  // ══════════════════════════════════════════════════
  // Cleanup
  // ══════════════════════════════════════════════════

  /**
   * Clear all app data
   */
  async clearAll() {
    // Clear LocalStorage
    const keys = Object.keys(localStorage);
    keys.forEach((key) => {
      if (key.startsWith(LS_PREFIX) || key.startsWith('coc_cache_')) {
        localStorage.removeItem(key);
      }
    });

    // Clear IndexedDB
    const db = await getDB();
    const storeNames = Object.values(STORES);
    for (const name of storeNames) {
      const tx = db.transaction(name, 'readwrite');
      await tx.store.clear();
      await tx.done;
    }
  },

  /**
   * Get storage usage estimate
   */
  async getStorageUsage() {
    if ('storage' in navigator && 'estimate' in navigator.storage) {
      const estimate = await navigator.storage.estimate();
      return {
        used: estimate.usage || 0,
        total: estimate.quota || 0,
        percentage: estimate.quota ? ((estimate.usage / estimate.quota) * 100).toFixed(2) : 0,
      };
    }
    return { used: 0, total: 0, percentage: 0 };
  },
};

export default storageService;

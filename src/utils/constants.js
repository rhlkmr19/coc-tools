// ============================================
// Clash Intelligence Pro – Constants & Reference Data
// ============================================
// Town Hall max levels, troop data, upgrade costs,
// hero data, building data — used by all engines.
// ============================================

// ─── Town Hall Max Levels ──────────────────────────────
// Key reference: max levels for buildings/troops at each TH
export const TH_MAX_LEVEL = 17; // Current max TH as of 2025

export const TH_DATA = {
  1:  { maxBuilders: 2, maxHeroes: 0, maxSpellFactory: 0, maxArmyCamp: 20,  maxCC: 0 },
  2:  { maxBuilders: 2, maxHeroes: 0, maxSpellFactory: 0, maxArmyCamp: 30,  maxCC: 0 },
  3:  { maxBuilders: 3, maxHeroes: 0, maxSpellFactory: 0, maxArmyCamp: 70,  maxCC: 10 },
  4:  { maxBuilders: 3, maxHeroes: 0, maxSpellFactory: 0, maxArmyCamp: 80,  maxCC: 15 },
  5:  { maxBuilders: 4, maxHeroes: 0, maxSpellFactory: 1, maxArmyCamp: 135, maxCC: 15 },
  6:  { maxBuilders: 4, maxHeroes: 0, maxSpellFactory: 2, maxArmyCamp: 150, maxCC: 20 },
  7:  { maxBuilders: 5, maxHeroes: 1, maxSpellFactory: 3, maxArmyCamp: 200, maxCC: 20 },
  8:  { maxBuilders: 5, maxHeroes: 1, maxSpellFactory: 3, maxArmyCamp: 200, maxCC: 25 },
  9:  { maxBuilders: 5, maxHeroes: 2, maxSpellFactory: 4, maxArmyCamp: 220, maxCC: 30 },
  10: { maxBuilders: 5, maxHeroes: 2, maxSpellFactory: 5, maxArmyCamp: 240, maxCC: 35 },
  11: { maxBuilders: 5, maxHeroes: 3, maxSpellFactory: 5, maxArmyCamp: 260, maxCC: 35 },
  12: { maxBuilders: 5, maxHeroes: 3, maxSpellFactory: 5, maxArmyCamp: 280, maxCC: 40 },
  13: { maxBuilders: 5, maxHeroes: 4, maxSpellFactory: 5, maxArmyCamp: 300, maxCC: 40 },
  14: { maxBuilders: 5, maxHeroes: 4, maxSpellFactory: 5, maxArmyCamp: 300, maxCC: 45 },
  15: { maxBuilders: 5, maxHeroes: 4, maxSpellFactory: 5, maxArmyCamp: 320, maxCC: 45 },
  16: { maxBuilders: 5, maxHeroes: 4, maxSpellFactory: 5, maxArmyCamp: 320, maxCC: 50 },
  17: { maxBuilders: 5, maxHeroes: 4, maxSpellFactory: 5, maxArmyCamp: 340, maxCC: 50 },
};

// ─── Hero Max Levels per TH ────────────────────────────
export const HERO_MAX_LEVELS = {
  'Barbarian King': {
    7: 5, 8: 10, 9: 30, 10: 40, 11: 50, 12: 65, 13: 75, 14: 80, 15: 85, 16: 90, 17: 95,
  },
  'Archer Queen': {
    9: 30, 10: 40, 11: 50, 12: 65, 13: 75, 14: 80, 15: 85, 16: 90, 17: 95,
  },
  'Grand Warden': {
    11: 20, 12: 40, 13: 50, 14: 55, 15: 60, 16: 65, 17: 70,
  },
  'Royal Champion': {
    13: 25, 14: 30, 15: 35, 16: 40, 17: 45,
  },
};

// ─── Hero Upgrade Costs (Dark Elixir, approx per level range) ──
export const HERO_UPGRADE_COSTS = {
  'Barbarian King': { resourceType: 'darkElixir', avgCostPerLevel: 180000, avgTimeHours: 168 },
  'Archer Queen':   { resourceType: 'darkElixir', avgCostPerLevel: 200000, avgTimeHours: 168 },
  'Grand Warden':   { resourceType: 'elixir',     avgCostPerLevel: 9000000, avgTimeHours: 168 },
  'Royal Champion': { resourceType: 'darkElixir', avgCostPerLevel: 250000, avgTimeHours: 168 },
};

// ─── Defense Max Levels per TH ─────────────────────────
export const DEFENSE_MAX_LEVELS = {
  'Cannon':           { 7: 8,  8: 10, 9: 11, 10: 13, 11: 15, 12: 17, 13: 19, 14: 20, 15: 21, 16: 22, 17: 23 },
  'Archer Tower':     { 7: 8,  8: 10, 9: 11, 10: 13, 11: 15, 12: 17, 13: 19, 14: 20, 15: 21, 16: 22, 17: 23 },
  'Mortar':           { 7: 5,  8: 6,  9: 7,  10: 8,  11: 10, 12: 12, 13: 14, 14: 15, 15: 16, 16: 17, 17: 18 },
  'Air Defense':      { 7: 5,  8: 6,  9: 7,  10: 8,  11: 9,  12: 11, 13: 12, 14: 13, 15: 14, 16: 15, 17: 16 },
  'Wizard Tower':     { 7: 4,  8: 6,  9: 7,  10: 9,  11: 11, 12: 13, 13: 14, 14: 15, 15: 16, 16: 17, 17: 18 },
  'X-Bow':            { 9: 3,  10: 4, 11: 5, 12: 7,  13: 8,  14: 9,  15: 10, 16: 11, 17: 12 },
  'Inferno Tower':    { 10: 3, 11: 5, 12: 6, 13: 7,  14: 8,  15: 9,  16: 10, 17: 11 },
  'Eagle Artillery':  { 11: 2, 12: 3, 13: 4, 14: 5,  15: 6,  16: 7,  17: 8 },
  'Scattershot':      { 13: 2, 14: 3, 15: 4, 16: 5,  17: 6 },
  'Spell Tower':      { 15: 2, 16: 3, 17: 4 },
  'Monolith':         { 15: 2, 16: 3, 17: 4 },
  'Multi-Archer Tower': { 16: 2, 17: 3 },
  'Bomb Tower':       { 8: 2,  9: 3,  10: 4, 11: 6, 12: 7,  13: 8,  14: 9,  15: 10, 16: 11, 17: 12 },
  'Air Sweeper':      { 6: 2,  7: 3,  8: 4,  9: 5,  10: 6,  11: 7,  12: 7,  13: 7,  14: 8,  15: 8,  16: 8,  17: 8 },
};

// ─── Troop Max Levels per TH ───────────────────────────
export const TROOP_MAX_LEVELS = {
  'Barbarian':      { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 5, 9: 6, 10: 7, 11: 8, 12: 9, 13: 10, 14: 11, 15: 11, 16: 12, 17: 12 },
  'Archer':         { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 5, 9: 6, 10: 7, 11: 8, 12: 9, 13: 10, 14: 11, 15: 11, 16: 12, 17: 12 },
  'Giant':          { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4, 7: 5, 8: 6, 9: 7, 10: 8, 11: 9, 12: 10, 13: 11, 14: 11, 15: 12, 16: 12, 17: 12 },
  'Goblin':         { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 5, 9: 6, 10: 7, 11: 7, 12: 8, 13: 8, 14: 8, 15: 9, 16: 9, 17: 9 },
  'Wall Breaker':   { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 3, 7: 4, 8: 5, 9: 6, 10: 7, 11: 8, 12: 9, 13: 10, 14: 11, 15: 11, 16: 11, 17: 11 },
  'Balloon':        { 1: 1, 2: 2, 3: 2, 4: 3, 5: 3, 6: 4, 7: 5, 8: 6, 9: 6, 10: 7, 11: 8, 12: 9, 13: 10, 14: 10, 15: 11, 16: 11, 17: 11 },
  'Wizard':         { 1: 1, 2: 1, 3: 2, 4: 2, 5: 3, 6: 4, 7: 4, 8: 5, 9: 6, 10: 7, 11: 9, 12: 10, 13: 11, 14: 11, 15: 11, 16: 12, 17: 12 },
  'Healer':         { 1: 1, 2: 1, 3: 1, 4: 1, 5: 1, 6: 2, 7: 3, 8: 4, 9: 4, 10: 5, 11: 6, 12: 7, 13: 8, 14: 8, 15: 9, 16: 9, 17: 9 },
  'Dragon':         { 7: 2, 8: 3, 9: 4, 10: 5, 11: 6, 12: 7, 13: 8, 14: 9, 15: 10, 16: 11, 17: 12 },
  'P.E.K.K.A':      { 8: 3, 9: 4, 10: 6, 11: 7, 12: 9, 13: 10, 14: 10, 15: 11, 16: 11, 17: 12 },
  'Minion':         { 7: 2, 8: 4, 9: 5, 10: 6, 11: 7, 12: 8, 13: 9, 14: 10, 15: 11, 16: 11, 17: 12 },
  'Hog Rider':      { 7: 2, 8: 4, 9: 5, 10: 6, 11: 7, 12: 9, 13: 10, 14: 11, 15: 12, 16: 12, 17: 13 },
  'Valkyrie':       { 8: 2, 9: 4, 10: 5, 11: 6, 12: 7, 13: 8, 14: 9, 15: 10, 16: 10, 17: 11 },
  'Golem':          { 8: 2, 9: 4, 10: 5, 11: 6, 12: 7, 13: 9, 14: 10, 15: 11, 16: 12, 17: 13 },
  'Witch':          { 9: 2, 10: 3, 11: 4, 12: 5, 13: 5, 14: 5, 15: 6, 16: 6, 17: 6 },
  'Lava Hound':     { 9: 2, 10: 3, 11: 4, 12: 5, 13: 6, 14: 6, 15: 7, 16: 7, 17: 7 },
  'Bowler':         { 10: 2, 11: 3, 12: 4, 13: 5, 14: 6, 15: 7, 16: 7, 17: 7 },
  'Miner':          { 10: 3, 11: 5, 12: 6, 13: 7, 14: 8, 15: 9, 16: 9, 17: 9 },
  'Electro Dragon': { 11: 2, 12: 3, 13: 4, 14: 5, 15: 6, 16: 6, 17: 6 },
  'Yeti':           { 12: 2, 13: 3, 14: 4, 15: 5, 16: 5, 17: 5 },
  'Dragon Rider':   { 14: 2, 15: 3, 16: 3, 17: 3 },
  'Electro Titan':  { 15: 2, 16: 3, 17: 3 },
  'Root Rider':     { 16: 2, 17: 3 },
};

// ─── Spell Max Levels per TH ───────────────────────────
export const SPELL_MAX_LEVELS = {
  'Lightning Spell': { 5: 4, 6: 4, 7: 4, 8: 5, 9: 6, 10: 7, 11: 8, 12: 9, 13: 10, 14: 10, 15: 11, 16: 11, 17: 11 },
  'Healing Spell':   { 6: 2, 7: 4, 8: 5, 9: 6, 10: 7, 11: 7, 12: 8, 13: 8, 14: 9, 15: 9, 16: 10, 17: 10 },
  'Rage Spell':      { 7: 4, 8: 5, 9: 5, 10: 5, 11: 6, 12: 6, 13: 6, 14: 6, 15: 6, 16: 6, 17: 6 },
  'Jump Spell':      { 9: 2, 10: 3, 11: 3, 12: 4, 13: 4, 14: 5, 15: 5, 16: 5, 17: 5 },
  'Freeze Spell':    { 9: 1, 10: 5, 11: 6, 12: 7, 13: 7, 14: 7, 15: 7, 16: 7, 17: 7 },
  'Poison Spell':    { 8: 2, 9: 3, 10: 4, 11: 5, 12: 6, 13: 7, 14: 8, 15: 9, 16: 9, 17: 10 },
  'Earthquake Spell':{ 8: 2, 9: 3, 10: 4, 11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5 },
  'Haste Spell':     { 9: 2, 10: 4, 11: 5, 12: 5, 13: 5, 14: 5, 15: 5, 16: 5, 17: 5 },
  'Clone Spell':     { 10: 3, 11: 5, 12: 5, 13: 7, 14: 7, 15: 7, 16: 7, 17: 7 },
  'Invisibility Spell': { 11: 2, 12: 3, 13: 4, 14: 4, 15: 4, 16: 4, 17: 4 },
  'Bat Spell':       { 10: 3, 11: 5, 12: 5, 13: 5, 14: 5, 15: 6, 16: 6, 17: 6 },
  'Recall Spell':    { 13: 2, 14: 3, 15: 4, 16: 5, 17: 5 },
  'Overgrowth Spell':{ 15: 2, 16: 3, 17: 3 },
};

// ─── Building Categories for Analysis ──────────────────
export const BUILDING_CATEGORIES = {
  pointDefense: ['Cannon', 'Archer Tower', 'Multi-Archer Tower'],
  splashDefense: ['Mortar', 'Wizard Tower', 'Bomb Tower'],
  airDefense: ['Air Defense', 'Air Sweeper'],
  heavyDefense: ['X-Bow', 'Inferno Tower', 'Eagle Artillery', 'Scattershot', 'Spell Tower', 'Monolith'],
  resource: ['Gold Mine', 'Elixir Collector', 'Dark Elixir Drill', 'Gold Storage', 'Elixir Storage', 'Dark Elixir Storage'],
  army: ['Barracks', 'Dark Barracks', 'Army Camp', 'Spell Factory', 'Dark Spell Factory', 'Workshop', 'Pet House'],
  special: ['Clan Castle', 'Town Hall', 'Laboratory'],
  traps: ['Bomb', 'Spring Trap', 'Air Bomb', 'Giant Bomb', 'Seeking Air Mine', 'Skeleton Trap', 'Tornado Trap'],
  walls: ['Wall'],
};

// ─── League Data ───────────────────────────────────────
export const LEAGUES = {
  'Unranked':          { minTrophies: 0,    icon: '🏳️' },
  'Bronze League III': { minTrophies: 400,  icon: '🥉' },
  'Bronze League II':  { minTrophies: 500,  icon: '🥉' },
  'Bronze League I':   { minTrophies: 600,  icon: '🥉' },
  'Silver League III': { minTrophies: 800,  icon: '🥈' },
  'Silver League II':  { minTrophies: 1000, icon: '🥈' },
  'Silver League I':   { minTrophies: 1200, icon: '🥈' },
  'Gold League III':   { minTrophies: 1400, icon: '🥇' },
  'Gold League II':    { minTrophies: 1600, icon: '🥇' },
  'Gold League I':     { minTrophies: 1800, icon: '🥇' },
  'Crystal League III':{ minTrophies: 2000, icon: '💎' },
  'Crystal League II': { minTrophies: 2200, icon: '💎' },
  'Crystal League I':  { minTrophies: 2400, icon: '💎' },
  'Master League III': { minTrophies: 2600, icon: '🏅' },
  'Master League II':  { minTrophies: 2800, icon: '🏅' },
  'Master League I':   { minTrophies: 3000, icon: '🏅' },
  'Champion League III': { minTrophies: 3200, icon: '🏆' },
  'Champion League II':  { minTrophies: 3500, icon: '🏆' },
  'Champion League I':   { minTrophies: 3800, icon: '🏆' },
  'Titan League III':    { minTrophies: 4100, icon: '⚡' },
  'Titan League II':     { minTrophies: 4400, icon: '⚡' },
  'Titan League I':      { minTrophies: 4700, icon: '⚡' },
  'Legend League':        { minTrophies: 5000, icon: '🌟' },
};

// ─── Clan War League Tiers ─────────────────────────────
export const CWL_TIERS = [
  'Bronze League III', 'Bronze League II', 'Bronze League I',
  'Silver League III', 'Silver League II', 'Silver League I',
  'Gold League III', 'Gold League II', 'Gold League I',
  'Crystal League III', 'Crystal League II', 'Crystal League I',
  'Master League III', 'Master League II', 'Master League I',
  'Champion League III', 'Champion League II', 'Champion League I',
];

// ─── Clan Roles ────────────────────────────────────────
export const CLAN_ROLES = {
  leader: { label: 'Leader', weight: 4 },
  coLeader: { label: 'Co-Leader', weight: 3 },
  admin: { label: 'Elder', weight: 2 },
  member: { label: 'Member', weight: 1 },
};

// ─── Average Upgrade Costs Reference (gold, per building level range) ──
export const AVG_UPGRADE_COSTS = {
  low:    { gold: 500000,   elixir: 500000,   time: 12 },   // TH 7-8 range (hours)
  mid:    { gold: 4000000,  elixir: 4000000,  time: 96 },   // TH 9-11
  high:   { gold: 12000000, elixir: 12000000, time: 168 },  // TH 12-14
  ultra:  { gold: 20000000, elixir: 20000000, time: 240 },  // TH 15-17
};

// ─── War Weight Approximations ─────────────────────────
export const WAR_WEIGHT = {
  heroes: 0.30,      // Heroes contribute ~30% to war weight
  defenses: 0.40,    // Defenses ~40%
  troops: 0.20,      // Troops/spells ~20%
  walls: 0.10,       // Walls ~10%
};

// ─── Star Rating Labels ───────────────────────────────
export const STAR_LABELS = ['☆☆☆', '★☆☆', '★★☆', '★★★'];

// ─── Utility: Get max level for a troop/spell/defense at a given TH
export function getMaxLevel(table, name, thLevel) {
  const levels = table[name];
  if (!levels) return 0;
  let max = 0;
  for (let th = 1; th <= thLevel; th++) {
    if (levels[th] !== undefined) max = levels[th];
  }
  return max;
}

// ─── Utility: Get all unlocked items at a TH level
export function getUnlockedItems(table, thLevel) {
  const items = [];
  for (const [name, levels] of Object.entries(table)) {
    const maxLevel = getMaxLevel(table, name, thLevel);
    if (maxLevel > 0) {
      const unlockTH = Math.min(...Object.keys(levels).map(Number));
      items.push({ name, maxLevel, unlockTH });
    }
  }
  return items;
}

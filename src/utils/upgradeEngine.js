// ============================================
// Clash Intelligence Pro – Upgrade Engine
// ============================================
// Computes: current vs max comparison, builder
// optimization, completion prediction, efficiency
// scoring, cost breakdown
// ============================================
import {
  HERO_MAX_LEVELS,
  HERO_UPGRADE_COSTS,
  TROOP_MAX_LEVELS,
  SPELL_MAX_LEVELS,
  AVG_UPGRADE_COSTS,
  TH_DATA,
  getMaxLevel,
} from './constants';

// ─── Current vs Max Comparison ─────────────────────────
// Returns an array of all upgradeable items with current/max levels
export function getUpgradeComparison(playerData) {
  if (!playerData) return { heroes: [], troops: [], spells: [], summary: {} };

  const th = playerData.townHallLevel || 1;

  // Heroes
  const heroes = [];
  for (const [heroName, _] of Object.entries(HERO_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(HERO_MAX_LEVELS, heroName, th);
    if (maxForTH === 0) continue;

    const hero = (playerData.heroes || []).find((h) => h.name === heroName);
    const current = hero?.level || 0;

    heroes.push({
      name: heroName,
      current,
      max: maxForTH,
      remaining: maxForTH - current,
      percentage: Math.round((current / maxForTH) * 100),
      isMaxed: current >= maxForTH,
      category: 'hero',
    });
  }

  // Troops
  const troops = [];
  for (const [troopName, _] of Object.entries(TROOP_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(TROOP_MAX_LEVELS, troopName, th);
    if (maxForTH === 0) continue;

    const troop = (playerData.troops || []).find((t) => t.name === troopName);
    const current = troop?.level || 0;

    troops.push({
      name: troopName,
      current,
      max: maxForTH,
      remaining: maxForTH - current,
      percentage: Math.round((current / maxForTH) * 100),
      isMaxed: current >= maxForTH,
      category: 'troop',
    });
  }

  // Spells
  const spells = [];
  for (const [spellName, _] of Object.entries(SPELL_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(SPELL_MAX_LEVELS, spellName, th);
    if (maxForTH === 0) continue;

    const spell = (playerData.spells || []).find((s) => s.name === spellName);
    const current = spell?.level || 0;

    spells.push({
      name: spellName,
      current,
      max: maxForTH,
      remaining: maxForTH - current,
      percentage: Math.round((current / maxForTH) * 100),
      isMaxed: current >= maxForTH,
      category: 'spell',
    });
  }

  // Summary
  const allItems = [...heroes, ...troops, ...spells];
  const totalItems = allItems.length;
  const maxedItems = allItems.filter((i) => i.isMaxed).length;
  const totalLevelsRemaining = allItems.reduce((sum, i) => sum + i.remaining, 0);

  return {
    heroes,
    troops,
    spells,
    summary: {
      totalItems,
      maxedItems,
      remainingItems: totalItems - maxedItems,
      completionPercentage: totalItems > 0 ? Math.round((maxedItems / totalItems) * 100) : 0,
      totalLevelsRemaining,
    },
  };
}

// ─── Builder Optimization Estimator ────────────────────
// Estimate total upgrade time given available builders
export function estimateBuilderOptimization(playerData, numBuilders = null) {
  const th = playerData?.townHallLevel || 1;
  const builders = numBuilders || TH_DATA[th]?.maxBuilders || 5;
  const comparison = getUpgradeComparison(playerData);

  // Estimate hours needed for each category
  const heroLevelsRemaining = comparison.heroes.reduce((s, h) => s + h.remaining, 0);
  const troopLevelsRemaining = comparison.troops.reduce((s, t) => s + t.remaining, 0);
  const spellLevelsRemaining = comparison.spells.reduce((s, sp) => s + sp.remaining, 0);

  // Estimate cost tier based on TH
  const tier = th >= 15 ? 'ultra' : th >= 12 ? 'high' : th >= 9 ? 'mid' : 'low';
  const avgTime = AVG_UPGRADE_COSTS[tier].time; // hours per level

  // Heroes can only be upgraded 1 at a time per hero
  // This is a significant bottleneck
  const heroHours = heroLevelsRemaining * HERO_UPGRADE_COSTS['Barbarian King'].avgTimeHours;
  const heroActiveHeroes = comparison.heroes.filter((h) => !h.isMaxed).length;
  const heroParallelHours = heroActiveHeroes > 0
    ? heroHours / Math.min(heroActiveHeroes, builders)
    : 0;

  // Lab upgrades (troops + spells) — only 1 lab, sequential
  const labLevels = troopLevelsRemaining + spellLevelsRemaining;
  const labHours = labLevels * (avgTime * 0.8); // Lab times are slightly less than building times

  // Building upgrades — can use all builders in parallel
  // Estimate ~40 building upgrades remaining per TH on average
  const estimatedBuildingLevels = Math.max(0, (17 - th) * 40);
  const buildingHours = estimatedBuildingLevels * avgTime;
  const buildingParallelHours = buildingHours / Math.max(1, builders);

  // Total is the MAX of (hero time, lab time, building time)
  // Because they run in parallel
  const totalHours = Math.max(heroParallelHours, labHours, buildingParallelHours);
  const totalDays = Math.ceil(totalHours / 24);

  // Estimated completion date
  const completionDate = new Date();
  completionDate.setDate(completionDate.getDate() + totalDays);

  return {
    builders,
    heroLevelsRemaining,
    labLevelsRemaining: labLevels,
    estimatedBuildingLevels,
    bottleneck: heroParallelHours >= labHours && heroParallelHours >= buildingParallelHours
      ? 'heroes'
      : labHours >= buildingParallelHours
        ? 'laboratory'
        : 'buildings',
    estimatedDays: totalDays,
    estimatedHours: Math.round(totalHours),
    completionDate: completionDate.toISOString().split('T')[0],
    breakdown: {
      heroHours: Math.round(heroParallelHours),
      labHours: Math.round(labHours),
      buildingHours: Math.round(buildingParallelHours),
    },
  };
}

// ─── Cost Breakdown ────────────────────────────────────
// Estimate remaining upgrade costs
export function estimateCostBreakdown(playerData) {
  const th = playerData?.townHallLevel || 1;
  const comparison = getUpgradeComparison(playerData);
  const tier = th >= 15 ? 'ultra' : th >= 12 ? 'high' : th >= 9 ? 'mid' : 'low';
  const avgCosts = AVG_UPGRADE_COSTS[tier];

  // Hero costs
  let heroDarkElixir = 0;
  let heroElixir = 0;
  for (const hero of comparison.heroes) {
    if (hero.isMaxed) continue;
    const costInfo = HERO_UPGRADE_COSTS[hero.name];
    if (costInfo) {
      const totalCost = hero.remaining * costInfo.avgCostPerLevel;
      if (costInfo.resourceType === 'darkElixir') {
        heroDarkElixir += totalCost;
      } else {
        heroElixir += totalCost;
      }
    }
  }

  // Troop costs (elixir + dark elixir)
  const troopLevels = comparison.troops.reduce((s, t) => s + t.remaining, 0);
  const elixirTroops = comparison.troops.filter((t) =>
    !['Minion', 'Hog Rider', 'Valkyrie', 'Golem', 'Witch', 'Lava Hound', 'Bowler'].includes(t.name)
  );
  const darkTroops = comparison.troops.filter((t) =>
    ['Minion', 'Hog Rider', 'Valkyrie', 'Golem', 'Witch', 'Lava Hound', 'Bowler'].includes(t.name)
  );

  const elixirTroopLevels = elixirTroops.reduce((s, t) => s + t.remaining, 0);
  const darkTroopLevels = darkTroops.reduce((s, t) => s + t.remaining, 0);

  // Spell costs
  const spellLevels = comparison.spells.reduce((s, sp) => s + sp.remaining, 0);
  const darkSpells = comparison.spells.filter((s) =>
    ['Poison Spell', 'Earthquake Spell', 'Haste Spell', 'Bat Spell'].includes(s.name)
  );
  const elixirSpells = comparison.spells.filter((s) =>
    !['Poison Spell', 'Earthquake Spell', 'Haste Spell', 'Bat Spell'].includes(s.name)
  );
  const darkSpellLevels = darkSpells.reduce((s, sp) => s + sp.remaining, 0);
  const elixirSpellLevels = elixirSpells.reduce((s, sp) => s + sp.remaining, 0);

  // Building costs (estimated)
  const buildingGold = Math.max(0, (17 - th) * 40) * avgCosts.gold;
  const buildingElixir = Math.max(0, (17 - th) * 20) * avgCosts.elixir;

  const labElixirCost = (elixirTroopLevels + elixirSpellLevels) * avgCosts.elixir * 0.3;
  const labDarkCost = (darkTroopLevels + darkSpellLevels) * 150000; // avg dark elixir per lab level

  return {
    gold: {
      buildings: buildingGold,
      total: buildingGold,
      formatted: formatResource(buildingGold),
    },
    elixir: {
      buildings: buildingElixir,
      heroes: heroElixir,
      lab: labElixirCost,
      total: buildingElixir + heroElixir + labElixirCost,
      formatted: formatResource(buildingElixir + heroElixir + labElixirCost),
    },
    darkElixir: {
      heroes: heroDarkElixir,
      lab: labDarkCost,
      total: heroDarkElixir + labDarkCost,
      formatted: formatResource(heroDarkElixir + labDarkCost),
    },
    summary: {
      totalGold: buildingGold,
      totalElixir: buildingElixir + heroElixir + labElixirCost,
      totalDarkElixir: heroDarkElixir + labDarkCost,
    },
  };
}

// ─── Efficiency Scoring (0-100) ────────────────────────
// How efficiently is the player progressing?
export function calcUpgradeEfficiency(playerData) {
  if (!playerData) return 0;

  const comparison = getUpgradeComparison(playerData);
  const th = playerData.townHallLevel || 1;

  // Factors:
  // 1. Completion % relative to TH
  const completionScore = comparison.summary.completionPercentage;

  // 2. Balance — are upgrades evenly distributed or is one area neglected?
  const heroAvg = comparison.heroes.length > 0
    ? comparison.heroes.reduce((s, h) => s + h.percentage, 0) / comparison.heroes.length
    : 100;
  const troopAvg = comparison.troops.length > 0
    ? comparison.troops.reduce((s, t) => s + t.percentage, 0) / comparison.troops.length
    : 100;
  const spellAvg = comparison.spells.length > 0
    ? comparison.spells.reduce((s, sp) => s + sp.percentage, 0) / comparison.spells.length
    : 100;

  const balanceValues = [heroAvg, troopAvg, spellAvg];
  const maxDiff = Math.max(...balanceValues) - Math.min(...balanceValues);
  const balanceScore = Math.max(0, 100 - maxDiff); // Smaller diff = better balance

  // 3. Are key items prioritized? (Heroes, Clan Castle troops, war troops)
  const heroPriority = heroAvg;

  return Math.round(
    completionScore * 0.4 +
    balanceScore * 0.3 +
    heroPriority * 0.3
  );
}

// ─── Upgrade Priority List ─────────────────────────────
// Returns items sorted by priority (highest priority first)
export function getUpgradePriorityList(playerData) {
  const comparison = getUpgradeComparison(playerData);
  const allItems = [
    ...comparison.heroes.map((h) => ({ ...h, priority: calcItemPriority(h, 'hero') })),
    ...comparison.troops.map((t) => ({ ...t, priority: calcItemPriority(t, 'troop') })),
    ...comparison.spells.map((s) => ({ ...s, priority: calcItemPriority(s, 'spell') })),
  ];

  return allItems
    .filter((item) => !item.isMaxed)
    .sort((a, b) => b.priority - a.priority);
}

// ─── Item Priority Calculation ─────────────────────────
function calcItemPriority(item, type) {
  let base = 50;

  // Heroes always high priority
  if (type === 'hero') base = 90;

  // War-relevant troops get bonus
  const warTroops = [
    'Hog Rider', 'Lava Hound', 'Balloon', 'Electro Dragon',
    'Witch', 'Bowler', 'Yeti', 'Dragon', 'P.E.K.K.A', 'Miner',
    'Golem', 'Valkyrie', 'Healer', 'Dragon Rider', 'Root Rider',
  ];
  if (warTroops.includes(item.name)) base += 15;

  // Key spells get bonus
  const keySpells = ['Rage Spell', 'Healing Spell', 'Freeze Spell', 'Poison Spell', 'Jump Spell'];
  if (keySpells.includes(item.name)) base += 10;

  // Higher remaining gap = higher urgency
  const gapPenalty = item.remaining / Math.max(1, item.max);
  base += gapPenalty * 20;

  // Lower current % = higher priority
  base += (100 - item.percentage) * 0.1;

  return Math.round(Math.min(100, base));
}

// ─── Resource Formatter ────────────────────────────────
function formatResource(value) {
  if (value >= 1_000_000_000) return `${(value / 1_000_000_000).toFixed(1)}B`;
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(1)}K`;
  return String(Math.round(value));
}

// ─── Time Formatter ────────────────────────────────────
export function formatUpgradeTime(hours) {
  if (hours < 1) return `${Math.round(hours * 60)}m`;
  if (hours < 24) return `${Math.round(hours)}h`;
  const days = Math.floor(hours / 24);
  const remainingHours = Math.round(hours % 24);
  if (remainingHours === 0) return `${days}d`;
  return `${days}d ${remainingHours}h`;
}

// ─── Upgrade Engine Public API ─────────────────────────
export const upgradeEngine = {
  getUpgradeComparison,
  estimateBuilderOptimization,
  estimateCostBreakdown,
  calcUpgradeEfficiency,
  getUpgradePriorityList,
  formatUpgradeTime,
};

export default upgradeEngine;

// ============================================
// Clash Intelligence Pro – Scoring Engine
// ============================================
// Computes: progression score, rush detection,
// efficiency metrics, win/defense rates,
// overall account health score
// ============================================
import {
  HERO_MAX_LEVELS,
  TROOP_MAX_LEVELS,
  SPELL_MAX_LEVELS,
  DEFENSE_MAX_LEVELS,
  getMaxLevel,
  TH_DATA,
} from './constants';

// ─── Progression Score (0-100) ─────────────────────────
// Measures how "complete" the account is for its TH level
export function calcProgressionScore(playerData) {
  if (!playerData) return 0;

  const th = playerData.townHallLevel || 1;
  const weights = { heroes: 0.30, troops: 0.25, defenses: 0.30, spells: 0.15 };

  const heroScore = calcHeroCompletionScore(playerData, th);
  const troopScore = calcTroopCompletionScore(playerData, th);
  const defenseScore = calcDefenseCompletionScore(playerData, th);
  const spellScore = calcSpellCompletionScore(playerData, th);

  const weighted =
    heroScore * weights.heroes +
    troopScore * weights.troops +
    defenseScore * weights.defenses +
    spellScore * weights.spells;

  return Math.round(Math.max(0, Math.min(100, weighted)));
}

// ─── Hero Completion Score ─────────────────────────────
export function calcHeroCompletionScore(playerData, th) {
  const heroes = playerData?.heroes || [];
  if (heroes.length === 0 && th < 7) return 100; // No heroes available

  let totalMax = 0;
  let totalCurrent = 0;

  for (const [heroName, thLevels] of Object.entries(HERO_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(HERO_MAX_LEVELS, heroName, th);
    if (maxForTH === 0) continue;

    totalMax += maxForTH;
    const hero = heroes.find((h) => h.name === heroName);
    totalCurrent += hero ? Math.min(hero.level, maxForTH) : 0;
  }

  return totalMax > 0 ? (totalCurrent / totalMax) * 100 : 100;
}

// ─── Troop Completion Score ────────────────────────────
export function calcTroopCompletionScore(playerData, th) {
  const troops = playerData?.troops || [];
  if (troops.length === 0) return 0;

  let totalMax = 0;
  let totalCurrent = 0;

  for (const [troopName, _] of Object.entries(TROOP_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(TROOP_MAX_LEVELS, troopName, th);
    if (maxForTH === 0) continue;

    totalMax += maxForTH;
    const troop = troops.find((t) => t.name === troopName);
    totalCurrent += troop ? Math.min(troop.level, maxForTH) : 0;
  }

  return totalMax > 0 ? (totalCurrent / totalMax) * 100 : 0;
}

// ─── Spell Completion Score ────────────────────────────
export function calcSpellCompletionScore(playerData, th) {
  const spells = playerData?.spells || [];
  if (spells.length === 0 && th < 5) return 100;

  let totalMax = 0;
  let totalCurrent = 0;

  for (const [spellName, _] of Object.entries(SPELL_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(SPELL_MAX_LEVELS, spellName, th);
    if (maxForTH === 0) continue;

    totalMax += maxForTH;
    const spell = spells.find((s) => s.name === spellName);
    totalCurrent += spell ? Math.min(spell.level, maxForTH) : 0;
  }

  return totalMax > 0 ? (totalCurrent / totalMax) * 100 : 100;
}

// ─── Defense Completion Score ──────────────────────────
export function calcDefenseCompletionScore(playerData, th) {
  // Uses achievement and building data from API
  // API doesn't give individual building levels, so we estimate
  // from overall defensive strength and TH weight
  const defenseWins = playerData?.defenseWins || 0;
  const trophies = playerData?.trophies || 0;
  const bestTrophies = playerData?.bestTrophies || trophies;

  // Higher defense wins relative to TH = better defenses
  const expectedDefenseWins = th * th * 5; // rough heuristic
  const defenseRatio = Math.min(1, defenseWins / Math.max(1, expectedDefenseWins));

  // Trophy holding ability
  const trophyExpected = th * 350; // rough expected trophies per TH
  const trophyRatio = Math.min(1, trophies / Math.max(1, trophyExpected));

  return ((defenseRatio * 0.6 + trophyRatio * 0.4) * 100);
}

// ─── Rush Detection ────────────────────────────────────
// Returns rush severity: 0 = not rushed, 100 = extremely rushed
export function detectRushLevel(playerData) {
  if (!playerData) return { rushScore: 0, isRushed: false, details: [] };

  const th = playerData.townHallLevel || 1;
  const details = [];
  let totalPenalty = 0;

  // Check heroes
  const heroes = playerData.heroes || [];
  for (const [heroName, thLevels] of Object.entries(HERO_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(HERO_MAX_LEVELS, heroName, th);
    if (maxForTH === 0) continue;

    const hero = heroes.find((h) => h.name === heroName);
    const currentLevel = hero?.level || 0;
    const gap = maxForTH - currentLevel;
    const gapPercent = (gap / maxForTH) * 100;

    if (gapPercent > 40) {
      details.push({
        type: 'hero',
        name: heroName,
        current: currentLevel,
        max: maxForTH,
        severity: gapPercent > 70 ? 'critical' : 'warning',
        message: `${heroName} Lv ${currentLevel} / ${maxForTH} (${Math.round(gapPercent)}% behind)`,
      });
      totalPenalty += gapPercent * 0.4; // Heroes weighted heavily
    }
  }

  // Check troops
  const troops = playerData.troops || [];
  let troopGaps = 0;
  let troopCount = 0;

  for (const [troopName, _] of Object.entries(TROOP_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(TROOP_MAX_LEVELS, troopName, th);
    if (maxForTH === 0) continue;

    troopCount++;
    const troop = troops.find((t) => t.name === troopName);
    const currentLevel = troop?.level || 0;
    const gap = maxForTH - currentLevel;

    if (gap > maxForTH * 0.5) {
      troopGaps++;
    }
  }

  if (troopCount > 0 && troopGaps / troopCount > 0.4) {
    details.push({
      type: 'troops',
      severity: troopGaps / troopCount > 0.6 ? 'critical' : 'warning',
      message: `${troopGaps}/${troopCount} troops are significantly underleveled`,
    });
    totalPenalty += (troopGaps / troopCount) * 30;
  }

  // Check TH vs experience level mismatch
  const expLevel = playerData.expLevel || 1;
  const expectedExp = th * 15; // rough heuristic
  if (expLevel < expectedExp * 0.7) {
    details.push({
      type: 'experience',
      severity: 'warning',
      message: `Experience level ${expLevel} is low for TH${th} (expected ~${expectedExp}+)`,
    });
    totalPenalty += 15;
  }

  const rushScore = Math.round(Math.min(100, totalPenalty));
  return {
    rushScore,
    isRushed: rushScore > 30,
    severity: rushScore > 70 ? 'critical' : rushScore > 30 ? 'moderate' : 'none',
    details,
  };
}

// ─── Win Rate ──────────────────────────────────────────
export function calcWinRate(playerData) {
  const wins = playerData?.attackWins || 0;
  const total = wins + (playerData?.defenseWins || 0);
  if (total === 0) return 0;
  return Math.round((wins / total) * 100);
}

// ─── Defense Rate ──────────────────────────────────────
export function calcDefenseRate(playerData) {
  const defWins = playerData?.defenseWins || 0;
  const total = (playerData?.attackWins || 0) + defWins;
  if (total === 0) return 0;
  return Math.round((defWins / total) * 100);
}

// ─── Donation Ratio ────────────────────────────────────
export function calcDonationRatio(playerData) {
  const donated = playerData?.donations || 0;
  const received = playerData?.donationsReceived || 1;
  return parseFloat((donated / received).toFixed(2));
}

// ─── Overall Account Health (0-100) ────────────────────
export function calcAccountHealth(playerData) {
  if (!playerData) return 0;

  const progression = calcProgressionScore(playerData);
  const rush = detectRushLevel(playerData);
  const rushPenalty = rush.rushScore * 0.5;
  const winRate = calcWinRate(playerData);

  // Composite score
  const health = Math.round(
    progression * 0.5 +
    (100 - rushPenalty) * 0.3 +
    winRate * 0.2
  );

  return Math.max(0, Math.min(100, health));
}

// ─── Trophy Efficiency ─────────────────────────────────
// How well the player maintains trophies relative to TH
export function calcTrophyEfficiency(playerData) {
  const trophies = playerData?.trophies || 0;
  const th = playerData?.townHallLevel || 1;
  const bestTrophies = playerData?.bestTrophies || trophies;

  // Expected trophy range per TH
  const expectedTrophies = Math.min(5000, th * 350);
  const currentRatio = Math.min(1.5, trophies / Math.max(1, expectedTrophies));
  const bestRatio = Math.min(1.5, bestTrophies / Math.max(1, expectedTrophies));

  return Math.round(((currentRatio * 0.6 + bestRatio * 0.4) / 1.5) * 100);
}

// ─── League Standing Quality ───────────────────────────
export function getLeagueQuality(playerData) {
  const league = playerData?.league?.name || 'Unranked';
  const th = playerData?.townHallLevel || 1;
  const trophies = playerData?.trophies || 0;

  let quality = 'average';
  const ratio = trophies / (th * 350);

  if (ratio > 1.3) quality = 'excellent';
  else if (ratio > 1.0) quality = 'good';
  else if (ratio > 0.7) quality = 'average';
  else if (ratio > 0.4) quality = 'below_average';
  else quality = 'poor';

  return { league, quality, trophies, ratio: parseFloat(ratio.toFixed(2)) };
}

// ─── Scoring Engine Public API ─────────────────────────
export const scoringEngine = {
  calcProgressionScore,
  calcHeroCompletionScore,
  calcTroopCompletionScore,
  calcSpellCompletionScore,
  calcDefenseCompletionScore,
  detectRushLevel,
  calcWinRate,
  calcDefenseRate,
  calcDonationRatio,
  calcAccountHealth,
  calcTrophyEfficiency,
  getLeagueQuality,
};

export default scoringEngine;

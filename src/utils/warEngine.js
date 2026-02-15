// ============================================
// Clash Intelligence Pro – War Engine
// ============================================
// Computes: war readiness %, offensive index,
// defensive index, hero strength score,
// star distribution analysis
// ============================================
import {
  HERO_MAX_LEVELS,
  TROOP_MAX_LEVELS,
  SPELL_MAX_LEVELS,
  WAR_WEIGHT,
  getMaxLevel,
} from './constants';

// ─── War Readiness Score (0-100) ───────────────────────
// How prepared is this player for clan war?
export function calcWarReadiness(playerData) {
  if (!playerData) return { score: 0, breakdown: {} };

  const th = playerData.townHallLevel || 1;
  const heroScore = calcHeroStrengthForWar(playerData, th);
  const offensiveScore = calcOffensiveIndex(playerData, th);
  const defensiveScore = calcDefensiveIndex(playerData, th);
  const spellScore = calcSpellReadiness(playerData, th);

  const readiness = Math.round(
    heroScore * 0.35 +
    offensiveScore * 0.30 +
    defensiveScore * 0.20 +
    spellScore * 0.15
  );

  return {
    score: Math.max(0, Math.min(100, readiness)),
    breakdown: {
      heroes: Math.round(heroScore),
      offense: Math.round(offensiveScore),
      defense: Math.round(defensiveScore),
      spells: Math.round(spellScore),
    },
    label: getReadinessLabel(readiness),
  };
}

function getReadinessLabel(score) {
  if (score >= 90) return 'Battle Ready';
  if (score >= 75) return 'Strong';
  if (score >= 60) return 'Decent';
  if (score >= 40) return 'Needs Work';
  if (score >= 20) return 'Weak';
  return 'Not Ready';
}

// ─── Offensive Index (0-100) ───────────────────────────
// Measures attack capability
export function calcOffensiveIndex(playerData, th) {
  if (!playerData) return 0;

  th = th || playerData.townHallLevel || 1;
  const troops = playerData.troops || [];

  // Key offensive troops for war
  const keyTroops = [
    'Hog Rider', 'Lava Hound', 'Balloon', 'Electro Dragon',
    'Witch', 'Bowler', 'Yeti', 'Dragon', 'P.E.K.K.A',
    'Miner', 'Golem', 'Valkyrie', 'Dragon Rider', 'Root Rider',
    'Electro Titan', 'Healer',
  ];

  let totalMax = 0;
  let totalCurrent = 0;
  let keyTroopScore = 0;
  let keyTroopMax = 0;

  for (const [troopName, _] of Object.entries(TROOP_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(TROOP_MAX_LEVELS, troopName, th);
    if (maxForTH === 0) continue;

    const troop = troops.find((t) => t.name === troopName);
    const current = troop?.level || 0;

    totalMax += maxForTH;
    totalCurrent += Math.min(current, maxForTH);

    if (keyTroops.includes(troopName)) {
      keyTroopMax += maxForTH;
      keyTroopScore += Math.min(current, maxForTH);
    }
  }

  const overallTroopPct = totalMax > 0 ? (totalCurrent / totalMax) * 100 : 0;
  const keyTroopPct = keyTroopMax > 0 ? (keyTroopScore / keyTroopMax) * 100 : 0;

  // Weight key troops more heavily
  return overallTroopPct * 0.4 + keyTroopPct * 0.6;
}

// ─── Defensive Index (0-100) ───────────────────────────
// Estimated from defense wins, trophies, war stars
export function calcDefensiveIndex(playerData, th) {
  if (!playerData) return 0;

  th = th || playerData.townHallLevel || 1;
  const defenseWins = playerData.defenseWins || 0;
  const trophies = playerData.trophies || 0;
  const warStars = playerData.warStars || 0;

  // Defense wins relative to TH
  const defenseScore = Math.min(100, (defenseWins / Math.max(1, th * th * 5)) * 100);

  // Trophy holding (higher trophies with good defense = strong base)
  const trophyScore = Math.min(100, (trophies / Math.max(1, th * 350)) * 100);

  // Composite
  return defenseScore * 0.6 + trophyScore * 0.4;
}

// ─── Hero Strength Score (0-100) ───────────────────────
export function calcHeroStrengthForWar(playerData, th) {
  if (!playerData) return 0;

  th = th || playerData.townHallLevel || 1;
  const heroes = playerData.heroes || [];

  if (th < 7) return 100; // No heroes available

  let totalMax = 0;
  let totalCurrent = 0;

  for (const [heroName, _] of Object.entries(HERO_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(HERO_MAX_LEVELS, heroName, th);
    if (maxForTH === 0) continue;

    totalMax += maxForTH;
    const hero = heroes.find((h) => h.name === heroName);
    totalCurrent += hero ? Math.min(hero.level, maxForTH) : 0;
  }

  return totalMax > 0 ? (totalCurrent / totalMax) * 100 : 0;
}

// ─── Hero Details for Display ──────────────────────────
export function getHeroDetails(playerData) {
  if (!playerData) return [];

  const th = playerData.townHallLevel || 1;
  const heroes = playerData.heroes || [];

  return Object.entries(HERO_MAX_LEVELS)
    .map(([heroName, _]) => {
      const maxForTH = getMaxLevel(HERO_MAX_LEVELS, heroName, th);
      if (maxForTH === 0) return null;

      const hero = heroes.find((h) => h.name === heroName);
      const current = hero?.level || 0;

      return {
        name: heroName,
        level: current,
        maxLevel: maxForTH,
        percentage: Math.round((current / maxForTH) * 100),
        isMaxed: current >= maxForTH,
        remaining: maxForTH - current,
      };
    })
    .filter(Boolean);
}

// ─── Spell Readiness ───────────────────────────────────
export function calcSpellReadiness(playerData, th) {
  if (!playerData) return 0;

  th = th || playerData.townHallLevel || 1;
  const spells = playerData.spells || [];

  if (th < 5) return 100;

  // Key war spells
  const keySpells = ['Rage Spell', 'Healing Spell', 'Freeze Spell', 'Poison Spell', 'Jump Spell', 'Haste Spell'];

  let totalMax = 0;
  let totalCurrent = 0;
  let keyMax = 0;
  let keyCurrent = 0;

  for (const [spellName, _] of Object.entries(SPELL_MAX_LEVELS)) {
    const maxForTH = getMaxLevel(SPELL_MAX_LEVELS, spellName, th);
    if (maxForTH === 0) continue;

    const spell = spells.find((s) => s.name === spellName);
    const current = spell?.level || 0;

    totalMax += maxForTH;
    totalCurrent += Math.min(current, maxForTH);

    if (keySpells.includes(spellName)) {
      keyMax += maxForTH;
      keyCurrent += Math.min(current, maxForTH);
    }
  }

  const overallPct = totalMax > 0 ? (totalCurrent / totalMax) * 100 : 0;
  const keyPct = keyMax > 0 ? (keyCurrent / keyMax) * 100 : 0;

  return overallPct * 0.4 + keyPct * 0.6;
}

// ─── Star Distribution Analysis ────────────────────────
// Analyze war performance from war data
export function analyzeStarDistribution(warData) {
  if (!warData?.clan?.members) return { distribution: [0, 0, 0, 0], avgStars: 0, totalAttacks: 0 };

  const distribution = [0, 0, 0, 0]; // 0-star, 1-star, 2-star, 3-star
  let totalStars = 0;
  let totalAttacks = 0;

  for (const member of warData.clan.members) {
    if (!member.attacks) continue;
    for (const attack of member.attacks) {
      const stars = attack.stars || 0;
      distribution[stars]++;
      totalStars += stars;
      totalAttacks++;
    }
  }

  const avgStars = totalAttacks > 0 ? parseFloat((totalStars / totalAttacks).toFixed(2)) : 0;

  // Percentage distribution
  const percentages = distribution.map((count) =>
    totalAttacks > 0 ? Math.round((count / totalAttacks) * 100) : 0
  );

  return {
    distribution,
    percentages,
    avgStars,
    totalStars,
    totalAttacks,
    threeStarRate: percentages[3],
    twoStarPlusRate: percentages[2] + percentages[3],
  };
}

// ─── War Performance Comparison ────────────────────────
export function analyzeWarPerformance(warData) {
  if (!warData) return null;

  const clan = warData.clan || {};
  const opponent = warData.opponent || {};

  const clanStars = clan.stars || 0;
  const opponentStars = opponent.stars || 0;
  const clanDestruction = clan.destructionPercentage || 0;
  const opponentDestruction = opponent.destructionPercentage || 0;
  const teamSize = warData.teamSize || 0;

  const maxPossibleStars = teamSize * 3;

  return {
    state: warData.state || 'unknown',
    teamSize,
    clan: {
      name: clan.name || 'Your Clan',
      tag: clan.tag || '',
      stars: clanStars,
      destruction: parseFloat(clanDestruction.toFixed(2)),
      attacks: clan.attacks || 0,
      maxStars: maxPossibleStars,
      starEfficiency: maxPossibleStars > 0
        ? Math.round((clanStars / maxPossibleStars) * 100)
        : 0,
    },
    opponent: {
      name: opponent.name || 'Opponent',
      tag: opponent.tag || '',
      stars: opponentStars,
      destruction: parseFloat(opponentDestruction.toFixed(2)),
      attacks: opponent.attacks || 0,
      maxStars: maxPossibleStars,
      starEfficiency: maxPossibleStars > 0
        ? Math.round((opponentStars / maxPossibleStars) * 100)
        : 0,
    },
    result: clanStars > opponentStars
      ? 'winning'
      : clanStars < opponentStars
        ? 'losing'
        : clanDestruction > opponentDestruction
          ? 'winning'
          : clanDestruction < opponentDestruction
            ? 'losing'
            : 'tied',
    starDifference: clanStars - opponentStars,
    destructionDifference: parseFloat((clanDestruction - opponentDestruction).toFixed(2)),
  };
}

// ─── Individual War Attack Analysis ────────────────────
export function analyzePlayerWarAttacks(warData, playerTag) {
  if (!warData?.clan?.members) return null;

  const member = warData.clan.members.find((m) => m.tag === playerTag);
  if (!member) return null;

  const attacks = member.attacks || [];
  const totalStars = attacks.reduce((sum, a) => sum + (a.stars || 0), 0);
  const totalDestruction = attacks.reduce((sum, a) => sum + (a.destructionPercentage || 0), 0);
  const avgStars = attacks.length > 0 ? (totalStars / attacks.length) : 0;
  const avgDestruction = attacks.length > 0 ? (totalDestruction / attacks.length) : 0;

  return {
    name: member.name,
    tag: member.tag,
    mapPosition: member.mapPosition,
    townhallLevel: member.townhallLevel,
    attacks: attacks.map((a) => ({
      stars: a.stars,
      destruction: a.destructionPercentage,
      order: a.order,
      defenderTag: a.defenderTag,
    })),
    totalStars,
    avgStars: parseFloat(avgStars.toFixed(2)),
    avgDestruction: parseFloat(avgDestruction.toFixed(1)),
    attacksUsed: attacks.length,
    bestAttack: attacks.length > 0
      ? attacks.reduce((best, a) =>
          (a.stars > best.stars || (a.stars === best.stars && a.destructionPercentage > best.destructionPercentage))
            ? a : best
        )
      : null,
    opponentDefenses: member.opponentAttacks || 0,
    bestOpponentAttack: member.bestOpponentAttack || null,
  };
}

// ─── War Radar Chart Data ──────────────────────────────
// Returns normalized data for a radar chart
export function getWarRadarData(playerData, warData) {
  const th = playerData?.townHallLevel || 1;
  const readiness = calcWarReadiness(playerData);

  const offensiveIdx = calcOffensiveIndex(playerData, th);
  const defensiveIdx = calcDefensiveIndex(playerData, th);
  const heroStrength = calcHeroStrengthForWar(playerData, th);
  const spellReady = calcSpellReadiness(playerData, th);

  // War stars analysis if available
  let starPerf = 50;
  if (warData?.clan?.members) {
    const starDist = analyzeStarDistribution(warData);
    starPerf = starDist.avgStars > 0 ? (starDist.avgStars / 3) * 100 : 50;
  }

  return [
    { axis: 'Offense', value: Math.round(offensiveIdx), fullMark: 100 },
    { axis: 'Defense', value: Math.round(defensiveIdx), fullMark: 100 },
    { axis: 'Heroes', value: Math.round(heroStrength), fullMark: 100 },
    { axis: 'Spells', value: Math.round(spellReady), fullMark: 100 },
    { axis: 'Stars', value: Math.round(starPerf), fullMark: 100 },
    { axis: 'Overall', value: readiness.score, fullMark: 100 },
  ];
}

// ─── War Engine Public API ─────────────────────────────
export const warEngine = {
  calcWarReadiness,
  calcOffensiveIndex,
  calcDefensiveIndex,
  calcHeroStrengthForWar,
  calcSpellReadiness,
  getHeroDetails,
  analyzeStarDistribution,
  analyzeWarPerformance,
  analyzePlayerWarAttacks,
  getWarRadarData,
};

export default warEngine;

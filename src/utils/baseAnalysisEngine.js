// ============================================
// Clash Intelligence Pro – Base Analysis Engine
// ============================================
// Computes: air defense score, ground defense
// score, splash density, weak compartments,
// structural imbalance, base layout assessment
// ============================================

import { TH_DATA, DEFENSE_MAX_LEVELS, BUILDING_CATEGORIES } from './constants';

// ─── Defense Category Weights ──────────────────────────
const DEFENSE_WEIGHTS = {
  // Air defenses
  'Air Defense': { category: 'air', weight: 10 },
  'Air Sweeper': { category: 'air', weight: 5 },
  'Seeking Air Mine': { category: 'air', weight: 3 },
  'Inferno Tower': { category: 'both', weight: 9, airWeight: 7, groundWeight: 8 },
  'Eagle Artillery': { category: 'both', weight: 10, airWeight: 8, groundWeight: 10 },
  'Scattershot': { category: 'both', weight: 9, airWeight: 7, groundWeight: 9 },
  'Monolith': { category: 'ground', weight: 10 },
  'Spell Tower': { category: 'both', weight: 7, airWeight: 5, groundWeight: 7 },

  // Ground defenses
  'Cannon': { category: 'ground', weight: 4 },
  'Archer Tower': { category: 'both', weight: 5, airWeight: 4, groundWeight: 5 },
  'Mortar': { category: 'ground', weight: 3, splash: true },
  'Wizard Tower': { category: 'both', weight: 6, airWeight: 5, groundWeight: 6, splash: true },
  'Bomb Tower': { category: 'ground', weight: 5, splash: true },
  'X-Bow': { category: 'both', weight: 8, airWeight: 6, groundWeight: 8 },

  // Traps / misc
  'Tesla': { category: 'ground', weight: 5 },
  'Giant Bomb': { category: 'ground', weight: 4 },
  'Bomb': { category: 'ground', weight: 1 },
  'Spring Trap': { category: 'ground', weight: 3 },
};

// ─── Air Defense Score (0-100) ─────────────────────────
// How well-defended is this base against air attacks?
export function calcAirDefenseScore(playerData) {
  if (!playerData) return { score: 0, details: [] };

  const thLevel = playerData.townHallLevel || 1;
  const buildings = extractDefenseBuildings(playerData);

  let earnedPoints = 0;
  let maxPoints = 0;
  const details = [];

  for (const building of buildings) {
    const config = DEFENSE_WEIGHTS[building.name];
    if (!config) continue;

    if (config.category === 'air' || config.category === 'both') {
      const weight = config.airWeight || config.weight;
      const maxLevel = getDefenseMaxLevel(building.name, thLevel);

      if (maxLevel > 0) {
        const contribution = (building.level / maxLevel) * weight;
        earnedPoints += contribution;
        maxPoints += weight;

        if (building.level < maxLevel) {
          details.push({
            name: building.name,
            level: building.level,
            maxLevel,
            deficit: maxLevel - building.level,
            impact: weight,
            priority: weight * (1 - building.level / maxLevel),
          });
        }
      }
    }
  }

  // Sort details by priority (highest first)
  details.sort((a, b) => b.priority - a.priority);

  const score = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;

  return {
    score,
    rating: getRating(score),
    earnedPoints: parseFloat(earnedPoints.toFixed(1)),
    maxPoints,
    weakPoints: details.slice(0, 5),
    details,
  };
}

// ─── Ground Defense Score (0-100) ──────────────────────
export function calcGroundDefenseScore(playerData) {
  if (!playerData) return { score: 0, details: [] };

  const thLevel = playerData.townHallLevel || 1;
  const buildings = extractDefenseBuildings(playerData);

  let earnedPoints = 0;
  let maxPoints = 0;
  const details = [];

  for (const building of buildings) {
    const config = DEFENSE_WEIGHTS[building.name];
    if (!config) continue;

    if (config.category === 'ground' || config.category === 'both') {
      const weight = config.groundWeight || config.weight;
      const maxLevel = getDefenseMaxLevel(building.name, thLevel);

      if (maxLevel > 0) {
        const contribution = (building.level / maxLevel) * weight;
        earnedPoints += contribution;
        maxPoints += weight;

        if (building.level < maxLevel) {
          details.push({
            name: building.name,
            level: building.level,
            maxLevel,
            deficit: maxLevel - building.level,
            impact: weight,
            priority: weight * (1 - building.level / maxLevel),
          });
        }
      }
    }
  }

  details.sort((a, b) => b.priority - a.priority);

  const score = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;

  return {
    score,
    rating: getRating(score),
    earnedPoints: parseFloat(earnedPoints.toFixed(1)),
    maxPoints,
    weakPoints: details.slice(0, 5),
    details,
  };
}

// ─── Splash Damage Density ─────────────────────────────
// How much splash damage coverage does the base have?
export function calcSplashDensity(playerData) {
  if (!playerData) return { score: 0, buildings: [] };

  const thLevel = playerData.townHallLevel || 1;
  const buildings = extractDefenseBuildings(playerData);

  const splashBuildings = [];
  let earnedPoints = 0;
  let maxPoints = 0;

  for (const building of buildings) {
    const config = DEFENSE_WEIGHTS[building.name];
    if (!config?.splash) continue;

    const maxLevel = getDefenseMaxLevel(building.name, thLevel);
    if (maxLevel <= 0) continue;

    const completionPct = (building.level / maxLevel) * 100;
    earnedPoints += building.level;
    maxPoints += maxLevel;

    splashBuildings.push({
      name: building.name,
      level: building.level,
      maxLevel,
      completionPct: Math.round(completionPct),
    });
  }

  const score = maxPoints > 0 ? Math.round((earnedPoints / maxPoints) * 100) : 0;

  return {
    score,
    rating: getRating(score),
    buildings: splashBuildings,
    coverage: score >= 80 ? 'excellent' : score >= 60 ? 'good' : score >= 40 ? 'moderate' : 'low',
  };
}

// ─── Weak Compartment Detection ────────────────────────
// Identify defense categories that are disproportionately weak
export function detectWeakCompartments(playerData) {
  if (!playerData) return [];

  const thLevel = playerData.townHallLevel || 1;
  const buildings = extractDefenseBuildings(playerData);
  const compartments = {};

  // Group by building categories
  for (const building of buildings) {
    const category = getBuildingCategory(building.name);
    if (!compartments[category]) {
      compartments[category] = { earned: 0, max: 0, buildings: [] };
    }

    const maxLevel = getDefenseMaxLevel(building.name, thLevel);
    if (maxLevel > 0) {
      compartments[category].earned += building.level;
      compartments[category].max += maxLevel;
      compartments[category].buildings.push({
        name: building.name,
        level: building.level,
        maxLevel,
        pct: Math.round((building.level / maxLevel) * 100),
      });
    }
  }

  // Calculate scores and identify weak ones
  const results = [];
  for (const [category, data] of Object.entries(compartments)) {
    const score = data.max > 0 ? Math.round((data.earned / data.max) * 100) : 0;

    // Sort buildings by completion percentage (weakest first)
    data.buildings.sort((a, b) => a.pct - b.pct);

    results.push({
      category,
      score,
      rating: getRating(score),
      isWeak: score < 60,
      buildings: data.buildings,
      weakestBuilding: data.buildings[0] || null,
    });
  }

  // Sort: weakest compartments first
  results.sort((a, b) => a.score - b.score);

  return results;
}

// ─── Structural Imbalance Detection ────────────────────
// Detect if offense is far ahead of defense or vice versa
export function detectStructuralImbalance(playerData) {
  if (!playerData) return null;

  const thLevel = playerData.townHallLevel || 1;

  // Offense: heroes + troops + spells
  const heroScore = calcHeroCompletion(playerData);
  const troopScore = calcTroopCompletion(playerData);
  const spellScore = calcSpellCompletion(playerData);

  const offenseScore = Math.round(
    heroScore * 0.40 + troopScore * 0.35 + spellScore * 0.25
  );

  // Defense: all defensive buildings
  const defenseScore = calcOverallDefenseScore(playerData);

  const imbalance = offenseScore - defenseScore;
  const absImbalance = Math.abs(imbalance);

  let severity = 'balanced';
  if (absImbalance > 30) severity = 'severe';
  else if (absImbalance > 20) severity = 'moderate';
  else if (absImbalance > 10) severity = 'slight';

  let recommendation = '';
  if (imbalance > 20) {
    recommendation = 'Your offense is significantly stronger than your defense. Focus on upgrading defensive buildings to balance your base.';
  } else if (imbalance > 10) {
    recommendation = 'Offense is slightly ahead of defense. Consider prioritizing some key defensive upgrades.';
  } else if (imbalance < -20) {
    recommendation = 'Your defense is significantly stronger than your offense. Focus on upgrading heroes, troops, and spells.';
  } else if (imbalance < -10) {
    recommendation = 'Defense is slightly ahead of offense. Consider prioritizing some hero or troop upgrades.';
  } else {
    recommendation = 'Your base has a well-balanced progression between offense and defense. Keep it up!';
  }

  return {
    offenseScore,
    defenseScore,
    imbalance,
    absImbalance,
    severity,
    direction: imbalance > 0 ? 'offense_heavy' : imbalance < 0 ? 'defense_heavy' : 'balanced',
    recommendation,
    breakdown: {
      heroScore,
      troopScore,
      spellScore,
      defenseScore,
    },
  };
}

// ─── Overall Base Assessment ───────────────────────────
// Comprehensive base analysis combining all metrics
export function assessBase(playerData) {
  if (!playerData) return null;

  const air = calcAirDefenseScore(playerData);
  const ground = calcGroundDefenseScore(playerData);
  const splash = calcSplashDensity(playerData);
  const compartments = detectWeakCompartments(playerData);
  const imbalance = detectStructuralImbalance(playerData);

  const weakCompartments = compartments.filter((c) => c.isWeak);

  // Overall base score
  const overallScore = Math.round(
    air.score * 0.25 +
    ground.score * 0.30 +
    splash.score * 0.15 +
    (imbalance ? (100 - imbalance.absImbalance) : 50) * 0.15 +
    (100 - weakCompartments.length * 15) * 0.15
  );

  // Generate AI-ready summary
  const summary = {
    thLevel: playerData.townHallLevel || 1,
    overallScore: Math.max(0, Math.min(100, overallScore)),
    overallRating: getRating(Math.max(0, Math.min(100, overallScore))),
    airDefense: air,
    groundDefense: ground,
    splashCoverage: splash,
    compartments,
    weakCompartments,
    imbalance,
  };

  // Generate recommendations
  summary.recommendations = generateRecommendations(summary);

  // Radar chart data
  summary.radarData = [
    { subject: 'Air Defense', value: air.score, fullMark: 100 },
    { subject: 'Ground Defense', value: ground.score, fullMark: 100 },
    { subject: 'Splash Coverage', value: splash.score, fullMark: 100 },
    { subject: 'Balance', value: Math.max(0, 100 - (imbalance?.absImbalance || 0)), fullMark: 100 },
    { subject: 'Completeness', value: Math.max(0, 100 - weakCompartments.length * 15), fullMark: 100 },
  ];

  return summary;
}

// ─── Recommendation Generator ──────────────────────────
function generateRecommendations(assessment) {
  const recs = [];

  // Air defense recommendations
  if (assessment.airDefense.score < 60) {
    const weakAir = assessment.airDefense.weakPoints[0];
    recs.push({
      priority: 'high',
      category: 'air_defense',
      icon: '🛡️',
      title: 'Upgrade Air Defenses',
      description: weakAir
        ? `${weakAir.name} is at level ${weakAir.level}/${weakAir.maxLevel}. Prioritize air defense upgrades to protect against air attacks.`
        : 'Your air defenses need attention. Upgrade them to counter popular air strategies.',
    });
  }

  // Ground defense recommendations
  if (assessment.groundDefense.score < 60) {
    const weakGround = assessment.groundDefense.weakPoints[0];
    recs.push({
      priority: 'high',
      category: 'ground_defense',
      icon: '🏰',
      title: 'Strengthen Ground Defenses',
      description: weakGround
        ? `${weakGround.name} is at level ${weakGround.level}/${weakGround.maxLevel}. Ground defenses need upgrades.`
        : 'Ground defenses are behind. Upgrade cannons, archer towers, and X-Bows.',
    });
  }

  // Splash damage
  if (assessment.splashCoverage.score < 50) {
    recs.push({
      priority: 'medium',
      category: 'splash',
      icon: '💥',
      title: 'Improve Splash Coverage',
      description: 'Wizard Towers, Bomb Towers, and Mortars need upgrading to handle mass attacks effectively.',
    });
  }

  // Imbalance
  if (assessment.imbalance && assessment.imbalance.severity !== 'balanced') {
    recs.push({
      priority: assessment.imbalance.severity === 'severe' ? 'high' : 'medium',
      category: 'balance',
      icon: '⚖️',
      title: 'Address Base Imbalance',
      description: assessment.imbalance.recommendation,
    });
  }

  // Weak compartments
  for (const comp of assessment.weakCompartments.slice(0, 2)) {
    recs.push({
      priority: comp.score < 40 ? 'high' : 'medium',
      category: 'compartment',
      icon: '📊',
      title: `Upgrade ${comp.category}`,
      description: comp.weakestBuilding
        ? `${comp.weakestBuilding.name} at ${comp.weakestBuilding.pct}% completion is the weakest in this category.`
        : `The ${comp.category} category is at ${comp.score}% and needs attention.`,
    });
  }

  // Sort by priority
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recs.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recs;
}

// ─── Helper: Extract Defense Buildings ─────────────────
function extractDefenseBuildings(playerData) {
  // CoC API doesn't give building layout, but we can infer
  // defense levels from the 'buildings' or 'achievements' data
  // For now, we work with what the API provides and use TH-based estimation

  const buildings = [];

  // If playerData has a buildings array (from extended API data)
  if (playerData.buildings) {
    for (const b of playerData.buildings) {
      if (DEFENSE_WEIGHTS[b.name]) {
        buildings.push({ name: b.name, level: b.level || 1 });
      }
    }
  }

  // If no buildings data, estimate from TH level
  if (buildings.length === 0) {
    const thLevel = playerData.townHallLevel || 1;
    return estimateDefensesFromTH(thLevel);
  }

  return buildings;
}

// Estimate defense buildings when API doesn't provide them
function estimateDefensesFromTH(thLevel) {
  const estimates = [];
  const thConfig = TH_DATA[thLevel];
  if (!thConfig) return estimates;

  // Standard defense counts by TH level (approximate)
  const defenseCountsByTH = {
    'Cannon': Math.min(7, Math.max(2, thLevel - 1)),
    'Archer Tower': Math.min(8, Math.max(1, thLevel - 2)),
    'Mortar': thLevel >= 3 ? Math.min(4, thLevel - 2) : 0,
    'Air Defense': thLevel >= 4 ? Math.min(5, thLevel - 3) : 0,
    'Wizard Tower': thLevel >= 5 ? Math.min(5, thLevel - 4) : 0,
    'Air Sweeper': thLevel >= 6 ? Math.min(2, thLevel - 5) : 0,
    'Tesla': thLevel >= 7 ? Math.min(5, thLevel - 5) : 0,
    'Bomb Tower': thLevel >= 8 ? Math.min(2, thLevel - 7) : 0,
    'X-Bow': thLevel >= 9 ? Math.min(4, thLevel - 7) : 0,
    'Inferno Tower': thLevel >= 10 ? Math.min(3, thLevel - 8) : 0,
    'Eagle Artillery': thLevel >= 11 ? 1 : 0,
    'Scattershot': thLevel >= 13 ? Math.min(2, thLevel - 12) : 0,
    'Monolith': thLevel >= 15 ? 1 : 0,
    'Spell Tower': thLevel >= 15 ? Math.min(2, thLevel - 14) : 0,
  };

  for (const [name, count] of Object.entries(defenseCountsByTH)) {
    const maxLevel = getDefenseMaxLevel(name, thLevel);
    for (let i = 0; i < count; i++) {
      // Assume average completion: ~75% of max level
      estimates.push({
        name,
        level: Math.max(1, Math.round(maxLevel * 0.75)),
        estimated: true,
      });
    }
  }

  return estimates;
}

// ─── Helper: Get Defense Max Level ─────────────────────
function getDefenseMaxLevel(buildingName, thLevel) {
  const levels = DEFENSE_MAX_LEVELS[buildingName];
  if (!levels) return 0;

  // Find the max level available at this TH
  let maxLevel = 0;
  for (const [th, level] of Object.entries(levels)) {
    if (parseInt(th) <= thLevel) {
      maxLevel = Math.max(maxLevel, level);
    }
  }

  return maxLevel;
}

// ─── Helper: Get Building Category ─────────────────────
function getBuildingCategory(buildingName) {
  const config = DEFENSE_WEIGHTS[buildingName];
  if (!config) return 'other';

  if (config.category === 'air') return 'Air Defense';
  if (config.category === 'ground') return 'Ground Defense';
  if (config.category === 'both') return 'Multi-Target';
  return 'Other';
}

// ─── Helper: Hero Completion ───────────────────────────
function calcHeroCompletion(playerData) {
  const heroes = playerData.heroes || [];
  if (heroes.length === 0) return 0;

  let earned = 0;
  let max = 0;

  for (const hero of heroes) {
    if (hero.village !== 'home') continue;
    earned += hero.level || 0;
    max += hero.maxLevel || hero.level || 1;
  }

  return max > 0 ? Math.round((earned / max) * 100) : 0;
}

// ─── Helper: Troop Completion ──────────────────────────
function calcTroopCompletion(playerData) {
  const troops = playerData.troops || [];
  if (troops.length === 0) return 0;

  let earned = 0;
  let max = 0;

  for (const troop of troops) {
    if (troop.village !== 'home') continue;
    earned += troop.level || 0;
    max += troop.maxLevel || troop.level || 1;
  }

  return max > 0 ? Math.round((earned / max) * 100) : 0;
}

// ─── Helper: Spell Completion ──────────────────────────
function calcSpellCompletion(playerData) {
  const spells = playerData.spells || [];
  if (spells.length === 0) return 0;

  let earned = 0;
  let max = 0;

  for (const spell of spells) {
    earned += spell.level || 0;
    max += spell.maxLevel || spell.level || 1;
  }

  return max > 0 ? Math.round((earned / max) * 100) : 0;
}

// ─── Helper: Overall Defense Score ─────────────────────
function calcOverallDefenseScore(playerData) {
  const air = calcAirDefenseScore(playerData);
  const ground = calcGroundDefenseScore(playerData);
  return Math.round(air.score * 0.40 + ground.score * 0.60);
}

// ─── Helper: Rating String ─────────────────────────────
function getRating(score) {
  if (score >= 90) return 'S';
  if (score >= 80) return 'A';
  if (score >= 70) return 'B';
  if (score >= 60) return 'C';
  if (score >= 40) return 'D';
  return 'F';
}

// ─── Base Analysis Engine Public API ───────────────────
export const baseAnalysisEngine = {
  calcAirDefenseScore,
  calcGroundDefenseScore,
  calcSplashDensity,
  detectWeakCompartments,
  detectStructuralImbalance,
  assessBase,
};

export default baseAnalysisEngine;

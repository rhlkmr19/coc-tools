// ============================================
// Clash Intelligence Pro – Analytics Engine
// ============================================
// Computes: growth projection, trophy trends,
// performance heatmap data, upgrade timelines,
// clan activity metrics
// ============================================

// ─── Trophy Trend Data ─────────────────────────────────
// Transform player history into chart-ready data
export function buildTrophyTrend(playerHistory) {
  if (!playerHistory || playerHistory.length === 0) return [];

  return playerHistory.map((entry) => ({
    date: formatDate(entry.timestamp),
    timestamp: entry.timestamp,
    trophies: entry.trophies || 0,
    bestTrophies: entry.bestTrophies || 0,
    attackWins: entry.attackWins || 0,
    defenseWins: entry.defenseWins || 0,
  }));
}

// ─── Upgrade Timeline Data ─────────────────────────────
// Create timeline visualization data from snapshots
export function buildUpgradeTimeline(snapshots) {
  if (!snapshots || snapshots.length < 2) return [];

  const timeline = [];

  for (let i = 1; i < snapshots.length; i++) {
    const prev = snapshots[i - 1];
    const curr = snapshots[i];

    const changes = detectChanges(prev.playerData, curr.playerData);
    if (changes.length > 0) {
      timeline.push({
        date: formatDate(curr.timestamp),
        timestamp: curr.timestamp,
        changes,
        changeCount: changes.length,
      });
    }
  }

  return timeline;
}

// Detect what changed between two player snapshots
function detectChanges(prevData, currData) {
  const changes = [];
  if (!prevData || !currData) return changes;

  // TH upgrade
  if ((currData.townHallLevel || 0) > (prevData.townHallLevel || 0)) {
    changes.push({
      type: 'townhall',
      name: 'Town Hall',
      from: prevData.townHallLevel,
      to: currData.townHallLevel,
      icon: '🏰',
    });
  }

  // Hero level changes
  const prevHeroes = prevData.heroes || [];
  const currHeroes = currData.heroes || [];
  for (const currHero of currHeroes) {
    const prevHero = prevHeroes.find((h) => h.name === currHero.name);
    if (prevHero && currHero.level > prevHero.level) {
      changes.push({
        type: 'hero',
        name: currHero.name,
        from: prevHero.level,
        to: currHero.level,
        icon: '⚔️',
      });
    }
  }

  // Troop level changes
  const prevTroops = prevData.troops || [];
  const currTroops = currData.troops || [];
  for (const currTroop of currTroops) {
    const prevTroop = prevTroops.find((t) => t.name === currTroop.name);
    if (prevTroop && currTroop.level > prevTroop.level) {
      changes.push({
        type: 'troop',
        name: currTroop.name,
        from: prevTroop.level,
        to: currTroop.level,
        icon: '🗡️',
      });
    }
  }

  // Trophy changes
  const trophyDiff = (currData.trophies || 0) - (prevData.trophies || 0);
  if (Math.abs(trophyDiff) > 100) {
    changes.push({
      type: 'trophies',
      name: 'Trophies',
      from: prevData.trophies,
      to: currData.trophies,
      diff: trophyDiff,
      icon: trophyDiff > 0 ? '📈' : '📉',
    });
  }

  // War stars change
  const starDiff = (currData.warStars || 0) - (prevData.warStars || 0);
  if (starDiff > 0) {
    changes.push({
      type: 'warStars',
      name: 'War Stars',
      from: prevData.warStars,
      to: currData.warStars,
      diff: starDiff,
      icon: '⭐',
    });
  }

  return changes;
}

// ─── Performance Heatmap Data ──────────────────────────
// Build a 7x24 heatmap (day of week × hour) from history timestamps
export function buildPerformanceHeatmap(playerHistory) {
  // Create 7x24 grid (0 = Monday, 6 = Sunday)
  const heatmap = Array.from({ length: 7 }, () => Array(24).fill(0));

  if (!playerHistory || playerHistory.length < 2) return formatHeatmapData(heatmap);

  // Calculate trophy changes between consecutive data points
  for (let i = 1; i < playerHistory.length; i++) {
    const prev = playerHistory[i - 1];
    const curr = playerHistory[i];

    const trophyGain = Math.max(0, (curr.trophies || 0) - (prev.trophies || 0));
    const attackGain = Math.max(0, (curr.attackWins || 0) - (prev.attackWins || 0));

    if (trophyGain > 0 || attackGain > 0) {
      const date = new Date(curr.timestamp);
      const day = (date.getDay() + 6) % 7; // Monday = 0
      const hour = date.getHours();

      heatmap[day][hour] += trophyGain + attackGain * 10;
    }
  }

  return formatHeatmapData(heatmap);
}

function formatHeatmapData(heatmap) {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const data = [];

  // Find max value for normalization
  let maxVal = 0;
  for (const row of heatmap) {
    for (const val of row) {
      if (val > maxVal) maxVal = val;
    }
  }

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const rawValue = heatmap[day][hour];
      data.push({
        day: days[day],
        dayIndex: day,
        hour,
        hourLabel: `${hour.toString().padStart(2, '0')}:00`,
        value: rawValue,
        intensity: maxVal > 0 ? Math.round((rawValue / maxVal) * 100) : 0,
      });
    }
  }

  return data;
}

// ─── Growth Projection ─────────────────────────────────
// Project future stats based on historical trends
export function projectGrowth(playerHistory, daysForward = 30) {
  if (!playerHistory || playerHistory.length < 2) {
    return {
      trophyProjection: [],
      warStarProjection: [],
      confidence: 0,
      trend: 'insufficient_data',
    };
  }

  const sorted = [...playerHistory].sort((a, b) => a.timestamp - b.timestamp);

  // Calculate daily averages
  const firstEntry = sorted[0];
  const lastEntry = sorted[sorted.length - 1];
  const daySpan = Math.max(1, (lastEntry.timestamp - firstEntry.timestamp) / (1000 * 60 * 60 * 24));

  const trophyChange = (lastEntry.trophies || 0) - (firstEntry.trophies || 0);
  const dailyTrophyRate = trophyChange / daySpan;

  const starChange = (lastEntry.warStars || 0) - (firstEntry.warStars || 0);
  const dailyStarRate = starChange / daySpan;

  const attackChange = (lastEntry.attackWins || 0) - (firstEntry.attackWins || 0);
  const dailyAttackRate = attackChange / daySpan;

  // Project forward
  const trophyProjection = [];
  const warStarProjection = [];
  const currentTrophies = lastEntry.trophies || 0;
  const currentStars = lastEntry.warStars || 0;

  for (let d = 0; d <= daysForward; d++) {
    const projDate = new Date(lastEntry.timestamp);
    projDate.setDate(projDate.getDate() + d);

    trophyProjection.push({
      date: formatDate(projDate.getTime()),
      timestamp: projDate.getTime(),
      projected: Math.round(currentTrophies + dailyTrophyRate * d),
      isProjection: d > 0,
    });

    warStarProjection.push({
      date: formatDate(projDate.getTime()),
      timestamp: projDate.getTime(),
      projected: Math.round(currentStars + dailyStarRate * d),
      isProjection: d > 0,
    });
  }

  // Determine trend direction
  let trend = 'stable';
  if (dailyTrophyRate > 5) trend = 'growing';
  else if (dailyTrophyRate > 1) trend = 'slight_growth';
  else if (dailyTrophyRate < -5) trend = 'declining';
  else if (dailyTrophyRate < -1) trend = 'slight_decline';

  // Confidence based on data points
  const confidence = Math.min(100, sorted.length * 10);

  return {
    trophyProjection,
    warStarProjection,
    dailyRates: {
      trophies: parseFloat(dailyTrophyRate.toFixed(2)),
      warStars: parseFloat(dailyStarRate.toFixed(2)),
      attackWins: parseFloat(dailyAttackRate.toFixed(2)),
    },
    trend,
    confidence,
    dataPoints: sorted.length,
    daySpan: Math.round(daySpan),
  };
}

// ─── Clan Activity Metrics ─────────────────────────────
export function analyzeClanActivity(clanData) {
  if (!clanData?.memberList) return null;

  const members = clanData.memberList || [];
  const totalMembers = members.length;

  // Donation analysis
  const donations = members.map((m) => ({
    name: m.name,
    tag: m.tag,
    donated: m.donations || 0,
    received: m.donationsReceived || 0,
    ratio: (m.donationsReceived || 1) > 0
      ? parseFloat(((m.donations || 0) / (m.donationsReceived || 1)).toFixed(2))
      : 0,
    trophies: m.trophies || 0,
    role: m.role,
    townHallLevel: m.townHallLevel || 0,
    expLevel: m.expLevel || 0,
    league: m.league?.name || 'Unranked',
  }));

  const totalDonated = donations.reduce((s, d) => s + d.donated, 0);
  const totalReceived = donations.reduce((s, d) => s + d.received, 0);

  // Inactivity detection (low donations + low trophies for TH = potentially inactive)
  const potentiallyInactive = donations.filter((m) => {
    const expectedDonations = m.townHallLevel * 50;
    return m.donated < expectedDonations * 0.2 && m.received < expectedDonations * 0.3;
  });

  // TH distribution
  const thDistribution = {};
  for (const m of members) {
    const th = m.townHallLevel || 0;
    thDistribution[th] = (thDistribution[th] || 0) + 1;
  }

  // Top donors
  const topDonors = [...donations].sort((a, b) => b.donated - a.donated).slice(0, 5);

  // Donation leaderboard
  const donationLeaderboard = [...donations].sort((a, b) => b.donated - a.donated);

  // Trophy leaderboard
  const trophyLeaderboard = [...donations].sort((a, b) => b.trophies - a.trophies);

  return {
    totalMembers,
    totalDonated,
    totalReceived,
    avgDonations: totalMembers > 0 ? Math.round(totalDonated / totalMembers) : 0,
    potentiallyInactive: potentiallyInactive.map((m) => ({
      name: m.name,
      tag: m.tag,
      donated: m.donated,
      received: m.received,
      townHallLevel: m.townHallLevel,
    })),
    inactiveCount: potentiallyInactive.length,
    thDistribution,
    topDonors,
    donationLeaderboard,
    trophyLeaderboard,
    clanStrength: calcClanStrength(clanData, members),
  };
}

// ─── Clan Strength Score (0-100) ───────────────────────
function calcClanStrength(clanData, members) {
  const clanLevel = clanData?.clanLevel || 1;
  const warWins = clanData?.warWins || 0;
  const warLosses = clanData?.warLosses || 0;
  const warTies = clanData?.warTies || 0;
  const warTotal = warWins + warLosses + warTies;

  // War win rate
  const warWinRate = warTotal > 0 ? (warWins / warTotal) * 100 : 50;

  // Clan level impact (level 1-25+)
  const levelScore = Math.min(100, clanLevel * 5);

  // Member TH quality
  const avgTH = members.length > 0
    ? members.reduce((s, m) => s + (m.townHallLevel || 1), 0) / members.length
    : 1;
  const thScore = Math.min(100, (avgTH / 17) * 100);

  // Member count score (50 is max)
  const memberScore = Math.min(100, (members.length / 50) * 100);

  return Math.round(
    warWinRate * 0.30 +
    levelScore * 0.25 +
    thScore * 0.25 +
    memberScore * 0.20
  );
}

// ─── War Participation Analysis ────────────────────────
export function analyzeWarParticipation(warData) {
  if (!warData?.clan?.members) return null;

  const members = warData.clan.members || [];
  const totalMembers = members.length;

  let attacked = 0;
  let totalAttacks = 0;
  let totalStars = 0;

  for (const member of members) {
    const attacks = member.attacks || [];
    if (attacks.length > 0) {
      attacked++;
      totalAttacks += attacks.length;
      totalStars += attacks.reduce((s, a) => s + (a.stars || 0), 0);
    }
  }

  const participationRate = totalMembers > 0 ? Math.round((attacked / totalMembers) * 100) : 0;
  const avgStarsPerAttacker = attacked > 0 ? parseFloat((totalStars / totalAttacks).toFixed(2)) : 0;

  // Members who didn't attack
  const noAttack = members
    .filter((m) => !m.attacks || m.attacks.length === 0)
    .map((m) => ({ name: m.name, tag: m.tag, mapPosition: m.mapPosition }));

  return {
    totalMembers,
    attacked,
    notAttacked: totalMembers - attacked,
    participationRate,
    totalAttacks,
    totalStars,
    avgStarsPerAttacker,
    noAttackMembers: noAttack,
  };
}

// ─── Donation Chart Data ───────────────────────────────
export function buildDonationChartData(clanData, limit = 10) {
  if (!clanData?.memberList) return [];

  return [...clanData.memberList]
    .sort((a, b) => (b.donations || 0) - (a.donations || 0))
    .slice(0, limit)
    .map((m) => ({
      name: truncateName(m.name, 10),
      fullName: m.name,
      donated: m.donations || 0,
      received: m.donationsReceived || 0,
    }));
}

// ─── Helpers ───────────────────────────────────────────
function formatDate(timestamp) {
  const d = new Date(timestamp);
  return `${d.getMonth() + 1}/${d.getDate()}`;
}

function truncateName(name, maxLen) {
  if (!name) return '';
  return name.length > maxLen ? name.substring(0, maxLen) + '…' : name;
}

// ─── Analytics Engine Public API ───────────────────────
export const analyticsEngine = {
  buildTrophyTrend,
  buildUpgradeTimeline,
  buildPerformanceHeatmap,
  projectGrowth,
  analyzeClanActivity,
  analyzeWarParticipation,
  buildDonationChartData,
};

export default analyticsEngine;

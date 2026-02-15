// ============================================
// Clash Intelligence Pro – AI Service
// ============================================
// Integration: OpenRouter API
// Model:       deepseek/deepseek-r1:free
// Purpose:     Strategic analysis, army suggestions,
//              weakness detection, growth projection
// ============================================
// STRICT: AI must output JSON only. No markdown.
// ============================================

const BASE_URL = 'https://openrouter.ai/api/v1/chat/completions';
const MODEL = 'deepseek/deepseek-r1:free';
const TEMPERATURE = 0.6;
const MAX_TOKENS = 2048;

// ─── System Prompt ─────────────────────────────────────
const SYSTEM_PROMPT = `You are a Clash of Clans strategic analysis engine. You are embedded inside a professional analytics application called "Clash Intelligence Pro".

STRICT RULES:
1. You MUST output ONLY valid JSON. No markdown, no code fences, no explanations, no extra text.
2. You MUST follow the exact schema provided in each request.
3. NEVER suggest cheating, exploits, modding, or any Terms of Service violations.
4. NEVER include profanity, hateful, or inappropriate content.
5. Base ALL analysis on the player/clan data provided.
6. Be specific and actionable in recommendations.
7. Use real Clash of Clans terminology (Town Hall levels, troop names, spell names, hero names).
8. If data is insufficient for a field, use reasonable defaults rather than null.

DEFAULT OUTPUT SCHEMA:
{
  "upgradeFocus": [],
  "warImprovements": [],
  "armySuggestions": [],
  "heroPriority": [],
  "weaknessDetection": [],
  "growthProjection": {
    "estimatedMaxDate": "",
    "efficiencyScore": 0
  }
}

Every array item should be a string with a clear, actionable recommendation.
efficiencyScore is 0-100.
estimatedMaxDate is ISO date string or descriptive text.`;

// ─── Request Builder ───────────────────────────────────
function buildMessages(playerData, clanData, warData, analysisType) {
  const messages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  let userContent = '';

  switch (analysisType) {
    case 'full_analysis':
      userContent = buildFullAnalysisPrompt(playerData, clanData, warData);
      break;
    case 'upgrade_priority':
      userContent = buildUpgradePriorityPrompt(playerData);
      break;
    case 'war_strategy':
      userContent = buildWarStrategyPrompt(playerData, warData);
      break;
    case 'army_suggestion':
      userContent = buildArmySuggestionPrompt(playerData);
      break;
    case 'weakness_detection':
      userContent = buildWeaknessPrompt(playerData);
      break;
    case 'growth_projection':
      userContent = buildGrowthPrompt(playerData);
      break;
    case 'clan_analysis':
      userContent = buildClanAnalysisPrompt(clanData);
      break;
    default:
      userContent = buildFullAnalysisPrompt(playerData, clanData, warData);
  }

  messages.push({ role: 'user', content: userContent });
  return messages;
}

function buildFullAnalysisPrompt(playerData, clanData, warData) {
  return `Analyze this Clash of Clans player and provide strategic recommendations.

PLAYER DATA:
${JSON.stringify(playerData || {}, null, 2)}

${clanData ? `CLAN DATA:\n${JSON.stringify(clanData, null, 2)}` : 'CLAN DATA: Not available'}

${warData ? `WAR DATA:\n${JSON.stringify(warData, null, 2)}` : 'WAR DATA: Not available'}

Respond with ONLY this JSON schema:
{
  "upgradeFocus": ["<5 most important upgrades to prioritize, be specific with building/troop names and levels>"],
  "warImprovements": ["<3-5 specific war performance improvements>"],
  "armySuggestions": ["<3 army compositions with troop counts, formatted as 'Army Name: X Troop1, Y Troop2, Z Spell1'>"],
  "heroPriority": ["<hero upgrade order with reasoning>"],
  "weaknessDetection": ["<3-5 detected weaknesses in the base/account>"],
  "growthProjection": {
    "estimatedMaxDate": "<estimated date to reach max TH level>",
    "efficiencyScore": <0-100 efficiency rating>
  }
}`;
}

function buildUpgradePriorityPrompt(playerData) {
  return `Analyze this player's upgrade status and provide prioritized upgrade recommendations.

PLAYER DATA:
${JSON.stringify(playerData || {}, null, 2)}

Respond with ONLY this JSON schema:
{
  "upgradeFocus": ["<top 8 upgrades in priority order, specific building/troop names with current→target levels>"],
  "warImprovements": ["<upgrades that will most improve war performance>"],
  "armySuggestions": [],
  "heroPriority": ["<hero upgrade order: Hero Name Lv X → Lv Y, with reasoning>"],
  "weaknessDetection": ["<rushed or underleveled areas detected>"],
  "growthProjection": {
    "estimatedMaxDate": "<estimated completion date for all recommended upgrades>",
    "efficiencyScore": <0-100 current upgrade efficiency>
  }
}`;
}

function buildWarStrategyPrompt(playerData, warData) {
  return `Analyze this player's war capabilities and suggest improvements.

PLAYER DATA:
${JSON.stringify(playerData || {}, null, 2)}

WAR DATA:
${JSON.stringify(warData || {}, null, 2)}

Respond with ONLY this JSON schema:
{
  "upgradeFocus": ["<upgrades that directly improve war performance>"],
  "warImprovements": ["<5 specific, actionable war performance improvements>"],
  "armySuggestions": ["<3 war army compositions: 'Army Name: X Troop1, Y Troop2 | Spells: A Spell1, B Spell2 | CC: Troop'>"],
  "heroPriority": ["<hero priorities for war impact>"],
  "weaknessDetection": ["<war-specific weaknesses: attack patterns, defense gaps, star averages>"],
  "growthProjection": {
    "estimatedMaxDate": "<estimated date to become fully war-ready>",
    "efficiencyScore": <0-100 war readiness score>
  }
}`;
}

function buildArmySuggestionPrompt(playerData) {
  return `Based on this player's troop levels and Town Hall, suggest optimal army compositions.

PLAYER DATA:
${JSON.stringify(playerData || {}, null, 2)}

Respond with ONLY this JSON schema:
{
  "upgradeFocus": ["<troop/spell upgrades to unlock better armies>"],
  "warImprovements": [],
  "armySuggestions": ["<5 army compositions tailored to this player's levels: 'Army Name: X Troop1, Y Troop2 | Spells: A Spell1, B Spell2 | Best against: base type'>"],
  "heroPriority": ["<hero abilities relevant to suggested armies>"],
  "weaknessDetection": ["<troop/spell level gaps limiting army effectiveness>"],
  "growthProjection": {
    "estimatedMaxDate": "",
    "efficiencyScore": <0-100 army strength rating>
  }
}`;
}

function buildWeaknessPrompt(playerData) {
  return `Detect all weaknesses and rushed aspects of this Clash of Clans account.

PLAYER DATA:
${JSON.stringify(playerData || {}, null, 2)}

Respond with ONLY this JSON schema:
{
  "upgradeFocus": ["<critical upgrades to address weaknesses>"],
  "warImprovements": ["<how fixing weaknesses improves war ability>"],
  "armySuggestions": [],
  "heroPriority": ["<hero level gaps if any>"],
  "weaknessDetection": ["<6-8 detected weaknesses: rushed buildings, low walls, underleveled defenses, troop gaps, hero gaps, spell gaps>"],
  "growthProjection": {
    "estimatedMaxDate": "<time to fix all critical weaknesses>",
    "efficiencyScore": <0-100 overall account health>
  }
}`;
}

function buildGrowthPrompt(playerData) {
  return `Project this player's growth trajectory and time to max.

PLAYER DATA:
${JSON.stringify(playerData || {}, null, 2)}

Respond with ONLY this JSON schema:
{
  "upgradeFocus": ["<upgrades that accelerate progression most>"],
  "warImprovements": [],
  "armySuggestions": [],
  "heroPriority": ["<hero milestones on the path to max>"],
  "weaknessDetection": ["<bottlenecks slowing progression>"],
  "growthProjection": {
    "estimatedMaxDate": "<realistic estimated date to max current TH, format: YYYY-MM-DD>",
    "efficiencyScore": <0-100 progression efficiency: how optimally resources are being used>
  }
}`;
}

function buildClanAnalysisPrompt(clanData) {
  return `Analyze this Clash of Clans clan and provide strategic insights.

CLAN DATA:
${JSON.stringify(clanData || {}, null, 2)}

Respond with ONLY this JSON schema:
{
  "upgradeFocus": [],
  "warImprovements": ["<5 improvements for the clan's war performance>"],
  "armySuggestions": [],
  "heroPriority": [],
  "weaknessDetection": ["<clan-level weaknesses: inactive members, donation imbalances, war participation gaps, TH distribution issues>"],
  "growthProjection": {
    "estimatedMaxDate": "<estimated timeline for clan to reach next milestone>",
    "efficiencyScore": <0-100 overall clan health score>
  }
}`;
}

// ─── API Call ──────────────────────────────────────────
async function callAI(messages, retries = 2) {
  const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

  if (!apiKey || apiKey === 'your_openrouter_api_key_here') {
    console.warn('[AI Service] No API key configured. Returning mock response.');
    return getMockResponse();
  }

  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`,
          'HTTP-Referer': window.location.origin,
          'X-Title': 'Clash Intelligence Pro',
        },
        body: JSON.stringify({
          model: MODEL,
          messages,
          temperature: TEMPERATURE,
          max_tokens: MAX_TOKENS,
          response_format: { type: 'json_object' },
        }),
      });

      if (response.status === 429) {
        // Rate limited — exponential backoff
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000);
        console.warn(`[AI Service] Rate limited. Retrying in ${waitMs}ms...`);
        await sleep(waitMs);
        continue;
      }

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`AI API error ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices?.[0]?.message?.content;

      if (!content) {
        throw new Error('Empty response from AI');
      }

      // Parse and validate JSON response
      return parseAIResponse(content);
    } catch (error) {
      console.error(`[AI Service] Attempt ${attempt + 1} failed:`, error.message);

      if (attempt === retries) {
        console.warn('[AI Service] All retries exhausted. Returning fallback.');
        return getMockResponse();
      }

      await sleep(1000 * (attempt + 1));
    }
  }

  return getMockResponse();
}

// ─── Response Parser ───────────────────────────────────
function parseAIResponse(content) {
  let cleaned = content.trim();

  // Strip markdown code fences if AI disobeys
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*\n?/, '').replace(/\n?```\s*$/, '');
  }

  // Strip any text before first { or after last }
  const firstBrace = cleaned.indexOf('{');
  const lastBrace = cleaned.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1) {
    cleaned = cleaned.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(cleaned);
    return validateSchema(parsed);
  } catch {
    console.error('[AI Service] Failed to parse AI JSON:', cleaned.substring(0, 200));
    return getMockResponse();
  }
}

// ─── Schema Validator ──────────────────────────────────
function validateSchema(data) {
  const defaults = getMockResponse();

  return {
    upgradeFocus: Array.isArray(data.upgradeFocus)
      ? data.upgradeFocus.map(String)
      : defaults.upgradeFocus,
    warImprovements: Array.isArray(data.warImprovements)
      ? data.warImprovements.map(String)
      : defaults.warImprovements,
    armySuggestions: Array.isArray(data.armySuggestions)
      ? data.armySuggestions.map(String)
      : defaults.armySuggestions,
    heroPriority: Array.isArray(data.heroPriority)
      ? data.heroPriority.map(String)
      : defaults.heroPriority,
    weaknessDetection: Array.isArray(data.weaknessDetection)
      ? data.weaknessDetection.map(String)
      : defaults.weaknessDetection,
    growthProjection: {
      estimatedMaxDate: String(data.growthProjection?.estimatedMaxDate || defaults.growthProjection.estimatedMaxDate),
      efficiencyScore: Math.max(0, Math.min(100,
        Number(data.growthProjection?.efficiencyScore) || defaults.growthProjection.efficiencyScore
      )),
    },
  };
}

// ─── Mock / Fallback Response ──────────────────────────
function getMockResponse() {
  return {
    upgradeFocus: [
      'Upgrade Clan Castle to max for your TH level',
      'Prioritize Eagle Artillery / Inferno Towers',
      'Max your primary war army troops first',
      'Upgrade spell factory and key spells (Rage, Heal, Freeze)',
      'Heroes should be upgraded continuously',
    ],
    warImprovements: [
      'Practice attack strategies in Friendly Challenges',
      'Scout bases before attacking — identify weak points',
      'Use armies that match your troop levels, not copied meta builds',
    ],
    armySuggestions: [
      'Hybrid: 16 Hog Riders, 8 Miners, 4 Healers | Spells: 4 Heal, 1 Rage, 1 Freeze',
      'LavaLoon: 2 Lava Hounds, 28 Balloons, 5 Minions | Spells: 3 Rage, 2 Freeze, 1 Haste',
      'Queen Charge: 5 Healers, 12 Witches, 4 Bowlers | Spells: 2 Rage, 1 Jump, 2 Freeze, 1 Poison',
    ],
    heroPriority: [
      'Archer Queen → highest priority (Queen Charge is meta)',
      'Royal Champion → second priority',
      'Barbarian King → steady progress',
      'Grand Warden → upgrade between wars',
    ],
    weaknessDetection: [
      'Analysis requires player data — connect your account for personalized insights',
      'Check if defenses are evenly leveled for your TH',
      'Verify heroes are not significantly behind TH level',
    ],
    growthProjection: {
      estimatedMaxDate: 'Connect account data for projection',
      efficiencyScore: 50,
    },
  };
}

// ─── Helpers ───────────────────────────────────────────
function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// ─── Public API ────────────────────────────────────────
export const aiService = {
  /**
   * Full strategic analysis of player + clan + war data
   */
  async getFullAnalysis(playerData, clanData = null, warData = null) {
    const messages = buildMessages(playerData, clanData, warData, 'full_analysis');
    return callAI(messages);
  },

  /**
   * Upgrade priority recommendations
   */
  async getUpgradePriority(playerData) {
    const messages = buildMessages(playerData, null, null, 'upgrade_priority');
    return callAI(messages);
  },

  /**
   * War strategy and improvement suggestions
   */
  async getWarStrategy(playerData, warData = null) {
    const messages = buildMessages(playerData, null, warData, 'war_strategy');
    return callAI(messages);
  },

  /**
   * Army composition suggestions
   */
  async getArmySuggestions(playerData) {
    const messages = buildMessages(playerData, null, null, 'army_suggestion');
    return callAI(messages);
  },

  /**
   * Account weakness detection
   */
  async getWeaknessDetection(playerData) {
    const messages = buildMessages(playerData, null, null, 'weakness_detection');
    return callAI(messages);
  },

  /**
   * Growth projection and timeline
   */
  async getGrowthProjection(playerData) {
    const messages = buildMessages(playerData, null, null, 'growth_projection');
    return callAI(messages);
  },

  /**
   * Clan-level analysis
   */
  async getClanAnalysis(clanData) {
    const messages = buildMessages(null, clanData, null, 'clan_analysis');
    return callAI(messages);
  },

  /**
   * Check if API key is configured
   */
  isConfigured() {
    const key = import.meta.env.VITE_OPENROUTER_API_KEY;
    return Boolean(key && key !== 'your_openrouter_api_key_here');
  },

  /**
   * Get mock/fallback response (for offline or unconfigured state)
   */
  getMockResponse,
};

export default aiService;

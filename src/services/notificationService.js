// ============================================
// Clash Intelligence Pro – Notification Service
// ============================================
// PWA-safe notification engine via Service Worker
// Types: builder idle, upgrade complete, war start,
//        war end, goal progress
// ============================================

// ─── Notification Types ────────────────────────────────
export const NOTIF_TYPES = {
  BUILDER: 'builder',
  UPGRADE: 'upgrade',
  WAR: 'war',
  GOAL: 'goal',
  GENERIC: 'generic',
};

// ─── Permission Check ──────────────────────────────────
function isSupported() {
  return 'Notification' in window && 'serviceWorker' in navigator;
}

function isGranted() {
  return isSupported() && Notification.permission === 'granted';
}

// ─── SW Message Sender ─────────────────────────────────
async function sendToSW(message) {
  if (!('serviceWorker' in navigator)) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    if (registration.active) {
      registration.active.postMessage(message);
      return true;
    }
  } catch (error) {
    console.warn('[Notifications] Failed to send message to SW:', error);
  }
  return false;
}

// ─── Scheduled Notification Tracker ────────────────────
const scheduledTimers = new Map();

// ─── Public API ────────────────────────────────────────
export const notificationService = {
  /**
   * Check if notifications are supported
   */
  isSupported,

  /**
   * Check if notifications are granted
   */
  isGranted,

  /**
   * Request notification permission
   * @returns {Promise<boolean>} true if granted
   */
  async requestPermission() {
    if (!isSupported()) return false;

    if (Notification.permission === 'granted') return true;
    if (Notification.permission === 'denied') return false;

    try {
      const result = await Notification.requestPermission();
      return result === 'granted';
    } catch {
      return false;
    }
  },

  /**
   * Show an immediate notification via SW
   */
  async show(title, body, type = NOTIF_TYPES.GENERIC, data = {}) {
    if (!isGranted()) {
      console.warn('[Notifications] Not granted. Skipping:', title);
      return false;
    }

    return sendToSW({
      type: 'SHOW_NOTIFICATION',
      payload: {
        title,
        body,
        notifType: type,
        notifData: data,
      },
    });
  },

  /**
   * Schedule a notification after a delay (seconds)
   * Also stores a local timer ID so it can be cancelled
   */
  async schedule(id, title, body, delaySec, type = NOTIF_TYPES.GENERIC, data = {}) {
    if (!isGranted()) return false;

    // Cancel existing with same ID
    this.cancel(id);

    // Use SW-based scheduling for reliability
    const sent = await sendToSW({
      type: 'SCHEDULE_NOTIFICATION',
      payload: {
        title,
        body,
        delay: delaySec,
        notifType: type,
        notifData: data,
      },
    });

    // Also set local timer as backup (SW might be terminated)
    const timer = setTimeout(() => {
      this.show(title, body, type, data);
      scheduledTimers.delete(id);
    }, delaySec * 1000);

    scheduledTimers.set(id, {
      timer,
      title,
      body,
      type,
      fireAt: Date.now() + delaySec * 1000,
    });

    return sent;
  },

  /**
   * Cancel a scheduled notification
   */
  cancel(id) {
    const entry = scheduledTimers.get(id);
    if (entry) {
      clearTimeout(entry.timer);
      scheduledTimers.delete(id);
    }
  },

  /**
   * Cancel all scheduled notifications
   */
  cancelAll() {
    scheduledTimers.forEach((entry) => clearTimeout(entry.timer));
    scheduledTimers.clear();
    sendToSW({ type: 'CLEAR_NOTIFICATIONS', payload: {} });
  },

  /**
   * Get list of currently scheduled notifications
   */
  getScheduled() {
    const result = [];
    scheduledTimers.forEach((entry, id) => {
      result.push({
        id,
        title: entry.title,
        body: entry.body,
        type: entry.type,
        fireAt: entry.fireAt,
        remainingSec: Math.max(0, Math.round((entry.fireAt - Date.now()) / 1000)),
      });
    });
    return result.sort((a, b) => a.fireAt - b.fireAt);
  },

  // ══════════════════════════════════════════════════
  // Domain-Specific Notification Helpers
  // ══════════════════════════════════════════════════

  /**
   * Builder idle alert
   * @param {number} builderIndex - Which builder (1-based)
   * @param {number} remainingSec - Seconds until builder finishes
   */
  scheduleBuilderIdle(builderIndex, remainingSec) {
    const id = `builder_${builderIndex}`;
    return this.schedule(
      id,
      '🔨 Builder Available!',
      `Builder ${builderIndex} has finished and is now idle. Start a new upgrade!`,
      remainingSec,
      NOTIF_TYPES.BUILDER,
      { url: '/?screen=upgrades' }
    );
  },

  /**
   * Upgrade completion reminder
   * @param {string} upgradeName - Name of building/troop
   * @param {number} remainingSec - Seconds until complete
   */
  scheduleUpgradeComplete(upgradeName, remainingSec) {
    const id = `upgrade_${upgradeName.replace(/\s+/g, '_').toLowerCase()}`;
    return this.schedule(
      id,
      '✅ Upgrade Complete!',
      `${upgradeName} has finished upgrading!`,
      remainingSec,
      NOTIF_TYPES.UPGRADE,
      { url: '/?screen=upgrades' }
    );
  },

  /**
   * War start reminder
   * @param {number} remainingSec - Seconds until war starts
   */
  scheduleWarStart(remainingSec) {
    return this.schedule(
      'war_start',
      '⚔️ War Starting Soon!',
      'Clan War is about to begin. Prepare your attacks!',
      remainingSec,
      NOTIF_TYPES.WAR,
      { url: '/?screen=war' }
    );
  },

  /**
   * War ending reminder (1 hour before end)
   * @param {number} remainingSec - Seconds until war ends
   */
  scheduleWarEnding(remainingSec) {
    const reminderSec = Math.max(0, remainingSec - 3600); // 1 hour before
    if (reminderSec <= 0) return Promise.resolve(false);

    return this.schedule(
      'war_ending',
      '⏰ War Ending Soon!',
      'Less than 1 hour left in the current war. Use your attacks!',
      reminderSec,
      NOTIF_TYPES.WAR,
      { url: '/?screen=war' }
    );
  },

  /**
   * Goal progress notification
   * @param {string} goalName
   * @param {number} progress - 0-100
   */
  notifyGoalProgress(goalName, progress) {
    if (progress >= 100) {
      return this.show(
        '🎯 Goal Achieved!',
        `Congratulations! You've completed: ${goalName}`,
        NOTIF_TYPES.GOAL,
        { url: '/?screen=dashboard' }
      );
    }
    if (progress >= 75) {
      return this.show(
        '🎯 Almost There!',
        `${goalName} is ${progress}% complete. Keep pushing!`,
        NOTIF_TYPES.GOAL,
        { url: '/?screen=dashboard' }
      );
    }
    return Promise.resolve(false);
  },

  /**
   * Set up all relevant notifications from current player/war data
   */
  async setupFromPlayerData(playerData, warData = null) {
    if (!isGranted()) return;
    // This would parse actual builder timers, war timers, etc.
    // from live data — the API doesn't expose exact timers,
    // so this is a framework for manual/estimated scheduling.

    // If war data has preparation or battle time remaining
    if (warData && warData.state === 'preparation') {
      const startTime = new Date(warData.startTime).getTime();
      const remainingSec = Math.max(0, Math.round((startTime - Date.now()) / 1000));
      if (remainingSec > 0) {
        await this.scheduleWarStart(remainingSec);
      }
    }

    if (warData && warData.state === 'inWar') {
      const endTime = new Date(warData.endTime).getTime();
      const remainingSec = Math.max(0, Math.round((endTime - Date.now()) / 1000));
      if (remainingSec > 0) {
        await this.scheduleWarEnding(remainingSec);
      }
    }
  },
};

export default notificationService;

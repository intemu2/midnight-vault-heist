// Midnight Vault: every number that shapes the bank floor.
// One screen, 1280x720, holds the whole heist: the vault room up top with
// three safes, the main hall, a dark vent shaft on the left, a dark service
// corridor on the right, and the getaway door at the bottom centre.

export const FIELD = { width: 1280, height: 720 };
export const HUD_HEIGHT = 52;
export const FLOOR_TOP = HUD_HEIGHT;

// Solid rectangles the thief and the guards cannot cross. The bottom wall
// leaves a gap in the middle: that gap is the getaway door.
export const WALLS = [
  { x: 0, y: FLOOR_TOP, w: 1280, h: 20 }, // top wall
  { x: 0, y: 696, w: 600, h: 24 }, // bottom wall, left of the exit
  { x: 680, y: 696, w: 600, h: 24 }, // bottom wall, right of the exit
  { x: 0, y: FLOOR_TOP, w: 24, h: 648 }, // left wall
  { x: 1256, y: FLOOR_TOP, w: 24, h: 648 }, // right wall
  // Vault room: two side walls and a front wall with a door gap (600-680).
  { x: 360, y: FLOOR_TOP, w: 20, h: 168 },
  { x: 900, y: FLOOR_TOP, w: 20, h: 168 },
  { x: 380, y: 200, w: 220, h: 20 },
  { x: 680, y: 200, w: 240, h: 20 },
  // Vent shaft wall (left): gaps at the top and bottom so the shaft is a
  // route, not a dead end. The service corridor wall (right) mirrors it.
  { x: 150, y: 160, w: 20, h: 400 },
  { x: 1110, y: 160, w: 20, h: 400 },
  // Low partition walls in the hall: they split the floor into three lanes
  // so every crossing has more than one route.
  { x: 200, y: 430, w: 280, h: 20 },
  { x: 800, y: 430, w: 280, h: 20 },
  // Pillars the thief can hide behind.
  { x: 300, y: 330, w: 36, h: 36 },
  { x: 944, y: 330, w: 36, h: 36 },
  { x: 622, y: 520, w: 36, h: 36 },
];

// Dark zones: no camera and no guard can spot the thief inside one.
export const DARK_ZONES = [
  { x: 24, y: 72, w: 126, h: 548, label: 'VENT SHAFT' },
  { x: 1130, y: 72, w: 126, h: 548, label: 'SERVICE CORRIDOR' },
];

export const VAULT_ROOM = { x: 380, y: 72, w: 520, h: 128, label: 'VAULT ROOM' };
export const EXIT_DOOR = { x: 600, y: 696, w: 80, h: 24, label: 'GETAWAY' };
export const THIEF_SPAWN = { x: 640, y: 640 };

// Three safes, each worth $400 once cracked. The middle one sits higher.
export const SAFES = [
  { id: 0, x: 420, y: 92, w: 64, h: 46, amount: 400 },
  { id: 1, x: 608, y: 82, w: 64, h: 46, amount: 400 },
  { id: 2, x: 796, y: 92, w: 64, h: 46, amount: 400 },
];

// Two glass cases with bonus gems. Only the glass cutter opens them.
export const GLASS_CASES = [
  { id: 0, x: 96, y: 300, w: 56, h: 40, amount: 250 },
  { id: 1, x: 1128, y: 300, w: 56, h: 40, amount: 250 },
];

// Six guards, each with a patrol loop of waypoints.
export const GUARD_PATROLS = [
  [{ x: 480, y: 280 }, { x: 800, y: 280 }, { x: 800, y: 340 }, { x: 480, y: 340 }],
  [{ x: 230, y: 300 }, { x: 230, y: 560 }, { x: 420, y: 560 }, { x: 420, y: 300 }],
  [{ x: 860, y: 300 }, { x: 1050, y: 300 }, { x: 1050, y: 560 }, { x: 860, y: 560 }],
  [{ x: 430, y: 150 }, { x: 850, y: 150 }],
  [{ x: 280, y: 640 }, { x: 1000, y: 640 }],
  [{ x: 640, y: 300 }, { x: 640, y: 560 }],
];

// Two ceiling cameras, sweeping their cones across the hall.
export const CAMERAS = [
  { id: 0, x: 300, y: 74, range: 230, halfAngle: 0.44, sweep: 0.85, period: 4.2, phase: 0 },
  { id: 1, x: 980, y: 74, range: 230, halfAngle: 0.44, sweep: 0.85, period: 4.2, phase: 2.1 },
];

// Tools for sale. Buying one spends loot; each one opens a new way through.
export const TOOLS = [
  { key: '1', id: 'lockpick', name: 'Lockpick', cost: 150, blurb: 'crack safes 2x faster' },
  { key: '2', id: 'cutter', name: 'Glass cutter', cost: 200, blurb: 'open the gem cases' },
  { key: '3', id: 'jammer', name: 'Camera jammer', cost: 250, blurb: 'blind cameras 12s' },
];

export const TUNING = {
  thiefSpeed: 175,
  thiefRadius: 14,
  guardSpeed: 58,
  guardChaseSpeed: 96,
  guardRange: 175,
  guardHalfAngle: 0.56,
  guardPause: 1.2,
  cameraAlarmPerSecond: 34,
  guardAlarmPerSecond: 26,
  alarmDecayPerSecond: 2.5,
  caughtAlarmJump: 35,
  graceSeconds: 2,
  safeCrackSeconds: 2.5,
  gemCutSeconds: 1.5,
  jammerSeconds: 12,
  startingCash: 200,
  alarmMax: 100,
};

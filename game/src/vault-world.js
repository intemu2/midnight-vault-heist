// Midnight Vault world: the whole heist state and one step of its rules.
// The thief crosses the bank floor, cracks three safes and slips out the
// getaway door. Guards patrol with vision cones, cameras sweep the hall,
// and anything that sees the thief feeds the alarm meter. At 100 the
// heist is busted; at the door with all three safes cracked, it is won.

import {
  CAMERAS, DARK_ZONES, EXIT_DOOR, FIELD, GLASS_CASES, GUARD_PATROLS,
  SAFES, THIEF_SPAWN, TOOLS, TUNING, WALLS,
} from './vault-config.js';

export const SCREEN_TITLE = 'title';
export const SCREEN_PLAY = 'play';
export const SCREEN_WIN = 'win';
export const SCREEN_BUSTED = 'busted';

function clamp(value, low, high) {
  return Math.min(high, Math.max(low, value));
}

function angleTo(fromX, fromY, toX, toY) {
  return Math.atan2(toY - fromY, toX - fromX);
}

function angleDiff(a, b) {
  let d = a - b;
  while (d > Math.PI) d -= Math.PI * 2;
  while (d < -Math.PI) d += Math.PI * 2;
  return d;
}

// Does the segment from (x1,y1) to (x2,y2) cross the rectangle? A wall
// between watcher and thief breaks line of sight.
export function lineBlocked(x1, y1, x2, y2) {
  for (const w of WALLS) {
    if (segmentHitsRect(x1, y1, x2, y2, w)) return true;
  }
  return false;
}

function segmentHitsRect(x1, y1, x2, y2, r) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  let t0 = 0;
  let t1 = 1;
  for (const [p, q] of [[-dx, x1 - r.x], [dx, r.x + r.w - x1], [-dy, y1 - r.y], [dy, r.y + r.h - y1]]) {
    if (p === 0) {
      if (q < 0) return false;
    } else {
      const t = q / p;
      if (p < 0) { if (t > t1) return false; if (t > t0) t0 = t; }
      else { if (t < t0) return false; if (t < t1) t1 = t; }
    }
  }
  return true;
}

function circleHitsWalls(x, y, radius) {
  for (const w of WALLS) {
    const nearX = clamp(x, w.x, w.x + w.w);
    const nearY = clamp(y, w.y, w.y + w.h);
    const dx = x - nearX;
    const dy = y - nearY;
    if (dx * dx + dy * dy < radius * radius) return true;
  }
  return false;
}

function inDarkZone(x, y) {
  return DARK_ZONES.some((z) => x > z.x && x < z.x + z.w && y > z.y && y < z.y + z.h);
}

function nearRect(x, y, r, reach) {
  const nearX = clamp(x, r.x, r.x + r.w);
  const nearY = clamp(y, r.y, r.y + r.h);
  return Math.hypot(x - nearX, y - nearY) <= reach;
}

export function makeWorld(seed) {
  const world = {
    seed,
    screen: SCREEN_TITLE,
    time: 0,
    alarm: 0,
    cash: TUNING.startingCash,
    loot: 0,
    safesCracked: 0,
    grace: 0,
    jammerLeft: 0,
    spotted: false,
    spottedBy: '',
    toast: '',
    toastLeft: 0,
    crackTarget: null,
    crackProgress: 0,
    thief: { x: THIEF_SPAWN.x, y: THIEF_SPAWN.y, face: -Math.PI / 2 },
    tools: { lockpick: false, cutter: false, jammer: false },
    safes: SAFES.map((s) => ({ ...s, cracked: false, progress: 0 })),
    cases: GLASS_CASES.map((c) => ({ ...c, opened: false, progress: 0 })),
    guards: GUARD_PATROLS.map((route, i) => ({
      route,
      wp: 0,
      x: route[0].x,
      y: route[0].y,
      face: 0,
      pauseLeft: 0,
      chaseLeft: 0,
      alerted: false,
    })),
    cameras: CAMERAS.map((c) => ({ ...c, angle: Math.PI / 2 })),
  };
  return world;
}

export function resetWorld(world) {
  const fresh = makeWorld(world.seed);
  fresh.screen = SCREEN_PLAY;
  Object.assign(world, fresh);
}

function say(world, text, seconds = 2.5) {
  world.toast = text;
  world.toastLeft = seconds;
}

function moveThief(world, dt, mx, my) {
  const t = world.thief;
  if (mx === 0 && my === 0) return;
  t.face = Math.atan2(my, mx);
  const step = TUNING.thiefSpeed * dt;
  const nx = clamp(t.x + mx * step, 0, FIELD.width);
  if (!circleHitsWalls(nx, t.y, TUNING.thiefRadius)) t.x = nx;
  const ny = clamp(t.y + my * step, 0, FIELD.height);
  if (!circleHitsWalls(t.x, ny, TUNING.thiefRadius)) t.y = ny;
  t.x = clamp(t.x, 24 + TUNING.thiefRadius, FIELD.width - 24 - TUNING.thiefRadius);
  t.y = clamp(t.y, 72 + TUNING.thiefRadius, FIELD.height - 24 - TUNING.thiefRadius);
}

function stepGuard(world, guard, dt) {
  const t = world.thief;
  if (guard.chaseLeft > 0) {
    guard.chaseLeft -= dt;
    const a = angleTo(guard.x, guard.y, t.x, t.y);
    guard.face = a;
    guard.x += Math.cos(a) * TUNING.guardChaseSpeed * dt;
    guard.y += Math.sin(a) * TUNING.guardChaseSpeed * dt;
    if (guard.chaseLeft <= 0) guard.alerted = false;
    return;
  }
  if (guard.pauseLeft > 0) {
    guard.pauseLeft -= dt;
    return;
  }
  const target = guard.route[guard.wp];
  const a = angleTo(guard.x, guard.y, target.x, target.y);
  const dist = Math.hypot(target.x - guard.x, target.y - guard.y);
  const step = TUNING.guardSpeed * dt;
  if (dist <= step) {
    guard.x = target.x;
    guard.y = target.y;
    guard.wp = (guard.wp + 1) % guard.route.length;
    guard.pauseLeft = TUNING.guardPause;
  } else {
    guard.face = a;
    guard.x += Math.cos(a) * step;
    guard.y += Math.sin(a) * step;
  }
}

function guardSeesThief(world, guard) {
  const t = world.thief;
  if (world.grace > 0 || inDarkZone(t.x, t.y)) return false;
  const dist = Math.hypot(t.x - guard.x, t.y - guard.y);
  if (dist > TUNING.guardRange) return false;
  if (Math.abs(angleDiff(angleTo(guard.x, guard.y, t.x, t.y), guard.face)) > TUNING.guardHalfAngle) return false;
  return !lineBlocked(guard.x, guard.y, t.x, t.y);
}

function cameraSeesThief(world, camera) {
  const t = world.thief;
  if (world.jammerLeft > 0 || world.grace > 0 || inDarkZone(t.x, t.y)) return false;
  const dist = Math.hypot(t.x - camera.x, t.y - camera.y);
  if (dist > camera.range) return false;
  if (Math.abs(angleDiff(angleTo(camera.x, camera.y, t.x, t.y), camera.angle)) > camera.halfAngle) return false;
  return !lineBlocked(camera.x, camera.y, t.x, t.y);
}

function workLoot(world, dt, interactHeld) {
  const t = world.thief;
  world.crackTarget = null;
  if (!interactHeld) {
    for (const s of world.safes) s.progress = 0;
    for (const c of world.cases) c.progress = 0;
    return;
  }
  for (const s of world.safes) {
    if (s.cracked || !nearRect(t.x, t.y, s, 62)) continue;
    const rate = world.tools.lockpick ? 2 : 1;
    s.progress += (dt * rate) / TUNING.safeCrackSeconds;
    world.crackTarget = { kind: 'safe', x: s.x + s.w / 2, y: s.y + s.h / 2, progress: s.progress };
    if (s.progress >= 1) {
      s.cracked = true;
      world.safesCracked += 1;
      world.loot += s.amount;
      world.cash += s.amount;
      say(world, `Safe cracked! +$${s.amount} — ${world.safesCracked}/3 safes`, 3);
    }
    return;
  }
  for (const c of world.cases) {
    if (c.opened || !nearRect(t.x, t.y, c, 56)) continue;
    if (!world.tools.cutter) {
      say(world, 'Locked glass case — buy the glass cutter (key 2)', 2);
      return;
    }
    c.progress += dt / TUNING.gemCutSeconds;
    world.crackTarget = { kind: 'gem', x: c.x + c.w / 2, y: c.y + c.h / 2, progress: c.progress };
    if (c.progress >= 1) {
      c.opened = true;
      world.loot += c.amount;
      world.cash += c.amount;
      say(world, `Gem cut free! +$${c.amount}`, 3);
    }
    return;
  }
}

function buyTool(world, key) {
  const tool = TOOLS.find((t) => t.key === key);
  if (!tool) return;
  if (tool.id === 'jammer' && world.tools.jammer && world.jammerLeft > 0) {
    say(world, 'Jammer already running', 1.5);
    return;
  }
  if (tool.id !== 'jammer' && world.tools[tool.id]) {
    say(world, `${tool.name} already owned`, 1.5);
    return;
  }
  if (world.cash < tool.cost) {
    say(world, `Need $${tool.cost} for the ${tool.name} — crack a safe first`, 2.5);
    return;
  }
  world.cash -= tool.cost;
  world.tools[tool.id] = true;
  if (tool.id === 'jammer') world.jammerLeft = TUNING.jammerSeconds;
  say(world, `${tool.name} bought — ${tool.blurb}`, 3);
}

// One step of the heist. `input` is {mx, my, interact, buyKey}.
export function stepWorld(world, dt, input) {
  if (world.screen !== SCREEN_PLAY) return;
  world.time += dt;
  if (world.grace > 0) world.grace -= dt;
  if (world.jammerLeft > 0) world.jammerLeft -= dt;
  if (world.toastLeft > 0) world.toastLeft -= dt;

  moveThief(world, dt, input.mx, input.my);
  if (input.buyKey) buyTool(world, input.buyKey);
  workLoot(world, dt, input.interact);

  // Cameras sweep; a jammer freezes them blind.
  for (const cam of world.cameras) {
    const sweep = cam.sweep * Math.sin((world.time / cam.period) * Math.PI * 2 + cam.phase);
    cam.angle = Math.PI / 2 + sweep;
  }

  // What sees the thief feeds the alarm; hiding drains it again.
  world.spotted = false;
  world.spottedBy = '';
  for (const guard of world.guards) {
    stepGuard(world, guard, dt);
    if (guardSeesThief(world, guard)) {
      world.spotted = true;
      world.spottedBy = 'guard';
      world.alarm += TUNING.guardAlarmPerSecond * dt;
      if (guard.chaseLeft <= 0) guard.chaseLeft = 3;
      guard.alerted = true;
    }
  }
  for (const cam of world.cameras) {
    if (cameraSeesThief(world, cam)) {
      world.spotted = true;
      world.spottedBy = 'camera';
      world.alarm += TUNING.cameraAlarmPerSecond * dt;
    }
  }
  if (!world.spotted) world.alarm -= TUNING.alarmDecayPerSecond * dt;
  world.alarm = clamp(world.alarm, 0, TUNING.alarmMax);

  // A guard who reaches the thief drags him back to the door, alarm jumping.
  for (const guard of world.guards) {
    const d = Math.hypot(world.thief.x - guard.x, world.thief.y - guard.y);
    if (d < 28 && world.grace <= 0) {
      world.alarm = clamp(world.alarm + TUNING.caughtAlarmJump, 0, TUNING.alarmMax);
      world.thief.x = THIEF_SPAWN.x;
      world.thief.y = THIEF_SPAWN.y;
      world.grace = TUNING.graceSeconds;
      guard.chaseLeft = 0;
      guard.alerted = false;
      say(world, 'Caught! Dragged back to the door — alarm jumps', 3);
    }
  }

  if (world.alarm >= TUNING.alarmMax) {
    world.screen = SCREEN_BUSTED;
    return;
  }

  // All three safes cracked, then reach the getaway door to win.
  const t = world.thief;
  if (world.safesCracked === 3 && t.y > 676 && t.x > EXIT_DOOR.x - 10 && t.x < EXIT_DOOR.x + EXIT_DOOR.w + 10) {
    world.screen = SCREEN_WIN;
  }
}

export function formatTime(seconds) {
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

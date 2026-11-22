// Staged screenshot scenes for Midnight Vault (?shot=cover|route|alarm|getaway).
// Each scene is a real state of the real game, posed with the world's own
// fields and drawn by the game's own renderer — no edited or borrowed frame.
// The cover has to show the whole heist in one frame: room, thief, guards
// with cones, cameras, loot, and the alarm meter.

import { SCREEN_PLAY, SCREEN_WIN, resetWorld } from './vault-world.js';

function poseGuard(world, index, x, y, face) {
  const g = world.guards[index];
  g.x = x;
  g.y = y;
  g.face = face;
  g.chaseLeft = 0;
  g.alerted = false;
}

function poseCamera(world, index, angle) {
  world.cameras[index].angle = angle;
}

export function stageShot(name, world) {
  resetWorld(world);
  if (name === 'route') {
    // The quiet way in: the thief slips up the dark vent shaft while the
    // hall guards sweep the open floor. Alarm barely touched.
    world.thief.x = 95;
    world.thief.y = 450;
    world.thief.face = -Math.PI / 2;
    poseGuard(world, 3, 640, 250, 0.5); // vault guard at the door
    world.alarm = 8;
    world.time = 22;
    world.toast = 'Vent shaft — dark, unseen. Cones cannot spot you here.';
    world.toastLeft = 999;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'alarm') {
    // The tense moment: the thief is under a camera cone below the vault
    // door, a guard is closing in, the alarm is at 78% and two safes are
    // already cracked. One more mistake ends the run.
    world.safes[0].cracked = true;
    world.safes[2].cracked = true;
    world.safesCracked = 2;
    world.loot = 800;
    world.cash = 800;
    world.tools.lockpick = true;
    world.thief.x = 640;
    world.thief.y = 252;
    world.thief.face = -Math.PI / 2;
    poseGuard(world, 5, 640, 310, Math.PI / 2);
    world.guards[5].chaseLeft = 2;
    world.guards[5].alerted = true;
    poseGuard(world, 0, 500, 300, 0.4);
    poseGuard(world, 3, 560, 280, 0.5); // vault guard near the door
    poseCamera(world, 0, 0.48);
    poseCamera(world, 1, 2.66);
    world.alarm = 78;
    world.spotted = true;
    world.spottedBy = 'camera';
    world.time = 121;
    world.toast = 'Camera! Break line of sight!';
    world.toastLeft = 999;
    return { screen: SCREEN_PLAY };
  }
  if (name === 'getaway') {
    // The payoff: all three safes cracked, the gem case cut open, the
    // thief out the green door with the loot.
    for (const s of world.safes) s.cracked = true;
    world.cases[0].opened = true;
    world.safesCracked = 3;
    world.loot = 1450;
    world.cash = 1450;
    world.tools.lockpick = true;
    world.tools.cutter = true;
    poseGuard(world, 3, 640, 250, 0.5); // vault guard at the door
    world.thief.x = 640;
    world.thief.y = 690;
    world.alarm = 41;
    world.time = 168;
    world.screen = SCREEN_WIN;
    return { screen: SCREEN_WIN };
  }
  // Cover: mid-heist, everything visible at once. The thief crosses the
  // hall toward the vault, one safe already cracked, the lockpick bought,
  // a guard cone sweeping toward him and the alarm at 32%.
  world.safes[0].cracked = true;
  world.safesCracked = 1;
  world.safes[1].progress = 0.55;
  world.crackTarget = { kind: 'safe', x: 640, y: 105, progress: 0.55 };
  world.loot = 400;
  world.cash = 550;
  world.tools.lockpick = true;
  world.thief.x = 640;
  world.thief.y = 470;
  world.thief.face = -Math.PI / 2;
  poseGuard(world, 0, 520, 290, 0.98);
  poseGuard(world, 1, 300, 420, 0);
  poseGuard(world, 2, 980, 420, Math.PI);
  poseGuard(world, 3, 700, 150, Math.PI / 2);
  poseGuard(world, 4, 420, 640, 0);
  poseGuard(world, 5, 640, 330, Math.PI / 2);
  poseCamera(world, 0, Math.PI / 2 + 0.6);
  poseCamera(world, 1, Math.PI / 2 - 0.6);
  world.alarm = 32;
  world.spotted = true;
  world.spottedBy = 'guard';
  world.time = 74;
  world.toast = 'One safe cracked — two to go. Watch the cones.';
  world.toastLeft = 999;
  return { screen: SCREEN_PLAY };
}

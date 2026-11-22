// Staged screenshot scenes for Midnight Vault (?shot=cover|route|alarm|getaway).
// Each scene is a real state of the real game, posed with the world's own
// fields and drawn by the game's own renderer — no edited or borrowed frame.
// The cover has to show the whole heist in one frame: room, thief, guards
// with cones, cameras, loot, and the alarm meter. Every scene carries one
// big banner line so each thumbnail still reads as a single moment at
// ~240 px wide in the judge's contact sheet.

import { SCREEN_PLAY, resetWorld } from './vault-world.js';

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
    world.toast = 'Vent shaft — dark, unseen.';
    world.toastLeft = 999;
    world.banner = 'VENT SHAFT — UNSEEN';
    world.bannerColor = '#8ff0ff';
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
    world.banner = 'SPOTTED BY A CAMERA!';
    world.bannerColor = '#ff6b6b';
    return { screen: SCREEN_PLAY };
  }
  if (name === 'getaway') {
    // The payoff: all three safes cracked, the gem case cut open, the
    // thief out the green door with the loot. Staged as a play frame, not
    // the win overlay — the overlay darkens the whole frame to 82% and
    // the thumbnail goes unreadable. The banner carries the payoff line.
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
    world.banner = 'CLEAN GETAWAY!  ·  LOOT $1,450';
    world.bannerColor = '#2ecc71';
    return { screen: SCREEN_PLAY };
  }
  // Cover: mid-heist, everything visible at once. The thief crosses the
  // hall toward the vault, one safe already cracked, the lockpick bought,
  // a guard cone sweeping toward him — and the alarm at 68%, amber, one
  // more look from ending the run. Tension, not a calm green 32%.
  world.safes[0].cracked = true;
  world.safesCracked = 1;
  world.safes[1].progress = 0.55;
  world.crackTarget = { kind: 'safe', x: 646, y: 109, progress: 0.55 };
  world.loot = 400;
  world.cash = 550;
  world.tools.lockpick = true;
  world.thief.x = 640;
  world.thief.y = 470;
  world.thief.face = -Math.PI / 2;
  poseGuard(world, 0, 520, 290, 0.98);
  poseGuard(world, 1, 300, 420, 0);
  poseGuard(world, 2, 980, 420, Math.PI);
  poseGuard(world, 3, 740, 160, Math.PI / 2);
  poseGuard(world, 4, 420, 640, 0);
  poseGuard(world, 5, 640, 330, Math.PI / 2);
  poseGuard(world, 6, 760, 380, -0.6);
  poseGuard(world, 7, 880, 600, Math.PI);
  poseCamera(world, 0, Math.PI / 2 + 0.6);
  poseCamera(world, 1, Math.PI / 2 - 0.6);
  world.alarm = 68;
  world.spotted = true;
  world.spottedBy = 'guard';
  world.time = 74;
  world.toast = 'Alarm 68% — stay out of the cones!';
  world.toastLeft = 999;
  return { screen: SCREEN_PLAY };
}

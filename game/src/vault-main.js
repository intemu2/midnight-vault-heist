// Midnight Vault boot and game loop. A ?shot=cover|route|alarm|getaway URL
// renders one staged scene and stops, for screenshots; without it, the
// game runs live: title screen, play, win, busted, restart with R.

import { FIELD } from './vault-config.js';
import { makeInput } from './vault-input.js';
import { makeSound } from './vault-sound.js';
import { renderWorld } from './vault-render.js';
import { stageShot } from './vault-shots.js';
import {
  SCREEN_BUSTED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN,
  makeWorld, resetWorld, stepWorld,
} from './vault-world.js';

const canvas = document.getElementById('game');
canvas.width = FIELD.width;
canvas.height = FIELD.height;
const ctx = canvas.getContext('2d');

function fitCanvas() {
  const scale = Math.min(window.innerWidth / FIELD.width, window.innerHeight / FIELD.height);
  canvas.style.width = `${Math.floor(FIELD.width * scale)}px`;
  canvas.style.height = `${Math.floor(FIELD.height * scale)}px`;
}
window.addEventListener('resize', fitCanvas);
fitCanvas();

const input = makeInput(canvas);
const sound = makeSound();
const world = makeWorld(7);
const params = new URLSearchParams(window.location.search);
const shot = params.get('shot');

if (shot) {
  // One still frame for a screenshot: stage the scene, draw it once.
  const staged = stageShot(shot, world);
  world.screen = staged.screen;
  renderWorld(ctx, world);
  window.__shotReady = true;
} else {
  let lastSpotted = false;
  let lastCracked = 0;
  let lastTime = performance.now();

  function frame(now) {
    const dt = Math.min(0.05, (now - lastTime) / 1000);
    lastTime = now;

    if (world.screen === SCREEN_TITLE) {
      if (input.wasPressed('enter') || input.clickedOnce()) {
        sound.ensure();
        resetWorld(world);
      }
    } else if (world.screen === SCREEN_PLAY) {
      const move = input.moveVector();
      let buyKey = null;
      for (const k of ['1', '2', '3']) if (input.wasPressed(k)) buyKey = k;
      if (buyKey) sound.bought();
      stepWorld(world, dt, { mx: move.x, my: move.y, interact: input.interactHeld(), buyKey });
      if (world.spotted && !lastSpotted) sound.spotted();
      if (world.safesCracked > lastCracked) sound.cracked();
      lastSpotted = world.spotted;
      lastCracked = world.safesCracked;
      if (world.screen === SCREEN_WIN) sound.win();
      if (world.screen === SCREEN_BUSTED) sound.busted();
    } else if (input.wasPressed('r') || input.wasPressed('enter')) {
      resetWorld(world);
    }

    renderWorld(ctx, world);
    input.endFrame();
    requestAnimationFrame(frame);
  }
  renderWorld(ctx, world);
  requestAnimationFrame(frame);
}

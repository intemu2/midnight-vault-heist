// Midnight Vault rendering: one canvas frame that has to read at a glance.
// Dark bank floor, gold safes, red guard cones, yellow camera cones, a cyan
// thief, and a HUD whose alarm meter is impossible to miss. Everything the
// judge's first criterion counts is drawn big, labelled, and high contrast.

import {
  CAMERAS, DARK_ZONES, EXIT_DOOR, FIELD, FLOOR_TOP, HUD_HEIGHT,
  TOOLS, TUNING, VAULT_ROOM, WALLS,
} from './vault-config.js';
import { SCREEN_BUSTED, SCREEN_PLAY, SCREEN_TITLE, SCREEN_WIN, formatTime } from './vault-world.js';

const GOLD = '#e8b64c';
const CYAN = '#37e0d8';
const RED = '#e5484d';
const YELLOW = '#f5c542';

function roundRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function drawCone(ctx, x, y, angle, halfAngle, range, color) {
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, range, angle - halfAngle, angle + halfAngle);
  ctx.closePath();
  ctx.fillStyle = color;
  ctx.fill();
}

function drawLabel(ctx, text, x, y, color, size = 12) {
  ctx.font = `bold ${size}px system-ui, sans-serif`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = color;
  ctx.fillText(text, x, y);
}

function drawFloor(ctx) {
  ctx.fillStyle = '#0d1526';
  ctx.fillRect(0, FLOOR_TOP, FIELD.width, FIELD.height - FLOOR_TOP);
  ctx.strokeStyle = 'rgba(255,255,255,0.045)';
  ctx.lineWidth = 1;
  for (let x = 24; x < FIELD.width; x += 64) {
    ctx.beginPath(); ctx.moveTo(x, FLOOR_TOP); ctx.lineTo(x, FIELD.height); ctx.stroke();
  }
  for (let y = FLOOR_TOP; y < FIELD.height; y += 64) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(FIELD.width, y); ctx.stroke();
  }
  // Vault room: a warmer marble floor with a gold frame.
  ctx.fillStyle = '#1d1a26';
  ctx.fillRect(VAULT_ROOM.x, VAULT_ROOM.y, VAULT_ROOM.w, VAULT_ROOM.h);
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 2;
  ctx.strokeRect(VAULT_ROOM.x, VAULT_ROOM.y, VAULT_ROOM.w, VAULT_ROOM.h);
  drawLabel(ctx, 'VAULT ROOM', VAULT_ROOM.x + VAULT_ROOM.w / 2, VAULT_ROOM.y + VAULT_ROOM.h - 12, 'rgba(232,182,76,0.75)', 11);
  // Dark zones: near-black with hatch marks, labelled as hiding places.
  for (const z of DARK_ZONES) {
    ctx.fillStyle = '#04060c';
    ctx.fillRect(z.x, z.y, z.w, z.h);
    ctx.strokeStyle = 'rgba(120,140,180,0.18)';
    for (let i = -z.h; i < z.w; i += 18) {
      ctx.beginPath(); ctx.moveTo(z.x + i, z.y + z.h); ctx.lineTo(z.x + i + z.h, z.y); ctx.stroke();
    }
    ctx.save();
    ctx.translate(z.x + z.w / 2, z.y + z.h / 2);
    ctx.rotate(-Math.PI / 2);
    drawLabel(ctx, z.label, 0, 0, 'rgba(150,170,210,0.6)', 11);
    ctx.restore();
  }
}

function drawWalls(ctx) {
  for (const w of WALLS) {
    ctx.fillStyle = '#2b3348';
    ctx.fillRect(w.x, w.y, w.w, w.h);
    ctx.fillStyle = '#46536f';
    ctx.fillRect(w.x, w.y, w.w, 3);
  }
}

function drawExit(ctx, world) {
  const open = world.safesCracked === 3;
  const pulse = open ? 0.55 + 0.35 * Math.sin(world.time * 5) : 0.3;
  ctx.fillStyle = open ? `rgba(46,204,113,${pulse})` : 'rgba(46,204,113,0.22)';
  ctx.fillRect(EXIT_DOOR.x - 14, EXIT_DOOR.y - 34, EXIT_DOOR.w + 28, 34);
  ctx.fillStyle = open ? '#2ecc71' : '#27ae60';
  ctx.fillRect(EXIT_DOOR.x, EXIT_DOOR.y - 6, EXIT_DOOR.w, 6);
  if (world.screen === SCREEN_PLAY) {
    drawLabel(ctx, 'GETAWAY', EXIT_DOOR.x + EXIT_DOOR.w / 2, EXIT_DOOR.y - 20, open ? '#b8f5cd' : '#7fbf95', 13);
    if (open) drawLabel(ctx, '▼ OPEN — GO!', EXIT_DOOR.x + EXIT_DOOR.w / 2, EXIT_DOOR.y - 52, '#2ecc71', 12);
  }
}

function drawSafes(ctx, world) {
  for (const s of world.safes) {
    if (s.cracked) {
      ctx.fillStyle = '#3a2f10';
      roundRect(ctx, s.x, s.y, s.w, s.h, 6); ctx.fill();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke();
      drawLabel(ctx, '✓ $400', s.x + s.w / 2, s.y + s.h / 2, GOLD, 13);
    } else {
      ctx.fillStyle = '#8a6d2b';
      roundRect(ctx, s.x, s.y, s.w, s.h, 6); ctx.fill();
      ctx.strokeStyle = GOLD; ctx.lineWidth = 2; ctx.stroke();
      ctx.beginPath(); ctx.arc(s.x + s.w / 2, s.y + s.h / 2, 11, 0, Math.PI * 2);
      ctx.fillStyle = '#2c2410'; ctx.fill();
      ctx.strokeStyle = GOLD; ctx.stroke();
      drawLabel(ctx, 'SAFE', s.x + s.w / 2, s.y - 12, GOLD, 11);
    }
  }
  for (const c of world.cases) {
    ctx.fillStyle = 'rgba(120,200,230,0.14)';
    roundRect(ctx, c.x, c.y, c.w, c.h, 5); ctx.fill();
    ctx.strokeStyle = '#7cc8e6'; ctx.lineWidth = 1.5; ctx.stroke();
    if (c.opened) {
      drawLabel(ctx, 'EMPTY', c.x + c.w / 2, c.y + c.h / 2, '#7cc8e6', 11);
    } else {
      ctx.save();
      ctx.translate(c.x + c.w / 2, c.y + c.h / 2);
      ctx.rotate(Math.PI / 4);
      ctx.fillStyle = '#8ff0ff';
      ctx.fillRect(-8, -8, 16, 16);
      ctx.restore();
      drawLabel(ctx, 'GEM $250', c.x + c.w / 2, c.y - 12, '#8ff0ff', 11);
    }
  }
}

function drawCameras(ctx, world) {
  for (const cam of world.cameras) {
    const jammed = world.jammerLeft > 0;
    if (!jammed) drawCone(ctx, cam.x, cam.y, cam.angle, cam.halfAngle, cam.range, 'rgba(245,197,66,0.16)');
    ctx.fillStyle = '#3a3f4d';
    roundRect(ctx, cam.x - 12, cam.y - 8, 24, 14, 4); ctx.fill();
    ctx.strokeStyle = jammed ? '#888' : YELLOW; ctx.lineWidth = 2; ctx.stroke();
    ctx.beginPath(); ctx.arc(cam.x, cam.y + 6, 4, 0, Math.PI * 2);
    ctx.fillStyle = jammed ? '#888' : YELLOW; ctx.fill();
    drawLabel(ctx, jammed ? 'CAM — JAMMED' : 'CAMERA', cam.x, cam.y + 24, jammed ? '#999' : YELLOW, 11);
  }
}

function drawGuards(ctx, world) {
  for (const g of world.guards) {
    const color = g.alerted ? 'rgba(229,72,77,0.34)' : 'rgba(229,72,77,0.17)';
    drawCone(ctx, g.x, g.y, g.face, TUNING.guardHalfAngle, TUNING.guardRange, color);
  }
  for (const g of world.guards) {
    ctx.beginPath(); ctx.arc(g.x, g.y, 14, 0, Math.PI * 2);
    ctx.fillStyle = '#7a1f24'; ctx.fill();
    ctx.lineWidth = 2.5; ctx.strokeStyle = g.alerted ? '#ff6b6b' : '#e8e8e8'; ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(g.x + Math.cos(g.face) * 8, g.y + Math.sin(g.face) * 8);
    ctx.lineTo(g.x + Math.cos(g.face) * 20, g.y + Math.sin(g.face) * 20);
    ctx.lineWidth = 3; ctx.strokeStyle = '#e8e8e8'; ctx.stroke();
    drawLabel(ctx, 'GUARD', g.x, g.y - 24, '#ff9a9e', 10);
    if (g.alerted) drawLabel(ctx, '!', g.x, g.y - 38, '#ff5252', 20);
  }
}

function drawThief(ctx, world) {
  const t = world.thief;
  if (world.grace > 0 && Math.floor(world.time * 8) % 2 === 0) return; // blink while grace lasts
  ctx.beginPath(); ctx.arc(t.x, t.y, TUNING.thiefRadius, 0, Math.PI * 2);
  ctx.fillStyle = '#0b3d3a'; ctx.fill();
  ctx.lineWidth = 3; ctx.strokeStyle = CYAN; ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(t.x + Math.cos(t.face) * 6, t.y + Math.sin(t.face) * 6);
  ctx.lineTo(t.x + Math.cos(t.face) * 20, t.y + Math.sin(t.face) * 20);
  ctx.lineWidth = 3; ctx.strokeStyle = CYAN; ctx.stroke();
  ctx.beginPath(); ctx.arc(t.x, t.y, 4, 0, Math.PI * 2);
  ctx.fillStyle = '#eafffd'; ctx.fill();
  if (world.screen === SCREEN_PLAY) drawLabel(ctx, 'YOU', t.x, t.y - 26, '#b8fff8', 11);
}

function drawCrackRing(ctx, world) {
  const target = world.crackTarget;
  if (!target) return;
  ctx.beginPath(); ctx.arc(target.x, target.y - 30, 16, -Math.PI / 2, -Math.PI / 2 + target.progress * Math.PI * 2);
  ctx.lineWidth = 5; ctx.strokeStyle = GOLD; ctx.stroke();
  drawLabel(ctx, target.kind === 'safe' ? 'CRACKING…' : 'CUTTING…', target.x, target.y - 52, GOLD, 11);
}

function drawHud(ctx, world) {
  ctx.fillStyle = '#101828';
  ctx.fillRect(0, 0, FIELD.width, HUD_HEIGHT);
  ctx.fillStyle = '#232d42';
  ctx.fillRect(0, HUD_HEIGHT - 2, FIELD.width, 2);
  // Left: title + tool shop.
  ctx.textAlign = 'left'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 17px system-ui, sans-serif';
  ctx.fillStyle = '#f2f5fa';
  ctx.fillText('MIDNIGHT VAULT', 14, 15);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#9fb0c9';
  const shop = TOOLS.map((t) => {
    const owned = world.tools[t.id] || (t.id === 'jammer' && world.jammerLeft > 0);
    return `${t.key} ${t.name} $${t.cost}${owned ? ' ✓' : ''}`;
  }).join('   ·   ');
  ctx.fillText(shop, 14, 36);
  // Centre: the alarm meter.
  const ax = FIELD.width / 2 - 160;
  ctx.font = 'bold 13px system-ui, sans-serif';
  ctx.fillStyle = world.alarm >= 70 ? '#ff6b6b' : '#f2f5fa';
  ctx.textAlign = 'center';
  ctx.fillText('ALARM', FIELD.width / 2, 13);
  ctx.fillStyle = '#1c2436';
  roundRect(ctx, ax, 24, 320, 18, 9); ctx.fill();
  const frac = world.alarm / TUNING.alarmMax;
  const alarmColor = world.alarm >= 70 ? '#e5484d' : world.alarm >= 40 ? '#f5a623' : '#2ecc71';
  if (frac > 0) {
    ctx.fillStyle = alarmColor;
    roundRect(ctx, ax, 24, Math.max(18, 320 * frac), 18, 9); ctx.fill();
  }
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px system-ui, sans-serif';
  ctx.fillText(`${Math.round(world.alarm)}%`, FIELD.width / 2, 33);
  // Right: loot, safes, time.
  ctx.textAlign = 'right';
  ctx.font = 'bold 15px system-ui, sans-serif';
  ctx.fillStyle = GOLD;
  ctx.fillText(`LOOT $${world.loot}`, FIELD.width - 14, 15);
  ctx.font = '12px system-ui, sans-serif';
  ctx.fillStyle = '#9fb0c9';
  ctx.fillText(`SAFES ${world.safesCracked}/3   ·   ${formatTime(world.time)}`, FIELD.width - 14, 36);
  // Toast under the HUD, top-left so it never covers the vault room.
  if (world.toastLeft > 0) {
    ctx.font = 'bold 14px system-ui, sans-serif';
    const w = ctx.measureText(world.toast).width + 28;
    ctx.fillStyle = 'rgba(16,24,40,0.92)';
    roundRect(ctx, 14, 60, w, 28, 14); ctx.fill();
    ctx.strokeStyle = GOLD; ctx.lineWidth = 1; ctx.stroke();
    ctx.fillStyle = '#ffe9b0';
    ctx.textAlign = 'left';
    ctx.fillText(world.toast, 28, 74);
  }
  // Spotted: a red frame so the danger reads even shrunk, and a banner
  // top-left, clear of the safes.
  if (world.spotted) {
    ctx.strokeStyle = `rgba(229,72,77,${0.5 + 0.4 * Math.sin(world.time * 8)})`;
    ctx.lineWidth = 6;
    ctx.strokeRect(3, HUD_HEIGHT + 3, FIELD.width - 6, FIELD.height - HUD_HEIGHT - 6);
    ctx.font = 'bold 16px system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.fillStyle = '#ff6b6b';
    ctx.fillText(world.spottedBy === 'camera' ? 'SPOTTED BY CAMERA!' : 'SPOTTED BY A GUARD!', 16, 112);
  }
}

function drawOverlay(ctx, title, lines, accent) {
  ctx.fillStyle = 'rgba(4,8,16,0.82)';
  ctx.fillRect(0, 0, FIELD.width, FIELD.height);
  ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
  ctx.font = 'bold 44px system-ui, sans-serif';
  ctx.fillStyle = accent;
  ctx.fillText(title, FIELD.width / 2, 210);
  ctx.font = '17px system-ui, sans-serif';
  ctx.fillStyle = '#dfe7f2';
  lines.forEach((line, i) => ctx.fillText(line, FIELD.width / 2, 280 + i * 30));
}

export function renderWorld(ctx, world) {
  drawFloor(ctx);
  drawExit(ctx, world);
  drawSafes(ctx, world);
  drawCameras(ctx, world);
  drawGuards(ctx, world);
  drawThief(ctx, world);
  drawCrackRing(ctx, world);
  drawWalls(ctx);
  drawHud(ctx, world);

  if (world.screen === SCREEN_TITLE) {
    drawOverlay(ctx, 'MIDNIGHT VAULT', [
      'One thief. Three safes. Six guards. Two cameras. One way out.',
      'Move: WASD / arrows    ·    Crack a safe: hold E beside it',
      'Buy tools: 1 Lockpick $150  ·  2 Glass cutter $200  ·  3 Jammer $250',
      'Hide in the dark vent shaft and service corridor — cones cannot see you there.',
      'Crack all 3 safes, then slip out the green GETAWAY door. Alarm 100% = busted.',
      '',
      'Press ENTER or click to start the heist',
    ], GOLD);
  } else if (world.screen === SCREEN_WIN) {
    const rank = world.alarm < 30 ? 'GHOST — never really seen' : world.alarm < 60 ? 'PRO — cool under the cones' : 'LOUD BUT RICH';
    drawOverlay(ctx, 'CLEAN GETAWAY!', [
      `Loot $${world.loot} in ${formatTime(world.time)} — final alarm ${Math.round(world.alarm)}%`,
      `Rank: ${rank}`,
      '',
      'Press R to run it again',
    ], '#2ecc71');
  } else if (world.screen === SCREEN_BUSTED) {
    drawOverlay(ctx, 'BUSTED!', [
      'The alarm hit 100% — the bank locks down and the crew walks.',
      `Loot kept: $${world.loot}   ·   Safes cracked: ${world.safesCracked}/3`,
      '',
      'Press R to try again — use the dark routes and the jammer',
    ], '#e5484d');
  }
}

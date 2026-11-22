// Keyboard and mouse input for Midnight Vault. WASD or arrows move the
// thief, E works a safe or a gem case, 1/2/3 buy tools, Enter starts,
// R restarts after a win or a bust. A click on the canvas starts too.

export function makeInput(canvas) {
  const keys = new Set();
  const pressed = new Set();
  let clicked = false;

  function keyName(event) {
    const k = event.key.toLowerCase();
    return k === ' ' ? 'space' : k;
  }

  window.addEventListener('keydown', (event) => {
    const k = keyName(event);
    if (['arrowup', 'arrowdown', 'arrowleft', 'arrowright', ' '].includes(k)) event.preventDefault();
    if (!keys.has(k)) pressed.add(k);
    keys.add(k);
  });
  window.addEventListener('keyup', (event) => keys.delete(keyName(event)));
  window.addEventListener('blur', () => keys.clear());
  canvas.addEventListener('pointerdown', () => { clicked = true; });

  function moveVector() {
    let x = 0;
    let y = 0;
    if (keys.has('a') || keys.has('arrowleft')) x -= 1;
    if (keys.has('d') || keys.has('arrowright')) x += 1;
    if (keys.has('w') || keys.has('arrowup')) y -= 1;
    if (keys.has('s') || keys.has('arrowdown')) y += 1;
    if (x !== 0 && y !== 0) {
      const len = Math.hypot(x, y);
      x /= len;
      y /= len;
    }
    return { x, y };
  }

  return {
    moveVector,
    interactHeld() { return keys.has('e'); },
    // One-shot presses: true only on the frame the key went down.
    wasPressed(name) { return pressed.has(name); },
    clickedOnce() { const c = clicked; clicked = false; return c; },
    endFrame() { pressed.clear(); },
  };
}

// Tiny WebAudio bleeps for Midnight Vault. No audio files: every sound is
// an oscillator, so the game still ships zero network requests.

export function makeSound() {
  let audio = null;
  function ensure() {
    if (!audio) {
      try { audio = new (window.AudioContext || window.webkitAudioContext)(); } catch { audio = null; }
    }
    if (audio && audio.state === 'suspended') audio.resume();
    return audio;
  }
  function tone(freq, seconds, type = 'sine', when = 0) {
    const ac = ensure();
    if (!ac) return;
    const osc = ac.createOscillator();
    const gain = ac.createGain();
    osc.type = type;
    osc.frequency.value = freq;
    gain.gain.setValueAtTime(0.08, ac.currentTime + when);
    gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + when + seconds);
    osc.connect(gain).connect(ac.destination);
    osc.start(ac.currentTime + when);
    osc.stop(ac.currentTime + when + seconds);
  }
  return {
    ensure,
    spotted() { tone(660, 0.12, 'square'); tone(520, 0.14, 'square', 0.12); },
    cracked() { tone(880, 0.1, 'sine'); tone(1320, 0.16, 'sine', 0.09); },
    bought() { tone(1040, 0.08, 'triangle'); },
    win() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.18, 'sine', i * 0.11)); },
    busted() { tone(220, 0.4, 'sawtooth'); tone(165, 0.5, 'sawtooth', 0.25); },
  };
}

export function playChime() {
  try {
    const context = new AudioContext();
    const gain = context.createGain();
    gain.gain.value = 0.0001;
    gain.connect(context.destination);

    const oscA = context.createOscillator();
    oscA.type = "sine";
    oscA.frequency.value = 523.25;
    oscA.connect(gain);

    const oscB = context.createOscillator();
    oscB.type = "sine";
    oscB.frequency.value = 659.25;
    oscB.connect(gain);

    oscA.start();
    oscB.start();
    gain.gain.exponentialRampToValueAtTime(0.18, context.currentTime + 0.05);
    gain.gain.exponentialRampToValueAtTime(0.0001, context.currentTime + 1.8);
    oscA.stop(context.currentTime + 1.85);
    oscB.stop(context.currentTime + 1.85);
  } catch {
    // Silent fail if audio context isn't available.
  }
}

export function playChimeSequence(count = 3, gapMs = 250) {
  if (count <= 0) {
    return;
  }
  for (let index = 0; index < count; index += 1) {
    window.setTimeout(() => {
      playChime();
    }, index * gapMs);
  }
}

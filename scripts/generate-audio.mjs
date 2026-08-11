import { writeFileSync } from "node:fs";

/**
 * Synthesizes short sound effects as 16-bit mono PCM WAV files — sine
 * waves with exponential decay envelopes. No external audio source
 * needed; this is just math written straight to bytes.
 *
 * Regenerate with: `node scripts/generate-audio.mjs`
 */

const SAMPLE_RATE = 44100;

function writeWav(path, samples) {
  const dataSize = samples.length * 2;
  const buffer = Buffer.alloc(44 + dataSize);

  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16);
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(SAMPLE_RATE, 24);
  buffer.writeUInt32LE(SAMPLE_RATE * 2, 28);
  buffer.writeUInt16LE(2, 32);
  buffer.writeUInt16LE(16, 34);
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < samples.length; i++) {
    const clamped = Math.max(-1, Math.min(1, samples[i]));
    buffer.writeInt16LE(Math.round(clamped * 32767), 44 + i * 2);
  }

  writeFileSync(path, buffer);
  const ms = ((samples.length / SAMPLE_RATE) * 1000).toFixed(0);
  console.log(`Wrote ${path} (${buffer.length} bytes, ${ms}ms)`);
}

/** A single decaying sine tone. */
function tone({ freq, durationMs, volume = 0.7, decayRate = 60, delayMs = 0 }) {
  const numSamples = Math.floor((SAMPLE_RATE * durationMs) / 1000);
  const delaySamples = Math.floor((SAMPLE_RATE * delayMs) / 1000);
  const out = new Float64Array(delaySamples + numSamples);
  for (let i = 0; i < numSamples; i++) {
    const t = i / SAMPLE_RATE;
    out[delaySamples + i] = Math.sin(2 * Math.PI * freq * t) * Math.exp(-t * decayRate) * volume;
  }
  return out;
}

/** Sums several tones into one buffer, letting them overlap/ring together. */
function mix(layers) {
  const length = Math.max(...layers.map((l) => l.length));
  const out = new Float64Array(length);
  for (const layer of layers) {
    for (let i = 0; i < layer.length; i++) out[i] += layer[i];
  }
  return out;
}

/**
 * Scales a buffer so its loudest sample sits at `peak`. Summed layers
 * routinely exceed 1.0 and would otherwise clip into harsh distortion.
 */
function normalize(samples, peak = 0.85) {
  let max = 0;
  for (const s of samples) max = Math.max(max, Math.abs(s));
  if (max === 0) return samples;
  const gain = peak / max;
  const out = new Float64Array(samples.length);
  for (let i = 0; i < samples.length; i++) out[i] = samples[i] * gain;
  return out;
}

// --- 1. Step tick: short, dry click on every algorithm step -----------------
writeWav("public/tick.wav", tone({ freq: 1400, durationMs: 45, volume: 0.7, decayRate: 60 }));

// --- 2. Success chime: rising C-E-G-C major arpeggio when sorting finishes --
// Longer decay so the notes ring into each other instead of clicking.
writeWav(
  "public/success.wav",
  normalize(
    mix([
      tone({ freq: 523.25, durationMs: 900, volume: 0.5, decayRate: 5, delayMs: 0 }), // C5
      tone({ freq: 659.25, durationMs: 800, volume: 0.5, decayRate: 5, delayMs: 110 }), // E5
      tone({ freq: 783.99, durationMs: 700, volume: 0.5, decayRate: 5, delayMs: 220 }), // G5
      tone({ freq: 1046.5, durationMs: 950, volume: 0.55, decayRate: 4, delayMs: 330 }), // C6
    ])
  )
);

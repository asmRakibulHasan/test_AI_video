import { writeFileSync } from "node:fs";

/**
 * Synthesizes a short percussive "tick" as a 16-bit mono PCM WAV file —
 * a sine wave with a fast exponential decay envelope. No external audio
 * source needed; this is just math written straight to bytes.
 *
 * Tweak `freq` (pitch) or `durationMs` (length) and re-run to change the
 * sound: `node scripts/generate-tick.mjs`
 */
function makeTickWav(path, { sampleRate = 44100, freq = 1400, durationMs = 45, volume = 0.7, decayRate = 60 } = {}) {
  const numSamples = Math.floor((sampleRate * durationMs) / 1000);
  const dataSize = numSamples * 2; // 16-bit mono
  const buffer = Buffer.alloc(44 + dataSize);

  // RIFF header
  buffer.write("RIFF", 0);
  buffer.writeUInt32LE(36 + dataSize, 4);
  buffer.write("WAVE", 8);

  // fmt chunk
  buffer.write("fmt ", 12);
  buffer.writeUInt32LE(16, 16); // chunk size
  buffer.writeUInt16LE(1, 20); // PCM
  buffer.writeUInt16LE(1, 22); // mono
  buffer.writeUInt32LE(sampleRate, 24);
  buffer.writeUInt32LE(sampleRate * 2, 28); // byte rate
  buffer.writeUInt16LE(2, 32); // block align
  buffer.writeUInt16LE(16, 34); // bits per sample

  // data chunk
  buffer.write("data", 36);
  buffer.writeUInt32LE(dataSize, 40);

  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    const envelope = Math.exp(-t * decayRate);
    const sample = Math.sin(2 * Math.PI * freq * t) * envelope * volume;
    const intSample = Math.round(Math.max(-1, Math.min(1, sample)) * 32767);
    buffer.writeInt16LE(intSample, 44 + i * 2);
  }

  writeFileSync(path, buffer);
  console.log(`Wrote ${path} (${buffer.length} bytes, ${durationMs}ms @ ${freq}Hz)`);
}

makeTickWav("public/tick.wav", { freq: 1400, durationMs: 45, volume: 0.7, decayRate: 60 });

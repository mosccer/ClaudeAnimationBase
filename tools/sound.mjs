// tools/sound.mjs: the TAXTALK demo's soundtrack, synthesised in code (no samples, no dependencies, deterministic).
//   node tools/sound.mjs            -> music/bed.wav (music), music/sfx.wav (sound effects), music/mix.wav (both)
// The music is a bouncy, viral-style 112 BPM groove (PROJECT.bpm) in C major (F → G → Em → Am): marimba, snaps and a
// soft bass while the receipts pile up, a riser under the brush wipe, the drop on beat 10 (5.357 s, right after the
// wipe) with kick, clap, funky bass, whistled hook and offbeat stabs, a break under the iris, and a final hit on the logo.
// SFX lists every on-screen event of src/scenes/taxtalk_demo.js in video seconds: edit the times there if the scene
// is re-timed.
import { writeFileSync, mkdirSync } from 'node:fs';

const SR = 44100, DUR = 15.5, N = Math.ceil(SR * DUR), BPM = 112, BEAT = 60 / BPM, S16 = BEAT / 4, TAU = Math.PI * 2;
const DROP = 10 * BEAT, BREAK = 21 * BEAT, OUTRO = 12.0, END = 27 * BEAT;   // section starts, in seconds

// ---------- buses and helpers ----------
const bus = () => [new Float32Array(N), new Float32Array(N)];
const DRUMS = bus(), MUSIC = bus(), SEND = bus(), FX = bus();
let seed = 7; const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647, noise = () => rnd() * 2 - 1;
const mtof = m => 440 * 2 ** ((m - 69) / 12);
const clamp = (x, a = 0, b = 1) => Math.max(a, Math.min(b, x));
// add a voice: fn(t) returns one sample at t seconds into the voice; pan -1..1; send = how much goes to the reverb
function add(B, t0, len, fn, gain = 1, pan = 0, send = 0) {
  const i0 = Math.round(t0 * SR), n = Math.round(len * SR), gl = gain * Math.min(1, 1 - pan), gr = gain * Math.min(1, 1 + pan);
  for (let i = 0; i < n; i++) {
    const k = i0 + i; if (k < 0 || k >= N) continue;
    const v = fn(i / SR); B[0][k] += v * gl; B[1][k] += v * gr;
    if (send) { SEND[0][k] += v * gl * send; SEND[1][k] += v * gr * send; }
  }
}
// state-variable filter: s(x) returns { lp, bp, hp }
function svf(fc, q = .7) {
  let lo = 0, band = 0;
  return (x, f = fc) => { const g = 2 * Math.sin(Math.PI * Math.min(f, SR / 6) / SR); lo += g * band; const hi = x - lo - q * band; band += g * hi; return { lp: lo, bp: band, hp: hi }; };
}
const env = (t, len, a = .005, r = .03) => clamp(t / a) * clamp((len - t) / r);

// ---------- instruments ----------
const kick = () => { let ph = 0; return t => { ph += TAU * (46 + 150 * Math.exp(-t * 32)) / SR; return Math.sin(ph) * Math.exp(-t * 6.5) * 1.1 + (t < .003 ? noise() * .4 : 0); }; };
const clap = () => { const f = svf(1300, .9); return t => { const burst = [0, .011, .022].reduce((s, d) => s + (t >= d ? Math.exp(-(t - d) * 180) : 0), 0) + Math.exp(-t * 22) * .5; return f(noise()).bp * burst * 2.2; }; };
const snap = () => { const f = svf(2600, .5); return t => f(noise()).bp * Math.exp(-t * 70) * 2.4; };
const hat = (open = false) => { const f = svf(9000, .7); return t => f(noise()).hp * Math.exp(-t * (open ? 14 : 45)) * .9; };
const bass = (m, len) => { let ph = 0; const f = svf(400, .35), fr = mtof(m); return t => { ph = (ph + fr / SR) % 1; const saw = 2 * ph - 1, sq = ph < .5 ? 1 : -1; return f(saw * .6 + sq * .4, 220 + 1400 * Math.exp(-t * 16)).lp * env(t, len, .004, .02) * 1.3; }; };
const marimba = m => { const fr = mtof(m); return t => (Math.sin(TAU * fr * t) * Math.exp(-t * 8) + .3 * Math.sin(TAU * fr * 3.93 * t) * Math.exp(-t * 34)) * env(t, 9, .002, .01); };
const bell = (fr, dec = 3) => t => [[1, 1], [2.76, .5], [5.4, .25], [8.9, .12]].reduce((s, [r, a]) => s + a * Math.sin(TAU * fr * r * t) * Math.exp(-t * dec * r ** .7), 0) * clamp(t / .002);
// the whistled hook: sine with vibrato, a breathy edge and a short glide in from the previous note
const whistle = (m, len, from = m) => { let ph = 0; const f = svf(3000, .8); return t => {
  const mm = from + (m - from) * clamp(t / .045), fr = mtof(mm) * (1 + .006 * Math.sin(TAU * 5.6 * t) * clamp((t - .08) / .1));
  ph += TAU * fr / SR; return (Math.sin(ph) + f(noise()).bp * .05) * env(t, len, .025, .07) * .9; }; };
const stab = (notes, len) => { const ph = notes.flatMap(m => [-.12, 0, .12].map(d => [mtof(m + d), 0])); const f = svf(2400, .5); return t => {
  let s = 0; for (const p of ph) { p[1] = (p[1] + p[0] / SR) % 1; s += 2 * p[1] - 1; } return f(s / ph.length, 900 + 2600 * Math.exp(-t * 14)).lp * Math.exp(-t * 7) * env(t, len, .003, .04) * 1.6; }; };

// ---------- the score ----------
const PROG = [[53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62], [57, 60, 64, 67]];   // Fmaj7, G7, Em7, Am7
const BASS = [[0, 0, 2], [3, 12, 1], [6, 0, 1], [8, 7, 2], [10, 0, 1], [11, 12, 1], [14, 7, 1]];   // [16th, semitones, length]
const HOOK = [[0, 76, 2], [2, 79, 2], [4, 81, 1], [6, 79, 1], [7, 76, 3], [10, 74, 2], [12, 72, 4],
              [16, 76, 2], [18, 79, 2], [20, 84, 2], [22, 81, 1], [23, 79, 3], [26, 76, 2], [28, 74, 2], [30, 76, 2]];
const KICKS = [];
const steps = Math.floor(END / S16);
for (let s = 0; s < steps; s++) {
  const t = s * S16, pos = s % 16, ch = PROG[Math.floor(s / 16) % 4];
  const intro = t < 3.0, build = t >= 3.0 && t < DROP, drop = t >= DROP && t < BREAK, brk = t >= BREAK && t < OUTRO, outro = t >= OUTRO;
  const groove = drop || outro;
  // marimba: chord-tone arpeggio on eighths, all the way through (quieter under the groove)
  if (pos % 2 === 0) add(MUSIC, t, .6, marimba(ch[(pos / 2 + Math.floor(s / 16)) % 4] + 12), groove ? .16 : .26, pos % 4 ? .35 : -.35, .25);
  // snaps on 2 and 4 before the drop
  if ((intro || build || brk) && (pos === 4 || pos === 12)) add(DRUMS, t, .12, snap(), .5, .2, .15);
  // bass: soft in the intro, funky from the build
  if (!brk) for (const [p, d, l] of BASS) if (p === pos && (groove || build || p % 8 === 0)) add(MUSIC, t, l * S16 * .95, bass(ch[0] - 12 + d, l * S16 * .95), intro ? .32 : .5);
  // hats: eighths in the build, sixteenths with offbeat accents in the groove
  if (build && pos % 2 === 0) add(DRUMS, t, .07, hat(), .22, .4);
  if (groove) add(DRUMS, t, pos % 4 === 2 ? .2 : .06, hat(pos % 4 === 2), pos % 4 === 2 ? .3 : .14, .4);
  // the groove: bouncy kick, clap on 2 and 4, offbeat stabs, the whistled hook
  if (groove && [0, 6, 8, 11].includes(pos) && !(outro && t < OUTRO + 4 * BEAT && pos === 11)) { add(DRUMS, t, .45, kick(), .95); KICKS.push(t); }
  if ((groove || (build && t > DROP - 4 * BEAT)) && (pos === 4 || pos === 12)) add(DRUMS, t, .3, clap(), groove ? .6 : .45, -.1, .3);
  if (groove && (pos === 2 || pos === 10)) add(MUSIC, t, .22, stab(ch.map(m => m + 12), .2), .22, 0, .3);
  if (groove) {
    const hs = Math.round((t - (drop ? DROP : OUTRO)) / S16) % 32, prev = HOOK[(HOOK.findIndex(h => h[0] === hs) + HOOK.length - 1) % HOOK.length];
    for (const [p, m, l] of HOOK) if (p === hs) add(MUSIC, t, l * S16 + .06, whistle(m, l * S16 + .06, prev[1]), .3, -.15, .4);
  }
}
// build: snare roll (claps, 8ths then 16ths, rising) and a noise riser into the drop
for (let t = DROP - 2 * BEAT; t < DROP - .01; t += t < DROP - BEAT ? S16 * 2 : S16) add(DRUMS, t, .25, clap(), .2 + .35 * clamp((t - (DROP - 2 * BEAT)) / (2 * BEAT)), -.1, .2);
const riser = (len, up = true) => { const f = svf(400, .4); return t => { const k = clamp(t / len), kk = up ? k : 1 - k; return f(noise(), 300 + 7000 * kk * kk).bp * kk * kk * 1.4; }; };
add(MUSIC, DROP - 4 * BEAT, 4 * BEAT, riser(4 * BEAT), .5, 0, .3);
add(DRUMS, DROP, .5, kick(), 1.1); add(DRUMS, DROP, .6, (() => { const f = svf(5000, .6); return t => f(noise()).hp * Math.exp(-t * 5) * .6; })(), .5);   // crash
add(MUSIC, OUTRO - 3 * BEAT / 2, 3 * BEAT / 2, riser(3 * BEAT / 2), .35, 0, .3);   // swell out of the break
// the end: a C major hit on the last beat that rings out
add(DRUMS, END, .5, kick(), 1.1);
add(MUSIC, END, 1.1, stab([60, 64, 67, 72], 1.05), .45, 0, .5);
for (const [m, g] of [[84, .25], [88, .18], [91, .15]]) add(MUSIC, END, 1.04, bell(mtof(m), 2.2), g, 0, .5);

// ---------- sound effects (video seconds; see src/scenes/taxtalk_demo.js) ----------
const whoosh = (len, up = true) => { const f = svf(600, .5); return t => { const k = clamp(t / len), a = Math.sin(Math.PI * k) ** 1.5; return f(noise(), up ? 400 + 3000 * k : 3400 - 3000 * k).bp * a * 1.6; }; };
const paper = () => { const f = svf(3000, .3); return t => f(noise(), 1800 + 3000 * rnd()).bp * (Math.exp(-t * 60) + .6 * Math.exp(-Math.max(0, t - .035) * 45) * (t > .035)) * 1.6; };
const pop = (f0 = 900, f1 = 260) => { let ph = 0; return t => { ph += TAU * (f1 + (f0 - f1) * Math.exp(-t * 40)) / SR; return Math.sin(ph) * Math.exp(-t * 22) + (t < .002 ? .5 : 0); }; };
const glide = (f0, f1, len) => { let ph = 0; return t => { ph += TAU * (f0 * (f1 / f0) ** clamp(t / len)) / SR; return Math.sin(ph) * env(t, len, .01, .04); }; };
const boing = (f0 = 220) => { let ph = 0; return t => { ph += TAU * f0 * (1 + .35 * Math.sin(TAU * 11 * t) * Math.exp(-t * 6) + .6 * Math.exp(-t * 20)) / SR; return Math.sin(ph) * Math.exp(-t * 5.5); }; };
const buzz = len => { let ph = 0; return t => { ph += TAU * 150 / SR; const on = Math.sin(TAU * 11 * t) > -.2 ? 1 : 0; return Math.tanh(Math.sin(ph) * 3) * on * env(t, len, .005, .03) * .5; }; };
const click = () => t => noise() * Math.exp(-t * 900);
const thump = () => { let ph = 0; const f = svf(500, .6); return t => { ph += TAU * (45 + 90 * Math.exp(-t * 25)) / SR; return Math.sin(ph) * Math.exp(-t * 5) * 1.3 + f(noise()).lp * Math.exp(-t * 18) * 1.8; }; };
const sparkle = (n = 6, base = 84, step = .045) => { return (t0, g) => { for (let i = 0; i < n; i++) add(FX, t0 + i * step, .9, bell(mtof(base + [0, 4, 7, 12, 16, 19, 24][i % 7]), 4.5), g * (1 - i * .06), (i % 2 ? .3 : -.3), .6); }; };

const SFX = [
  [0.00, () => add(FX, 0, .55, whoosh(.55), .35, 0, .3)],                                        // iris opens
  [0.78, t => add(FX, t, .2, glide(700, 1600, .12), .22, .35, .3)],                                // sweat drop
  ...[1.10, 1.40, 1.65, 1.85, 2.00, 2.13].map((t, i) => [t, t => add(FX, t, .12, paper(), .5 + .05 * i, .3, .1)]),   // receipts land
  [1.98, t => add(FX, t, .3, glide(420, 760, .22), .25, .2, .3)],                                  // "?"
  [2.60, t => add(FX, t, .45, buzz(.45), .5, .45)],                                                // phone buzzes
  [3.05, t => add(FX, t, .2, pop(1100, 320), .5, .45, .2)],                                        // bubble pops in
  ...[3.18, 3.31, 3.44, 3.57, 3.70, 3.83].map(t => [t, t => add(FX, t, .02, click(), .25, .45)]),   // typing
  [3.20, t => add(FX, t, .5, boing(240), .3, -.2, .2)],                                            // the take
  [3.92, t => add(FX, t, 1.2, bell(mtof(88), 3), .35, .45, .5)],                                    // the check
  [4.02, t => sparkle(5, 79, .05)(t, .18)],                                                         // idea bulb
  [4.70, t => add(FX, t, .62, whoosh(.62), .5, 0, .2)],                                            // brush wipe
  ...[0.9, 1.55, 2.2, 2.75].flatMap((ti, i) => [
    [5 + ti - .38, t => add(FX, t, .12, paper(), .35, -.4, .1)],                                   // grab
    [5 + ti, t => add(FX, t, .32, whoosh(.32), .32, 0, .1)],                                       // fling
    [5 + ti + .5, t => add(FX, t, .9, bell(mtof([84, 86, 88, 91][i]), 5), .3, .35, .4)]]),         // the tick lands
  [8.60, t => add(FX, t, .28, whoosh(.28, false), .35, .3)],                                       // stamp falls
  [8.88, t => add(FX, t, .7, thump(), .9, .2, .25)],                                               // STAMP
  [9.08, t => add(FX, t, 1, bell(mtof(91), 3.5), .2, .6, .5)],                                     // calendar check
  ...[0, 1, 2, 3, 4].flatMap(i => [
    [9.40 + i * .12, t => add(FX, t, .12, pop(700 + 80 * i, 400), .14, .3)],                       // coin pops out
    [9.95 + i * .12, t => { for (const [r, g] of [[1, 1], [1.5, .6]]) add(FX, t, .6, bell(2100 * r + 90 * i, 9), .12 * g, -.1, .3); }]]),   // cling
  [10.05, t => sparkle(7, 84, .045)(t, .16)],                                                       // starstruck
  [10.58, t => add(FX, t, .35, glide(300, 900, .3), .3, -.1, .2)],                                 // hop
  [11.00, t => add(FX, t, .25, thump(), .35, -.1)],                                                // land
  [11.20, t => add(FX, t, .5, whoosh(.5, false), .35, 0, .2)],                                     // iris closes
  [12.00, t => add(FX, t, .45, whoosh(.45), .3, 0, .2)],                                           // iris opens
  [12.35, t => add(FX, t, .2, pop(1000, 300), .45, .2, .2)],                                       // green bubble
  [12.78, t => add(FX, t, 1.2, bell(mtof(88), 3), .3, .2, .5)],                                     // its check
  [13.00, t => add(FX, t, .2, pop(800, 200), .55, .3, .2)],                                        // TAX
  [13.15, t => { add(FX, t, .25, pop(600, 150), .6, .3, .2); sparkle(6, 91, .04)(t + .05, .14); }],   // TALK
  [14.90, t => add(FX, t, .55, whoosh(.55, false), .35, 0, .2)],                                   // iris out
];
for (const [t, f] of SFX) f(t);

// ---------- mix ----------
// sidechain pump: the music ducks under each kick (the bouncy "viral" feel); everything ducks under the stamp
const pump = new Float32Array(N).fill(1);
for (const tk of KICKS) for (let i = 0; i < SR * .3; i++) { const k = Math.round(tk * SR) + i; if (k < N) pump[k] = Math.min(pump[k], 1 - .4 * Math.exp(-i / SR * 12)); }
for (let k = 0; k < N; k++) { const t = k / SR; pump[k] *= 1 - .35 * clamp(1 - Math.abs(t - 2.82) / .3) - .4 * clamp(1 - Math.abs(t - 9.0) / .3); }
// reverb: a small Schroeder room on the send bus
function reverb(x, off) {
  const out = new Float32Array(N), combs = [1557, 1617, 1491, 1422].map(d => ({ b: new Float32Array(d + off), i: 0, lp: 0 })), aps = [225, 556].map(d => ({ b: new Float32Array(d + off), i: 0 }));
  for (let k = 0; k < N; k++) {
    let s = 0;
    for (const c of combs) { const y = c.b[c.i]; c.lp = y * .75 + c.lp * .25; c.b[c.i] = x[k] + c.lp * .8; c.i = (c.i + 1) % c.b.length; s += y; }
    s *= .25;
    for (const a of aps) { const y = a.b[a.i]; a.b[a.i] = s + y * .5; a.i = (a.i + 1) % a.b.length; s = y - s * .5; }
    out[k] = s;
  }
  return out;
}
const rev = [reverb(SEND[0], 0), reverb(SEND[1], 23)];
const fade = k => clamp((N - k) / (SR * .35));
const BED = bus(), SFXOUT = bus(), MIX = bus();
for (let c = 0; c < 2; c++) for (let k = 0; k < N; k++) {
  BED[c][k] = (MUSIC[c][k] * pump[k] + DRUMS[c][k] * (pump[k] > .7 ? 1 : pump[k] + .3)) * .8 * fade(k);
  SFXOUT[c][k] = FX[c][k] * fade(k);
  MIX[c][k] = BED[c][k] + SFXOUT[c][k] + rev[c][k] * .35 * fade(k);
}
function wav(path, B) {
  let peak = 1e-9; for (const ch of B) for (const v of ch) peak = Math.max(peak, Math.abs(v));
  const g = .89 / peak, buf = Buffer.alloc(44 + N * 4);
  buf.write('RIFF', 0); buf.writeUInt32LE(36 + N * 4, 4); buf.write('WAVEfmt ', 8); buf.writeUInt32LE(16, 16); buf.writeUInt16LE(1, 20); buf.writeUInt16LE(2, 22);
  buf.writeUInt32LE(SR, 24); buf.writeUInt32LE(SR * 4, 28); buf.writeUInt16LE(4, 32); buf.writeUInt16LE(16, 34); buf.write('data', 36); buf.writeUInt32LE(N * 4, 40);
  for (let k = 0; k < N; k++) for (let c = 0; c < 2; c++) buf.writeInt16LE(Math.round(Math.tanh(B[c][k] * g * 1.1) / Math.tanh(1.1) * 32767 * .97), 44 + k * 4 + c * 2);
  writeFileSync(path, buf); console.log(`${path}  peak ${peak.toFixed(2)} -> normalised`);
}
mkdirSync('music', { recursive: true });
wav('music/bed.wav', BED); wav('music/sfx.wav', SFXOUT); wav('music/mix.wav', MIX);

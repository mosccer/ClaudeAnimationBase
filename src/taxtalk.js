// taxtalk.js: the TAXTALK brand layer on top of the kit. Load it after clawd.js.
//   TT                the brand palette (the logo's green and blue, softened for paint), plus paper, gold and line greys
//   TT_WIPE           brushWipe colours in brand blue and green: brushWipe(p, TT_WIPE)
//   taxtalk(x, y, u, o)  the mascot, "น้องแท็กทอล์ค": Clawd's body and acting, painted like the logo (a green top over
//                     a blue band and blue legs) with a little cream chat-bubble badge on the belly. Takes every clawd()
//                     option; badge: false hides the badge.
//   Props, all painted (no letters): receipt, receiptPile, taxForm, checkmark, stampMark, coin, coinStack, chatBubble,
//   calendar. The one lettered piece is logoCard(), the end card: the guide's "use a word once" exception.
const TT = {
  green: '#3E9A4E', greenDk: '#256B36', greenLt: '#9ED69A',
  blue: '#2A68B0', blueDk: '#1C4A82', blueLt: '#8DB6E6',
  paper: '#FBF6EA', line: '#B3A894', gold: '#E8B23A', goldDk: '#A8741A', red: '#D65B52',
  wall: '#E9EFE2', wood: '#C9976A', woodDk: '#8E6040'
};
const TT_WIPE = [TT.blue, TT.green];

// ---------- the mascot ----------
// Badge position per view, in u (front-view x maps through the view's face, like the features do).
const TT_BADGE = { front: [0, 1], q: [1.3, .74] };
function taxtalk(x, y, u, o = {}) {
  const userDraw = o.draw, b = TT_BADGE[o.view || 'front'];
  clawd(x, y, u, {
    col: TT.green, dk: TT.blue, lt: TT.greenLt, ...o,
    draw: (u, sw) => {
      if (b && o.badge !== false && !(o.lid > .01)) {
        push(); translate(b[0] * u, -2.75 * u); scale(b[1] * .9, .9);
        chatShape(0, 0, 1.7 * u, 1.05 * u, { col: PAL.cream, sw: sw * .55, tail: -1 });
        for (let i = -1; i <= 1; i++) paint(ellPts(i * .42 * u, 0, .13 * u, .13 * u, 8), { wash: TT.blue, ink: null });
        pop();
      }
      if (userDraw) userDraw(u, sw);
    }
  });
}

// ---------- props ----------
// A chat bubble outline, w × h centred on (x, y), with its tail at the bottom (tail -1 = left, 1 = right), as ONE shape.
function chatBubblePts(x, y, w, h, tail = -1) {
  const r = Math.min(w, h) * .38, P = rrPts(x - w / 2, y - h / 2, w, h, r), n = P.length / 4;   // TR, BR, BL, TL corners
  const bx = x + tail * w * .12, tip = [x + tail * w * .42, y + h * .85];
  const T = tail < 0 ? [[bx, y + h / 2], tip, [bx - w * .16, y + h / 2]] : [[bx + w * .16, y + h / 2], tip, [bx, y + h / 2]];
  return [...P.slice(0, 2 * n), ...T, ...P.slice(2 * n)];
}
function chatShape(x, y, w, h, o = {}) { paint(chatBubblePts(x, y, w, h, o.tail ?? -1), { wash: o.col || TT.blue, ink: PAL.ink, sw: o.sw ?? 1 }); }

// chatBubble(x, y, s, k, o): the TAXTALK reply bubble, s = height in px. k 0..1 pops it in (backOut). It shows typing
// dots that bounce on the beat (o.dots, default on) or a checkmark drawing itself (o.check 0..1, replaces the dots).
//   o.col (default TT.blue), o.tail ±1, o.age (seconds since it appeared, for the dots)
function chatBubble(x, y, s, k = 1, o = {}) {
  if (k <= 0) return;
  const sc = backOut(k), w = s * 1.55, sw = clamp(s / 90, .5, 1.6);
  push(); translate(x, y); scale(sc); rotate(.04 * Math.sin((o.age ?? T) * 2.4));
  chatShape(0, 0, w, s, { col: o.col || TT.blue, sw, tail: o.tail ?? -1 });
  const chk = o.check || 0;
  if (chk > 0) checkmark(0, -s * .02, s * .62, chk, PAL.cream, sw, true);
  else if (o.dots !== false) for (let i = -1; i <= 1; i++) {
    const hop = Math.max(0, Math.sin(((o.age ?? T) * 2.2 - i * .18) * TAU)) * s * .1;
    paint(ellPts(i * w * .22, -hop, s * .09, s * .09, 10), { wash: PAL.cream, ink: null });
  }
  pop();
}

// A checkmark that draws itself as k goes 0 → 1. s = its width. painted: true paints it as a flat ribbon instead of an
// ink stroke (for a light check on a dark ground: ink mixes like pigment and turns muddy there).
function checkmark(x, y, s, k = 1, col = TT.green, sw = 2, painted = false) {
  if (k <= 0) return;
  const P = [[-.45, .02], [-.12, .32], [.48, -.36]].map(([a, b]) => [x + a * s, y + b * s]);
  const l1 = Math.hypot(P[1][0] - P[0][0], P[1][1] - P[0][1]), l2 = Math.hypot(P[2][0] - P[1][0], P[2][1] - P[1][1]), d = clamp(k) * (l1 + l2);
  const pts = d <= l1 ? [P[0], [lerp(P[0][0], P[1][0], d / l1), lerp(P[0][1], P[1][1], d / l1)]]
                      : [P[0], P[1], [lerp(P[1][0], P[2][0], (d - l1) / l2), lerp(P[1][1], P[2][1], (d - l1) / l2)]];
  if (d <= 2) return;
  if (painted) paint(ribbon(pts, s * .16, s * .13), { wash: col, ink: null }); else inkLine(pts, sw, col, 'ink', 0);
}

// A paper receipt with a torn zigzag foot and painted (unreadable) lines. s = height in px. o: rot, seed, sw.
function receipt(x, y, s, o = {}) {
  const w = s * .44, h = s, sd = o.seed || 0, sw = o.sw ?? clamp(s / 140, .35, 1);
  push(); translate(x, y); rotate(o.rot || 0);
  const P = [[-w / 2, -h / 2], [w / 2, -h / 2]];
  for (let i = 0; i <= 6; i++) P.push([w / 2 - i * w / 6, h / 2 - (i % 2 ? h * .05 : 0)]);
  paint(P, { wash: TT.paper, ink: PAL.ink, sw });
  for (let i = 0; i < 5; i++) {
    const yy = -h * .34 + i * h * .12, len = .3 + .45 * hash(sd * 7 + i);
    inkLine([[-w * .32, yy], [-w * .32 + w * .64 * len, yy]], sw * .7, TT.line, 'inkfine', 0);
  }
  inkLine([[-w * .32, h * .3], [w * .32, h * .3]], sw * .9, PAL.ink, 'inkfine', 0);   // the total
  pop();
}
// A messy pile of n receipts on the ground point (x, y). Stable from frame to frame (hash), each on its own boil seed.
// pileSpot gives where receipt i of a pile lies ({ x, y, rot }), so a falling receipt can land exactly where it will stay.
function pileSpot(x, y, i, s, seed = 0) {
  const lay = Math.floor(i / 3);
  return { x: x + (hash(seed + i * 3.1) - .5) * s * 1.1 + (i % 3 - 1) * s * .35, y: y - s * .32 - lay * s * .16 - hash(i + 9) * s * .05,
           rot: (hash(seed + i * 5.7) - .5) * 2.2 + Math.PI / 2 * (i % 2) };
}
function receiptPile(x, y, n, s, seed = 0, from = 0) {
  for (let i = from; i < n; i++) { boilSeed(`pile ${seed} ${i}`); const p = pileSpot(x, y, i, s, seed); receipt(p.x, p.y, s, { rot: p.rot, seed: seed + i }); }
}

// The tax form: a sheet with a green header band and four rows, each with a box. s = height in px.
//   o.ticks 0..4: how many rows are ticked (fractional values draw the next tick in progress)
//   o.stamp 0..1: the approval stamp slams down (big, then settles with overshoot)
function taxForm(x, y, s, o = {}) {
  const w = s * .74, sw = o.sw ?? clamp(s / 300, .5, 1.4);
  push(); translate(x, y); rotate(o.rot || 0);
  paint(rectPts(-w / 2, -s / 2, w, s, s * .004), { wash: TT.paper, fill: '#E9E0CC', fillOp: 50, tex: .5, ink: PAL.ink, sw });
  paint(rectPts(-w * .42, -s * .44, w * .84, s * .1, 1), { wash: TT.green, ink: null });
  for (let i = 0; i < 4; i++) {
    const yy = -s * .22 + i * s * .15, bs = s * .08;
    paint(rectPts(-w * .38, yy - bs / 2, bs, bs, 1), { wash: PAL.cream, ink: PAL.ink, sw: sw * .7 });
    for (let j = 0; j < 2; j++) inkLine([[-w * .38 + bs * 1.5, yy - bs * .2 + j * bs * .45], [w * (.36 - .2 * hash(i * 2 + j)), yy - bs * .2 + j * bs * .45]], sw * .6, TT.line, 'inkfine', 0);
    checkmark(-w * .38 + bs * .55, yy - bs * .1, bs * 1.25, clamp((o.ticks || 0) - i), TT.green, sw * 2.2);
  }
  if (o.stamp > 0) stampMark(w * .18, s * .33, s * .17, o.stamp);
  pop();
}
// The approval stamp: a ring with a check, slammed down. k 0..1 (0..0.35 falls in big, then lands and settles).
function stampMark(x, y, r, k = 1) {
  if (k <= 0) return;
  const land = seg(k, 0, .35), sc = land < 1 ? lerp(1.8, 1, easeIn(land)) : 1 + .12 * Math.exp(-(k - .35) * 12) * Math.cos((k - .35) * 40), a = lerp(.3, 1, land);
  push(); translate(x, y); rotate(-.22); scale(sc);
  paint(ellPts(0, 0, r, r, 30, r * .02), { fill: TT.green, fillOp: 70 * a, bleed: .05, tex: .6, ink: null });
  inkLine(through(ellPts(0, 0, r, r, 18).concat([[r, 0.01]])), r / 25, TT.greenDk, 'ink', 0);
  checkmark(0, 0, r * 1.15, 1, TT.greenDk, r / 16);
  pop();
}

// A gold baht coin, r = radius. o.sy 0..1 squashes it (spinning, or edge-on in a stack).
function coin(x, y, r, o = {}) {
  const sy = Math.max(.08, o.sy ?? 1), sw = o.sw ?? clamp(r / 30, .4, 1.2);
  paint(ellPts(x, y, r, r * sy, 24), { wash: TT.gold, fill: TT.goldDk, fillOp: 50, tex: .5, ink: PAL.ink, sw });
  if (sy > .45) {
    push(); translate(x, y); scale(1, sy);
    inkLine(through(ellPts(0, 0, r * .72, r * .72, 14).concat([[r * .72, .01]])), sw * .5, TT.goldDk, 'inkfine', 0);
    // the baht sign: a B with a stroke through it, painted
    inkLine([[0, -r * .5], [0, r * .5]], sw * .8, PAL.ink, 'inkfine', 0);
    inkLine([[-r * .2, -r * .32], [-r * .2, r * .32]], sw * .8, PAL.ink, 'inkfine', 0);
    inkLine([[-r * .2, -r * .32], [r * .12, -r * .32], [r * .22, -r * .16], [r * .1, 0], [-r * .2, 0]], sw * .8, PAL.ink, 'inkfine', .6);
    inkLine([[-r * .2, 0], [r * .16, 0], [r * .27, r * .16], [r * .14, r * .32], [-r * .2, r * .32]], sw * .8, PAL.ink, 'inkfine', .6);
    pop();
  }
}
// n coins stacked edge-on on the ground point (x, y); a fractional n is ignored past its whole part.
function coinStack(x, y, n, r, seed = 0) {
  for (let i = 0; i < Math.floor(n); i++) { boilSeed(`coins ${seed} ${i}`); coin(x + (hash(seed + i) - .5) * r * .25, y - r * .35 - i * r * .32, r, { sy: .32 }); }
}

// A wall calendar with one day circled: the deadline. o.done 0..1 swaps the circle for a green check.
function calendar(x, y, s, o = {}) {
  const w = s * .9, sw = clamp(s / 250, .5, 1.2), cw = w * .16, ch = s * .13;
  paint(rectPts(x - w / 2, y - s / 2, w, s, 1), { wash: TT.paper, ink: PAL.ink, sw });
  paint(rectPts(x - w / 2, y - s / 2, w, s * .2, 1), { wash: TT.red, ink: PAL.ink, sw });
  for (const dx of [-.25, .25]) paint(ellPts(x + dx * w, y - s / 2, s * .03, s * .03, 10), { wash: PAL.ink, ink: null });
  for (let r = 0; r < 4; r++) for (let c = 0; c < 5; c++)
    paint(rectPts(x - w * .42 + c * cw * 1.08, y - s * .22 + r * ch * 1.08, cw * .7, ch * .55), { wash: mixCol(TT.paper, TT.line, .35), ink: null });
  const dx = x - w * .42 + 3 * cw * 1.08 + cw * .35, dy = y - s * .22 + 2 * ch * 1.08 + ch * .27;
  const done = clamp(o.done || 0);
  if (done < 1) inkLine(through(ellPts(dx, dy, cw * .62, ch * .55, 12, 1).concat([[dx + cw * .7, dy - ch * .1]])), sw * 1.4, mixCol(TT.red, TT.green, done), 'ink', 0);
  if (done > 0) checkmark(dx, dy, cw * 1.2, done, TT.green, sw * 2.4);
}

// ---------- the end card ----------
// The TAXTALK logo, painted: "TAX" in green over a blue rounded box with "TALK" in cream. (x, y) is its centre, s the
// letter size in px, k 0..1 pops it in (TAX first, then the box). o.tagline: one short line under it (Thai is fine).
const TT_FONT = s => `900 ${s}px "Kanit", "Arial Black", sans-serif`;
function logoCard(x, y, s, k = 1, o = {}) {
  if (k <= 0) return;
  const k1 = seg(k, 0, .6), k2 = seg(k, .3, 1), bw = s * 2.75, bh = s * 1.12;
  if (k2 > 0) {
    boilSeed('logo box');
    const sc = backOut(k2);
    push(); translate(x, y + s * .62); scale(sc);
    paint(rrPts(-bw / 2, -bh / 2, bw, bh, s * .2, 1.5), { wash: TT.blue, fill: TT.blueDk, fillOp: 40, tex: .5, ink: PAL.ink, sw: clamp(s / 90, .6, 1.6) });
    pop();
    letter('TALK', x, y + s * .66, s * .92 * sc, PAL.cream, { font: TT_FONT(Math.round(s * .92 * sc)), ink: false });
  }
  if (k1 > 0) letter('TAX', x, y - s * .55, s * 1.05, TT.green, { pop: k1, font: TT_FONT(Math.round(s * 1.05)), ink: false });
  if (o.tagline && k > .7) letter(o.tagline, x, y + s * 1.62, s * .3, PAL.ink, { pop: seg(k, .7, 1), font: `500 ${Math.round(s * .3)}px "Kanit", sans-serif`, ink: false, alpha: .85 });
}

// ---------- model sheet: studio.html?loop=taxtalk ----------
(() => {
  const label = (txt, x, y, size = 20) => letter(txt, x, y, size, PAL.ink, { ink: false, alpha: .8 });
  const floor = y => inkLine([[80, y + 6], [W / 2, y + 4], [W - 80, y + 7]], .6, mixCol(PAL.paper, PAL.ink, .35), 'inkfine', .5);
  LOOPS.taxtalk = t => {
    // row 1: the five views
    ['front', 'q', 'side', 'qback', 'back'].forEach((v, i) => { const x = 220 + i * 300; taxtalk(x, 330, 15, { ...feel('happy', t, { seed: i }), view: v }); label(v, x, 366, 22); });
    floor(330);
    // row 2: a few emotions
    ['nervous', 'confused', 'idea', 'determined', 'starstruck', 'proud'].forEach((e, i) => { const x = 200 + i * 304; taxtalk(x, 640, 13, feel(e, t, { seed: i })); label(e, x, 672); });
    floor(640);
    // row 3: props
    const y3 = 930, l = t % 4;
    boilSeed('sheet pile'); receiptPile(150, y3, 7, 70, 3); label('receiptPile', 150, y3 + 34);
    boilSeed('sheet receipt'); receipt(360, y3 - 70, 120, { rot: .15 * Math.sin(t * 2), seed: 2 }); label('receipt', 360, y3 + 34);
    boilSeed('sheet form'); taxForm(580, y3 - 120, 230, { ticks: seg(l, .3, 2.3) * 4, stamp: seg(l, 2.6, 3.4) }); label('taxForm', 580, y3 + 34);
    boilSeed('sheet bubble'); chatBubble(820, y3 - 80, 90, 1, { age: t }); label('chatBubble', 820, y3 + 34);
    boilSeed('sheet bubble2'); chatBubble(1030, y3 - 80, 90, 1, { check: seg(l, .5, 1.2), col: TT.green, tail: 1 }); label('{ check }', 1030, y3 + 34);
    boilSeed('sheet coins'); coinStack(1210, y3, 5, 34, 1); coin(1300, y3 - 70, 34, { sy: Math.abs(Math.cos(t * 5)) }); label('coin / coinStack', 1250, y3 + 34);
    boilSeed('sheet cal'); calendar(1480, y3 - 95, 180, { done: seg(l, 2, 3) }); label('calendar', 1480, y3 + 34);
    boilSeed('sheet logo'); logoCard(1740, y3 - 120, 70, 1); label('logoCard', 1740, y3 + 34);
    floor(y3);
  };
  LOOPS.taxtalk.len = 4;
})();

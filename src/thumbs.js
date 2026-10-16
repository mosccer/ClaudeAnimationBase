// thumbs.js: the demo's thumbnail / cover, as a still loop that lays itself out for the canvas shape (?size=WxH).
// Thumbnails are the one place a big headline belongs: it's the hook that gets the click.
//   node render.mjs --loop=thumb --stills=0.4 --out=out/thumbs/yt                       YouTube (1920×1080, scale to 1280×720)
//   node render.mjs --loop=thumb --size=1080x1920 --stills=0.4 --out=out/thumbs/cover   TikTok / Reels cover (key content in the
//                                                                                       centre 4:5, which the profile grids keep)
//   node render.mjs --loop=thumb --size=1080x1350 --stills=0.4 --out=out/thumbs/feed    IG feed post (4:5)
(() => {
  const HEAD = ['ยื่นภาษี', 'ไม่เป็น?'];   // the hook, two lines
  // positions as fractions of the canvas, sizes in px for that canvas: one layout per shape
  const LAYOUT = {
    wide:  { h1: [.29, .3, 190], h2: [.29, .52, 230], logo: [.29, .77, 92], me: [.72, .84, 50], pile: [.72, .94, 150], bubble: [.91, .3, 170] },
    tall:  { h1: [.5, .225, 170], h2: [.5, .325, 205], logo: [.5, .8, 82], me: [.47, .66, 46], pile: [.5, .72, 140], bubble: [.8, .43, 150] },
    post:  { h1: [.5, .115, 145], h2: [.5, .245, 175], logo: [.5, .915, 72], me: [.46, .735, 46], pile: [.5, .8, 130], bubble: [.83, .43, 135] },
  };
  const headline = (txt, x, y, s, col) => {   // a thick ink outline under a cream one, then the colour: reads at any size
    letter(txt, x, y, s, PAL.ink, { font: TT_FONT(s), stroke: PAL.ink, ink: false, scaleStroke: 2.1 });
    letter(txt, x, y, s, col, { font: TT_FONT(s), stroke: PAL.cream, ink: false });
  };

  LOOPS.thumb = t => {
    const L = H > W * 1.5 ? LAYOUT.tall : H > W ? LAYOUT.post : LAYOUT.wide, P = ([x, y]) => [x * W, y * H], k = Math.min(W, H) / 1080;
    // background: the office wall, a soft brand-green glow behind the mascot, a blue one behind the headline
    boilSeed('thumb bg');
    paint(rectPts(-100, -100, W + 200, H + 200), { wash: TT.wall, ink: null });
    const [mx, my] = P(L.me), [hx, hy] = P(L.h1);
    paint(ellPts(mx, my - 260 * k, 560 * k, 480 * k, 30, 10), { fill: TT.greenLt, fillOp: 110, bleed: .25, tex: .6, ink: null });
    paint(ellPts(hx, hy + 120 * k, 620 * k, 300 * k, 30, 10), { fill: TT.blueLt, fillOp: 70, bleed: .25, tex: .6, ink: null });
    // receipts flying everywhere (stable placement), and a few coins
    for (let i = 0; i < 9; i++) {
      boilSeed('thumb flying ' + i);
      const a = hash(i + 3) * TAU, d = (330 + 170 * hash(i + 7)) * k, rx = mx + Math.cos(a) * d * 1.15, ry = my - 300 * k + Math.sin(a) * d * .8;
      if (H > W && ry < P(L.h2)[1] + L.h2[2] * .7) continue;   // keep the headline clear on vertical covers
      receipt(rx, ry, (80 + 40 * hash(i)) * k, { rot: (hash(i + 11) - .5) * 2.4, seed: i });
    }
    for (let i = 0; i < 3; i++) { if (H > W) break; boilSeed('thumb coin ' + i); coin(mx + (-330 + 330 * i) * k, my - (600 + 90 * (i % 2)) * k, 38 * k, { sy: [1, .55, .85][i] }); }
    // the mascot, in a panic, half buried, with TAXTALK's answer arriving
    taxtalk(mx, my, L.me[2], { ...feel('nervous', t), lookX: .7, lookY: -.6, aL: 1.25, aR: 1.0, squint: 0 });
    const [px, py] = P(L.pile); receiptPile(px, py, 11, L.pile[2], 5);
    const [bx, by] = P(L.bubble); boilSeed('thumb bubble'); chatBubble(bx, by, L.bubble[2], 1, { check: 1, tail: -1, age: 0 });
    glow(bx, by, L.bubble[2] * 1.2, '#FFF6C8', .25);
    // the hook and the brand
    headline(HEAD[0], ...P(L.h1), L.h1[2], PAL.ink);
    headline(HEAD[1], ...P(L.h2), L.h2[2], TT.red);
    logoCard(...P(L.logo), L.logo[2], 1);
  };
  LOOPS.thumb.len = 1;
})();

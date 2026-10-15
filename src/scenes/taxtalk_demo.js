// taxtalk_demo.js: "ภาษีไม่ยากถ้ามีคนคุยด้วย" (taxes are easy with someone to talk to), a 15.5-second TAXTALK example.
// Like demo.js, it's one idea, not a template.
//
// Logline: the mascot wants its taxes done, but drowns in receipts, so it asks TAXTALK, files it all, and gets a refund.
// World: one warm office, wall in pale brand green, a wooden desk; the brand green and blue carry every transition.
// Motif: the chat bubble (it brings the answer in shot A and comes back as the sign-off in shot C).
// Arc: neutral → nervous → confused → surprised → idea → excited | determined → surprised → starstruck → proud | happy
// Shots:
//   A 0–5.0    [iris in]     at the desk, receipts rain onto a pile · the phone buzzes, a blue bubble types, then a check
//      reads: 0.5–1.7 receipts pile up (mascot nervous, sweat) · 1.9–2.6 confused "?" · 2.6–3.0 phone buzzes and glows ·
//             3.05–3.9 bubble pops, typing (mascot's take at 3.2) · 3.9–4.3 the check · 4.0–4.6 idea bulb, then excited
//   B 5.0–12.0 [brush wipe]  four receipts flung from the pile into the form, one tick per row, faster each time ·
//             the stamp slams (shake), the calendar's deadline gets its check · baht coins arc out into a stack ·
//             starstruck, then a proud hop
//      reads: 0.5–3.5 four tosses (0.9, 1.55, 2.2, 2.75) · 3.6–4.3 the stamp · 4.4–5.4 the refund · 5.05 starstruck ·
//             5.6–6.0 hop · 6.2–7.0 iris closes on the mascot
//   C 12.0–15.5 [iris opens on the mascot] the green bubble checks itself (rhyme with A) · the logo pops · hold ·
//             [iris out on the logo]
(() => {
  const room = () => {
    boilSeed('wall');
    paint(rectPts(-400, -400, W + 800, H + 800), { wash: TT.wall, ink: null });
    paint(ellPts(560, 360, 620, 330, 28, 8), { fill: mixCol(TT.wall, TT.greenLt, .5), fillOp: 70, bleed: .25, tex: .6, ink: null });
    paint(ellPts(1500, 200, 520, 260, 28, 8), { fill: mixCol(TT.wall, TT.blueLt, .5), fillOp: 55, bleed: .25, tex: .6, ink: null });
  };
  const poof = (x, y, k, col = TT.greenLt) => { if (k > 0 && k < 1) for (let i = 0; i < 5; i++) { const a = i / 5 * TAU + .4, d = 26 + 46 * easeOut(k); paint(starPts(x + Math.cos(a) * d, y + Math.sin(a) * d, 11 * (1 - k), .3, 4), { wash: col, washOp: 255 * (1 - k * k), ink: null }); } };

  // ---------- shot A: the pile ----------
  const PILE_A = [1010, 785, 120], FALLS = [.55, .85, 1.1, 1.3, 1.45, 1.58], FALL = .55, BASE_A = 5;
  function phone(x, y, t) {
    const buzz = t > 2.6 && t < 3.05 ? Math.sin(t * 90) * 4 : 0, lit = seg(t, 2.6, 2.75);
    boilSeed('phone');
    push(); translate(x + buzz, y); rotate(-.08);
    paint(rrPts(-46, -84, 92, 168, 16, 1), { wash: TT.blueDk, ink: PAL.ink, sw: .9 });
    paint(rrPts(-37, -72, 74, 136, 8, 1), { wash: mixCol('#3B4C66', TT.blueLt, lit), ink: null });
    pop();
    if (lit > 0) glow(x, y - 4, 150 + 30 * Math.sin(t * 6), '#BFE4FF', .45 * lit);
    if (buzz) for (const s of [-1, 1]) inkLine([[x + s * 62, y - 30], [x + s * 74, y], [x + s * 62, y + 30]], .7, PAL.ink, 'inkfine', .6);
  }
  function shotDesk(t, lt, dur) {
    camBegin(kf(t, [[0, 860], [2.75, 900], [3.5, 1000]]), kf(t, [[0, 620], [3.5, 580]]), kf(t, [[0, 1.42], [1.6, 1.34], [2.75, 1.34], [3.5, 1.4]]));
    room();
    boilSeed('calendar'); calendar(420, 430, 190);
    const x = 700, u = 30, gy = 860;
    const mood = emotions(t, [[0, 'neutral', { lookX: .4 }], [.75, 'nervous', { lookX: .7, lookY: -.6 }], [1.95, 'confused', { lookX: .6, lookY: .1 }],
                              [3.2, 'surprised', { lookX: 1, lookY: -.3 }], [3.95, 'idea', { lookX: .9, lookY: -.4 }], [4.5, 'excited', { lookX: .5 }]]);
    taxtalk(x, gy, u, { ...mood, noShadow: true });
    // the desk, in front of the mascot
    boilSeed('desk');
    paint(rectPts(220, 812, 1520, 420, 2), { wash: TT.woodDk, fill: mixCol(TT.woodDk, PAL.ink, .3), fillOp: 70, tex: .6, ink: PAL.ink, sw: 1 });
    paint(rectPts(180, 772, 1600, 44, 2), { wash: TT.wood, fill: TT.woodDk, fillOp: 50, tex: .5, ink: PAL.ink, sw: 1 });
    phone(1330, 700, t);
    // the pile: the base, plus every receipt that has landed
    const [px, py, ps] = PILE_A, landed = FALLS.filter(f => t >= f + FALL).length;
    receiptPile(px, py, BASE_A + landed, ps, 4);
    FALLS.forEach((f, i) => {   // falling receipts flutter down and land exactly on their spot
      const k = seg(t, f, f + FALL); if (k <= 0 || k >= 1) return;
      const p = pileSpot(px, py, BASE_A + i, ps, 4), x0 = p.x + (hash(i + 40) - .5) * 260;
      boilSeed('fall' + i);
      receipt(lerp(x0, p.x, ease(k)) + Math.sin(k * TAU * 1.3 + i) * 50 * (1 - k), lerp(80, p.y, easeIn(k * .85 + .15 * k * k)), ps,
              { rot: lerp(Math.sin(i * 2) * 1.5, p.rot, ease(k)) + Math.sin(k * 9 + i) * .4 * (1 - k), seed: 4 + BASE_A + i });
    });
    boilSeed('bubble A');
    chatBubble(1350, 500, 130, seg(t, 3.05, 3.35), { age: t - 3.05, check: seg(t, 3.9, 4.25), tail: -1 });
    const eye = toScreen(x, gy - 6 * u);
    camEnd();
    if (lt < .5) iris(...eye, lerp(0, 1500, easeIn(lt / .5)));
    boilSeed('transition');
    if (lt > dur - .3) brushWipe((lt - (dur - .3)) / .6, TT_WIPE);
  }

  // ---------- shot B: filing it ----------
  const G = 905, MX = 680, MU = 28, PILE_B = [440, G, 95], FORM = [1330, 520, 560];
  const TOSS = [.9, 1.55, 2.2, 2.75], GRAB = .38, FLY = .5, TSTAMP = 3.6, COIN0 = 4.4, NCOIN = 5, STACK = [930, G], CR = 34;
  const formRow = i => { const s = FORM[2], w = s * .74, bs = s * .08; return [FORM[0] - w * .38 + bs * .55, FORM[1] - s * .22 + i * s * .15]; };
  const stampAt = [FORM[0] + FORM[2] * .74 * .18, FORM[1] + FORM[2] * .33];
  // the left arm: down to grab, up and over to fling, then back to rest
  function armL(lt) {
    for (const ti of TOSS) if (lt > ti - GRAB - .15 && lt < ti + .4) return kf(lt, [[ti - GRAB - .15, .2], [ti - GRAB, -.95], [ti - .1, -.7], [ti, 1.4], [ti + .4, .3]]);
    return .2;
  }
  const lean = lt => TOSS.reduce((s, ti) => s + (lt > ti - GRAB - .15 && lt < ti + .4 ? kf(lt, [[ti - GRAB - .15, 0], [ti - GRAB, -.12], [ti - .1, -.06], [ti, .1], [ti + .4, 0]]) : 0), 0);
  function shotFile(t, lt, dur) {
    const tLand = TSTAMP + .28, sh = lt > tLand ? shakeXY(t, 9 * Math.exp(-(lt - tLand) * 8)) : [0, 0];
    camBegin(1000 + 14 * Math.sin(lt * .7) + sh[0], 600 + sh[1], kf(lt, [[0, 1.12], [3.5, 1.15], [tLand, 1.18], [6.2, 1.2]]));
    room();
    boilSeed('floor');
    paint(rectPts(-400, G - 10, W + 800, 600, 2), { wash: mixCol(TT.wood, PAL.paper, .45), fill: TT.wood, fillOp: 60, tex: .6, ink: null });
    inkLine([[-200, G - 8], [W / 2, G - 12], [W + 200, G - 6]], 1, PAL.ink, 'ink', .5);
    boilSeed('calendar'); calendar(1690, 270, 190, { done: seg(lt, 4.05, 4.4) });
    // the form on its easel
    boilSeed('easel');
    for (const s of [-1, 1]) inkLine([[FORM[0] + s * 120, FORM[1] + 200], [FORM[0] + s * 210, G + 10]], 2.2, TT.woodDk, 'dry', 0);
    const ticks = TOSS.reduce((s, ti) => s + seg(lt, ti + FLY, ti + FLY + .22), 0);
    boilSeed('form'); taxForm(...FORM, { ticks, stamp: seg(lt, TSTAMP, TSTAMP + .8) });
    if (lt > tLand) glow(...stampAt, 200, '#FFF2B8', .5 * Math.exp(-(lt - tLand) * 3));
    // the pile shrinks by one at each grab
    const taken = TOSS.filter(ti => lt >= ti - GRAB).length;
    receiptPile(PILE_B[0], PILE_B[1], 6 - taken, PILE_B[2], 4);
    // coins on the floor
    const landed = Array.from({ length: NCOIN }, (_, i) => COIN0 + i * .12 + .55).filter(l => lt >= l).length;
    coinStack(...STACK, landed, CR, 2);

    const mood = emotions(lt, [[0, 'determined'], [TSTAMP + .35, 'surprised', { lookX: .9, lookY: -.2 }], [5.05, 'starstruck', { lookX: .5, lookY: .5 }], [5.55, 'proud']]);
    let look = {};   // eyes lead: to the pile for each grab, to the form for each throw
    if (lt < TSTAMP) { const ti = TOSS.find(ti => lt < ti + .35); look = ti && lt > ti - GRAB - .2 && lt < ti - .05 ? { lookX: -.9, lookY: .7 } : { lookX: .8, lookY: -.3 }; }
    const hop = jump(lt, 5.6, 6.0, 2.5), hand = lt > TOSS[0] - GRAB && TOSS.some(ti => lt >= ti - GRAB && lt < ti);
    const cl = { ...mood, ...look, aL: lt < TSTAMP ? armL(lt) : mood.aL, rot: lean(lt), dy: (mood.dy || 0) + hop.dy, sq: (mood.sq || 0) + hop.sq,
                 armL: hand ? (u, sw) => receipt(-u * .6, 0, u * 3.6, { rot: 1.4, seed: 99, sw: sw * .7 }) : null };
    taxtalk(MX, G, MU, cl);
    // receipts in flight: from the raised hand to their row, spinning, shrinking, gone in a puff as the tick lands
    TOSS.forEach((ti, i) => {
      const k = seg(lt, ti, ti + FLY), a = 1.4, from = [MX - 4.9 * MU - 2.2 * MU * Math.cos(a), G - 4.5 * MU - 2.2 * MU * Math.sin(a)], to = formRow(i);
      boilSeed('toss' + i);
      if (k > 0 && k < 1) { const p = arcPt(from, to, 260, easeOut(k)); receipt(p[0], p[1], lerp(120, 60, k), { rot: 1.4 + k * TAU * 1.25, seed: 50 + i }); }
      poof(...to, seg(lt, ti + FLY, ti + FLY + .35));
    });
    // the refund: coins burst from the stamp and arc down onto the stack
    for (let i = 0; i < NCOIN; i++) {
      const t0 = COIN0 + i * .12, k = seg(lt, t0, t0 + .55); if (k <= 0 || k >= 1) continue;
      boilSeed('coin' + i);
      const p = arcPt(stampAt, [STACK[0], STACK[1] - CR * .35 - i * CR * .32], 230 + 40 * hash(i), k);
      coin(...p, CR, { sy: Math.abs(Math.cos(k * TAU * 1.5)) });
    }
    const eye = toScreen(MX, G + (cl.dy || 0) * MU - 5 * MU);
    camEnd();
    boilSeed('transition');
    if (lt < .3) brushWipe(.5 + lt / .6, TT_WIPE);
    const tI = 6.2;
    if (lt > tI) iris(...eye, lt < tI + .4 ? lerp(1500, 260, ease(seg(lt, tI, tI + .4))) : lt < dur - .2 ? 260 : lerp(260, 0, easeIn(seg(lt, dur - .2, dur - .02))));
  }

  // ---------- shot C: the sign-off ----------
  function shotLogo(t, lt, dur) {
    camBegin(960, 540, 1 + .015 * lt);
    room();
    boilSeed('floor');
    paint(rectPts(-400, G - 10, W + 800, 600, 2), { wash: mixCol(TT.wood, PAL.paper, .45), fill: TT.wood, fillOp: 60, tex: .6, ink: null });
    inkLine([[-200, G - 8], [W / 2, G - 12], [W + 200, G - 6]], 1, PAL.ink, 'ink', .5);
    const x = 600, u = 32, wave = ease(seg(lt, .5, .75));
    const cl = { ...feel('happy', t), ...move('bounce', t) };
    cl.aR = lerp(cl.aR ?? .2, 1.1 + .4 * Math.sin(lt * 12), wave);   // waves at the viewer with the bubble's arm
    taxtalk(x, G, u, cl);
    boilSeed('bubble C');
    chatBubble(880, 520, 130, seg(lt, .35, .7), { col: TT.green, check: seg(lt, .75, 1.1), tail: -1 });
    logoCard(1360, 470, 170, seg(lt, 1.0, 1.5));
    const eye = toScreen(x, G - 5 * u);
    camEnd();
    flushLetters();   // so the iris covers the logo
    if (lt < .45) iris(...eye, lerp(0, 1500, easeIn(lt / .45)));
    if (lt > dur - .6) iris(1360, 520, lerp(1400, 0, easeIn(seg(lt, dur - .6, dur - .05))));
  }

  shots([[0, shotDesk], [5, shotFile], [12, shotLogo]]);
})();

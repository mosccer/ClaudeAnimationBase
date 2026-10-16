# TAXTALK Animation Base

ชุดเริ่มต้นสำหรับทำแอนิเมชันลายมือวาดสีน้ำของแบรนด์ **TAXTALK** ด้วย p5.js + p5.brush และ Claude ต่อยอดมาจาก Claude Animation Base (ส่วนต้นฉบับอยู่ด้านล่าง)

**มีอะไรเพิ่มมา**
- **น้องแท็กทอล์ค** มาสคอตของแบรนด์ (`taxtalk(x, y, u, options)`): ตัวสีเขียวกับแถบและขาสีน้ำเงินแบบโลโก้ มีป้ายแชตเล็ก ๆ ที่พุง ใช้ท่าทาง อารมณ์ 31 แบบ การหัน และหมวกได้ครบเหมือน Clawd
- **พร็อพเรื่องภาษี** (วาดด้วยพู่กันทั้งหมด ไม่มีตัวหนังสือ): ใบเสร็จ (`receipt`, `receiptPile`), แบบฟอร์มภาษีที่ติ๊กได้ทีละช่อง และตราประทับอนุมัติ (`taxForm`, `stampMark`), เหรียญบาท (`coin`, `coinStack`), บับเบิลแชตที่พิมพ์อยู่หรือขึ้นเครื่องหมายถูก (`chatBubble`), ปฏิทินวันครบกำหนด (`calendar`)
- **ชุดสีแบรนด์** `TT` และสีของทรานซิชัน `TT_WIPE` (เขียว/น้ำเงิน)
- **การ์ดโลโก้ตอนจบ** `logoCard()` ใช้ฟอนต์ Kanit ใส่ tagline ภาษาไทยได้
- **วิดีโอตัวอย่าง** [src/scenes/taxtalk_demo.js](src/scenes/taxtalk_demo.js) ยาว 15.5 วินาที: ใบเสร็จท่วมโต๊ะ → TAXTALK ตอบแชต → ยื่นแบบเสร็จ ได้เงินคืน → โลโก้
- **ชีตอ้างอิง** เปิด `studio.html?loop=taxtalk`
- **เพลงประกอบและเสียงเอฟเฟกต์** [tools/sound.mjs](tools/sound.mjs): เพลงแนวไวรัล 112 BPM สังเคราะห์ด้วยโค้ดทั้งหมด (ไม่มีปัญหาลิขสิทธิ์) ดรอปตรงจังหวะหลังทรานซิชัน และมีเสียงเอฟเฟกต์ตรงทุกเหตุการณ์ในคลิป เช่น ใบเสร็จตก โทรศัพท์สั่น ติ๊กถูก ตราประทับ และเหรียญ ถ้าแก้เวลาในฉาก ให้แก้รายการ `SFX` ให้ตรงกัน แล้วสั่ง `npm run sound`

## เริ่มใช้งาน

ต้องมี Node.js, Google Chrome และ ffmpeg

```bash
npm install
npm run taxtalk
```

ได้ไฟล์ `out/taxtalk.mp4` ถ้าจะเลื่อนดูทีละเฟรม ให้เปิด [studio.html](studio.html) ใน Chrome

ทำวิดีโอใหม่โดยสั่ง Claude แบบนี้:

> อ่าน ANIMATION_GUIDE.md แล้วทำวิดีโอ 15 วินาที ให้น้องแท็กทอล์คสอนวิธีลดหย่อนภาษีด้วยการเก็บใบเสร็จ

| ไฟล์ | คืออะไร |
|---|---|
| [src/taxtalk.js](src/taxtalk.js) | ชุดสีแบรนด์ มาสคอต พร็อพ การ์ดโลโก้ และชีต `?loop=taxtalk` |
| [src/scenes/taxtalk_demo.js](src/scenes/taxtalk_demo.js) | วิดีโอตัวอย่างของ TAXTALK พร้อมสตอรีบอร์ดในคอมเมนต์ |
| [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) | กฎและ API ทั้งหมด (ส่วน TAXTALK อยู่ท้ายไฟล์) |

---

# Claude Animation Base

This is a small starter kit with code, instructions and assets for animating a character in [p5.js](https://p5js.org) and [p5.brush](https://github.com/acamposuribe/p5.brush) with Claude Opus 5.5. It's based on the code from the music video [I'm Upping My P(doom)](https://github.com/JohnHeibel/PDoomVideo) and an analysis of what the model did and didn't do well. I highly recommend playing around with your prompting: make it give you the storyboard before coding, give it very broad instructions, try being very specific, ask for subagents, and try a bunch of other fun ways of testing the model's capabilities. In my testing, it can do a lot with very little, but it's also quite accurate when you give it more requirements. Also try asking the model to swap out the character or make new emotions or costumes, give it your own reference images, and try many other fun things like that. I've found that the reasoning level corresponds to how "extravagant" and detail-oriented the model makes the scene. All test videos were generated with Opus 5.5 on xhigh reasoning in Claude Code.

![Clawd's emotions, animated](docs/emotions.webp)

## Make a video

Clone it, open it in Claude Code (or any coding agent) and ask for what you want:

> Read ANIMATION_GUIDE.md, then make a 15-second video of Clawd trying to catch a butterfly.

The model storyboards first, builds shot by shot, renders contact sheets to check its own work, and writes `out/video.mp4`. [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) holds the rules it follows: handmade, alive, one piece, no text, transitions always, something happens in every scene, and a solid medium of brush strokes, flat 2D and boiling linework. It also covers timing for the viewer and the core principles of character animation.

## Run it yourself

You need Node.js, Google Chrome and ffmpeg.

Without a dedicated GPU, p5.brush's watercolour fills make render times fairly slow, measured in seconds per frame. If you're running on integrated graphics, I recommend asking the model to avoid those fills and replace them with something else appropriate. (I love the look of the watercolours, though.)

```bash
npm install
node render.mjs --clip --out=out/video.mp4
```

That renders the 11-second demo in [src/scenes/demo.js](src/scenes/demo.js). Open [studio.html](studio.html) in Chrome to scrub through it. Add `?loop=emotions` or `?loop=views` to see the model sheets. If Chrome isn't in a standard location, pass `--chrome=<path>` or set `CHROME_PATH`.

On Linux, `render.mjs` starts Chrome with `--no-sandbox` (Ubuntu 23.10+ blocks Chrome's sandbox in headless use) and also finds a Chromium installed by Playwright. With no GPU at all, add `--soft-gl` to render WebGL in software: slow on watercolour fills, but it works. On a headless Linux machine with an NVIDIA GPU (a cloud or cluster node), add `--gpu-angle=gl-egl` (or `vulkan`); `node gpu_probe.mjs <chrome path>` shows which renderer each set of flags gets.

## What's here

| path | what it is |
|---|---|
| [ANIMATION_GUIDE.md](ANIMATION_GUIDE.md) | The rules, the workflow and the full API. Read it first. |
| [src/clawd.js](src/clawd.js) | Clawd: views, emotions, eyes, mouths, hats, emotes, dances |
| [src/core.js](src/core.js) | Painting, timing, motion helpers, camera, light, paper |
| [src/timeline.js](src/timeline.js) | Shots, loops and the brush-wipe transition |
| [src/config.js](src/config.js) | Length and tempo |
| [src/scenes/](src/scenes/) | Your video goes here (the demo is an example) |
| [render.mjs](render.mjs) | Headless renderer: contact sheets, frame strips, crops, stills, MP4 |
| [docs/](docs/) | Model sheets: [emotions](docs/emotions.jpg) (also [animated](docs/emotions.webp)) and [views, motion and hats](docs/views.jpg) |

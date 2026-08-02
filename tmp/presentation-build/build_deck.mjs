import fs from "node:fs/promises";
import path from "node:path";
import { Presentation, PresentationFile } from "@oai/artifact-tool";

const ROOT = "C:/Users/mohit/Documents/hda/Assignment/AVRD-E4 Agentic AI/Jamaa-Next-Door";
const TMP = path.join(ROOT, "tmp/presentation-build");
const ASSETS = path.join(TMP, "assets");
const OUTPUT = path.join(ROOT, "output/presentation");
const FINAL = path.join(OUTPUT, "jamaa-next-door-project-presentation.pptx");
const W = 1280;
const H = 720;

const C = {
  teal: "#063E4D",
  teal2: "#0B4B58",
  dark: "#102F33",
  off: "#F7F5F2",
  paper: "#EEE9DF",
  gold: "#E7C48D",
  sage: "#89A98F",
  muted: "#AEB7B8",
  ink: "#16363B",
  danger: "#C8766B",
  white: "#FFFFFF",
};

const FONT_HEAD = "Georgia";
const FONT_BODY = "Aptos";

async function bytes(file) {
  const b = await fs.readFile(file);
  return b.buffer.slice(b.byteOffset, b.byteOffset + b.byteLength);
}

function shape(slide, geometry, position, fill = "none", line = { style: "solid", fill: "none", width: 0 }, name) {
  return slide.shapes.add({ geometry, position, fill, line, name });
}

function text(slide, value, position, opts = {}) {
  const s = shape(slide, "textbox", position, "none", { style: "solid", fill: "none", width: 0 }, opts.name);
  s.text = value;
  s.text.style = {
    fontSize: opts.fontSize ?? 20,
    bold: opts.bold ?? false,
    italic: opts.italic ?? false,
    color: opts.color ?? C.ink,
    typeface: opts.typeface ?? FONT_BODY,
    alignment: opts.alignment ?? "left",
    verticalAlignment: opts.verticalAlignment ?? "top",
    lineSpacing: opts.lineSpacing ?? 1.02,
    autoFit: opts.autoFit ?? "shrinkText",
    insets: opts.insets ?? { top: 0, right: 0, bottom: 0, left: 0 },
  };
  return s;
}

function rect(slide, position, fill, radius = 0, lineFill = "none", lineWidth = 0, name) {
  const s = shape(slide, radius ? "roundRect" : "rect", position, fill, {
    style: "solid",
    fill: lineFill,
    width: lineWidth,
  }, name);
  if (radius) s.borderRadius = radius;
  return s;
}

function line(slide, left, top, width, height, color = C.gold, weight = 2) {
  const position = {
    left: width < 0 ? left + width : left,
    top: height < 0 ? top + height : top,
    width: Math.abs(width),
    height: Math.abs(height),
    horizontalFlip: width < 0,
    verticalFlip: height < 0,
  };
  return shape(slide, "line", position, "none", { style: "solid", fill: color, width: weight });
}

async function image(slide, file, position, opts = {}) {
  return slide.images.add({
    blob: await bytes(file),
    contentType: opts.contentType ?? (file.toLowerCase().endsWith(".jpeg") || file.toLowerCase().endsWith(".jpg") ? "image/jpeg" : "image/png"),
    alt: opts.alt ?? path.basename(file),
    fit: opts.fit ?? "cover",
    position,
    ...(opts.crop ? { crop: opts.crop } : {}),
    ...(opts.geometry ? { geometry: opts.geometry } : {}),
    ...(opts.borderRadius ? { borderRadius: opts.borderRadius } : {}),
  });
}

function title(slide, number, value, dark = false, size = 42) {
  text(slide, String(number).padStart(2, "0"), { left: 58, top: 34, width: 52, height: 30 }, {
    fontSize: 17, bold: true, color: C.gold, typeface: FONT_BODY,
  });
  line(slide, 116, 47, 54, 0, dark ? C.sage : C.gold, 2);
  text(slide, value, { left: 188, top: 26, width: 1034, height: 72 }, {
    fontSize: size, bold: true, color: dark ? C.off : C.ink, typeface: FONT_HEAD,
  });
}

function footer(slide, number, dark = false) {
  text(slide, "JAMAA NEXT DOOR", { left: 58, top: 686, width: 190, height: 18 }, {
    fontSize: 11, bold: true, color: dark ? C.muted : "#6A7C7F",
  });
  text(slide, String(number).padStart(2, "0"), { left: 1182, top: 684, width: 42, height: 20 }, {
    fontSize: 12, bold: true, color: C.gold, alignment: "right",
  });
}

function notes(slide, body, sources = []) {
  const sourceBlock = sources.length ? `\n\n[Sources]\n${sources.map((s) => `- ${s}`).join("\n")}` : "";
  slide.speakerNotes.textFrame.setText(`${body}${sourceBlock}`);
}

function dot(slide, x, y, r, fill) {
  return shape(slide, "ellipse", { left: x - r, top: y - r, width: r * 2, height: r * 2 }, fill, { style: "solid", fill: "none", width: 0 });
}

function bullet(slide, value, x, y, width, color = C.ink, dotColor = C.gold, fontSize = 20) {
  dot(slide, x + 5, y + 12, 4, dotColor);
  text(slide, value, { left: x + 20, top: y, width, height: 52 }, { fontSize, color, lineSpacing: 1.02 });
}

function phoneFrame(slide, x, y, w, h, screen = "home") {
  rect(slide, { left: x, top: y, width: w, height: h }, C.dark, 30, C.gold, 2);
  rect(slide, { left: x + 10, top: y + 12, width: w - 20, height: h - 24 }, C.teal, 23, "#FFFFFF/16", 1);
  rect(slide, { left: x + w * 0.36, top: y + 8, width: w * 0.28, height: 7 }, C.dark, 4);
  if (screen === "home") drawHomeScreen(slide, x + 16, y + 28, w - 32, h - 48);
  if (screen === "details") drawDetailsScreen(slide, x + 16, y + 28, w - 32, h - 48);
  if (screen === "review") drawReviewScreen(slide, x + 16, y + 28, w - 32, h - 48);
}

function drawHomeScreen(slide, x, y, w, h) {
  text(slide, "Frankfurt am Main", { left: x, top: y + 4, width: w, height: 24 }, { fontSize: 13, bold: true, color: C.off, alignment: "center" });
  rect(slide, { left: x + 8, top: y + 38, width: w - 16, height: 86 }, "#FFFFFF/12", 18, "#FFFFFF/18", 1);
  text(slide, "Nearby prayer", { left: x + 20, top: y + 49, width: w - 40, height: 18 }, { fontSize: 10, color: C.muted });
  text(slide, "Jama'ah", { left: x + 20, top: y + 69, width: w - 40, height: 30 }, { fontSize: 22, bold: true, color: C.off });
  text(slide, "Approximate locations remain private.", { left: x + 20, top: y + 101, width: w - 40, height: 17 }, { fontSize: 9, color: C.muted });
  text(slide, "Upcoming Jama'ahs", { left: x + 8, top: y + 140, width: w - 16, height: 30 }, { fontSize: 21, bold: true, color: C.off });
  const rows = [
    ["Dhuhr", "12:45", "3 joined"],
    ["Asr", "16:30", "1 joined"],
  ];
  rows.forEach((row, i) => {
    const yy = y + 181 + i * 62;
    rect(slide, { left: x + 8, top: yy, width: w - 16, height: 52 }, "#FFFFFF/05", 14, "#FFFFFF/18", 1);
    text(slide, row[0], { left: x + 20, top: yy + 8, width: 80, height: 20 }, { fontSize: 14, bold: true, color: C.off });
    text(slide, row[1], { left: x + 20, top: yy + 29, width: 80, height: 14 }, { fontSize: 9, color: C.muted });
    text(slide, row[2], { left: x + w - 94, top: yy + 18, width: 70, height: 18 }, { fontSize: 10, bold: true, color: C.gold, alignment: "right" });
  });
  const cy = y + h - 64;
  shape(slide, "ellipse", { left: x + w / 2 - 38, top: cy - 38, width: 76, height: 76 }, C.off, { style: "solid", fill: "none", width: 0 });
  text(slide, "Start\nJama'ah", { left: x + w / 2 - 30, top: cy - 20, width: 60, height: 44 }, { fontSize: 13, bold: true, color: C.dark, alignment: "center", verticalAlignment: "middle" });
}

function drawDetailsScreen(slide, x, y, w, h) {
  rect(slide, { left: x + 8, top: y + 20, width: w - 16, height: 130 }, "#FFFFFF/08", 18);
  text(slide, "Upcoming Jama'ahs", { left: x + 18, top: y + 38, width: w - 36, height: 28 }, { fontSize: 18, bold: true, color: C.off });
  rect(slide, { left: x + 8, top: y + 118, width: w - 16, height: h - 126 }, C.dark, 22, "#FFFFFF/18", 1);
  rect(slide, { left: x + w / 2 - 24, top: y + 128, width: 48, height: 4 }, C.muted, 2);
  text(slide, "Dhuhr Jama'ah", { left: x + 25, top: y + 150, width: w - 50, height: 30 }, { fontSize: 19, bold: true, color: C.off });
  text(slide, "00:11:42", { left: x + 25, top: y + 186, width: w - 50, height: 34 }, { fontSize: 26, bold: true, color: C.gold });
  text(slide, "Starts\n12:45 today\n\nApproximate area\nFrankfurt-Bockenheim\n\nParticipants\n3", { left: x + 25, top: y + 232, width: w - 50, height: 156 }, { fontSize: 11, color: C.off, lineSpacing: 1.12 });
  const buttons = [["Leave Jama'ah", C.teal2], ["Share Jama'ah", C.teal2], ["Close", C.teal2]];
  buttons.forEach((b, i) => {
    rect(slide, { left: x + 24, top: y + h - 126 + i * 36, width: w - 48, height: 28 }, b[1], 10, "#FFFFFF/18", 1);
    text(slide, b[0], { left: x + 30, top: y + h - 121 + i * 36, width: w - 60, height: 18 }, { fontSize: 10, bold: true, color: C.off, alignment: "center" });
  });
}

function drawReviewScreen(slide, x, y, w, h) {
  text(slide, "Review Jama'ah", { left: x + 12, top: y + 12, width: w - 24, height: 30 }, { fontSize: 21, bold: true, color: C.off });
  rect(slide, { left: x + 10, top: y + 56, width: w - 20, height: 238 }, "#FFFFFF/08", 18, "#FFFFFF/16", 1);
  text(slide, "PRAYER\nDhuhr\n\nSTARTS\n12:45 today\n\nLOCATION\nFrankfurt-Bockenheim\n\nPHOTO\nLocation image attached", { left: x + 28, top: y + 72, width: w - 56, height: 204 }, { fontSize: 12, color: C.off, lineSpacing: 1.08 });
  rect(slide, { left: x + 18, top: y + h - 100, width: w - 36, height: 42 }, C.gold, 13);
  text(slide, "Confirm Jama'ah", { left: x + 28, top: y + h - 89, width: w - 56, height: 22 }, { fontSize: 14, bold: true, color: C.dark, alignment: "center" });
  text(slide, "Edit", { left: x + 18, top: y + h - 46, width: w - 36, height: 20 }, { fontSize: 11, bold: true, color: C.off, alignment: "center" });
}

async function build() {
  await fs.mkdir(OUTPUT, { recursive: true });
  await fs.mkdir(path.join(TMP, "rendered"), { recursive: true });
  const p = Presentation.create({ slideSize: { width: W, height: H } });
  p.theme.colorScheme = {
    name: "Jamaa Next Door",
    themeColors: { accent1: C.teal, accent2: C.gold, accent3: C.sage, accent4: C.teal2, accent5: C.danger, accent6: C.muted, bg1: C.off, bg2: C.paper, tx1: C.ink, tx2: "#5F7377", dk1: C.dark, dk2: C.teal, lt1: C.white, lt2: C.off, hlink: C.gold, folHlink: C.sage },
  };

  // 1 - Cover
  {
    const s = p.slides.add();
    await image(s, path.join(ROOT, "output/documentation/cover-variations/jnd-cover-05-atmospheric-arch-portfolio.png"), { left: 0, top: 0, width: W, height: H }, { fit: "cover", alt: "Atmospheric arch portfolio cover artwork" });
    rect(s, { left: 0, top: 0, width: W, height: H }, "#063E4D/D8");
    rect(s, { left: 790, top: 70, width: 360, height: 570 }, "none", 180, C.gold, 3);
    dot(s, 970, 350, 9, C.sage);
    line(s, 92, 96, 0, 492, C.gold, 3);
    text(s, "Jamaa Next Door", { left: 126, top: 108, width: 720, height: 92 }, { fontSize: 64, bold: true, color: C.off, typeface: FONT_HEAD });
    text(s, "A platform to unify Muslims", { left: 132, top: 214, width: 610, height: 42 }, { fontSize: 28, color: C.gold, typeface: FONT_HEAD });
    text(s, "PROJECT PRESENTATION", { left: 132, top: 310, width: 360, height: 28 }, { fontSize: 16, bold: true, color: C.sage });
    text(s, "Mohitur Rahman Zidan", { left: 132, top: 350, width: 540, height: 52 }, { fontSize: 34, bold: true, color: C.off, typeface: FONT_HEAD });
    text(s, "Augmented and Virtual Reality Design\nExperimental XR Interactions & Interfaces\nSummer Semester - 2026\nTutored by David Bachmann", { left: 132, top: 518, width: 560, height: 110 }, { fontSize: 18, color: C.off, lineSpacing: 1.12 });
    notes(s, "Open with the project name and mission. Establish that the presentation will connect a personal need to a working, responsibly designed Android prototype.", ["Project portfolio cover artwork: output/documentation/cover-variations/jnd-cover-05-atmospheric-arch-portfolio.png", "Project metadata supplied by Mohitur Rahman Zidan."]);
  }

  // 2 - Personal motivation
  {
    const s = p.slides.add();
    await image(s, path.join(OUTPUT, "assets/motivation-neighborhood.png"), { left: 0, top: 0, width: W, height: H }, { alt: "Editorial neighborhood illustration generated for the presentation" });
    rect(s, { left: 0, top: 0, width: 685, height: H }, "#063E4D/E8");
    title(s, 2, "The idea began with religious isolation", true, 42);
    text(s, "For two months, I lived in Germany without a mosque nearby.", { left: 82, top: 160, width: 520, height: 94 }, { fontSize: 31, bold: true, color: C.off, typeface: FONT_HEAD, lineSpacing: 1.03 });
    text(s, "Muslims lived around me, but there was no simple way to find each other for congregational prayer.", { left: 82, top: 286, width: 500, height: 92 }, { fontSize: 22, color: C.off, lineSpacing: 1.08 });
    line(s, 82, 420, 480, 0, C.gold, 2);
    text(s, "Could nearby Muslims coordinate safely when the mosque is inaccessible or its Jama'ah has already passed?", { left: 82, top: 446, width: 500, height: 112 }, { fontSize: 24, bold: true, color: C.gold, typeface: FONT_HEAD, lineSpacing: 1.05 });
    footer(s, 2, true);
    notes(s, "Explain the two-month experience and why the absence of coordination felt painful despite Muslims living nearby. Use the final question to transition from personal experience to a design problem.", ["Personal account supplied by Mohitur Rahman Zidan.", "AI-generated editorial illustration created for this presentation; no identifiable persons depicted."]);
  }

  // 3 - Problem
  {
    const s = p.slides.add(); s.background.fill = C.off;
    title(s, 3, "The gap is coordination, not always the absence of people", false, 40);
    const cx = 640, cy = 352;
    const points = [[280, 205], [1000, 205], [280, 505], [1000, 505]];
    points.forEach(([x, y]) => line(s, cx, cy, x - cx, y - cy, C.gold, 2));
    shape(s, "ellipse", { left: cx - 110, top: cy - 110, width: 220, height: 220 }, C.teal, { style: "solid", fill: C.gold, width: 2 });
    text(s, "Missing\nJama'ah", { left: cx - 88, top: cy - 48, width: 176, height: 100 }, { fontSize: 34, bold: true, color: C.off, typeface: FONT_HEAD, alignment: "center", verticalAlignment: "middle" });
    const barriers = [
      ["ACCESS", "No nearby mosque or religious center", 95, 144],
      ["TIMING", "Work, classes, meetings or travel", 890, 144],
      ["AWARENESS", "Muslims may be nearby but disconnected", 95, 478],
      ["TRUST", "Location and identity cannot be exposed carelessly", 890, 478],
    ];
    barriers.forEach(([h, b, x, y], i) => {
      text(s, h, { left: x, top: y, width: 290, height: 24 }, { fontSize: 17, bold: true, color: i === 3 ? C.danger : C.teal });
      text(s, b, { left: x, top: y + 34, width: 300, height: 70 }, { fontSize: 21, color: C.ink, lineSpacing: 1.04 });
    });
    text(s, "Worker   /   Student   /   Traveler   /   New arrival   /   Local host", { left: 185, top: 621, width: 910, height: 30 }, { fontSize: 20, bold: true, color: C.teal, alignment: "center" });
    footer(s, 3);
    notes(s, "Frame the problem as a coordination gap shaped by four constraints. The five situations show that the need is broader than one demographic or routine.", ["Problem framing derived from the project portfolio and user-provided motivation."]);
  }

  // 4 - Product journey
  {
    const s = p.slides.add(); s.background.fill = C.teal;
    title(s, 4, "The prototype turns the need into a time-bounded journey", true, 40);
    text(s, "One central flow carries the user from trust-building access to a gathering that ends at its scheduled time.", { left: 122, top: 105, width: 1036, height: 38 }, { fontSize: 21, color: C.muted, alignment: "center" });
    await image(s, path.join(ASSETS, "product-flow.png"), { left: 100, top: 170, width: 1080, height: 462 }, { fit: "contain", alt: "Product flow extracted from the project portfolio" });
    rect(s, { left: 455, top: 202, width: 212, height: 312 }, "none", 20, C.gold, 4);
    text(s, "REVIEW + CONFIRM", { left: 450, top: 536, width: 220, height: 24 }, { fontSize: 14, bold: true, color: C.gold, alignment: "center" });
    line(s, 902, 572, 170, 0, C.gold, 3);
    text(s, "AUTOMATIC END", { left: 900, top: 584, width: 176, height: 22 }, { fontSize: 14, bold: true, color: C.gold, alignment: "center" });
    footer(s, 4, true);
    notes(s, "Walk through the journey at a high level before discussing individual UX and technical decisions. Emphasize review before publication and automatic ending as deliberate safeguards.", ["Project portfolio, page 19: product-flow graphic."]);
  }

  // 5 - Reference interactions
  {
    const s = p.slides.add(); s.background.fill = C.off;
    title(s, 5, "Reference interactions clarified the missing transitions", false, 35);
    text(s, "REFERENCE APPLICATION INTERACTION STUDY", { left: 72, top: 112, width: 500, height: 24 }, { fontSize: 15, bold: true, color: C.teal });
    line(s, 72, 145, 1136, 0, C.gold, 2);
    const labels = ["Home action", "Creation form", "Published nearby item", "Contextual details"];
    for (let i = 0; i < 4; i++) {
      const x = 78 + i * 226;
      await image(s, path.join(ASSETS, `reference-phone-${i + 1}.jpeg`), { left: x, top: 168, width: 170, height: 354 }, { fit: "contain", alt: `${labels[i]} reference application screenshot` });
      text(s, labels[i], { left: x - 8, top: 532, width: 186, height: 26 }, { fontSize: 15, bold: true, color: C.ink, alignment: "center" });
      if (i < 3) {
        line(s, x + 176, 342, 42, 0, C.gold, 3);
        shape(s, "rightArrow", { left: x + 202, top: 334, width: 22, height: 16 }, C.gold, { style: "solid", fill: "none", width: 0 });
      }
    }
    line(s, 988, 164, 0, 430, C.sage, 2);
    text(s, "ADAPTED FOR JAMAA NEXT DOOR", { left: 1018, top: 170, width: 200, height: 48 }, { fontSize: 17, bold: true, color: C.teal });
    ["Review before publication", "Time-sorted discovery", "Bottom-sheet details", "Role-based actions", "Privacy-controlled location"].forEach((v, i) => bullet(s, v, 1018, 238 + i * 62, 188, C.ink, C.gold, 17));
    footer(s, 5);
    notes(s, "Make clear that these screens belong to a reference application. Explain that observing the transitions helped identify what the Jamaa Next Door flow still needed, while the final behavior was adapted for privacy and role-based participation.", ["Research/App Interface and Interaction.pdf. Reference application screenshots are visibly labeled and are not Jamaa Next Door screens."]);
  }

  // 6 - Visual evolution
  {
    const s = p.slides.add(); s.background.fill = C.paper;
    title(s, 6, "The visual language moved toward calm, human trust", false, 35);
    text(s, "EARLY", { left: 165, top: 112, width: 140, height: 24 }, { fontSize: 16, bold: true, color: C.teal, alignment: "center" });
    text(s, "CURRENT", { left: 587, top: 112, width: 160, height: 24 }, { fontSize: 16, bold: true, color: C.teal, alignment: "center" });
    await image(s, path.join(ROOT, "Research/Figma Home interface.png"), { left: 150, top: 148, width: 184, height: 398 }, { fit: "contain", geometry: "roundRect", borderRadius: 25, alt: "Early Figma home interface" });
    line(s, 378, 347, 118, 0, C.gold, 3);
    shape(s, "rightArrow", { left: 482, top: 338, width: 28, height: 18 }, C.gold, { style: "solid", fill: "none", width: 0 });
    phoneFrame(s, 565, 148, 210, 398, "home");
    text(s, "Prayer and countdown remained priorities. The hierarchy became quieter, the language more explicit, and privacy more visible.", { left: 834, top: 156, width: 350, height: 124 }, { fontSize: 23, color: C.ink, typeface: FONT_HEAD, lineSpacing: 1.06 });
    ["Human, not generic", "Calm, not technical", "Specific, not decorative", "Trust visible in language"].forEach((v, i) => bullet(s, v, 850, 320 + i * 52, 320, C.ink, C.gold, 19));
    const palette = [C.teal, C.off, C.gold, C.sage];
    palette.forEach((fill, i) => rect(s, { left: 150 + i * 156, top: 590, width: 142, height: 24 }, fill, 0, i === 1 ? "#CFC8BC" : "none", i === 1 ? 1 : 0));
    text(s, "Current prototype reconstruction based on implemented UI", { left: 520, top: 555, width: 300, height: 20 }, { fontSize: 11, color: "#6A7C7F", alignment: "center" });
    footer(s, 6);
    notes(s, "Contrast the early Figma screen with the current implemented hierarchy. Acknowledge the teacher's request for a more human, authentic visual identity and show how language, spacing and trust cues were refined.", ["Research/Figma Home interface.png.", "Current prototype reconstruction based on apps/mobile/app/(tabs)/jamaahs.tsx and apps/mobile/src/theme/tokens.ts."]);
  }

  // 7 - Privacy
  {
    const s = p.slides.add();
    await image(s, path.join(OUTPUT, "assets/privacy-proximity.png"), { left: 0, top: 0, width: W, height: H }, { alt: "Abstract privacy and proximity illustration generated for the presentation" });
    rect(s, { left: 0, top: 0, width: 592, height: H }, "#063E4D/E8");
    title(s, 7, "Location makes privacy part of the product architecture", true, 35);
    text(s, "PUBLIC DISCOVERY", { left: 76, top: 154, width: 230, height: 26 }, { fontSize: 17, bold: true, color: C.gold });
    ["Prayer and start time", "Approximate area", "Participant count"].forEach((v, i) => bullet(s, v, 76, 195 + i * 48, 400, C.off, C.sage, 20));
    text(s, "PROTECTED ACCESS", { left: 76, top: 360, width: 230, height: 26 }, { fontSize: 17, bold: true, color: C.gold });
    ["Exact address", "Location image", "Participant-only information"].forEach((v, i) => bullet(s, v, 76, 401 + i * 48, 410, C.off, C.sage, 20));
    text(s, "BACKEND ENFORCEMENT", { left: 76, top: 566, width: 245, height: 24 }, { fontSize: 16, bold: true, color: C.gold });
    text(s, "Private Storage  /  RLS  /  authenticated functions  /  reports, blocks and deletion", { left: 76, top: 598, width: 450, height: 48 }, { fontSize: 16, color: C.off });
    shape(s, "ellipse", { left: 770, top: 162, width: 364, height: 364 }, "#FFFFFF/04", { style: "solid", fill: C.sage, width: 3 });
    shape(s, "ellipse", { left: 850, top: 242, width: 204, height: 204 }, "#E7C48D/12", { style: "solid", fill: C.gold, width: 3 });
    text(s, "APPROXIMATE\nPUBLIC ZONE", { left: 800, top: 185, width: 300, height: 58 }, { fontSize: 18, bold: true, color: C.off, alignment: "center" });
    text(s, "EXACT\nPARTICIPANT ZONE", { left: 875, top: 304, width: 154, height: 70 }, { fontSize: 18, bold: true, color: C.gold, alignment: "center", verticalAlignment: "middle" });
    footer(s, 7, true);
    notes(s, "Present privacy as functionality: discovery is useful without revealing exact meeting data, and protected fields are controlled server-side rather than merely hidden in the interface.", ["Project portfolio privacy model and implemented Supabase policies.", "AI-generated abstract privacy/proximity background created for this presentation."]);
  }

  // 8 - Architecture
  {
    const s = p.slides.add(); s.background.fill = C.off;
    title(s, 8, "A standalone APK connects focused mobile layers to Supabase", false, 38);
    await image(s, path.join(ASSETS, "architecture-diagram.png"), { left: 100, top: 120, width: 1080, height: 392 }, { fit: "contain", alt: "Technical architecture extracted from the project portfolio" });
    line(s, 134, 544, 1010, 0, C.gold, 2);
    const layerText = [
      ["ANDROID UI", "Expo React Native + TypeScript\nExpo Router + deep links", 118],
      ["FOCUSED MOBILE LAYERS", "Controllers, state holders\nand repository interfaces", 470],
      ["SERVICE IMPLEMENTATIONS", "Supabase Auth, PostGIS, RLS,\nRealtime, Storage + notifications", 830],
    ];
    layerText.forEach(([h, b, x]) => {
      text(s, h, { left: x, top: 566, width: 300, height: 22 }, { fontSize: 15, bold: true, color: C.teal });
      text(s, b, { left: x, top: 596, width: 300, height: 54 }, { fontSize: 18, color: C.ink });
    });
    rect(s, { left: 1125, top: 566, width: 84, height: 64 }, C.teal, 14, C.gold, 2);
    text(s, "APK", { left: 1138, top: 581, width: 58, height: 28 }, { fontSize: 21, bold: true, color: C.gold, alignment: "center" });
    footer(s, 8);
    notes(s, "Explain the one-directional dependency boundary: screens render and forward actions, feature logic owns state transitions, and repositories isolate Supabase and Android services. Finish by pointing to the signed standalone APK.", ["Project portfolio, page 14: technical architecture.", "Project source: apps/mobile/src/services/app-dependencies.ts and apps/mobile/src/ports/."]);
  }

  // 9 - Controlled specifications
  {
    const s = p.slides.add(); s.background.fill = C.teal;
    title(s, 9, "AI became useful when requests became controlled specifications", true, 38);
    const xs = [94, 447, 690];
    const heads = ["BROAD REQUEST", "BOUNDED CHANGE", "VERIFIED IMPLEMENTATION"];
    const bodies = ["Feature idea\nScreenshots\nWritten description", "Desired behavior\nKeep unchanged\nObsolete behavior\nOwner module", "Syntax + imports\nSmoke test\nDevice reproduction\nRegression check"];
    line(s, 244, 268, 680, 0, C.gold, 4);
    shape(s, "rightArrow", { left: 415, top: 257, width: 30, height: 22 }, C.gold, { style: "solid", fill: "none", width: 0 });
    shape(s, "rightArrow", { left: 768, top: 257, width: 30, height: 22 }, C.gold, { style: "solid", fill: "none", width: 0 });
    xs.forEach((x, i) => {
      dot(s, x + 115, 268, 13, i === 0 ? C.sage : C.gold);
      text(s, heads[i], { left: x, top: 158, width: 230, height: 50 }, { fontSize: 18, bold: true, color: i === 1 ? C.gold : C.off, alignment: "center" });
      text(s, bodies[i], { left: x, top: 306, width: 230, height: 138 }, { fontSize: 20, color: C.off, alignment: "center", lineSpacing: 1.1 });
    });
    await image(s, path.join(ASSETS, "safe-change-page-1.png"), { left: 970, top: 115, width: 220, height: 386 }, { fit: "cover", crop: { left: 0.08, top: 0.31, right: 0.08, bottom: 0.39 }, geometry: "roundRect", borderRadius: 14, alt: "Cropped safe change request template" });
    text(s, "Prompting became an engineering control rather than a request for automatic output.", { left: 168, top: 520, width: 760, height: 78 }, { fontSize: 30, bold: true, color: C.gold, typeface: FONT_HEAD, alignment: "center", lineSpacing: 1.02 });
    text(s, "Safe-change template crop", { left: 970, top: 514, width: 220, height: 20 }, { fontSize: 11, color: C.muted, alignment: "center" });
    footer(s, 9, true);
    notes(s, "Describe the shift from broad prompting to bounded specifications. The key learning is that AI became reliable when the request defined scope, ownership and verification rather than asking for unsupervised output.", ["Research/safe-change-workflow.updated.pdf, page 1."]);
  }

  // 10 - Prompt verbs
  {
    const s = p.slides.add(); s.background.fill = C.off;
    title(s, 10, "Reusable prompts made different kinds of changes safer", false, 35);
    const rows = [
      ["ADD", "Owner module + explicit dependencies"],
      ["CHANGE", "Preserve specified behavior + remove obsolete branches"],
      ["REMOVE", "Delete logic, state, UI, imports + stale documentation"],
      ["FIX", "Reproduce -> root cause -> focused regression check"],
      ["REFACTOR", "Preserve public behavior + separate incrementally"],
    ];
    rows.forEach(([verb, desc], i) => {
      const y = 128 + i * 83;
      text(s, verb, { left: 80, top: y, width: 220, height: 55 }, { fontSize: i === 3 ? 42 : 36, bold: true, color: i === 3 ? C.gold : C.teal, typeface: FONT_HEAD });
      line(s, 300, y + 28, 82, 0, i === 3 ? C.gold : C.sage, 3);
      text(s, desc, { left: 405, top: y + 5, width: 760, height: 48 }, { fontSize: 22, color: C.ink });
    });
    rect(s, { left: 690, top: 544, width: 500, height: 112 }, C.teal, 16);
    text(s, "Observed behavior: ...\nExpected behavior: ...\nHow to reproduce: ...\nIdentify the root cause before editing.", { left: 716, top: 562, width: 450, height: 80 }, { fontSize: 17, color: C.off, lineSpacing: 1.08 });
    text(s, "KEEP UNCHANGED", { left: 82, top: 584, width: 250, height: 28 }, { fontSize: 18, bold: true, color: C.gold });
    text(s, "VERIFICATION", { left: 82, top: 620, width: 250, height: 28 }, { fontSize: 18, bold: true, color: C.gold });
    footer(s, 10);
    notes(s, "Use the five verbs to show that different change types require different safety constraints. For fixes, quote the root-cause-first excerpt and explain why 'keep unchanged' and verification became mandatory fields.", ["Research/safe-change-workflow.updated.pdf, pages 1-3. Exact prompt wording is adapted into visible excerpts."]);
  }

  // 11 - Feedback loop
  {
    const s = p.slides.add(); s.background.fill = C.dark;
    title(s, 11, "Direct access shortened the feedback loop", true, 35);
    const stages = [
      ["01", "Screenshots + written reports", 110, 522],
      ["02", "USB debugging + ADB", 300, 456],
      ["03", "Direct APK installation", 492, 390],
      ["04", "Device logs + reproduction", 684, 324],
      ["05", "Browser-assisted setup", 876, 258],
      ["06", "Rebuild -> install -> verify", 1060, 192],
    ];
    stages.forEach(([n, label, x, y]) => {
      dot(s, x, y, 14, C.gold);
      text(s, n, { left: x - 17, top: y - 10, width: 34, height: 20 }, { fontSize: 11, bold: true, color: C.dark, alignment: "center" });
      text(s, label, { left: x - 80, top: y + 24, width: 160, height: 48 }, { fontSize: 16, bold: true, color: C.off, alignment: "center" });
    });
    rect(s, { left: 76, top: 130, width: 430, height: 224 }, "#071D21", 18, "#FFFFFF/12", 1);
    text(s, "DEVICE EVIDENCE", { left: 100, top: 151, width: 180, height: 22 }, { fontSize: 14, bold: true, color: C.sage });
    text(s, "> adb devices\n> adb install -r jamaa-next-door.apk\n> adb logcat | findstr AuthSession\n\nMagic-link callback\nCrypto compatibility\nBlank details route", { left: 100, top: 187, width: 372, height: 145 }, { fontSize: 17, color: C.off, typeface: "Consolas", lineSpacing: 1.08 });
    rect(s, { left: 730, top: 468, width: 454, height: 144 }, C.teal2, 18, "#FFFFFF/12", 1);
    text(s, "BROWSER-ASSISTED CONFIGURATION", { left: 755, top: 490, width: 400, height: 24 }, { fontSize: 15, bold: true, color: C.gold });
    text(s, "NAMECHEAP   ->   RESEND   ->   SUPABASE\nDNS records      SMTP domain      Auth redirects", { left: 755, top: 530, width: 400, height: 58 }, { fontSize: 18, color: C.off, alignment: "center", lineSpacing: 1.12 });
    footer(s, 11, true);
    notes(s, "Explain how direct observation replaced guesswork: connect the phone, install the APK, reproduce the issue, inspect logs, then verify the same path. Mention magic-link routing, the missing profile action, the crypto error, blank details, and browser configuration without exposing credentials.", ["Project development chronology supplied by Mohitur Rahman Zidan.", "Local project evidence: Android package com.zidan73.jamaanextdoor and EAS/APK build outputs."]);
  }

  // 12 - Walkthrough video placeholder
  {
    const s = p.slides.add(); s.background.fill = C.off;
    title(s, 12, "The working prototype proves the central journey", false, 40);
    text(s, "Create and confirm", { left: 80, top: 212, width: 260, height: 44 }, { fontSize: 23, bold: true, color: C.teal, alignment: "right" });
    text(s, "Return to the\ntime-sorted home", { left: 80, top: 326, width: 260, height: 66 }, { fontSize: 23, bold: true, color: C.teal, alignment: "right" });
    text(s, "Open details and\nparticipation actions", { left: 80, top: 454, width: 260, height: 66 }, { fontSize: 23, bold: true, color: C.teal, alignment: "right" });
    line(s, 374, 236, 96, 0, C.gold, 2); line(s, 374, 356, 96, 0, C.gold, 2); line(s, 374, 484, 96, 0, C.gold, 2);
    phoneFrame(s, 490, 124, 276, 510, "review");
    shape(s, "ellipse", { left: 577, top: 314, width: 102, height: 102 }, "#E7C48D/E8", { style: "solid", fill: C.off, width: 2 });
    shape(s, "triangle", { left: 615, top: 343, width: 36, height: 44 }, C.dark, { style: "solid", fill: "none", width: 0 });
    text(s, "APPLICATION WALKTHROUGH", { left: 842, top: 226, width: 330, height: 36 }, { fontSize: 18, bold: true, color: C.gold });
    text(s, "60-90 seconds\nPortrait H.264 MP4\nEmbedded for offline playback", { left: 842, top: 282, width: 310, height: 116 }, { fontSize: 24, color: C.ink, typeface: FONT_HEAD, lineSpacing: 1.12 });
    text(s, "A poster frame remains visible if playback is unavailable.", { left: 842, top: 446, width: 300, height: 64 }, { fontSize: 18, color: "#667C80" });
    footer(s, 12);
    notes(s, "Replace the central poster with the final embedded 1080 x 1920 H.264 walkthrough before presentation. Demonstrate home, creation, prayer/time selection, location image, review, confirmation, refreshed home, details sheet, participation actions and Close. Keep the poster frame as the media fallback.", ["Walkthrough sequence defined from the implemented application flow. No walkthrough MP4 was available during deck generation."]);
  }

  // 13 - Status
  {
    const s = p.slides.add(); s.background.fill = C.teal;
    title(s, 13, "The prototype works; trust still requires real-world validation", true, 35);
    text(s, "WORKING", { left: 78, top: 128, width: 220, height: 30 }, { fontSize: 20, bold: true, color: C.gold });
    const working = ["Standalone APK", "Magic-link authentication", "Profile setup", "Create + confirm", "Time-sorted discovery", "Details bottom sheet", "Participation actions", "Automatic ending"];
    working.forEach((v, i) => {
      line(s, 93, 181 + i * 53, 20, 0, C.sage, 3);
      text(s, v, { left: 128, top: 167 + i * 53, width: 290, height: 30 }, { fontSize: 20, color: C.off });
    });
    phoneFrame(s, 490, 142, 216, 454, "details");
    rect(s, { left: 774, top: 138, width: 430, height: 458 }, "#102F33", 22, "#FFFFFF/16", 1);
    text(s, "STILL REQUIRES VALIDATION", { left: 808, top: 174, width: 360, height: 30 }, { fontSize: 19, bold: true, color: C.gold });
    ["Structured user testing", "Transparent moderation policy", "Professional selfie-verification decision", "Arabic and right-to-left design testing", "Production monitoring and safeguarding"].forEach((v, i) => bullet(s, v, 812, 230 + i * 67, 340, C.off, C.sage, 19));
    text(s, "Current prototype reconstruction", { left: 474, top: 612, width: 250, height: 18 }, { fontSize: 11, color: C.muted, alignment: "center" });
    footer(s, 13, true);
    notes(s, "Be explicit about what works and what remains unresolved. The prototype proves the central journey, but responsible release still depends on user testing, moderation transparency, verification policy, RTL design and ongoing safeguarding.", ["Project source and current implementation status.", "Teacher feedback supplied by Mohitur Rahman Zidan."]);
  }

  // 14 - Conclusion
  {
    const s = p.slides.add();
    await image(s, path.join(ROOT, "output/documentation/cover-variations/jnd-cover-05-atmospheric-arch-portfolio.png"), { left: 0, top: 0, width: W, height: H }, { fit: "cover", alt: "Atmospheric arch portfolio cover artwork" });
    rect(s, { left: 0, top: 0, width: W, height: H }, "#063E4D/E0");
    rect(s, { left: 632, top: 110, width: 540, height: 430 }, "none", 210, C.gold, 2);
    text(s, "Personal need became a responsible, verifiable product", { left: 116, top: 102, width: 905, height: 118 }, { fontSize: 52, bold: true, color: C.off, typeface: FONT_HEAD, lineSpacing: 1.0 });
    line(s, 116, 246, 190, 0, C.gold, 3);
    const proofs = ["Personal motivation", "Trust-aware product design", "Working Android implementation", "AI-assisted, human-directed process"];
    proofs.forEach((v, i) => text(s, v, { left: 116, top: 285 + i * 52, width: 470, height: 34 }, { fontSize: 23, bold: true, color: i === 3 ? C.gold : C.off }));
    text(s, "Jamaa Next Door demonstrates that local coordination can reduce religious isolation when privacy, timing and trust are treated as part of the functionality.", { left: 672, top: 286, width: 460, height: 190 }, { fontSize: 29, color: C.gold, typeface: FONT_HEAD, lineSpacing: 1.08 });
    text(s, "Questions", { left: 116, top: 628, width: 200, height: 38 }, { fontSize: 24, bold: true, color: C.sage });
    notes(s, "Resolve the opening story: a personal need became a product whose central journey is implemented and whose risks are treated as design constraints. Invite questions without adding a generic thank-you slide.", ["Conclusion synthesized from the project portfolio, implemented prototype and user-provided motivation.", "Project portfolio cover artwork reused as a visual bookend."]);
  }

  for (let i = 0; i < p.slides.items.length; i++) {
    const slide = p.slides.items[i];
    const png = await p.export({ slide, format: "png", scale: 1 });
    await fs.writeFile(path.join(TMP, "rendered", `slide-${String(i + 1).padStart(2, "0")}.png`), new Uint8Array(await png.arrayBuffer()));
    const layout = await slide.export({ format: "layout" });
    await fs.writeFile(path.join(TMP, "rendered", `slide-${String(i + 1).padStart(2, "0")}.layout.json`), await layout.text());
  }
  const montage = await p.export({ format: "webp", montage: { columns: 4, slideWidth: 320, padding: 12, gap: 10, background: C.dark }, scale: 1 });
  await fs.writeFile(path.join(TMP, "rendered", "deck-montage.webp"), new Uint8Array(await montage.arrayBuffer()));
  const pptx = await PresentationFile.exportPptx(p);
  await pptx.save(FINAL);
  console.log(FINAL);
}

build().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});

// Draws the shareable achievement image entirely client-side (canvas — there
// is no backend). It's the same celebration card the app shows in-page (cream
// card, accent tint, colored disc + glyph, label, figure, headline, note) set
// on the night background with Voco branding and a small voco.courses
// watermark, so anyone who sees it shared knows where to find the app.
//
// Input is a card descriptor from lib/milestones.js (describeMilestone() /
// streakCard()) — real data, never placeholder text. Output is a PNG Blob.

import { CARD_STYLES } from "./milestones";

export const CARD_WIDTH = 1080;
export const CARD_HEIGHT = 1350;

// lucide-react's own path data (24x24, stroked), so the glyphs match the
// ones used throughout the app exactly.
const ICON_PATHS = {
  moon: ["M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"],
  sunrise: [
    "M12 2v8",
    "m4.93 10.93 1.41 1.41",
    "M2 18h2",
    "M20 18h2",
    "m19.07 10.93-1.41 1.41",
    "M22 22H2",
    "m8 6 4-4 4 4",
    "M16 18a4 4 0 0 0-8 0",
  ],
  flame: [
    "M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z",
  ],
  // (the circle in lucide's Award, written as a path so Path2D can stroke it)
  award: [
    "m15.477 12.89 1.515 8.526a.5.5 0 0 1-.81.47l-3.58-2.687a1 1 0 0 0-1.197 0l-3.586 2.686a.5.5 0 0 1-.81-.469l1.514-8.526",
    "M6 8a6 6 0 1 0 12 0a6 6 0 1 0-12 0",
  ],
  book: ["M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"],
};

const FONT_DISPLAY = '"Fraunces", Georgia, serif';
const FONT_TEXT = '"Inter", system-ui, -apple-system, "Segoe UI", sans-serif';

function drawIcon(ctx, name, cx, cy, size, color) {
  const scale = size / 24;
  ctx.save();
  ctx.translate(cx - size / 2, cy - size / 2);
  ctx.scale(scale, scale);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2.5;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const d of ICON_PATHS[name]) ctx.stroke(new Path2D(d));
  ctx.restore();
}

function roundedRect(ctx, x, y, w, h, r) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

// Centered text with extra letter-spacing (used for the small-caps label and
// the watermark); done per character so it works in every browser.
function spacedText(ctx, text, cx, y, spacing) {
  const chars = [...text];
  const widths = chars.map((c) => ctx.measureText(c).width);
  const total = widths.reduce((a, b) => a + b, 0) + spacing * (chars.length - 1);
  let x = cx - total / 2;
  ctx.textAlign = "left";
  chars.forEach((c, i) => {
    ctx.fillText(c, x, y);
    x += widths[i] + spacing;
  });
  ctx.textAlign = "center";
}

function wrapLines(ctx, text, maxWidth) {
  const words = text.split(/\s+/);
  const lines = [];
  let line = "";
  for (const word of words) {
    const test = line ? `${line} ${word}` : word;
    if (line && ctx.measureText(test).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = test;
    }
  }
  if (line) lines.push(line);
  return lines;
}

// Wait for the web fonts, but never indefinitely: if they're slow or blocked
// (offline, a content blocker) the image is drawn with the system fonts named
// in the stacks above rather than leaving the share dialog stuck on
// "Making your image…".
const FONT_WAIT_MS = 2500;

async function ensureFonts() {
  if (typeof document === "undefined" || !document.fonts) return;
  const loads = Promise.all([
    document.fonts.load(`600 100px ${FONT_DISPLAY}`),
    document.fonts.load(`400 30px ${FONT_TEXT}`),
    document.fonts.load(`500 30px ${FONT_TEXT}`),
    document.fonts.load(`600 30px ${FONT_TEXT}`),
  ]);
  try {
    await Promise.race([loads, new Promise((resolve) => setTimeout(resolve, FONT_WAIT_MS))]);
  } catch (e) {
    // fall back to the system fonts
  }
}

// The text under the big figure is laid out BEFORE the card is drawn, because
// how tall the card must be depends on it: a long headline (a category such as
// "Leadership & Workplace Dynamics") wraps onto extra lines, and a fixed-height
// card would let the note spill out of the bottom. In order of preference: keep
// the standard sizes; else shrink the headline; else the note; and only if none
// of that fits, grow the card (up to CARD_H_MAX, which still leaves room for
// the tagline and watermark). A card whose text already fits is drawn exactly
// as it always was.
const CARD_H = 890;
const CARD_H_MAX = 966;
const CARD_BOTTOM_PAD = 40;
const HEADLINE_SIZES = [54, 48, 44, 40]; // px, the standard size first
const NOTE_SIZES = [30, 27];

function layoutText(ctx, card, cardW, cardY, headlineTop) {
  const options = [];
  for (const noteSize of NOTE_SIZES) {
    for (const headSize of HEADLINE_SIZES) {
      ctx.font = `600 ${headSize}px ${FONT_DISPLAY}`;
      const headLines = wrapLines(ctx, card.headline, cardW - 140);
      const headLH = Math.round((headSize * 64) / 54);
      ctx.font = `400 ${noteSize}px ${FONT_TEXT}`;
      const noteLines = wrapLines(ctx, card.note, cardW - 160);
      const noteLH = Math.round((noteSize * 42) / 30);
      const lastBaseline = headlineTop + headLH * headLines.length + 14 + noteLH * (noteLines.length - 1);
      const cardH = Math.max(CARD_H, lastBaseline + CARD_BOTTOM_PAD - cardY);
      options.push({ headSize, headLines, headLH, noteSize, noteLines, noteLH, cardH });
    }
  }
  return options.find((o) => o.cardH === CARD_H) || options.find((o) => o.cardH <= CARD_H_MAX) || options[options.length - 1];
}

export async function renderShareCard(card) {
  const style = CARD_STYLES[card.style];
  await ensureFonts();

  const canvas = document.createElement("canvas");
  canvas.width = CARD_WIDTH;
  canvas.height = CARD_HEIGHT;
  const ctx = canvas.getContext("2d");
  const cx = CARD_WIDTH / 2;
  ctx.textAlign = "center";
  ctx.textBaseline = "alphabetic";

  // --- night background + a soft glow in the card's accent ---
  const bg = ctx.createLinearGradient(0, 0, 0, CARD_HEIGHT);
  bg.addColorStop(0, "#14152B");
  bg.addColorStop(1, "#1A1C3A");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);
  const glow = ctx.createRadialGradient(cx, 330, 40, cx, 330, 760);
  glow.addColorStop(0, `rgba(${style.rgb}, 0.20)`);
  glow.addColorStop(1, `rgba(${style.rgb}, 0)`);
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, CARD_WIDTH, CARD_HEIGHT);

  // --- Voco logo: moon + wordmark ---
  ctx.font = `600 66px ${FONT_DISPLAY}`;
  const wordmark = "Voco";
  const markWidth = ctx.measureText(wordmark).width;
  const logoSize = 62;
  const logoTotal = logoSize + 20 + markWidth;
  const logoLeft = cx - logoTotal / 2;
  drawIcon(ctx, "moon", logoLeft + logoSize / 2, 118, logoSize, "#8B85FF");
  ctx.fillStyle = "#EDEBFF";
  ctx.textAlign = "left";
  ctx.fillText(wordmark, logoLeft + logoSize + 20, 140);
  ctx.textAlign = "center";

  // --- the celebration card: cream, accent tint, accent border ---
  const cardX = 90;
  const cardY = 200;
  const cardW = CARD_WIDTH - 180;

  // The big figure is drawn at a small font size and scaled UP. Fraunces picks
  // its optical-size cut from the font-size, and at 200px+ that is the
  // display cut, whose hairline strokes and ball terminals make some numerals
  // (a "4") hard to recognise. A sturdier cut, magnified, reads clearly.
  const baseSize = 32;
  let scale = (card.big.length <= 2 ? 250 : 200) / baseSize;
  ctx.font = `600 ${baseSize}px ${FONT_DISPLAY}`;
  while (ctx.measureText(card.big).width * scale > cardW - 140 && scale > 2.5) scale -= 0.3;
  const bigPx = baseSize * scale;
  const bigBaseline = cardY + 315 + 60 + bigPx * 0.78;
  const unitY = bigBaseline + 66;
  const text = layoutText(ctx, card, cardW, cardY, unitY + 92);
  const cardH = Math.min(text.cardH, CARD_H_MAX);

  roundedRect(ctx, cardX, cardY, cardW, cardH, 56);
  ctx.fillStyle = "#FFF9F2";
  ctx.fill();
  const tint = ctx.createLinearGradient(0, cardY, 0, cardY + cardH * 0.65);
  tint.addColorStop(0, `rgba(${style.rgb}, 0.22)`);
  tint.addColorStop(1, `rgba(${style.rgb}, 0)`);
  ctx.fillStyle = tint;
  ctx.fill();
  ctx.lineWidth = 3;
  ctx.strokeStyle = `${style.accent}99`;
  roundedRect(ctx, cardX + 1.5, cardY + 1.5, cardW - 3, cardH - 3, 55);
  ctx.stroke();

  // --- disc + glyph (with the same soft halo ring as the in-app card) ---
  const discY = cardY + 150;
  ctx.beginPath();
  ctx.arc(cx, discY, 88 + 22, 0, Math.PI * 2);
  ctx.fillStyle = `${style.accent}33`;
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, discY, 88, 0, Math.PI * 2);
  ctx.fillStyle = style.accent;
  ctx.fill();
  drawIcon(ctx, style.icon, cx, discY, 92, "#FFF9F2");

  // --- label, big figure, unit ---
  ctx.fillStyle = style.deep;
  ctx.font = `600 30px ${FONT_TEXT}`;
  spacedText(ctx, card.label.toUpperCase(), cx, cardY + 315, 7);

  ctx.font = `600 ${baseSize}px ${FONT_DISPLAY}`;
  ctx.save();
  ctx.translate(cx, bigBaseline);
  ctx.scale(scale, scale);
  ctx.fillStyle = style.deep;
  ctx.fillText(card.big, 0, 0);
  ctx.restore();

  ctx.fillStyle = "#3D2B4F";
  ctx.font = `500 40px ${FONT_TEXT}`;
  ctx.fillText(card.unit, cx, unitY);

  // --- headline + note (wrapped; sizes and card height chosen by layoutText) ---
  ctx.font = `600 ${text.headSize}px ${FONT_DISPLAY}`;
  ctx.fillStyle = "#3D2B4F";
  let y = unitY + 92;
  for (const line of text.headLines) {
    ctx.fillText(line, cx, y);
    y += text.headLH;
  }
  ctx.font = `400 ${text.noteSize}px ${FONT_TEXT}`;
  ctx.fillStyle = "#8A6E7D";
  y += 14;
  for (const line of text.noteLines) {
    ctx.fillText(line, cx, y);
    y += text.noteLH;
  }

  // --- tagline + watermark, below the card ---
  ctx.fillStyle = "#C9C5EC";
  ctx.font = `400 40px ${FONT_DISPLAY}`;
  const watermarkY = Math.min(cardY + cardH + 168, CARD_HEIGHT - 58);
  ctx.fillText("Study at night. Quiz in the morning.", cx, watermarkY - 80);
  ctx.fillStyle = "#8B85FF";
  ctx.font = `600 42px ${FONT_TEXT}`;
  spacedText(ctx, "voco.courses", cx, watermarkY, 5);

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Could not create the image"))), "image/png");
  });
}

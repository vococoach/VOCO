// `npm run validate:contact` — the project has ONE contact address and it lives in ONE
// file (lib/contact.js). This fails if that stops being true, so it can't drift back.
//
// It scans every tracked file plus every untracked file git doesn't ignore (so a new file
// is checked before it is ever `git add`ed), and falls back to walking the folder when
// there is no git. It never scans node_modules, .next, .git, .vercel or package-lock.json,
// nor binary files.
//
// It fails on:
//   1. the retired mail provider's name, anywhere, in any file (assembled below, so this
//      file does not contain it);
//   2. any email-shaped string that is not the shared address (ALLOWED_OTHER is empty on
//      purpose; adding to it needs the owner's say-so);
//   3. the shared address typed anywhere except lib/contact.js and this file's expected
//      value — everything else must import CONTACT_EMAIL / CONTACT_MAILTO;
//   4. a mailto link that is not built from the constant (code and markup files; the only
//      literal form allowed is the template that interpolates CONTACT_EMAIL, in a file
//      that imports it — or lib/contact.js itself, which defines it);
//   5. lib/contact.js exporting anything other than exactly the expected address / link.
//
// To change the address on purpose: edit lib/contact.js AND EXPECTED below, re-date the
// Terms and Privacy pages, and update scripts/test-access.mjs's date check.

import { execFileSync } from "node:child_process";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");

const EXPECTED = "vococourses@gmail.com";
const CONSTANT_FILE = "lib/contact.js";
const SELF = "scripts/validate-contact.mjs";
const RETIRED_PROVIDER = ["i", "cloud"].join(""); // never written out whole anywhere in the repo
const MAILTO = ["mail", "to:"].join(""); // same trick: this file must pass its own mailto rule
const ALLOWED_OTHER = []; // email-shaped strings allowed besides the shared address. Empty on purpose.

const EMAIL_RE = /[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}/g;
const CONSTANT_IMPORT_RE =
  /import\s*\{[^}]*\bCONTACT_EMAIL\b[^}]*\}\s*from\s*["'](?:@\/lib\/contact|(?:\.{1,2}\/)+(?:lib\/)?contact)(?:\.js)?["']/;
const SKIP_DIRS = new Set(["node_modules", ".next", ".git", ".vercel"]);
const SKIP_FILES = new Set(["package-lock.json"]);
const BINARY_EXT = new Set([
  ".png", ".jpg", ".jpeg", ".gif", ".webp", ".avif", ".ico", ".icns", ".bmp",
  ".woff", ".woff2", ".ttf", ".otf", ".eot", ".pdf", ".zip", ".gz", ".mp3", ".mp4", ".mov", ".webm",
]);

let pass = 0;
let fail = 0;
const ok = (name, cond, extra = "", details = []) => {
  cond ? pass++ : fail++;
  console.log(`${cond ? "PASS" : "FAIL"} ${name}${extra ? "  — " + extra : ""}`);
  if (!cond) for (const d of details) console.log(`     ${d}`);
};

// ---------- which files ----------
function gitFiles() {
  try {
    const out = execFileSync("git", ["ls-files", "-z", "--cached", "--others", "--exclude-standard"], {
      cwd: root,
      stdio: ["ignore", "pipe", "ignore"],
      maxBuffer: 64 * 1024 * 1024,
    });
    return out.toString("utf8").split("\0").filter(Boolean);
  } catch (e) {
    return null;
  }
}
function walk(rel = "") {
  const out = [];
  for (const entry of readdirSync(path.join(root, rel), { withFileTypes: true })) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const r = rel ? `${rel}/${entry.name}` : entry.name;
    if (entry.isDirectory()) out.push(...walk(r));
    else if (entry.isFile()) out.push(r);
  }
  return out;
}

const viaGit = gitFiles();
const listed = [...new Set(viaGit || walk())].sort();
const skipped = { excluded: 0, missing: 0, binary: 0 };
const files = [];
for (const rel of listed) {
  const parts = rel.split("/");
  if (SKIP_FILES.has(rel) || parts.some((p) => SKIP_DIRS.has(p)) || path.basename(rel) === ".DS_Store") {
    skipped.excluded++;
    continue;
  }
  const abs = path.join(root, rel);
  if (!existsSync(abs) || !statSync(abs).isFile()) {
    skipped.missing++; // tracked but deleted in the working tree
    continue;
  }
  if (BINARY_EXT.has(path.extname(rel).toLowerCase())) {
    skipped.binary++;
    continue;
  }
  const buf = readFileSync(abs);
  if (buf.includes(0)) {
    skipped.binary++;
    continue;
  }
  files.push({ rel, text: buf.toString("utf8") });
}

const lineOf = (text, index) => text.slice(0, index).split("\n").length;
const isMarkdown = (rel) => /\.mdx?$/i.test(rel);

// ---------- the checks ----------
const v = { provider: [], other: [], typed: [], link: [], constant: [] };
let emailsTotal = 0;
let emailsShared = 0;
let sharedInSelf = 0;
let mailtoTotal = 0;
let mailtoBuilt = 0;
let constantFileAddressCount = 0;

for (const { rel, text } of files) {
  // 1. the retired provider's name
  const lower = text.toLowerCase();
  for (let i = lower.indexOf(RETIRED_PROVIDER); i !== -1; i = lower.indexOf(RETIRED_PROVIDER, i + 1)) {
    v.provider.push(`${rel}:${lineOf(text, i)} — contains the retired mail provider's name`);
  }

  // 2 + 3. email-shaped strings
  for (const m of text.matchAll(EMAIL_RE)) {
    emailsTotal++;
    const where = `${rel}:${lineOf(text, m.index)}`;
    if (m[0].toLowerCase() === EXPECTED) {
      emailsShared++;
      if (rel === CONSTANT_FILE) constantFileAddressCount++;
      else if (rel === SELF) sharedInSelf++;
      else v.typed.push(`${where} — the contact address is typed here; import CONTACT_EMAIL from lib/contact.js instead`);
    } else if (!ALLOWED_OTHER.includes(m[0])) {
      v.other.push(`${where} — "${m[0]}" is not the shared contact address (reword it, or ask the owner about ALLOWED_OTHER)`);
    }
  }

  // 4. mailto links (code and markup; prose in Markdown can't be a link, and any address in it is caught above)
  if (!isMarkdown(rel)) {
    for (const m of text.matchAll(new RegExp(MAILTO, "gi"))) {
      mailtoTotal++;
      const after = text.slice(m.index + MAILTO.length, m.index + MAILTO.length + "${CONTACT_EMAIL}".length);
      const definesIt = rel === CONSTANT_FILE && /export\s+const\s+CONTACT_EMAIL\s*=/.test(text);
      const built = after === "${CONTACT_EMAIL}" && (definesIt || CONSTANT_IMPORT_RE.test(text));
      if (built) mailtoBuilt++;
      else v.link.push(`${rel}:${lineOf(text, m.index)} — a mailto link not built from CONTACT_EMAIL (use CONTACT_MAILTO from lib/contact.js)`);
    }
  }
}

// 5. the constant itself, as the app will actually read it
const constantFileScanned = files.some((f) => f.rel === CONSTANT_FILE);
if (!constantFileScanned) v.constant.push(`${CONSTANT_FILE} was not found among the scanned files`);
else {
  const mod = await import(pathToFileURL(path.join(root, CONSTANT_FILE)).href);
  if (mod.CONTACT_EMAIL !== EXPECTED) v.constant.push(`CONTACT_EMAIL is ${JSON.stringify(mod.CONTACT_EMAIL)}, expected exactly ${JSON.stringify(EXPECTED)}`);
  if (mod.CONTACT_MAILTO !== MAILTO + EXPECTED) v.constant.push(`CONTACT_MAILTO is ${JSON.stringify(mod.CONTACT_MAILTO)}, expected ${JSON.stringify(MAILTO + EXPECTED)}`);
  if (constantFileAddressCount !== 1) v.constant.push(`${CONSTANT_FILE} must contain the address exactly once (found ${constantFileAddressCount})`);
}

// ---------- report ----------
console.log(
  `Scanning ${files.length} text files (${listed.length} listed by ${viaGit ? "git: tracked + untracked-not-ignored" : "a folder walk (no git found)"}; ` +
    `skipped ${skipped.binary} binary, ${skipped.excluded} excluded (node_modules/.next/.git/.vercel/package-lock.json/.DS_Store), ${skipped.missing} deleted)\n`
);
ok("the retired mail provider's name appears nowhere", v.provider.length === 0, `${v.provider.length} occurrence(s) in ${files.length} files`, v.provider);
ok("no email-shaped string other than the shared contact address", v.other.length === 0, `${emailsTotal} email-shaped string(s) found, ${emailsShared} are the shared address, ${emailsTotal - emailsShared} other; allowlist entries: ${ALLOWED_OTHER.length}`, v.other);
ok("the shared address is typed only in lib/contact.js (everything else imports the constant)", v.typed.length === 0, `${emailsShared} occurrence(s): ${constantFileAddressCount} in ${CONSTANT_FILE}, ${sharedInSelf} in this guard's expected value, ${v.typed.length} elsewhere`, v.typed);
ok("every mailto link is built from the shared constant", v.link.length === 0, `${mailtoTotal} mailto occurrence(s) in code/markup, ${mailtoBuilt} built from CONTACT_EMAIL`, v.link);
ok("lib/contact.js exports exactly the expected address and link", v.constant.length === 0, `expected ${EXPECTED}`, v.constant);

console.log(`\n${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);

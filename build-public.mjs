// ===========================================================================
// build-public.mjs — assembles ./public before `wrangler deploy`
// ---------------------------------------------------------------------------
// The repo keeps site files at the root; wrangler.toml expects them in
// ./public. This script builds that folder on every deploy (locally and on
// Cloudflare's build machine), so ./public never needs to be committed.
//
// Run:  node build-public.mjs     (wired into `npm run build` / `npm run deploy`)
// ===========================================================================

import { cpSync, mkdirSync, rmSync, readdirSync, statSync, existsSync } from "node:fs";
import path from "node:path";

const OUT = "public";

// File types that belong on the static site
const STATIC_EXT = new Set([
  ".css", ".js", ".jsx", ".json",
  ".png", ".jpg", ".jpeg", ".webp", ".gif", ".svg", ".ico",
  ".mp4", ".webm", ".woff", ".woff2", ".ttf",
]);

// Only these HTML pages are deployable — the rest are internal docs/guides
const HTML_ALLOW = new Set([
  "index.html",
  "Sales Dashboard.html",
  "admin-news-dashboard.html",
]);

// Never ship these
const EXCLUDE_FILES = new Set([
  "worker.js",            // the Worker itself — deployed by wrangler, not served
  "build-public.mjs",
  "package.json",
  "package-lock.json",
  "wrangler.toml",
]);
const EXCLUDE_DIRS = new Set([
  OUT, "node_modules", ".git", ".github", ".wrangler", "src", "_ds", "uploads",
]);

// Asset folders copied recursively if present
const COPY_DIRS = ["assets"];

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

let copied = 0;
for (const entry of readdirSync(".")) {
  if (EXCLUDE_DIRS.has(entry) || EXCLUDE_FILES.has(entry)) continue;
  if (statSync(entry).isDirectory()) continue; // folders handled below
  const ext = path.extname(entry).toLowerCase();
  const wanted = ext === ".html" ? HTML_ALLOW.has(entry) : STATIC_EXT.has(ext);
  if (!wanted) continue;
  cpSync(entry, path.join(OUT, entry));
  copied += 1;
}

for (const dir of COPY_DIRS) {
  if (existsSync(dir)) {
    cpSync(dir, path.join(OUT, dir), { recursive: true });
    console.log(`  + ${dir}/ (copied recursively)`);
  } else {
    console.warn(
      `  ! WARNING: ./${dir} not found in the repo — images will 404.\n` +
      `    Commit your ${dir}/ folder:  git add ${dir} && git commit -m "add ${dir}" && git push`
    );
  }
}

if (!existsSync(path.join(OUT, "index.html"))) {
  console.error("✗ index.html was not copied into ./public — nothing to serve. Aborting.");
  process.exit(1);
}

console.log(`✓ built ./${OUT} — ${copied} files + asset folders. Ready for wrangler deploy.`);

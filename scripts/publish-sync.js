const fs = require("fs");
const path = require("path");

const rootDir = path.resolve(__dirname, "..");
const src = path.join(rootDir, "door-os-frontend", "out");

if (!fs.existsSync(src)) {
  console.error("[publish-sync] Static export output directory does not exist:", src);
  process.exit(1);
}

// Sync to all common Render publish directories
const targets = [
  path.join(rootDir, "dist"),
  path.join(rootDir, "build"),
  path.join(rootDir, "public"),
  path.join(rootDir, "out"),
  path.join(rootDir, "door-os-frontend", "dist"),
  path.join(rootDir, "door-os-frontend", "build"),
  path.join(rootDir, "door-os-frontend", "public"),
];

targets.forEach((target) => {
  try {
    fs.mkdirSync(target, { recursive: true });
    fs.cpSync(src, target, { recursive: true });
    console.log(`[publish-sync] Synced static export to: ${target}`);
  } catch (err) {
    console.warn(`[publish-sync] Notice syncing to ${target}:`, err.message);
  }
});

// Copy index.html, 404.html, and _next to repo root for root-level publishing
try {
  const rootFiles = ["index.html", "404.html"];
  rootFiles.forEach((file) => {
    const fPath = path.join(src, file);
    if (fs.existsSync(fPath)) {
      fs.copyFileSync(fPath, path.join(rootDir, file));
    }
  });

  const nextDir = path.join(src, "_next");
  if (fs.existsSync(nextDir)) {
    fs.cpSync(nextDir, path.join(rootDir, "_next"), { recursive: true });
  }
  console.log("[publish-sync] Synced root directory index.html and _next assets");
} catch (err) {
  console.warn("[publish-sync] Notice syncing root files:", err.message);
}

console.log("[publish-sync] Done! Door OS static site is now present in all Render target directories.");

#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

const TEMPLATES_DIR = path.join(__dirname, 'templates', 'agent-hub');
const CORE_MANIFEST = '.core-manifest.json';

function install(destPath) {
  const dest = path.resolve(destPath);

  if (fs.existsSync(dest)) {
    const files = fs.readdirSync(dest);
    if (files.length > 0) {
      console.log(`Directory ${dest} already exists and is not empty.`);
      console.log('Use "agent-hub upgrade" to update an existing installation.');
      process.exit(1);
    }
  }

  fs.mkdirSync(dest, { recursive: true });
  const copiedFiles = [];
  copyDir(TEMPLATES_DIR, dest, copiedFiles);

  const manifest = {
    installed_at: new Date().toISOString(),
    core_files: copiedFiles.map(f => ({
      path: f,
      hash: fileHash(path.join(dest, f))
    }))
  };
  fs.writeFileSync(path.join(dest, CORE_MANIFEST), JSON.stringify(manifest, null, 2));

  console.log(`Agent Hub installed to ${dest}`);
  console.log('Edit knowledgebase/personal.md to personalize your setup.');
  console.log('Then load skills/orchestrator.md in your AI agent to get started.');
}

function upgrade(destPath) {
  const dest = destPath ? path.resolve(destPath) : findInstall();
  if (!dest) {
    console.log('No Agent Hub installation found. Use "agent-hub install <path>" first.');
    process.exit(1);
  }

  const manifestPath = path.join(dest, CORE_MANIFEST);
  if (!fs.existsSync(manifestPath)) {
    console.log('No installation manifest found. Run install instead.');
    process.exit(1);
  }

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
  let updated = 0;
  const upgradedFiles = [];

  for (const entry of manifest.core_files) {
    const src = path.join(TEMPLATES_DIR, entry.path);
    const dst = path.join(dest, entry.path);

    if (!fs.existsSync(src)) continue;

    const currentHash = fileHash(src);
    if (currentHash === entry.hash) continue;

    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    upgradedFiles.push({ path: entry.path, hash: currentHash });
    updated++;
  }

  manifest.core_files = manifest.core_files.map(f => {
    const upgraded = upgradedFiles.find(u => u.path === f.path);
    return upgraded || f;
  });
  manifest.last_upgrade = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`Upgraded ${updated} core file(s) in ${dest}`);
  if (updated > 0) {
    console.log('Updated files:', upgradedFiles.map(f => f.path).join(', '));
  } else {
    console.log('Everything is up to date.');
  }
}

function list(destPath) {
  const dest = destPath ? path.resolve(destPath) : findInstall();
  if (!dest) {
    console.log('No Agent Hub installation found.');
    process.exit(1);
  }

  const manifestPath = path.join(dest, CORE_MANIFEST);
  let manifest = null;
  if (fs.existsSync(manifestPath)) {
    manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
    console.log(`Installed at: ${dest}`);
    console.log(`Install date: ${manifest.installed_at}`);
    if (manifest.last_upgrade) {
      console.log(`Last upgrade: ${manifest.last_upgrade}`);
    }
    console.log(`\nCore files (${manifest.core_files.length}):`);
    manifest.core_files.forEach(f => console.log(`  ${f.path}`));
  }

  const corePaths = manifest ? manifest.core_files.map(c => c.path) : [];
  console.log('\nUser files:');
  walkDir(dest, dest).forEach(f => {
    if (f !== CORE_MANIFEST && !corePaths.includes(f)) {
      console.log(`  ${f}`);
    }
  });
}

function help() {
  console.log(`
Agent Hub - Universal Agent Plugin System

Usage:
  agent-hub install <path>   Install to a local directory
  agent-hub upgrade [path]   Upgrade core files (preserves user data)
  agent-hub list [path]      Show installed files
  agent-hub help             Show this help

Examples:
  npx agent-hub install ~/.agent-hub
  npx agent-hub upgrade
  npx agent-hub list

User-created roles, skills, memory, knowledge base, and logs are
never touched during upgrades. Only core template files are updated.
`);
}

// --- Helpers ---

function copyDir(src, dest, copiedFiles, relativePath = '') {
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const relPath = path.join(relativePath, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath, copiedFiles, relPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
      copiedFiles.push(relPath);
    }
  }
}

function fileHash(filePath) {
  const content = fs.readFileSync(filePath);
  let hash = 0;
  for (let i = 0; i < content.length; i++) {
    hash = ((hash << 5) - hash + content[i]) | 0;
  }
  return hash.toString(36);
}

function walkDir(base, dir) {
  const results = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...walkDir(base, fullPath));
    } else {
      results.push(path.relative(base, fullPath));
    }
  }
  return results;
}

function findInstall() {
  const cwd = process.cwd();
  if (fs.existsSync(path.join(cwd, CORE_MANIFEST))) return cwd;
  const home = path.join(require('os').homedir(), '.agent-hub');
  if (fs.existsSync(path.join(home, CORE_MANIFEST))) return home;
  return null;
}

// --- Main ---

const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case 'install':
    if (!args[0]) { console.log('Usage: agent-hub install <path>'); process.exit(1); }
    install(args[0]);
    break;
  case 'upgrade':
    upgrade(args[0]);
    break;
  case 'list':
    list(args[0]);
    break;
  case 'help':
  case '--help':
  case '-h':
  case undefined:
    help();
    break;
  default:
    console.log(`Unknown command: ${cmd}`);
    help();
    process.exit(1);
}

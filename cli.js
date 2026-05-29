#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const TEMPLATES_DIR = path.join(__dirname, 'templates', 'agent-hub');
const CORE_MANIFEST = '.core-manifest.json';

function normalizePath(p) {
  return p.split(path.sep).join('/');
}

function expandHome(p) {
  if (p.startsWith('~')) {
    return path.join(os.homedir(), p.slice(1).replace(/^[/\\]/, ''));
  }
  return p;
}

function install(destPath, force = false) {
  const dest = path.resolve(expandHome(destPath));

  if (fs.existsSync(dest) && !force) {
    const files = fs.readdirSync(dest);
    if (files.length > 0) {
      console.log(`Directory ${dest} already exists and is not empty.`);
      console.log('Use "agent-hub upgrade" to update, or "agent-hub install --force" to overwrite.');
      process.exit(1);
    }
  }

  fs.mkdirSync(dest, { recursive: true });
  const copiedFiles = [];
  copyDir(TEMPLATES_DIR, dest, copiedFiles);

  const manifest = {
    installed_at: new Date().toISOString(),
    core_files: copiedFiles.map(f => ({
      path: normalizePath(f),
      hash: fileHash(path.join(dest, f))
    }))
  };
  fs.writeFileSync(path.join(dest, CORE_MANIFEST), JSON.stringify(manifest, null, 2));

  console.log(`Agent Hub installed to ${dest}`);
  console.log('Edit knowledgebase/personal.md to personalize your setup.');
  console.log('Then load skills/orchestrator.md in your AI agent to get started.');
}

function upgrade(destPath) {
  const dest = destPath ? path.resolve(expandHome(destPath)) : findInstall();
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
    const src = path.join(TEMPLATES_DIR, ...entry.path.split('/'));
    const dst = path.join(dest, ...entry.path.split('/'));

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
  const dest = destPath ? path.resolve(expandHome(destPath)) : findInstall();
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
    const normalized = normalizePath(f);
    if (normalized !== CORE_MANIFEST && !corePaths.includes(normalized)) {
      console.log(`  ${f}`);
    }
  });
}

function setupCursor(destPath) {
  const dest = destPath ? path.resolve(expandHome(destPath)) : findInstall();
  if (!dest) {
    console.log('No Agent Hub installation found. Use "agent-hub install <path>" first.');
    process.exit(1);
  }

  const rulesDir = path.join(process.cwd(), '.cursor', 'rules');
  const rulesFile = path.join(rulesDir, 'agent-hub.md');

  fs.mkdirSync(rulesDir, { recursive: true });

  const content = `---
alwaysApply: true
---

Read and follow the agent hub system defined in ${dest}/SKILLS.md.

The agent hub files are located at:
- Main entry: ${dest}/SKILLS.md
- Roles: ${dest}/roles/
- Skills: ${dest}/skills/
- Memory: ${dest}/memory/
- Knowledge base: ${dest}/knowledgebase/
- Logs: ${dest}/logs/

When a user submits a request, act as the orchestrator:
1. Read all role files in ${dest}/roles/ to understand available capabilities.
2. Match the request to the best-fit role.
3. If no match, create a new role using the create-role skill.
4. Log the task to ${dest}/logs/.
5. Update memory in ${dest}/memory/.
`;

  fs.writeFileSync(rulesFile, content);
  console.log(`Cursor rules created at ${rulesFile}`);
}

function help() {
  console.log(`
Agent Hub - Universal Agent Plugin System

Usage:
  agent-hub install <path> [--force]   Install to a local directory
  agent-hub upgrade [path]             Upgrade core files (preserves user data)
  agent-hub list [path]                Show installed files
  agent-hub setup-cursor [path]        Generate Cursor rules in current project
  agent-hub help                       Show this help

Examples:
  npx agent-hub install ~/.agent-hub        # macOS / Linux
  npx agent-hub install %USERPROFILE%\\.agent-hub # Windows
  npx agent-hub upgrade
  npx agent-hub list
  npx agent-hub setup-cursor

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
  const home = path.join(os.homedir(), '.agent-hub');
  if (fs.existsSync(path.join(home, CORE_MANIFEST))) return home;
  return null;
}

// --- Main ---

const [,, cmd, ...args] = process.argv;

switch (cmd) {
  case 'install': {
    const force = args.includes('--force') || args.includes('-f');
    const installPath = args.find(a => !a.startsWith('-'));
    if (!installPath) { console.log('Usage: agent-hub install <path> [--force]'); process.exit(1); }
    install(installPath, force);
    break;
  }
  case 'upgrade':
    upgrade(args[0]);
    break;
  case 'list':
    list(args[0]);
    break;
  case 'setup-cursor':
    setupCursor(args[0]);
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

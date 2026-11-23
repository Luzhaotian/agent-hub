#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const os = require('os');

const TEMPLATES_DIR = path.join(__dirname, 'templates', 'agent-hub');
const CORE_MANIFEST = '.core-manifest.json';
const CONFIG_FILE = 'config.json';
const DEFAULT_INSTALL = path.join(os.homedir(), '.agent-hub');
const PACKAGE_VERSION = require('./package.json').version;

function normalizePath(p) {
  return String(p).replace(/\\/g, '/');
}

function expandHome(p) {
  if (!p) return p;
  if (p.startsWith('~')) {
    return path.join(os.homedir(), p.slice(1).replace(/^[/\\]/, ''));
  }
  return p;
}

function writeConfig(dest) {
  const config = {
    version: PACKAGE_VERSION,
    data_root: dest,
    updated_at: new Date().toISOString()
  };
  fs.writeFileSync(path.join(dest, CONFIG_FILE), JSON.stringify(config, null, 2) + '\n');
  return config;
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
  writeConfig(dest);

  // config.json is install-specific; keep it out of core_files so upgrades never clobber it blindly
  const coreFiles = copiedFiles
    .map(f => normalizePath(f))
    .filter(f => f !== CONFIG_FILE)
    .map(f => ({
      path: f,
      hash: fileHash(path.join(dest, ...f.split('/')))
    }));

  // Ensure config exists in listing for discoverability via list(), but track separately
  const manifest = {
    installed_at: new Date().toISOString(),
    version: PACKAGE_VERSION,
    data_root: dest,
    core_files: coreFiles
  };
  fs.writeFileSync(path.join(dest, CORE_MANIFEST), JSON.stringify(manifest, null, 2) + '\n');

  const linked = registerSkills(dest);
  ensureLogsDir(dest);

  console.log(`Agent Hub installed to ${dest}`);
  console.log(`Registered ${linked} skill(s) in ${claudeSkillsHome()}`);
  console.log('Edit knowledgebase/personal.md to personalize your setup.');
  console.log('Restart your editor, then use /orchestrator to activate.');
}

function ensureLogsDir(dest) {
  fs.mkdirSync(path.join(dest, 'logs'), { recursive: true });
  fs.mkdirSync(path.join(dest, 'mcp'), { recursive: true });
}

function removePath(linkPath) {
  try {
    const stat = fs.lstatSync(linkPath);
    if (stat.isSymbolicLink() || stat.isFile()) {
      fs.unlinkSync(linkPath);
    } else if (stat.isDirectory()) {
      fs.rmSync(linkPath, { recursive: true, force: true });
    }
  } catch (err) {
    if (err.code !== 'ENOENT') throw err;
  }
}

function linkOrCopy(targetPath, linkPath) {
  removePath(linkPath);
  try {
    fs.symlinkSync(targetPath, linkPath, 'junction');
    return 'symlink';
  } catch (symlinkErr) {
    try {
      fs.symlinkSync(targetPath, linkPath, 'dir');
      return 'symlink';
    } catch {
      // Windows without privilege / restricted environments: fall back to copy
      const copied = [];
      fs.mkdirSync(linkPath, { recursive: true });
      copyDir(targetPath, linkPath, copied);
      console.warn(`  warn: symlink failed for ${path.basename(linkPath)}, used copy instead (${symlinkErr.message})`);
      return 'copy';
    }
  }
}

function claudeSkillsHome() {
  if (process.env.AGENT_HUB_SKILLS_DIR) {
    return path.resolve(expandHome(process.env.AGENT_HUB_SKILLS_DIR));
  }
  return path.join(os.homedir(), '.claude', 'skills');
}

function registerSkills(dest) {
  const skillsDir = path.join(dest, 'skills');
  if (!fs.existsSync(skillsDir)) return 0;

  const claudeSkillsDir = claudeSkillsHome();
  fs.mkdirSync(claudeSkillsDir, { recursive: true });

  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory());

  let count = 0;
  for (const dir of skillDirs) {
    const skillFile = path.join(skillsDir, dir.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    const linkPath = path.join(claudeSkillsDir, dir.name);
    const targetPath = path.join(skillsDir, dir.name);
    linkOrCopy(targetPath, linkPath);
    count++;
  }
  return count;
}

function collectTemplateFiles() {
  return walkDir(TEMPLATES_DIR, TEMPLATES_DIR)
    .map(f => normalizePath(f))
    .filter(f => f !== CONFIG_FILE);
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
  let added = 0;
  const changed = [];

  // Update existing core files when template content changed
  for (const entry of manifest.core_files) {
    const src = path.join(TEMPLATES_DIR, ...entry.path.split('/'));
    const dst = path.join(dest, ...entry.path.split('/'));

    if (!fs.existsSync(src)) continue;

    const currentHash = fileHash(src);
    if (currentHash === entry.hash) continue;

    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    entry.hash = currentHash;
    changed.push(entry.path);
    updated++;
  }

  // Add new template files that were not part of the original install
  const known = new Set(manifest.core_files.map(f => f.path));
  for (const rel of collectTemplateFiles()) {
    if (known.has(rel)) continue;

    const src = path.join(TEMPLATES_DIR, ...rel.split('/'));
    const dst = path.join(dest, ...rel.split('/'));

    if (fs.existsSync(dst)) {
      // User (or prior manual copy) already has this path — track as core without overwrite
      manifest.core_files.push({ path: rel, hash: fileHash(dst) });
      known.add(rel);
      continue;
    }

    fs.mkdirSync(path.dirname(dst), { recursive: true });
    fs.copyFileSync(src, dst);
    manifest.core_files.push({ path: rel, hash: fileHash(src) });
    known.add(rel);
    changed.push(rel + ' (new)');
    added++;
  }

  writeConfig(dest);
  ensureLogsDir(dest);

  manifest.version = PACKAGE_VERSION;
  manifest.data_root = dest;
  manifest.last_upgrade = new Date().toISOString();
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');

  // Always re-register so newly added user skills get symlinked too
  const linked = registerSkills(dest);

  if (updated + added > 0) {
    console.log(`Upgraded in ${dest}: ${updated} updated, ${added} added`);
    console.log('Changed:', changed.join(', '));
  } else {
    console.log('Core files are up to date.');
  }
  console.log(`Registered ${linked} skill(s) in ${claudeSkillsHome()}`);
}

function registerCmd(destPath) {
  const dest = destPath ? path.resolve(expandHome(destPath)) : findInstall();
  if (!dest) {
    console.log('No Agent Hub installation found. Use "agent-hub install <path>" first.');
    process.exit(1);
  }
  ensureLogsDir(dest);
  writeConfig(dest);
  const linked = registerSkills(dest);
  console.log(`Registered ${linked} skill(s) from ${dest}`);
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
    if (manifest.version) console.log(`Version: ${manifest.version}`);
    if (manifest.last_upgrade) console.log(`Last upgrade: ${manifest.last_upgrade}`);
    console.log(`\nCore files (${manifest.core_files.length}):`);
    manifest.core_files.forEach(f => console.log(`  ${f.path}`));
  }

  const corePaths = manifest ? manifest.core_files.map(c => c.path) : [];
  console.log('\nUser files:');
  let userCount = 0;
  walkDir(dest, dest).forEach(f => {
    const normalized = normalizePath(f);
    if (normalized === CORE_MANIFEST) return;
    if (corePaths.includes(normalized)) return;
    console.log(`  ${f}`);
    userCount++;
  });
  if (userCount === 0) console.log('  (none)');
}

function parseSkillMeta(content) {
  const meta = { name: '', description: '' };
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return meta;
  for (const line of match[1].split(/\r?\n/)) {
    const m = line.match(/^(\w[\w-]*)\s*:\s*(.*)$/);
    if (!m) continue;
    const key = m[1];
    let val = m[2].trim();
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    if (key === 'name' || key === 'description') meta[key] = val;
  }
  return meta;
}

function toCursorRule(skillName, content) {
  const meta = parseSkillMeta(content);
  const description = meta.description || `Agent Hub skill: ${skillName}`;
  const body = content.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n?/, '');
  return [
    '---',
    `description: ${JSON.stringify(description)}`,
    'alwaysApply: false',
    '---',
    '',
    body.trimStart()
  ].join('\n');
}

function setup(destPath) {
  const dest = destPath ? path.resolve(expandHome(destPath)) : findInstall();
  if (!dest) {
    console.log('No Agent Hub installation found. Use "agent-hub install <path>" first.');
    process.exit(1);
  }

  const skillsDir = path.join(dest, 'skills');
  if (!fs.existsSync(skillsDir)) {
    console.log(`Skills directory not found: ${skillsDir}`);
    process.exit(1);
  }

  const rulesDir = path.join(process.cwd(), '.cursor', 'rules');
  fs.mkdirSync(rulesDir, { recursive: true });

  // Pointer so Cursor rules know where data lives
  const pointer = [
    '---',
    'description: "Agent Hub data root pointer — read before using orchestrator/roles/memory"',
    'alwaysApply: false',
    '---',
    '',
    `# Agent Hub`,
    '',
    `Data root: \`${dest}\``,
    '',
    'All roles, memory, knowledge base, logs, and skills live under this path.',
    'Use absolute paths under the data root. Do not use the current project directory for Agent Hub state.',
    ''
  ].join('\n');
  fs.writeFileSync(path.join(rulesDir, 'agent-hub-root.mdc'), pointer);

  const skillDirs = fs.readdirSync(skillsDir, { withFileTypes: true })
    .filter(d => d.isDirectory());

  let created = 0;
  for (const dir of skillDirs) {
    const skillFile = path.join(skillsDir, dir.name, 'SKILL.md');
    if (!fs.existsSync(skillFile)) continue;

    const content = fs.readFileSync(skillFile, 'utf-8');
    const ruleFile = path.join(rulesDir, `${dir.name}.mdc`);
    fs.writeFileSync(ruleFile, toCursorRule(dir.name, content));
    created++;
  }

  console.log(`Created ${created + 1} rule(s) in ${rulesDir}`);
  console.log('Restart Cursor, then use @rules/orchestrator (or @rules/agent-hub-root) to activate.');
}

function help() {
  console.log(`
Agent Hub - Universal Agent Plugin System

Usage:
  agent-hub install <path> [--force]   Install and register skills globally
  agent-hub upgrade [path]             Upgrade core files + re-register skills
  agent-hub register [path]            Re-register skills (incl. custom ones)
  agent-hub setup [path]               Generate .cursor/rules in current project
  agent-hub list [path]                Show installed files
  agent-hub help                       Show this help

Examples:
  npx agent-hub install ~/.agent-hub
  npx agent-hub upgrade
  npx agent-hub register
  npx agent-hub list

After install, use /orchestrator in Claude Code to activate.
For Cursor, run 'agent-hub setup' in each project, then use @rules/orchestrator.

Data root defaults to ~/.agent-hub. Skills always read/write under that root
(see config.json), not the current project directory.
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
  if (!fs.existsSync(dir)) return results;
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
  if (fs.existsSync(path.join(DEFAULT_INSTALL, CORE_MANIFEST))) return DEFAULT_INSTALL;
  return null;
}

// --- Main ---

function main() {
  const [, , cmd, ...args] = process.argv;

  switch (cmd) {
    case 'install': {
      const force = args.includes('--force') || args.includes('-f');
      const installPath = args.find(a => !a.startsWith('-'));
      if (!installPath) {
        console.log('Usage: agent-hub install <path> [--force]');
        process.exit(1);
      }
      install(installPath, force);
      break;
    }
    case 'upgrade':
      upgrade(args[0]);
      break;
    case 'register':
      registerCmd(args[0]);
      break;
    case 'list':
      list(args[0]);
      break;
    case 'setup':
      setup(args[0]);
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
}

if (require.main === module) {
  main();
}

module.exports = {
  normalizePath,
  expandHome,
  fileHash,
  parseSkillMeta,
  toCursorRule,
  collectTemplateFiles,
  TEMPLATES_DIR,
  DEFAULT_INSTALL,
  CORE_MANIFEST,
  CONFIG_FILE,
  claudeSkillsHome
};

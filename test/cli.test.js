#!/usr/bin/env node

const assert = require('assert');
const fs = require('fs');
const os = require('os');
const path = require('path');
const {
  normalizePath,
  expandHome,
  fileHash,
  parseSkillMeta,
  toCursorRule,
  collectTemplateFiles,
  TEMPLATES_DIR,
  CONFIG_FILE
} = require('../cli.js');

function test(name, fn) {
  try {
    fn();
    console.log(`ok - ${name}`);
  } catch (err) {
    console.error(`fail - ${name}`);
    console.error(err);
    process.exitCode = 1;
  }
}

test('normalizePath uses forward slashes', () => {
  assert.strictEqual(normalizePath('a\\b\\c'), 'a/b/c');
  assert.strictEqual(normalizePath('a/b/c'), 'a/b/c');
});

test('expandHome expands tilde', () => {
  const expanded = expandHome('~/.agent-hub');
  assert.strictEqual(expanded, path.join(os.homedir(), '.agent-hub'));
});

test('fileHash is stable for same content', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-hub-'));
  const file = path.join(dir, 'a.txt');
  fs.writeFileSync(file, 'hello');
  assert.strictEqual(fileHash(file), fileHash(file));
});

test('fileHash changes when content changes', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-hub-'));
  const a = path.join(dir, 'a.txt');
  const b = path.join(dir, 'b.txt');
  fs.writeFileSync(a, 'one');
  fs.writeFileSync(b, 'two');
  assert.notStrictEqual(fileHash(a), fileHash(b));
});

test('parseSkillMeta reads frontmatter', () => {
  const meta = parseSkillMeta(`---
name: find-skill
description: "技能发现与安装"
disable-model-invocation: false
---

body
`);
  assert.strictEqual(meta.name, 'find-skill');
  assert.ok(meta.description.includes('技能发现'));
});

test('toCursorRule emits Cursor frontmatter', () => {
  const out = toCursorRule('orchestrator', `---
name: orchestrator
description: "智能体编排者"
---

You are the orchestrator.
`);
  assert.ok(out.startsWith('---\n'));
  assert.ok(out.includes('alwaysApply: false'));
  assert.ok(out.includes('You are the orchestrator.'));
  assert.ok(!out.includes('disable-model-invocation'));
});

test('templates include find-skill and logs', () => {
  const files = collectTemplateFiles();
  assert.ok(files.includes('skills/find-skill/SKILL.md'), 'missing find-skill');
  assert.ok(files.includes('skills/orchestrator/SKILL.md'));
  assert.ok(files.some(f => f.startsWith('logs/')), 'missing logs in templates');
  assert.ok(files.includes('mcp/README.md'));
  assert.ok(fs.existsSync(path.join(TEMPLATES_DIR, 'roles', 'orchestrator.yaml')));
  const role = fs.readFileSync(path.join(TEMPLATES_DIR, 'roles', 'orchestrator.yaml'), 'utf-8');
  assert.ok(role.includes('find-skill'));
});

test('template config.json exists as placeholder', () => {
  assert.ok(fs.existsSync(path.join(TEMPLATES_DIR, CONFIG_FILE)));
});

test('install → upgrade adds new core file + register path helpers', () => {
  const { execFileSync } = require('child_process');
  const cli = path.join(__dirname, '..', 'cli.js');
  const dest = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-hub-install-'));
  const skillsReg = fs.mkdtempSync(path.join(os.tmpdir(), 'agent-hub-skills-'));
  const env = { ...process.env, AGENT_HUB_SKILLS_DIR: skillsReg };

  execFileSync(process.execPath, [cli, 'install', dest], { stdio: 'pipe', env });
  assert.ok(fs.existsSync(path.join(dest, '.core-manifest.json')));
  assert.ok(fs.existsSync(path.join(dest, 'config.json')));
  const config = JSON.parse(fs.readFileSync(path.join(dest, 'config.json'), 'utf-8'));
  assert.strictEqual(config.data_root, dest);
  assert.ok(fs.existsSync(path.join(dest, 'skills', 'find-skill', 'SKILL.md')));
  assert.ok(fs.existsSync(path.join(dest, 'logs')));
  assert.ok(fs.existsSync(path.join(skillsReg, 'orchestrator')));

  const manifestBefore = JSON.parse(fs.readFileSync(path.join(dest, '.core-manifest.json'), 'utf-8'));
  // Simulate an older install missing a newly added template file
  manifestBefore.core_files = manifestBefore.core_files.filter(
    f => f.path !== 'skills/find-skill/SKILL.md'
  );
  fs.rmSync(path.join(dest, 'skills', 'find-skill'), { recursive: true, force: true });
  fs.writeFileSync(path.join(dest, '.core-manifest.json'), JSON.stringify(manifestBefore, null, 2));

  execFileSync(process.execPath, [cli, 'upgrade', dest], { stdio: 'pipe', env });
  assert.ok(fs.existsSync(path.join(dest, 'skills', 'find-skill', 'SKILL.md')), 'upgrade should add find-skill');
  const manifestAfter = JSON.parse(fs.readFileSync(path.join(dest, '.core-manifest.json'), 'utf-8'));
  assert.ok(manifestAfter.core_files.some(f => f.path === 'skills/find-skill/SKILL.md'));

  execFileSync(process.execPath, [cli, 'register', dest], { stdio: 'pipe', env });
  assert.ok(fs.existsSync(path.join(skillsReg, 'find-skill')));
});

if (!process.exitCode) {
  console.log('\nAll tests passed.');
}

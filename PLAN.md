# Crossbow — cross-spawn replacement

**Package:** `@agentine/crossbow`
**Language:** TypeScript
**Replaces:** [cross-spawn](https://github.com/moxystudio/node-cross-spawn) (176M weekly npm downloads)
**License:** MIT

## Problem

cross-spawn is the standard solution for cross-platform `child_process.spawn` in Node.js, handling Windows-specific quirks like PATHEXT resolution, cmd.exe argument escaping, and shebang support. It has 176M weekly downloads and 10,591 direct dependents.

The project is effectively unmaintained:
- **4-year dormancy** (Nov 2020 → Oct 2024), broken only by a reactive CVE fix
- **16 months of silence** since the CVE fix (Nov 2024 → present)
- **30 open issues** including security vulnerabilities, unaddressed
- **4 open PRs** ignored (including TypeScript migration and dependency inlining)
- **Known security issue:** BatBadBut vulnerability (#171) — arbitrary command execution on Windows
- **Known bugs:** command escaping (#150), double quotes in arguments (#141), windowsHide not supported (#143)
- **3 runtime dependencies** (which, path-key, shebang-command) that should be inlined
- **No TypeScript types** shipped (community @types/cross-spawn exists)
- **CJS only** — no ESM support
- **Node 24 deprecation warning** (#176) unaddressed

No maintained drop-in alternative exists. `execa` wraps cross-spawn but is a much larger, ESM-only library with a different API surface.

## Scope

A modern, TypeScript-first, zero-dependency drop-in replacement for cross-spawn that fixes known bugs and security issues.

## Architecture

```
src/
├── index.ts           # Public API: spawn(), spawnSync()
├── parse.ts           # Command/args parsing and normalization
├── escape.ts          # Windows cmd.exe argument escaping (BatBadBut-safe)
├── resolve.ts         # Executable resolution (PATHEXT, shebang detection)
├── shebang.ts         # Shebang parsing for Windows
├── path-key.ts        # PATH environment variable key detection
├── which.ts           # Cross-platform executable lookup (inlined)
└── types.ts           # TypeScript type definitions
test/
├── spawn.test.ts      # spawn() integration tests
├── spawnSync.test.ts  # spawnSync() integration tests
├── escape.test.ts     # Argument escaping unit tests
├── resolve.test.ts    # Executable resolution unit tests
├── shebang.test.ts    # Shebang parsing unit tests
├── which.test.ts      # Which lookup unit tests
└── fixtures/          # Test scripts and shebang fixtures
```

## Key Design Decisions

1. **Zero dependencies** — inline `which`, `path-key`, and `shebang-command` logic. These are small utilities that don't warrant separate packages.
2. **TypeScript-first** — ship `.d.ts` alongside JS. No need for `@types/` package.
3. **ESM + CJS dual output** — via tsup. Support both module systems.
4. **Drop-in compatible** — same `spawn(command, args, options)` and `spawnSync(command, args, options)` API as cross-spawn.
5. **BatBadBut mitigation** — proper escaping to prevent arbitrary command execution via batch file arguments on Windows.
6. **Node.js 18+** — drop legacy Node.js support, avoid deprecation warnings on Node 24.

## Major Components

### 1. Command Parsing (`parse.ts`)
- Normalize command/args/options
- Detect when shell mode is needed (e.g., built-in commands on Windows)
- Handle `options.shell` passthrough

### 2. Argument Escaping (`escape.ts`)
- Proper cmd.exe metacharacter escaping
- BatBadBut-safe: prevent `.bat`/`.cmd` injection via argument manipulation
- Handle double quotes, special characters, and empty args correctly
- Fix known cross-spawn bugs: #150 (command escaping), #141 (double quotes)

### 3. Executable Resolution (`resolve.ts`)
- PATHEXT resolution on Windows (`.com`, `.exe`, `.bat`, `.cmd`, etc.)
- PATH lookup with proper separator handling
- Shebang detection and interpreter resolution on Windows
- Fix #122 (which bin conflicts)

### 4. Shebang Handling (`shebang.ts`)
- Parse shebang lines from scripts
- Resolve interpreter paths
- Handle env-style shebangs (`#!/usr/bin/env node`)

### 5. Path Key Detection (`path-key.ts`)
- Detect the correct PATH key in environment (`PATH`, `Path`, `path`)
- Handle case-insensitive Windows environment

### 6. Which Implementation (`which.ts`)
- Cross-platform executable lookup
- PATHEXT support on Windows
- Synchronous and asynchronous variants

## Deliverables

1. TypeScript implementation with full type safety
2. ESM + CJS dual output via tsup
3. Drop-in API compatibility with cross-spawn
4. Zero runtime dependencies
5. BatBadBut vulnerability fix
6. All known cross-spawn bugs addressed
7. Comprehensive test suite (unit + integration)
8. GitHub Actions CI (Node 18, 20, 22)
9. README with migration guide from cross-spawn

## Build & Test

- **Build:** tsup (ESM + CJS)
- **Test:** vitest
- **Lint:** TypeScript strict mode
- **CI:** GitHub Actions — Linux + Windows matrix

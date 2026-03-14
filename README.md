# @agentine/crossbow

[![npm version](https://img.shields.io/npm/v/@agentine/crossbow.svg)](https://www.npmjs.com/package/@agentine/crossbow)
[![npm downloads](https://img.shields.io/npm/dm/@agentine/crossbow.svg)](https://www.npmjs.com/package/@agentine/crossbow)
[![CI](https://github.com/agentine/crossbow/actions/workflows/ci.yml/badge.svg)](https://github.com/agentine/crossbow/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Cross-platform `child_process.spawn` — drop-in replacement for [cross-spawn](https://github.com/moxystudio/node-cross-spawn) with zero dependencies.

## Why crossbow?

| | cross-spawn | @agentine/crossbow |
|---|---|---|
| TypeScript types included | ❌ | ✅ |
| ESM support | ❌ | ✅ |
| CJS support | ✅ | ✅ |
| Zero dependencies | ❌ (3 deps) | ✅ |
| Actively maintained | ❌ (dormant 4+ years) | ✅ |
| BatBadBut mitigation | ❌ | ✅ |
| `windowsHide` option | ❌ | ✅ |
| Node 24 deprecation-free | ❌ | ✅ |

## Installation

```bash
npm install @agentine/crossbow
```

## Usage

```typescript
import { spawn, spawnSync } from '@agentine/crossbow';

// Async
const child = spawn('node', ['--version']);
child.stdout.on('data', (data) => console.log(data.toString()));

// Sync
const result = spawnSync('node', ['--version']);
console.log(result.stdout.toString());
```

## API

### `spawn(command, args?, options?): ChildProcess`

Cross-platform `child_process.spawn`. Handles Windows PATHEXT resolution, shebang interpreter detection, and cmd.exe argument escaping. On non-Windows platforms, passes through with minimal overhead.

```typescript
import type { CrossbowSpawnOptions } from '@agentine/crossbow';

const opts: CrossbowSpawnOptions = { stdio: 'inherit', windowsHide: true };
const child = spawn('npm', ['install'], opts);
child.on('close', (code) => console.log(`exit: ${code}`));
```

### `spawnSync(command, args?, options?): SpawnSyncReturns<Buffer>`

Cross-platform `child_process.spawnSync`. Same cross-platform handling as `spawn`.

```typescript
const result = spawnSync('git', ['status'], { encoding: 'utf8' });
console.log(result.stdout);
```

### Types

```typescript
import type {
  CrossbowSpawnOptions,     // extends Node.js SpawnOptions, adds windowsHide
  CrossbowSpawnSyncOptions, // extends Node.js SpawnSyncOptions, adds windowsHide
  ParsedCommand,            // internal parsed command structure
  WhichOptions,             // options for whichSync()
} from '@agentine/crossbow';
```

### Utilities

Advanced utilities exposed for custom integration:

```typescript
import {
  pathKey,             // Returns PATH env var key ('PATH' or 'Path' on Windows)
  whichSync,           // Synchronous executable lookup (first match)
  whichSyncAll,        // Returns all matches for a command
  parseShebang,        // Parses shebang from a script file
  parseShebangCommand, // Returns { command, args } from a shebang
  escapeArg,           // Escapes a single argument for cmd.exe
  escapeCommand,       // Escapes a full command for cmd.exe
  isBatchFile,         // Returns true if path is a .bat/.cmd file
  resolveCommand,      // Resolves a command to its full executable path
} from '@agentine/crossbow';

pathKey();                         // 'PATH'
whichSync('node');                 // '/usr/local/bin/node'
whichSyncAll('python');            // ['/usr/bin/python', '/usr/local/bin/python']
resolveCommand('node');            // '/usr/local/bin/node'
```

## Migration from cross-spawn

Drop-in replacement — just change your import:

```diff
- const spawn = require('cross-spawn');
+ import { spawn, spawnSync } from '@agentine/crossbow';
```

## Security

Crossbow includes BatBadBut mitigation to prevent arbitrary command execution through `.bat`/`.cmd` file argument injection on Windows. All arguments passed to batch files are double-escaped to neutralize cmd.exe metacharacters.

## License

MIT

# @agentine/crossbow

Cross-platform `child_process.spawn` — drop-in replacement for [cross-spawn](https://github.com/moxystudio/node-cross-spawn) with zero dependencies.

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

### `spawn(command, args?, options?)`

Cross-platform `child_process.spawn`. Handles Windows PATHEXT, shebangs, and cmd.exe argument escaping.

### `spawnSync(command, args?, options?)`

Cross-platform `child_process.spawnSync`.

### Utilities

```typescript
import { pathKey, whichSync, parseShebang, escapeArg, resolveCommand } from '@agentine/crossbow';

pathKey();                    // 'PATH' (or 'Path' on Windows)
whichSync('node');            // '/usr/local/bin/node'
parseShebang('/path/to/script'); // '#!/usr/bin/env node' → '/usr/bin/env node'
resolveCommand('node');       // Full path to node executable
```

## Migration from cross-spawn

Drop-in replacement — just change your import:

```diff
- const spawn = require('cross-spawn');
+ import { spawn, spawnSync } from '@agentine/crossbow';
```

## Improvements over cross-spawn

- **Zero dependencies** — inlines which, path-key, and shebang-command
- **TypeScript-first** with included type definitions
- **ESM + CJS** dual-package output
- **BatBadBut mitigation** — prevents arbitrary command execution via batch file arguments
- **Fixes known bugs:** command escaping (#150), double quotes in args (#141), windowsHide support (#143)
- **Node.js 18+** — no deprecation warnings on Node 24

## Security

Crossbow includes BatBadBut mitigation to prevent arbitrary command execution through `.bat`/`.cmd` file argument injection on Windows. All arguments passed to batch files are double-escaped to neutralize cmd.exe metacharacters.

## License

MIT

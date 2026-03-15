# @agentine/crossbow

[![npm version](https://img.shields.io/npm/v/@agentine/crossbow.svg)](https://www.npmjs.com/package/@agentine/crossbow)
[![npm downloads](https://img.shields.io/npm/dm/@agentine/crossbow.svg)](https://www.npmjs.com/package/@agentine/crossbow)
[![CI](https://github.com/agentine/crossbow/actions/workflows/ci.yml/badge.svg)](https://github.com/agentine/crossbow/actions)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-ready-blue.svg)](https://www.typescriptlang.org/)

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
| Windows built-in commands | ❌ | ✅ |

## Requirements

- Node.js **18 or later**

## Installation

```bash
npm install @agentine/crossbow
```

## Usage

```typescript
import { spawn, spawnSync } from '@agentine/crossbow';

// Async — stream output
const child = spawn('node', ['--version']);
child.stdout?.on('data', (data) => console.log(data.toString()));
child.on('close', (code) => console.log(`exit: ${code}`));

// Sync — capture output
const result = spawnSync('node', ['--version']);
console.log(result.stdout.toString()); // 'v22.0.0\n'

// CommonJS
const { spawn, spawnSync } = require('@agentine/crossbow');
```

## API

### `spawn(command, args?, options?): ChildProcess`

Cross-platform `child_process.spawn`. On Windows, handles PATHEXT resolution, shebang interpreter detection, cmd.exe argument escaping, and Windows built-in commands. On macOS/Linux, passes through to `child_process.spawn` with minimal overhead.

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | `string` | Executable name or path |
| `args` | `readonly string[]` | Arguments to pass (optional) |
| `options` | `CrossbowSpawnOptions` | Spawn options (optional) |

Returns a `ChildProcess` — identical to `child_process.spawn`.

```typescript
import type { CrossbowSpawnOptions } from '@agentine/crossbow';

const opts: CrossbowSpawnOptions = { stdio: 'inherit', windowsHide: true };
const child = spawn('npm', ['install'], opts);
child.on('close', (code) => console.log(`exit: ${code}`));
```

### `spawnSync(command, args?, options?): SpawnSyncReturns<Buffer>`

Cross-platform `child_process.spawnSync`. Same cross-platform handling as `spawn`.

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | `string` | Executable name or path |
| `args` | `readonly string[]` | Arguments to pass (optional) |
| `options` | `CrossbowSpawnSyncOptions` | Spawn options (optional) |

Returns `SpawnSyncReturns<Buffer>` — identical to `child_process.spawnSync`.

```typescript
const result = spawnSync('git', ['status'], { encoding: 'utf8' });
if (result.status !== 0) {
  console.error(result.stderr);
} else {
  console.log(result.stdout);
}
```

### Types

```typescript
import type {
  CrossbowSpawnOptions,     // extends Node.js SpawnOptions — adds windowsHide
  CrossbowSpawnSyncOptions, // extends Node.js SpawnSyncOptions — adds windowsHide
  ParsedCommand,            // internal parsed command structure
  WhichOptions,             // options for whichSync() / whichSyncAll()
} from '@agentine/crossbow';
```

#### `CrossbowSpawnOptions` / `CrossbowSpawnSyncOptions`

Extends the standard Node.js `SpawnOptions` / `SpawnSyncOptions` with one additional property:

| Property | Type | Description |
|----------|------|-------------|
| `windowsHide` | `boolean` | Hide the spawned subprocess console window on Windows (fixes cross-spawn [#143](https://github.com/moxystudio/node-cross-spawn/issues/143)) |

All other `SpawnOptions` / `SpawnSyncOptions` properties are supported unchanged.

#### `WhichOptions`

| Property | Type | Description |
|----------|------|-------------|
| `path` | `string` | Custom PATH string to search instead of `process.env.PATH` |
| `pathExt` | `string` | Custom PATHEXT (Windows only) — semicolon-separated extensions |
| `all` | `boolean` | If `true`, return all matches (used internally by `whichSyncAll`) |

### Utilities

Advanced utilities exported for custom integration:

```typescript
import {
  pathKey,             // Returns the PATH env key ('PATH' or 'Path' on Windows)
  whichSync,           // Find an executable in PATH (first match)
  whichSyncAll,        // Find all matching executables in PATH
  parseShebang,        // Read the shebang line from a file
  parseShebangCommand, // Parse a shebang string into { command, args }
  escapeArg,           // Escape a single argument for cmd.exe
  escapeCommand,       // Escape the command itself for cmd.exe
  isBatchFile,         // Returns true if path ends in .bat or .cmd
  resolveCommand,      // Resolve a command to its full path
} from '@agentine/crossbow';
```

#### `pathKey(env?): string`

Returns the correct PATH key for the given environment. On Windows, the key may be `PATH`, `Path`, or `path` (case-insensitive lookup). On all other platforms, returns `"PATH"`.

```typescript
pathKey();                        // 'PATH'
pathKey({ Path: 'C:\\Windows' }); // 'Path' (Windows)
```

#### `whichSync(cmd, options?): string | null`

Find an executable in PATH. Returns the full resolved path or `null` if not found. If `cmd` contains a path separator, resolves it directly without PATH search.

```typescript
whichSync('node');                        // '/usr/local/bin/node'
whichSync('node', { path: '/usr/bin' });  // '/usr/bin/node'
whichSync('nonexistent');                 // null
```

#### `whichSyncAll(cmd, options?): string[]`

Find all matching executables in PATH. Returns every match across all PATH directories. Useful when multiple versions of a command are installed.

```typescript
whichSyncAll('python'); // ['/usr/bin/python', '/usr/local/bin/python']
whichSyncAll('node');   // ['/usr/local/bin/node']
```

#### `parseShebang(file): string | null`

Read the shebang line from a file. Returns the interpreter string (everything after `#!`) or `null` if no shebang is present.

```typescript
parseShebang('/usr/local/bin/ts-node'); // '/usr/bin/env ts-node'
parseShebang('/usr/bin/node');          // null
```

#### `parseShebangCommand(shebang): { command: string; args: string[] } | null`

Parse a shebang string into its command and optional arguments. Handles `env`-style shebangs.

```typescript
parseShebangCommand('/usr/bin/env node');        // { command: 'node', args: [] }
parseShebangCommand('/usr/bin/env ts-node -T');  // { command: 'ts-node', args: ['-T'] }
parseShebangCommand('/usr/bin/python3');         // { command: '/usr/bin/python3', args: [] }
```

#### `escapeArg(arg, doubleEscape): string`

Escape a single argument for cmd.exe. Handles cmd metacharacters and wraps in quotes when necessary.

| Parameter | Type | Description |
|-----------|------|-------------|
| `arg` | `string` | The argument to escape |
| `doubleEscape` | `boolean` | Apply extra escaping for `.bat`/`.cmd` files (BatBadBut mitigation) |

```typescript
escapeArg('hello world', false);  // '"hello world"'
escapeArg('file.txt', false);     // 'file.txt'
escapeArg('a&b', true);           // '"a^&b"'  (metachar escaped before quoting)
```

#### `escapeCommand(command): string`

Escape a command string for cmd.exe. Wraps in double quotes if the command contains spaces or metacharacters.

```typescript
escapeCommand('node');              // 'node'
escapeCommand('C:\\My Tools\\run'); // '"C:\\My Tools\\run"'
```

#### `isBatchFile(file): boolean`

Returns `true` if the file path ends in `.bat` or `.cmd` (case-insensitive).

```typescript
isBatchFile('script.bat');   // true
isBatchFile('script.CMD');   // true
isBatchFile('script.sh');    // false
```

#### `resolveCommand(command, env?): string | null`

Resolve a command name to its full path. On Windows, also detects shebang interpreters and returns the interpreter path. Returns `null` if the command cannot be found.

```typescript
resolveCommand('node');   // '/usr/local/bin/node'
resolveCommand('npm');    // '/usr/local/bin/npm'
resolveCommand('ghost');  // null
```

## Platform Compatibility

### Windows

Crossbow handles the full range of Windows-specific quirks automatically:

- **PATHEXT resolution** — tries each extension in `PATHEXT` (`.COM`, `.EXE`, `.BAT`, `.CMD`, etc.) when looking up a command
- **Shebang detection** — reads the `#!` line from script files to find the correct interpreter
- **Batch file routing** — `.bat`/`.cmd` files are automatically run through `cmd.exe /d /s /c` with proper escaping
- **Built-in commands** — Windows shell built-ins (`dir`, `echo`, `copy`, `del`, `mkdir`, etc.) are automatically routed through `cmd.exe`
- **COMSPEC** — uses the `COMSPEC` environment variable to locate `cmd.exe` (falls back to `cmd.exe`)
- **Argument escaping** — correctly escapes arguments for `cmd.exe`, including metacharacters (`(`, `)`, `%`, `!`, `^`, `"`, `<`, `>`, `&`, `|`)
- **windowsHide** — supports the `windowsHide` option to suppress console windows for spawned subprocesses

### macOS / Linux

On non-Windows platforms, crossbow passes commands directly to `child_process.spawn` / `child_process.spawnSync` with no transformation. There is no measurable overhead compared to calling Node.js directly.

## Migration from cross-spawn

crossbow is a drop-in replacement. Change your import and you're done:

```diff
- const { spawn, spawnSync } = require('cross-spawn');
+ import { spawn, spawnSync } from '@agentine/crossbow';
```

Or with CommonJS:

```diff
- const { spawn, spawnSync } = require('cross-spawn');
+ const { spawn, spawnSync } = require('@agentine/crossbow');
```

All function signatures are identical to cross-spawn. No other changes required.

## Security

### BatBadBut Mitigation

Crossbow prevents the [BatBadBut](https://flatt.tech/research/posts/batbadbut-you-cant-securely-execute-commands-on-windows/) vulnerability — a class of argument injection attacks against `.bat` and `.cmd` files on Windows.

When a resolved command is a batch file, crossbow applies **double-escaping**: cmd.exe metacharacters (`(`, `)`, `%`, `!`, `^`, `"`, `<`, `>`, `&`, `|`) are escaped with `^` before the argument is wrapped in double quotes. This prevents user-supplied input from breaking out of the argument and executing arbitrary cmd.exe commands.

cross-spawn does not implement this mitigation.

### General Recommendations

- Avoid passing unsanitized user input as command arguments on any platform.
- Use `stdio: 'pipe'` or `stdio: 'inherit'` rather than `shell: true` — crossbow handles shell routing internally for batch files and built-ins.
- On Windows, prefer specifying the full path to executables when security is critical, rather than relying on PATH resolution.

## License

MIT

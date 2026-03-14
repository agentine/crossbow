# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.1.0] - 2026-03-14

### Added

- `spawn(command, args?, options?)` — cross-platform `child_process.spawn` drop-in replacement
- `spawnSync(command, args?, options?)` — cross-platform `child_process.spawnSync` drop-in replacement
- TypeScript types included (`CrossbowSpawnOptions`, `CrossbowSpawnSyncOptions`, `ParsedCommand`, `WhichOptions`)
- ESM + CJS dual-package output
- Zero runtime dependencies (inlines `which`, `path-key`, `shebang-command` logic)
- BatBadBut mitigation — prevents arbitrary command execution via `.bat`/`.cmd` argument injection on Windows
- `windowsHide` option support (fixes cross-spawn #143)
- Correct cmd.exe argument escaping (fixes cross-spawn #150, #141)
- Node.js 18+ support with no deprecation warnings on Node 24
- Exported utilities: `pathKey`, `whichSync`, `whichSyncAll`, `parseShebang`, `parseShebangCommand`, `escapeArg`, `escapeCommand`, `isBatchFile`, `resolveCommand`
- Comprehensive test suite: spawn, spawnSync, escape, resolve, shebang, and which

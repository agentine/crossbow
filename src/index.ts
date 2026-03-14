import {
  spawn as nodeSpawn,
  spawnSync as nodeSpawnSync,
  type ChildProcess,
  type SpawnSyncReturns,
} from "node:child_process";
import type { CrossbowSpawnOptions, CrossbowSpawnSyncOptions } from "./types.js";
import { parse } from "./parse.js";

/**
 * Cross-platform spawn. Drop-in replacement for child_process.spawn
 * that handles Windows-specific quirks (PATHEXT, shebangs, cmd.exe escaping).
 *
 * On non-Windows platforms, passes through to child_process.spawn with minimal overhead.
 */
export function spawn(
  command: string,
  args?: readonly string[],
  options?: CrossbowSpawnOptions,
): ChildProcess {
  const parsed = parse(command, args ? [...args] : [], options ?? {});
  return nodeSpawn(parsed.command, parsed.args, parsed.options);
}

/**
 * Cross-platform spawnSync. Drop-in replacement for child_process.spawnSync
 * that handles Windows-specific quirks.
 */
export function spawnSync(
  command: string,
  args?: readonly string[],
  options?: CrossbowSpawnSyncOptions,
): SpawnSyncReturns<Buffer> {
  const parsed = parse(command, args ? [...args] : [], options ?? {});
  const result = nodeSpawnSync(parsed.command, parsed.args, parsed.options as CrossbowSpawnSyncOptions);
  return result as SpawnSyncReturns<Buffer>;
}

// Re-export types
export type { CrossbowSpawnOptions, CrossbowSpawnSyncOptions, ParsedCommand, WhichOptions } from "./types.js";

// Re-export utilities for advanced usage
export { pathKey } from "./path-key.js";
export { whichSync, whichSyncAll } from "./which.js";
export { parseShebang, parseShebangCommand } from "./shebang.js";
export { escapeArg, escapeCommand, isBatchFile } from "./escape.js";
export { resolveCommand } from "./resolve.js";

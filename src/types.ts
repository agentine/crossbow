import type { SpawnOptions, SpawnSyncOptions } from "node:child_process";

/** Options for crossbow spawn (extends Node.js SpawnOptions) */
export interface CrossbowSpawnOptions extends SpawnOptions {
  /** Enable windowsHide (fix cross-spawn #143) */
  windowsHide?: boolean;
}

/** Options for crossbow spawnSync (extends Node.js SpawnSyncOptions) */
export interface CrossbowSpawnSyncOptions extends SpawnSyncOptions {
  /** Enable windowsHide (fix cross-spawn #143) */
  windowsHide?: boolean;
}

/** Parsed command ready for child_process */
export interface ParsedCommand {
  command: string;
  args: string[];
  options: SpawnOptions | SpawnSyncOptions;
  /** Original unresolved command */
  original: string;
}

/** Options for which() */
export interface WhichOptions {
  /** Custom PATH to search */
  path?: string;
  /** Custom PATHEXT (Windows only) */
  pathExt?: string;
  /** Return all matches, not just the first */
  all?: boolean;
}

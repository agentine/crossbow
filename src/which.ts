import { existsSync, statSync } from "node:fs";
import { join, delimiter, resolve } from "node:path";
import type { WhichOptions } from "./types.js";
import { pathKey } from "./path-key.js";

const isWindows = process.platform === "win32";

function getPathDirs(options?: WhichOptions): string[] {
  const key = pathKey();
  const pathValue = options?.path ?? process.env[key] ?? "";
  return pathValue.split(delimiter).filter(Boolean);
}

function getPathExt(options?: WhichOptions): string[] {
  if (!isWindows) return [""];
  const ext = options?.pathExt ?? process.env["PATHEXT"] ?? ".COM;.EXE;.BAT;.CMD;.VBS;.VBE;.JS;.JSE;.WSF;.WSH;.MSC";
  return ext.split(";").filter(Boolean).map(e => e.toLowerCase());
}

function isExecutable(file: string): boolean {
  try {
    const stats = statSync(file);
    if (!stats.isFile()) return false;
    if (isWindows) return true;
    // On Unix, check execute permission
    const mode = stats.mode;
    const uid = process.getuid?.();
    const gid = process.getgid?.();
    if (uid === 0) return true; // root can execute anything
    if (uid === stats.uid) return (mode & 0o100) !== 0;
    if (gid === stats.gid) return (mode & 0o010) !== 0;
    return (mode & 0o001) !== 0;
  } catch {
    return false;
  }
}

/**
 * Find an executable in PATH (synchronous).
 * Returns the full path to the executable, or null if not found.
 */
export function whichSync(cmd: string, options?: WhichOptions): string | null {
  // If command has a path separator, resolve it directly
  if (cmd.includes("/") || (isWindows && cmd.includes("\\"))) {
    const resolved = resolve(cmd);
    const exts = getPathExt(options);
    for (const ext of exts) {
      const full = ext ? resolved + ext : resolved;
      if (existsSync(full) && isExecutable(full)) return full;
    }
    return isExecutable(resolved) ? resolved : null;
  }

  const dirs = getPathDirs(options);
  const exts = getPathExt(options);
  const results: string[] = [];

  for (const dir of dirs) {
    for (const ext of exts) {
      const full = join(dir, cmd + ext);
      if (existsSync(full) && isExecutable(full)) {
        if (!options?.all) return full;
        results.push(full);
      }
    }
    // On non-Windows, also try without extension
    if (!isWindows) {
      const full = join(dir, cmd);
      if (existsSync(full) && isExecutable(full)) {
        if (!options?.all) return full;
        if (!results.includes(full)) results.push(full);
      }
    }
  }

  return results.length > 0 ? results[0]! : null;
}

/**
 * Find all matching executables in PATH (synchronous).
 */
export function whichSyncAll(cmd: string, options?: WhichOptions): string[] {
  const dirs = getPathDirs(options);
  const exts = getPathExt(options);
  const results: string[] = [];

  for (const dir of dirs) {
    for (const ext of exts) {
      const full = join(dir, cmd + ext);
      if (existsSync(full) && isExecutable(full)) {
        results.push(full);
      }
    }
  }

  return results;
}

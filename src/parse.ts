import type { SpawnOptions, SpawnSyncOptions } from "node:child_process";
import type { ParsedCommand } from "./types.js";
import { resolveCommandWithShebang } from "./resolve.js";
import { escapeArg, escapeCommand, isBatchFile } from "./escape.js";
import { pathKey } from "./path-key.js";

const isWindows = process.platform === "win32";

/** Windows built-in commands that require shell */
const WIN_BUILTINS = new Set([
  "assoc", "break", "call", "cd", "chdir", "cls", "color", "copy",
  "date", "del", "dir", "echo", "endlocal", "erase", "exit", "for",
  "ftype", "goto", "if", "md", "mkdir", "mklink", "move", "path",
  "pause", "popd", "prompt", "pushd", "rd", "rem", "ren", "rename",
  "rmdir", "set", "setlocal", "shift", "start", "time", "title",
  "type", "ver", "vol",
]);

function isBuiltinCommand(command: string): boolean {
  return WIN_BUILTINS.has(command.toLowerCase());
}

/**
 * Parse and normalize a command for cross-platform execution.
 */
export function parse(
  command: string,
  args: string[],
  options: SpawnOptions | SpawnSyncOptions,
): ParsedCommand {
  const opts = { ...options };
  const env = opts.env ?? process.env;

  // If shell is explicitly set, pass through with minimal processing
  if (opts.shell) {
    return { command, args, options: opts, original: command };
  }

  // On non-Windows, pass through directly
  if (!isWindows) {
    return { command, args, options: opts, original: command };
  }

  // --- Windows-specific handling ---

  // Check for built-in commands that need shell
  if (isBuiltinCommand(command)) {
    return {
      command: env["COMSPEC"] ?? "cmd.exe",
      args: ["/d", "/s", "/c", escapeCommand(command), ...args.map(a => escapeArg(a, false))],
      options: { ...opts, windowsVerbatimArguments: true },
      original: command,
    };
  }

  // Resolve the command
  const resolved = resolveCommandWithShebang(command, env);

  if (!resolved) {
    // Command not found — let child_process handle the error
    return { command, args, options: opts, original: command };
  }

  const resolvedFile = resolved.file;
  let finalArgs = [...resolved.args, ...args];

  // Handle batch files — must be run through cmd.exe
  if (isBatchFile(resolvedFile)) {
    const pk = pathKey(env);
    return {
      command: env["COMSPEC"] ?? "cmd.exe",
      args: [
        "/d", "/s", "/c",
        escapeCommand(resolvedFile),
        ...finalArgs.map(a => escapeArg(a, true)),
      ],
      options: {
        ...opts,
        env: { ...env, [pk]: env[pk] ?? "" },
        windowsVerbatimArguments: true,
      },
      original: command,
    };
  }

  return {
    command: resolvedFile,
    args: finalArgs,
    options: opts,
    original: command,
  };
}

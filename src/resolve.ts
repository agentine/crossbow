import { whichSync } from "./which.js";
import { parseShebang, parseShebangCommand } from "./shebang.js";
import { pathKey } from "./path-key.js";

const isWindows = process.platform === "win32";

/**
 * Resolve a command to its full path.
 * On Windows: handles PATHEXT resolution and shebang detection.
 * On non-Windows: simple which lookup.
 */
export function resolveCommand(command: string, env?: NodeJS.ProcessEnv): string | null {
  const resolved = whichSync(command, {
    path: env?.[pathKey(env)] ?? process.env[pathKey()],
  });

  if (!resolved) return null;

  // On Windows, check for shebang and resolve the interpreter
  if (isWindows) {
    const shebang = parseShebang(resolved);
    if (shebang) {
      const parsed = parseShebangCommand(shebang);
      if (parsed) {
        return whichSync(parsed.command) ?? parsed.command;
      }
    }
  }

  return resolved;
}

/**
 * Resolve a command and return shebang info if applicable.
 * Returns the resolved path plus any shebang interpreter details.
 */
export function resolveCommandWithShebang(
  command: string,
  env?: NodeJS.ProcessEnv,
): { file: string; args: string[]; original: string } | null {
  const resolved = whichSync(command, {
    path: env?.[pathKey(env)] ?? process.env[pathKey()],
  });

  if (!resolved) return null;

  // On Windows, handle shebang-based scripts
  if (isWindows) {
    const shebang = parseShebang(resolved);
    if (shebang) {
      const parsed = parseShebangCommand(shebang);
      if (parsed) {
        const interpreter = whichSync(parsed.command) ?? parsed.command;
        return {
          file: interpreter,
          args: [...parsed.args, resolved],
          original: command,
        };
      }
    }
  }

  return { file: resolved, args: [], original: command };
}

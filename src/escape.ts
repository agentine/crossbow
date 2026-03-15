/**
 * Windows cmd.exe argument escaping.
 * Handles metacharacters and BatBadBut mitigation.
 */

/** Characters that have special meaning in cmd.exe */
const CMD_META = /[()%!^"<>&|;, ]/;

/**
 * Escape an argument for cmd.exe.
 * Handles cmd metacharacters and wraps in quotes when necessary.
 */
export function escapeArg(arg: string, doubleEscape: boolean): string {
  if (!arg) {
    return '""';
  }

  if (!CMD_META.test(arg)) {
    return arg;
  }

  // Escape backslashes preceding double quotes
  let escaped = arg.replace(/(\\*)"/g, '$1$1\\"');
  // Escape trailing backslashes
  escaped = escaped.replace(/(\\*)$/, "$1$1");

  if (doubleEscape) {
    // For .bat/.cmd files, escape cmd metacharacters before wrapping in quotes
    escaped = escaped.replace(/[()%!^"<>&|]/g, "^$&");
  }

  // Wrap in double quotes
  escaped = `"${escaped}"`;

  return escaped;
}

/**
 * Escape the command itself for cmd.exe.
 * Commands are handled differently from arguments.
 */
export function escapeCommand(command: string): string {
  // Wrap in double quotes if it contains spaces or metacharacters
  if (/\s/.test(command) || CMD_META.test(command)) {
    return `"${command}"`;
  }
  return command;
}

/**
 * Check if a file is a batch file (.bat or .cmd).
 */
export function isBatchFile(file: string): boolean {
  const lower = file.toLowerCase();
  return lower.endsWith(".bat") || lower.endsWith(".cmd");
}

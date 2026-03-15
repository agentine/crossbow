import { openSync, readSync, closeSync } from "node:fs";

/**
 * Read the shebang line from a file, if present.
 * Returns the interpreter command or null.
 */
export function parseShebang(file: string): string | null {
  try {
    // Read only the first 150 bytes (enough for shebang line)
    const fd = openSync(file, "r");
    const buf = Buffer.alloc(150);
    const bytesRead = readSync(fd, buf, 0, 150, 0);
    closeSync(fd);
    const header = buf.subarray(0, bytesRead).toString("utf8");
    const firstLine = header.split(/\r?\n/)[0];
    if (!firstLine || !firstLine.startsWith("#!")) return null;
    return firstLine.slice(2).trim();
  } catch {
    return null;
  }
}

/**
 * Parse a shebang string into command and optional argument.
 * Handles env-style shebangs: "#!/usr/bin/env node" → { command: "node" }
 */
export function parseShebangCommand(shebang: string): { command: string; args: string[] } | null {
  if (!shebang) return null;

  const parts = shebang.split(/\s+/);
  const command = parts[0]!;

  // Handle env-style: /usr/bin/env <cmd>
  if (command.endsWith("/env") || command === "env") {
    const realCmd = parts[1];
    if (!realCmd) return null;
    return { command: realCmd, args: parts.slice(2) };
  }

  return { command, args: parts.slice(1) };
}

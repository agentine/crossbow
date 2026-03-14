/**
 * Get the correct PATH key from the environment.
 * On Windows, environment variable keys are case-insensitive,
 * so it may be PATH, Path, path, etc.
 */
export function pathKey(env?: NodeJS.ProcessEnv): string {
  const e = env ?? process.env;

  if (process.platform !== "win32") {
    return "PATH";
  }

  // On Windows, find the actual casing used
  for (const key of Object.keys(e)) {
    if (key.toLowerCase() === "path") {
      return key;
    }
  }

  return "Path";
}

import { describe, it, expect } from "vitest";
import { spawnSync } from "../src/index.js";

describe("spawnSync", () => {
  it("runs node --version", () => {
    const result = spawnSync("node", ["--version"]);
    expect(result.status).toBe(0);
    expect(result.stdout.toString().trim()).toMatch(/^v\d+/);
  });

  it("runs node -e with inline script", () => {
    const result = spawnSync("node", ["-e", "console.log('hello sync')"]);
    expect(result.status).toBe(0);
    expect(result.stdout.toString().trim()).toBe("hello sync");
  });

  it("handles args with spaces", () => {
    const result = spawnSync("node", ["-e", "console.log(process.argv[1])", "hello world"]);
    expect(result.status).toBe(0);
    expect(result.stdout.toString().trim()).toBe("hello world");
  });

  it("handles args with special characters", () => {
    const result = spawnSync("node", ["-e", "console.log(process.argv[1])", "foo&bar"]);
    expect(result.status).toBe(0);
    expect(result.stdout.toString().trim()).toBe("foo&bar");
  });

  it("returns error for non-existent command", () => {
    const result = spawnSync("nonexistent-command-xyz-12345");
    expect(result.error).toBeDefined();
  });

  it("captures stderr", () => {
    const result = spawnSync("node", ["-e", "console.error('test error')"]);
    expect(result.status).toBe(0);
    expect(result.stderr.toString().trim()).toBe("test error");
  });

  it("returns non-zero exit code on failure", () => {
    const result = spawnSync("node", ["-e", "process.exit(42)"]);
    expect(result.status).toBe(42);
  });

  it("handles windowsHide option", () => {
    const result = spawnSync("node", ["--version"], { windowsHide: true });
    expect(result.status).toBe(0);
  });
});

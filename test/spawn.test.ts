import { describe, it, expect } from "vitest";
import { spawn } from "../src/index.js";

function collectOutput(cmd: string, args: string[]): Promise<{ stdout: string; code: number | null }> {
  return new Promise((resolve) => {
    const child = spawn(cmd, args);
    let stdout = "";
    child.stdout?.on("data", (data: Buffer) => {
      stdout += data.toString();
    });
    child.on("close", (code) => {
      resolve({ stdout: stdout.trim(), code });
    });
    child.on("error", () => {
      resolve({ stdout: "", code: 1 });
    });
  });
}

describe("spawn", () => {
  it("spawns node and gets version", async () => {
    const result = await collectOutput("node", ["--version"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toMatch(/^v\d+/);
  });

  it("spawns node -e with inline script", async () => {
    const result = await collectOutput("node", ["-e", "console.log('hello from crossbow')"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe("hello from crossbow");
  });

  it("handles args with spaces", async () => {
    const result = await collectOutput("node", ["-e", "console.log(process.argv[1])", "hello world"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe("hello world");
  });

  it("handles args with special characters", async () => {
    const result = await collectOutput("node", ["-e", "console.log(process.argv[1])", "foo&bar"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe("foo&bar");
  });

  it("passes multiple args correctly", async () => {
    const result = await collectOutput("node", ["-e", "console.log(process.argv.slice(1).join(','))", "a", "b", "c"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe("a,b,c");
  });

  it("returns ChildProcess with pid", () => {
    const child = spawn("node", ["--version"]);
    expect(child.pid).toBeDefined();
    child.kill();
  });

  it("handles echo-like output", async () => {
    const result = await collectOutput("node", ["-e", "console.log('test output')"]);
    expect(result.code).toBe(0);
    expect(result.stdout).toBe("test output");
  });
});

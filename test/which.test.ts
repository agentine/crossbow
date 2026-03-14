import { describe, it, expect } from "vitest";
import { whichSync, whichSyncAll } from "../src/which.js";

describe("whichSync", () => {
  it("finds node executable", () => {
    const result = whichSync("node");
    expect(result).not.toBeNull();
    expect(result).toContain("node");
  });

  it("returns null for non-existent command", () => {
    expect(whichSync("nonexistent-command-xyz-12345")).toBeNull();
  });

  it("finds npm", () => {
    const result = whichSync("npm");
    expect(result).not.toBeNull();
  });

  it("handles absolute paths", () => {
    const nodePath = whichSync("node");
    if (nodePath) {
      const result = whichSync(nodePath);
      expect(result).toBe(nodePath);
    }
  });

  it("respects custom PATH option", () => {
    const result = whichSync("node", { path: "/nonexistent-path" });
    expect(result).toBeNull();
  });
});

describe("whichSyncAll", () => {
  it("returns array of matches", () => {
    const results = whichSyncAll("node");
    expect(Array.isArray(results)).toBe(true);
    expect(results.length).toBeGreaterThan(0);
  });

  it("returns empty array for non-existent command", () => {
    const results = whichSyncAll("nonexistent-command-xyz-12345");
    expect(results).toEqual([]);
  });
});

import { describe, it, expect } from "vitest";
import { resolveCommand } from "../src/resolve.js";

describe("resolveCommand", () => {
  it("resolves node", () => {
    const result = resolveCommand("node");
    expect(result).not.toBeNull();
    expect(result).toContain("node");
  });

  it("returns null for non-existent command", () => {
    expect(resolveCommand("nonexistent-command-xyz-12345")).toBeNull();
  });

  it("resolves npm", () => {
    const result = resolveCommand("npm");
    expect(result).not.toBeNull();
  });
});

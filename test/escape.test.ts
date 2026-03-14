import { describe, it, expect } from "vitest";
import { escapeArg, escapeCommand, isBatchFile } from "../src/escape.js";

describe("escapeArg", () => {
  it("returns empty string wrapped in quotes", () => {
    expect(escapeArg("", false)).toBe('""');
  });

  it("passes through simple args without escaping", () => {
    expect(escapeArg("hello", false)).toBe("hello");
    expect(escapeArg("foo123", false)).toBe("foo123");
    expect(escapeArg("/path/to/file", false)).toBe("/path/to/file");
  });

  it("escapes args with spaces", () => {
    expect(escapeArg("hello world", false)).toBe('"hello world"');
  });

  it("escapes args with special characters", () => {
    expect(escapeArg("foo&bar", false)).toBe('"foo&bar"');
    expect(escapeArg("foo|bar", false)).toBe('"foo|bar"');
    expect(escapeArg("foo<bar", false)).toBe('"foo<bar"');
    expect(escapeArg("foo>bar", false)).toBe('"foo>bar"');
  });

  it("escapes double quotes in args", () => {
    const result = escapeArg('say "hello"', false);
    expect(result).toContain('\\"');
  });

  it("double-escapes for batch files", () => {
    const normal = escapeArg("foo&bar", false);
    const batch = escapeArg("foo&bar", true);
    expect(batch.length).toBeGreaterThanOrEqual(normal.length);
  });

  it("handles args with parentheses", () => {
    const result = escapeArg("(test)", false);
    expect(result).toBe('"(test)"');
  });

  it("handles backslashes before quotes", () => {
    const result = escapeArg('path\\"file', false);
    expect(result).toContain('"');
  });
});

describe("escapeCommand", () => {
  it("passes through simple commands", () => {
    expect(escapeCommand("node")).toBe("node");
    expect(escapeCommand("npm")).toBe("npm");
  });

  it("quotes commands with spaces", () => {
    expect(escapeCommand("C:\\Program Files\\node.exe")).toBe('"C:\\Program Files\\node.exe"');
  });
});

describe("isBatchFile", () => {
  it("detects .bat files", () => {
    expect(isBatchFile("script.bat")).toBe(true);
    expect(isBatchFile("SCRIPT.BAT")).toBe(true);
  });

  it("detects .cmd files", () => {
    expect(isBatchFile("script.cmd")).toBe(true);
    expect(isBatchFile("SCRIPT.CMD")).toBe(true);
  });

  it("returns false for non-batch files", () => {
    expect(isBatchFile("script.exe")).toBe(false);
    expect(isBatchFile("script.js")).toBe(false);
    expect(isBatchFile("script.sh")).toBe(false);
  });
});

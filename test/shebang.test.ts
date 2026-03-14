import { describe, it, expect } from "vitest";
import { parseShebang, parseShebangCommand } from "../src/shebang.js";
import { writeFileSync, unlinkSync, mkdirSync } from "node:fs";
import { join } from "node:path";
import { tmpdir } from "node:os";

describe("parseShebang", () => {
  const tmpDir = join(tmpdir(), "crossbow-test-shebang");

  function createFixture(name: string, content: string): string {
    mkdirSync(tmpDir, { recursive: true });
    const path = join(tmpDir, name);
    writeFileSync(path, content);
    return path;
  }

  it("parses #!/usr/bin/env node", () => {
    const file = createFixture("env-node.sh", "#!/usr/bin/env node\nconsole.log('hi');\n");
    expect(parseShebang(file)).toBe("/usr/bin/env node");
    unlinkSync(file);
  });

  it("parses #!/bin/bash", () => {
    const file = createFixture("bash.sh", "#!/bin/bash\necho hi\n");
    expect(parseShebang(file)).toBe("/bin/bash");
    unlinkSync(file);
  });

  it("parses shebang with args", () => {
    const file = createFixture("python.sh", "#!/usr/bin/env python3 -u\nprint('hi')\n");
    expect(parseShebang(file)).toBe("/usr/bin/env python3 -u");
    unlinkSync(file);
  });

  it("returns null for files without shebang", () => {
    const file = createFixture("no-shebang.txt", "hello world\n");
    expect(parseShebang(file)).toBeNull();
    unlinkSync(file);
  });

  it("returns null for non-existent files", () => {
    expect(parseShebang("/nonexistent/file/path")).toBeNull();
  });

  it("handles Windows CRLF line endings", () => {
    const file = createFixture("crlf.sh", "#!/usr/bin/env node\r\nconsole.log('hi');\r\n");
    expect(parseShebang(file)).toBe("/usr/bin/env node");
    unlinkSync(file);
  });
});

describe("parseShebangCommand", () => {
  it("parses env-style shebang", () => {
    const result = parseShebangCommand("/usr/bin/env node");
    expect(result).toEqual({ command: "node", args: [] });
  });

  it("parses env-style shebang with args", () => {
    const result = parseShebangCommand("/usr/bin/env python3 -u");
    expect(result).toEqual({ command: "python3", args: ["-u"] });
  });

  it("parses direct interpreter path", () => {
    const result = parseShebangCommand("/bin/bash");
    expect(result).toEqual({ command: "/bin/bash", args: [] });
  });

  it("parses interpreter with argument", () => {
    const result = parseShebangCommand("/usr/bin/perl -w");
    expect(result).toEqual({ command: "/usr/bin/perl", args: ["-w"] });
  });

  it("returns null for empty string", () => {
    expect(parseShebangCommand("")).toBeNull();
  });
});

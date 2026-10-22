// Upstream draws in Menlo first. Under the host's fontconfig, Menlo must be
// a monospace font (spacing 100), or wide glyphs overflow their cells.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const conf = fileURLToPath(new URL("../host/fonts.conf", import.meta.url));
const spacing = (env) => spawnSync("fc-match", ["-f", "%{spacing}", "Menlo"], { encoding: "utf8", env: { ...process.env, ...env } });

test("Menlo is monospace under the host's fontconfig", () => {
  const out = spacing({ FONTCONFIG_FILE: conf });
  assert.equal(out.status, 0, out.stderr);
  assert.equal(out.stdout, "100");
});

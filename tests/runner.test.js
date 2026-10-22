// The runner's side of the screensaver-rotation contract, with
// screensaver-session and gjs stubbed out to print what they were given.
import { test } from "node:test";
import assert from "node:assert/strict";
import { spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync, chmodSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const runner = fileURLToPath(new URL("../bin/ascii-magic", import.meta.url));
const repo = fileURLToPath(new URL("..", import.meta.url)).replace(/\/$/, "");
const stubs = mkdtempSync(join(tmpdir(), "ascii-magic-stubs-"));
for (const name of ["screensaver-session", "gjs"]) {
  writeFileSync(join(stubs, name), `#!/bin/sh\nprintf '%s\\n' ${name} "$@"\n`);
  chmodSync(join(stubs, name), 0o755);
}
const run = (...args) => spawnSync(runner, args, { encoding: "utf8", env: { ...process.env, PATH: `${stubs}:${process.env.PATH}` } });
const host = `${repo}/host/host.js`;

test("--list names every piece as a magic: entry", () => {
  const lines = run("--list").stdout.trim().split("\n");
  assert.equal(lines.length, 634);
  assert.ok(lines.every((l) => /^magic:[a-z0-9-]+$/.test(l)));
  assert.ok(lines.includes("magic:plasma") && lines.includes("magic:moonlit-sea"));
});

test("the rotation's call runs the first known entry under screensaver-session", () => {
  const out = run("--app-id", "org.omarchy.screensaver", "--seed", "42", "--log", "/l/log", "magic:nope", "magic:campfire", "magic:plasma");
  assert.equal(out.status, 0, out.stderr);
  assert.deepEqual(out.stdout.trim().split("\n"), [
    "screensaver-session", "--app-id", "org.omarchy.screensaver", "--log", "/l/log",
    "--entry", "magic:campfire", "--kind", "ascii-magic", "--",
    "gjs", "-m", host, "org.omarchy.screensaver", "campfire",
  ]);
});

test("without a log, none is passed on", () => {
  const out = run("--app-id", "x", "magic:campfire");
  assert.ok(!out.stdout.includes("--log"), out.stdout);
});

test("without an app id it plays under its own name, a path or a bare name", () => {
  const session = ["screensaver-session", "--app-id", "ascii-magic", "--entry", "magic:campfire", "--kind", "ascii-magic", "--", "gjs", "-m", host, "ascii-magic", "campfire"];
  assert.deepEqual(run("/some/dir/campfire.js").stdout.trim().split("\n"), session);
  assert.deepEqual(run("campfire").stdout.trim().split("\n"), session);
});

test("names that aren't pieces are skipped, and none at all fails", () => {
  const out = run("../../etc/passwd", "magic:Campfire", "magic:");
  assert.equal(out.status, 1);
  assert.match(out.stderr, /no piece among/);
  assert.equal(run().status, 1);
});

test("unknown options are refused", () => {
  assert.equal(run("--fast", "campfire").status, 2);
});

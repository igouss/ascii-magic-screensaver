// Every piece the runner lists loads and draws a frame of its own size, at
// the start and later on.
import { test } from "node:test";
import assert from "node:assert/strict";
import { readdirSync } from "node:fs";

const dir = new URL("../vendor/ascii-magic-art/pieces/", import.meta.url);
const slugs = readdirSync(dir).filter((f) => f.endsWith(".js")).map((f) => f.slice(0, -3));

test("upstream's 634 pieces are all there", () => {
  assert.equal(slugs.length, 634);
});

const draws = async (slug) => {
  const piece = await import(new URL(`${slug}.js`, dir));
  const draw = piece.default();
  return [0, 1.5, 30].map((t) => draw(t)).map((f) => (typeof f === "string" ? f : f.text).split("\n").length);
};

for (const slug of slugs) {
  test(`${slug} draws`, async () => {
    const piece = await import(new URL(`${slug}.js`, dir));
    assert.deepEqual(await draws(slug), [piece.meta.rows, piece.meta.rows, piece.meta.rows]);
  });
}

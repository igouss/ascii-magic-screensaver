import { test } from "node:test";
import assert from "node:assert/strict";
import { fit } from "../page/fit.js";
import { CELL_W } from "../vendor/ascii-magic-art/runtime/canvas.js";

const text = { cols: 80, rows: 34 };
const square = { cols: 60, rows: 60, cell: "square" };
const drawn = (meta, px) => [meta.cols * px * CELL_W, meta.rows * px * CELL_W * (meta.cell === "square" ? 1 : 1 / CELL_W)];
const close = (a, b) => assert.ok(Math.abs(a - b) < 1e-9, `${a} != ${b}`);

test("a wide window is filled top to bottom", () => {
  const [w, h] = drawn(text, fit(text, 2560, 1440));
  close(h, 1440);
  assert.ok(w < 2560);
});

test("a tall window is filled side to side", () => {
  const [w, h] = drawn(text, fit(text, 800, 1440));
  close(w, 800);
  assert.ok(h < 1440);
});

test("square cells are as tall as they are wide", () => {
  const [w, h] = drawn(square, fit(square, 2560, 1440));
  close(h, 1440);
  close(w, 1440);
});

test("an empty window draws nothing", () => {
  assert.equal(fit(text, 0, 1440), 0);
  assert.equal(fit(text, 2560, 0), 0);
});

/*
 * fit.js: the font size at which a piece's grid fills a window, keeping its
 * shape. The grid draws `cols * px * CELL_W` wide and `rows * px * CELL_W *
 * cellAspect(meta)` tall (runtime/canvas.js), so the smaller of the two
 * ratios fits both; the window's background letterboxes the rest.
 */
import { CELL_W, cellAspect } from "../vendor/ascii-magic-art/runtime/canvas.js";

export function fit(meta, width, height) {
  const cellW = meta.cols * CELL_W, cellH = meta.rows * CELL_W * cellAspect(meta);
  return Math.min(width / cellW, height / cellH);
}

/*
 * host.js: one ascii-magic piece in a fullscreen WebKit window.
 *
 *   gjs -m host.js APP_ID PIECE
 *
 * Draws only. Its input goes to stdout for screensaver-session to judge, one
 * line each: `key`, `pointer`, `motion COLUMN ROW` (in cells of CELL_PX).
 */
import GLib from "gi://GLib";
import Gio from "gi://Gio";

const [appId, piece] = ARGV;
if (!appId || !piece) {
  printerr("usage: gjs -m host.js APP_ID PIECE");
  imports.system.exit(2);
}
// GTK takes the Wayland app id from the program name, so it must be set
// before GTK loads.
GLib.set_prgname(appId);
const here = GLib.path_get_dirname(GLib.filename_from_uri(import.meta.url)[0]);
// WebKit's processes inherit it: upstream's fonts, mapped onto ours.
GLib.setenv("FONTCONFIG_FILE", GLib.build_filenamev([here, "fonts.conf"]), true);
const { default: Gtk } = await import("gi://Gtk?version=3.0");
const { default: WebKit2 } = await import("gi://WebKit2?version=4.1");

/** Pointer travel is reported in cells this wide, about the aquarium's. */
const CELL_PX = 16;

const page = GLib.build_filenamev([here, "..", "page", "index.html"]);
const report = (line) => print(line);

const app = new Gtk.Application({ application_id: appId, flags: Gio.ApplicationFlags.NON_UNIQUE });
app.connect("activate", () => {
  const window = new Gtk.ApplicationWindow({ application: app, title: `ascii-magic: ${piece}` });
  // The page imports upstream's modules from file:// URLs next to it.
  const settings = new WebKit2.Settings({ allow_file_access_from_file_urls: true });
  const view = new WebKit2.WebView({ settings });
  view.connect("key-press-event", () => (report("key"), false));
  view.connect("button-press-event", () => (report("pointer"), false));
  view.connect("scroll-event", () => (report("pointer"), false));
  view.connect("motion-notify-event", (_, event) => {
    const [, x, y] = event.get_coords();
    report(`motion ${Math.floor(x / CELL_PX)} ${Math.floor(y / CELL_PX)}`);
    return false;
  });
  window.add(view);
  view.load_uri(`${GLib.filename_to_uri(page, null)}?piece=${encodeURIComponent(piece)}`);
  window.fullscreen();
  window.show_all();
});
app.run([]);

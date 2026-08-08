#!/usr/bin/env python3
"""Local development server for the Shamegrin website.

Run ``python3 app.py`` and open http://localhost:8000.  Any saved HTML, CSS,
JavaScript, JSON, or image change refreshes connected browser pages automatically.
"""

from __future__ import annotations

import argparse
import io
import os
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
from urllib.parse import unquote, urlsplit


SITE_ROOT = Path(__file__).resolve().parent
WATCHED_SUFFIXES = {".css", ".html", ".js", ".json", ".jpg", ".jpeg", ".png", ".svg", ".webp"}
RELOAD_SCRIPT = b"""<script>
(() => {
  let version = '';
  const poll = async () => {
    try {
      const next = await fetch('/__site_version', {cache: 'no-store'}).then(r => r.text());
      if (version && next !== version) location.reload();
      version = next;
    } catch (_) { /* The server may be restarting. */ }
  };
  poll();
  setInterval(poll, 900);
})();
</script>"""


def site_version() -> str:
    """Return a stable token that changes whenever a site asset is saved."""
    newest = 0
    for file_path in SITE_ROOT.rglob("*"):
        if file_path.is_file() and file_path.suffix.lower() in WATCHED_SUFFIXES:
            newest = max(newest, file_path.stat().st_mtime_ns)
    return str(newest)


class SiteRequestHandler(SimpleHTTPRequestHandler):
    """Serve static files and inject a dependency-free live-reload client in HTML."""

    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=str(SITE_ROOT), **kwargs)

    def do_GET(self) -> None:
        if urlsplit(self.path).path == "/__site_version":
            payload = site_version().encode("ascii")
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/plain; charset=utf-8")
            self.send_header("Cache-Control", "no-store")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)
            return
        super().do_GET()

    def send_head(self):  # noqa: ANN201 - dictated by the stdlib handler API
        """Return an HTML stream with live reload injected, or a normal file stream."""
        path = Path(self.translate_path(self.path))
        request_path = urlsplit(self.path).path

        if path.is_dir():
            if not request_path.endswith("/"):
                self.send_response(HTTPStatus.MOVED_PERMANENTLY)
                self.send_header("Location", request_path + "/")
                self.end_headers()
                return None
            for index in ("index.html", "index.htm"):
                candidate = path / index
                if candidate.is_file():
                    path = candidate
                    break
            else:
                return self.list_directory(str(path))

        if not path.is_file():
            not_found = SITE_ROOT / "404.html"
            page = not_found.read_bytes()
            page = page.replace(b"</body>", RELOAD_SCRIPT + b"</body>", 1)
            stream = io.BytesIO(page)
            self.send_response(HTTPStatus.NOT_FOUND)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(page)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return stream

        content_type = self.guess_type(str(path))
        if path.suffix.lower() == ".html":
            page = path.read_bytes()
            page = page.replace(b"</body>", RELOAD_SCRIPT + b"</body>", 1)
            stream = io.BytesIO(page)
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", "text/html; charset=utf-8")
            self.send_header("Content-Length", str(len(page)))
            self.send_header("Cache-Control", "no-store")
            self.end_headers()
            return stream

        try:
            stream = path.open("rb")
        except OSError:
            self.send_error(HTTPStatus.NOT_FOUND, "File not found")
            return None
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(path.stat().st_size))
        self.end_headers()
        return stream


def main() -> None:
    parser = argparse.ArgumentParser(description="Serve the Shamegrin website with live reload.")
    parser.add_argument("--port", type=int, default=int(os.getenv("PORT", "8000")))
    args = parser.parse_args()

    server = ThreadingHTTPServer(("127.0.0.1", args.port), SiteRequestHandler)
    print(f"Shamegrin is running at http://localhost:{args.port}")
    print("Live reload is on — save a site file to refresh the browser.")
    print("Press Ctrl+C to stop the server.")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        print("\nServer stopped.")
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

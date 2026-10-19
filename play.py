"""Open the local game without installing any Python packages."""

from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from pathlib import Path
import sys
import webbrowser


def main():
    game_dir = Path(__file__).resolve().parent
    handler = partial(SimpleHTTPRequestHandler, directory=str(game_dir))
    server = ThreadingHTTPServer(("127.0.0.1", 0), handler)
    url = f"http://127.0.0.1:{server.server_port}/"
    print(url, flush=True)
    if "--no-browser" not in sys.argv:
        webbrowser.open_new_tab(url)
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()

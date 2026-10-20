"""Write compact .webp copies of every runtime image (originals stay as sources).
Usage: python3 scripts/optimize-assets.py <image.png> ..."""
import sys
from pathlib import Path
from PIL import Image
# Longest side the game ever draws, at 2x pixel density.
LIMITS = {'quest-treasure': 160, 'quest-cat': 320, 'quest-magpie': 320, 'awakening': 1536, 'cat': 1536, 'mission': 1536}
DEFAULT_LIMIT = 1024
for name in sys.argv[1:]:
    src = Path(name)
    im = Image.open(src)
    limit = LIMITS.get(src.stem, DEFAULT_LIMIT)
    if max(im.size) > limit:
        scale = limit / max(im.size)
        im = im.resize((round(im.width * scale), round(im.height * scale)), Image.LANCZOS)
    out = src.with_suffix('.webp')
    im.save(out, 'WEBP', quality=82, method=6)
    print(f'{src} {src.stat().st_size//1024}KB -> {out.stat().st_size//1024}KB {im.size}')

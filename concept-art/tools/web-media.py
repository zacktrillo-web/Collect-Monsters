# Converts rendered output into light web assets for gallery.html.
# Usage: python3 tools/web-media.py   (needs Pillow)
import glob, os
from PIL import Image

os.makedirs('output/web/thumbs', exist_ok=True)
os.makedirs('output/web/sheets', exist_ok=True)
for f in sorted(glob.glob('output/heroes/*.png')):
    name = os.path.basename(f)[:-4]
    im = Image.open(f).convert('RGB')
    w, h = im.size
    im.crop((90, 60, w - 90, h - 120)).resize((264, 252), Image.LANCZOS).save(f'output/web/thumbs/{name}.webp', quality=82)
for f in sorted(glob.glob('output/sheets/*.png')):
    name = os.path.basename(f)[:-4]
    Image.open(f).convert('RGB').save(f'output/web/sheets/{name}.jpg', quality=86, optimize=True)

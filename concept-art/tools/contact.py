# Builds a quick review grid from output/heroes (or sheets) for eyeballing.
import sys, glob, os
from PIL import Image
kind = sys.argv[1] if len(sys.argv) > 1 else 'heroes'
ids = sys.argv[3:] if len(sys.argv) > 3 else None
files = [f'output/{kind}/{i}.png' for i in ids] if ids else sorted(glob.glob(f'output/{kind}/*.png'))
cols = 3
w, h = (580, 540) if kind == 'heroes' else (960, 540)
rows = (len(files) + cols - 1) // cols
out = Image.new('RGB', (cols * w, rows * h), 'black')
for k, f in enumerate(files):
    out.paste(Image.open(f).convert('RGB').resize((w, h)), ((k % cols) * w, (k // cols) * h))
out.save(sys.argv[2])

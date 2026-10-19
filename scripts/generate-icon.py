"""Regenerate the original Arena icon with Python and Pillow (maintainers only)."""
from pathlib import Path
from PIL import Image, ImageDraw
root=Path(__file__).resolve().parent.parent/'assets'
im=Image.new('RGBA',(1024,1024),(0,0,0,0));d=ImageDraw.Draw(im)
d.rounded_rectangle((24,24,1000,1000),radius=220,fill='#101319')
# Three answer dots above a compact Y monogram.
for x,color in [(280,'#d9ae90'),(512,'#a3cebd'),(744,'#aab3f0')]:
 d.ellipse((x-64,150,x+64,278),fill=color)
d.line([(285,375),(512,590),(739,375)],fill='#c5e6aa',width=100,joint='curve')
d.line([(512,560),(512,822)],fill='#c5e6aa',width=100)
im.save(root/'icon.png');im.save(root/'icon.icns');im.save(root/'icon.ico',sizes=[(16,16),(32,32),(48,48),(64,64),(128,128),(256,256)])

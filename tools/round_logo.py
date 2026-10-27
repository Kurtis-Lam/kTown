from pathlib import Path
from PIL import Image, ImageChops, ImageDraw

LOGO_DIR = Path(__file__).resolve().parent.parent / "public" / "imgs" / "logos"
NAMES = ["ktown", "krevisionnotes", "kauranotes", "kcitethisforme"]
OUT_SIZE = 192
RADIUS_RATIO = 0.225
SUPERSAMPLE = 4


def rounded_mask(size, radius):
    big = size * SUPERSAMPLE
    mask = Image.new("L", (big, big), 0)
    ImageDraw.Draw(mask).rounded_rectangle((0, 0, big - 1, big - 1), radius=radius * SUPERSAMPLE, fill=255)
    return mask.resize((size, size), Image.LANCZOS)


def process(path):
    img = Image.open(path).convert("RGBA")
    bbox = img.getchannel("A").point(lambda a: 255 if a > 8 else 0).getbbox()
    if bbox:
        img = img.crop(bbox)
    side = min(img.size)
    left = (img.width - side) // 2
    top = (img.height - side) // 2
    img = img.crop((left, top, left + side, top + side))
    img = img.resize((OUT_SIZE, OUT_SIZE), Image.LANCZOS)
    mask = rounded_mask(OUT_SIZE, OUT_SIZE * RADIUS_RATIO)
    img.putalpha(ImageChops.multiply(img.getchannel("A"), mask))
    img.save(path, optimize=True)


if __name__ == "__main__":
    for name in NAMES:
        p = LOGO_DIR / f"{name}.png"
        before = p.stat().st_size
        process(p)
        print(f"{p.name}: {before} -> {p.stat().st_size} bytes")
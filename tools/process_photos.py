from __future__ import annotations

import hashlib
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont, ImageOps


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "fotos-originales"
OUTPUT = ROOT / "assets" / "img" / "fotos"
TEMP = ROOT / ".tmp"


def file_digest(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def prepare_image(path: Path) -> Image.Image:
    with Image.open(path) as source:
        return ImageOps.exif_transpose(source).convert("RGB")


def save_webp(image: Image.Image, path: Path, max_side: int, quality: int) -> None:
    copy = image.copy()
    copy.thumbnail((max_side, max_side), Image.Resampling.LANCZOS)
    copy.save(path, "WEBP", quality=quality, method=6)


def main() -> None:
    OUTPUT.mkdir(parents=True, exist_ok=True)
    TEMP.mkdir(parents=True, exist_ok=True)

    supported = {".jpg", ".jpeg", ".png", ".webp", ".heic"}
    candidates = sorted(
        path for path in SOURCE.iterdir() if path.is_file() and path.suffix.lower() in supported
    )

    unique: list[Path] = []
    seen: set[str] = set()
    for path in candidates:
        digest = file_digest(path)
        if digest not in seen:
            seen.add(digest)
            unique.append(path)

    cards: list[tuple[str, Image.Image]] = []
    for index, path in enumerate(unique, start=1):
        image = prepare_image(path)
        stem = f"recuerdo-{index:02d}"
        save_webp(image, OUTPUT / f"{stem}.webp", max_side=2000, quality=88)
        save_webp(image, OUTPUT / f"{stem}-thumb.webp", max_side=900, quality=82)

        preview = ImageOps.contain(image, (360, 300), Image.Resampling.LANCZOS)
        cards.append((f"{index:02d}", preview))

    columns = 3
    card_width, card_height = 400, 350
    rows = (len(cards) + columns - 1) // columns
    sheet = Image.new("RGB", (columns * card_width, rows * card_height), "#f5f0df")
    draw = ImageDraw.Draw(sheet)
    font = ImageFont.load_default(size=24)

    for index, (label, preview) in enumerate(cards):
        column = index % columns
        row = index // columns
        left = column * card_width + (card_width - preview.width) // 2
        top = row * card_height + 12
        sheet.paste(preview, (left, top))
        draw.rounded_rectangle(
            (column * card_width + 12, row * card_height + 10, column * card_width + 58, row * card_height + 48),
            radius=12,
            fill="#2f3b23",
        )
        draw.text((column * card_width + 23, row * card_height + 17), label, fill="white", font=font)

    sheet.save(TEMP / "photo-contact.jpg", "JPEG", quality=88, optimize=True)
    print(f"Processed {len(unique)} unique photos.")


if __name__ == "__main__":
    main()

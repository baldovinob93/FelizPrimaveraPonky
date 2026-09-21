from __future__ import annotations

import re
import sys
from collections import Counter
from html.parser import HTMLParser
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
HTML_FILES = [ROOT / "index.html", ROOT / "404.html"]


class SiteParser(HTMLParser):
    def __init__(self) -> None:
        super().__init__()
        self.ids: list[str] = []
        self.references: list[str] = []

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        values = dict(attrs)
        if values.get("id"):
            self.ids.append(values["id"] or "")
        for name in ("src", "href"):
            value = values.get(name)
            if value and value.startswith("./") and not value.startswith("./#"):
                self.references.append(value.split("?", 1)[0].split("#", 1)[0])


def main() -> int:
    errors: list[str] = []

    for path in HTML_FILES:
        parser = SiteParser()
        parser.feed(path.read_text(encoding="utf-8"))

        duplicates = [item for item, count in Counter(parser.ids).items() if count > 1]
        if duplicates:
            errors.append(f"{path.name}: duplicate ids: {', '.join(duplicates)}")

        for reference in parser.references:
            target = (path.parent / reference).resolve()
            if not target.exists():
                errors.append(f"{path.name}: missing {reference}")

    forbidden = re.compile(r"TODO|FIXME|Lorem ipsum|(?:src|href)=[\"']/[^/]")
    for path in [*HTML_FILES, ROOT / "css" / "styles.css", ROOT / "js" / "app.js"]:
        if forbidden.search(path.read_text(encoding="utf-8")):
            errors.append(f"{path.relative_to(ROOT)}: forbidden placeholder or root-relative path")

    if errors:
        print("\n".join(errors))
        return 1

    print("Static validation passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

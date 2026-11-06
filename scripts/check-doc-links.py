#!/usr/bin/env python3
"""Check that relative Markdown links point to existing local files/directories."""
from pathlib import Path
import re
import sys
from urllib.parse import unquote, urlsplit

ROOT = Path(__file__).resolve().parents[1]
LINK_RE = re.compile(r"(?<!!)\[[^\]]+\]\(([^)]+)\)")
SKIP_DIRS = {".git", "node_modules", ".vercel"}


def markdown_files():
    for path in ROOT.rglob("*.md"):
        if any(part in SKIP_DIRS for part in path.relative_to(ROOT).parts):
            continue
        yield path


def main():
    problems = []
    files = sorted(markdown_files())
    for md_file in files:
        text = md_file.read_text(encoding="utf-8")
        for match in LINK_RE.finditer(text):
            raw_target = match.group(1).strip()
            # The repository uses simple Markdown links; ignore links with a title only after the URL.
            target = raw_target.split(maxsplit=1)[0].strip("<>")
            parsed = urlsplit(target)
            if parsed.scheme or target.startswith("//") or not parsed.path:
                continue
            relative_path = Path(unquote(parsed.path))
            resolved = (md_file.parent / relative_path).resolve()
            try:
                resolved.relative_to(ROOT)
            except ValueError:
                problems.append(f"{md_file.relative_to(ROOT)}: link escapes repository: {target}")
                continue
            if not resolved.exists():
                line = text.count("\n", 0, match.start()) + 1
                problems.append(f"{md_file.relative_to(ROOT)}:{line}: missing target: {target}")

    required = ["README.md", "docs/ARCHITECTURE.md", "docs/TESTING.md", "docs/DEPLOYMENT.md"]
    for item in required:
        if not (ROOT / item).is_file():
            problems.append(f"required documentation file is missing: {item}")

    if problems:
        print("Documentation link check failed:")
        for problem in problems:
            print(f" - {problem}")
        return 1

    print(f"PASS — checked local Markdown links in {len(files)} files")
    return 0


if __name__ == "__main__":
    sys.exit(main())

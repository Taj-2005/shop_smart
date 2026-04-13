#!/usr/bin/env python3
"""Convert KEY=value .env lines to ECS containerDefinitions[].environment JSON."""
import json
import sys
from pathlib import Path


def main() -> None:
    text = Path(sys.argv[1]).read_text(encoding="utf-8")
    out: list[dict[str, str]] = []
    for line in text.splitlines():
        s = line.strip()
        if not s or s.startswith("#") or "=" not in s:
            continue
        key, _, val = s.partition("=")
        key = key.strip()
        if not key:
            continue
        val = val.strip()
        if len(val) >= 2 and val[0] == val[-1] and val[0] in "\"'":
            val = val[1:-1]
        out.append({"name": key, "value": val})
    json.dump(out, sys.stdout)


if __name__ == "__main__":
    main()

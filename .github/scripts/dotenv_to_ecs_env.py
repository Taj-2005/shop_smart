#!/usr/bin/env python3
"""Convert KEY=value .env lines to ECS containerDefinitions[].environment JSON."""
import json
import sys
from pathlib import Path


def main() -> None:
    if len(sys.argv) != 2:
        raise SystemExit("Usage: dotenv_to_ecs_env.py <path-to-.env>")

    path = Path(sys.argv[1])
    if not path.exists():
        raise SystemExit(f"Env file not found: {path}")

    text = path.read_text(encoding="utf-8")
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
    if not isinstance(out, list):
        raise SystemExit("Internal error: output is not a list")
    json.dump(out, sys.stdout, separators=(",", ":"))
    sys.stdout.write("\n")


if __name__ == "__main__":
    main()

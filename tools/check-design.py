#!/usr/bin/env python3
"""Lightweight design-system guardrails for learncs.ru."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / "assets" / "styles.css"
HTML_GLOBS = ("*.html", "*/*.html", "*/*/*.html")

EXPECTED_TOKENS = {
    "--bg": "#ffffff",
    "--accent-bg": "#f7fbff",
    "--card-bg": "#f5f9fd",
    "--blue": "#155d96",
    "--blue-dark": "#0f426b",
    "--blue-soft": "#eaf3fb",
    "--graphite": "#1f2933",
    "--graphite-soft": "#eef5fa",
    "--muted": "#526170",
    "--line": "#d7e5ef",
    "--line-soft": "#e8f0f7",
    "--radius": "16px",
    "--radius-lg": "24px",
}

ALLOWED_HEX = {
    "#000000",
    "#0f426b",
    "#111111",
    "#155d96",
    "#1f2933",
    "#2e3942",
    "#313c45",
    "#343431",
    "#526170",
    "#5f695f",
    "#63635d",
    "#9bb7c9",
    "#b6c5d4",
    "#cbddec",
    "#d7e5ef",
    "#d8d8d0",
    "#deddd6",
    "#e8f0f7",
    "#eaf3fb",
    "#eef5fa",
    "#e7e7df",
    "#e7e7e1",
    "#ebeae4",
    "#ecece6",
    "#eeeee8",
    "#f0f0ea",
    "#f5f9fd",
    "#f7f7f2",
    "#f7f7f3",
    "#f7fbff",
    "#fcfcfa",
    "#ffffff",
}

HOMEPAGE_RECIPE = (
    "hero",
    "summary-strip",
    "feature-grid",
    "media-card",
    "teacher-card",
    "program-grid",
    "social-proof",
    "price-card",
    "faq",
    "final-cta",
)

FORBIDDEN_PATTERNS = (
    ("linear-gradient(", "Decorative gradients are outside the learncs visual system."),
    ("radial-gradient(", "Decorative gradients are outside the learncs visual system."),
)


def css_lines() -> list[str]:
    if not CSS_PATH.exists():
        return []
    return CSS_PATH.read_text(encoding="utf-8").splitlines()


def collect_html_paths() -> list[Path]:
    paths: list[Path] = []
    for pattern in HTML_GLOBS:
        paths.extend(ROOT.glob(pattern))
    return sorted(set(paths))


def last_css_tokens(lines: list[str]) -> dict[str, str]:
    tokens: dict[str, str] = {}
    token_re = re.compile(r"^\s*(--[a-z0-9-]+)\s*:\s*([^;]+);")
    for line in lines:
        match = token_re.match(line)
        if match:
            tokens[match.group(1)] = match.group(2).strip().lower()
    return tokens


def check_tokens(lines: list[str]) -> list[str]:
    errors: list[str] = []
    tokens = last_css_tokens(lines)
    for name, expected in EXPECTED_TOKENS.items():
        actual = tokens.get(name)
        if actual != expected:
            errors.append(f"{CSS_PATH.relative_to(ROOT)}: expected {name}: {expected}; got {actual!r}")
    return errors


def check_forbidden_patterns(paths: list[Path]) -> list[str]:
    errors: list[str] = []
    for path in paths:
        text = path.read_text(encoding="utf-8")
        for pattern, message in FORBIDDEN_PATTERNS:
            if pattern in text:
                errors.append(f"{path.relative_to(ROOT)}: {message}")
    return errors


def check_box_shadows(lines: list[str]) -> list[str]:
    errors: list[str] = []
    for number, line in enumerate(lines, start=1):
        if "box-shadow:" not in line:
            continue
        value = line.split("box-shadow:", 1)[1].split(";", 1)[0].strip()
        if value not in {"none", "var(--shadow)"}:
            errors.append(f"{CSS_PATH.relative_to(ROOT)}:{number}: box-shadow must be none or var(--shadow)")
    return errors


def check_hardcoded_hex(paths: list[Path]) -> list[str]:
    errors: list[str] = []
    hex_re = re.compile(r"#[0-9a-fA-F]{3,8}\b")
    for path in paths:
        text = path.read_text(encoding="utf-8")
        for number, line in enumerate(text.splitlines(), start=1):
            for value in hex_re.findall(line):
                if value.lower() not in ALLOWED_HEX:
                    errors.append(
                        f"{path.relative_to(ROOT)}:{number}: hard-coded color {value} is not in the design-token allowlist"
                    )
    return errors


def check_design_system_page() -> list[str]:
    page = ROOT / "design-system" / "index.html"
    if not page.exists():
        return ["design-system/index.html: missing live design-system page"]
    text = page.read_text(encoding="utf-8")
    required = ("Tokens", "Components", "Recipes", "python3 tools/check-design.py")
    return [f"design-system/index.html: missing {item!r} section" for item in required if item not in text]


def check_homepage_recipe() -> list[str]:
    page = ROOT / "index.html"
    if not page.exists():
        return ["index.html: missing homepage"]
    text = page.read_text(encoding="utf-8")
    blocks = re.findall(r'data-block="([^"]+)"', text)
    if not blocks:
        return ["index.html: homepage sections need data-block markers"]

    cursor = 0
    missing: list[str] = []
    for expected in HOMEPAGE_RECIPE:
        try:
            cursor = blocks.index(expected, cursor) + 1
        except ValueError:
            missing.append(expected)
    if missing:
        return [f"index.html: homepage recipe is missing ordered blocks: {', '.join(missing)}"]
    return []


def main() -> int:
    lines = css_lines()
    paths = [CSS_PATH, *collect_html_paths()]
    errors: list[str] = []
    errors.extend(check_tokens(lines))
    errors.extend(check_forbidden_patterns(paths))
    errors.extend(check_box_shadows(lines))
    errors.extend(check_hardcoded_hex(paths))
    errors.extend(check_design_system_page())
    errors.extend(check_homepage_recipe())

    if errors:
        print("Design check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Design check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

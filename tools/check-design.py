#!/usr/bin/env python3
"""Lightweight homepage guardrails for learncs.ru."""

from __future__ import annotations

import re
import sys
from pathlib import Path


ROOT = Path(__file__).resolve().parents[1]
CSS_PATH = ROOT / "assets" / "styles.css"
HOME_CONTENT_PATH = ROOT / "src" / "content" / "pages" / "home.md"
HTML_GLOBS = ("*.html", "*/*.html", "*/*/*.html")

EXPECTED_TOKENS = {
    "--bg": "#ffffff",
    "--accent-bg": "#fcfaf6",
    "--card-bg": "#f8f2ea",
    "--blue": "#155d96",
    "--blue-dark": "#0f426b",
    "--blue-soft": "#fbf8f1",
    "--accent": "#c5ae8c",
    "--accent-dark": "#6f604d",
    "--accent-strong": "#806044",
    "--accent-soft": "#f8f2ea",
    "--accent-line": "#eee2d0",
    "--graphite": "#1f2933",
    "--graphite-soft": "#f2ece3",
    "--muted": "#526170",
    "--pretitle": "#526071",
    "--line": "#e8dccb",
    "--line-soft": "#f0e8dc",
    "--shadow-soft": "0 18px 42px rgba(17, 17, 17, 0.09)",
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
    "#526071",
    "#526170",
    "#5f695f",
    "#63635d",
    "#6f604d",
    "#765d3d",
    "#806044",
    "#a7845d",
    "#9bb7c9",
    "#b6c5d4",
    "#c5ae8c",
    "#cbddec",
    "#d7e5ef",
    "#d8d8d0",
    "#deddd6",
    "#e8dccb",
    "#e8f0f7",
    "#eaf3fb",
    "#eadfce",
    "#eee2d0",
    "#eef5fa",
    "#e7e7df",
    "#e7e7e1",
    "#ebeae4",
    "#ecece6",
    "#eeeee8",
    "#f0f0ea",
    "#f0e8dc",
    "#f2ece3",
    "#f4eee5",
    "#f8f2ea",
    "#f5f9fd",
    "#f7f7f2",
    "#f7f7f3",
    "#f7fbff",
    "#fbf8f1",
    "#fcfaf6",
    "#fcfcfa",
    "#ffffff",
}

HOMEPAGE_RECIPE = (
    "hero-split",
    "split-media",
    "card-grid",
    "media-stack",
    "card-grid",
    "image-showcase",
    "two-column-list",
    "centered-summary",
    "faq-accordion",
    "cta-panel",
)

APPROVED_TEMPLATES = {
    "hero-split",
    "split-media",
    "card-grid",
    "media-stack",
    "image-showcase",
    "two-column-list",
    "centered-summary",
    "faq-accordion",
    "cta-panel",
}

CONTENT_SPECIFIC_CSS_MARKERS = (
    "teacher-",
    "materials-",
    "program-",
    "student-",
    "camp-",
    "fethiye-",
)

CONTRAST_PAIRS = (
    ("body text on white", "--ink", "--bg", 4.5),
    ("graphite text on white", "--graphite", "--bg", 4.5),
    ("muted text on white", "--muted", "--bg", 4.5),
    ("hero pretitle on white", "--pretitle", "--bg", 4.5),
    ("blue links on white", "--blue", "--bg", 4.5),
    ("white text on primary CTA", "--bg", "--blue", 4.5),
    ("accent meta on cream", "--accent-dark", "--accent-soft", 4.5),
    ("strong accent on white", "--accent-strong", "--bg", 4.5),
    ("strong accent on warm card", "--accent-strong", "--card-bg", 4.5),
    ("muted text on card", "--muted", "--card-bg", 4.5),
    ("ink on warm section", "--ink", "--accent-bg", 4.5),
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


def relative_luminance(hex_color: str) -> float:
    value = hex_color.strip().lower()
    if not re.fullmatch(r"#[0-9a-f]{6}", value):
        raise ValueError(f"expected 6-digit hex color, got {hex_color!r}")
    channels = [int(value[index : index + 2], 16) / 255 for index in (1, 3, 5)]

    def linearize(channel: float) -> float:
        if channel <= 0.03928:
            return channel / 12.92
        return ((channel + 0.055) / 1.055) ** 2.4

    red, green, blue = [linearize(channel) for channel in channels]
    return 0.2126 * red + 0.7152 * green + 0.0722 * blue


def contrast_ratio(foreground: str, background: str) -> float:
    foreground_luminance = relative_luminance(foreground)
    background_luminance = relative_luminance(background)
    lighter = max(foreground_luminance, background_luminance)
    darker = min(foreground_luminance, background_luminance)
    return (lighter + 0.05) / (darker + 0.05)


def check_contrast(lines: list[str]) -> list[str]:
    errors: list[str] = []
    tokens = last_css_tokens(lines)
    for label, foreground_token, background_token, minimum in CONTRAST_PAIRS:
        foreground = tokens.get(foreground_token)
        background = tokens.get(background_token)
        if not foreground or not background:
            errors.append(f"{CSS_PATH.relative_to(ROOT)}: missing contrast tokens for {label}")
            continue
        ratio = contrast_ratio(foreground, background)
        if ratio < minimum:
            errors.append(
                f"{CSS_PATH.relative_to(ROOT)}: {label} contrast is {ratio:.2f}:1; "
                f"expected at least {minimum:.1f}:1"
            )
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
        if value not in {"none", "var(--shadow)", "var(--shadow-soft)"}:
            errors.append(
                f"{CSS_PATH.relative_to(ROOT)}:{number}: box-shadow must be none, var(--shadow), or var(--shadow-soft)"
            )
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


def check_brandbook() -> list[str]:
    page = ROOT / "BRANDBOOK.md"
    if not page.exists():
        return ["BRANDBOOK.md: missing brandbook"]
    text = page.read_text(encoding="utf-8")
    required = (
        "Color Roles",
        "Contrast",
        "Usage Rules",
        "Marketing Fit",
        "Subheadings, labels, meta, captions, and secondary text",
        "Do not treat cream as a generic soft background",
        "Every user-requested or agent-proposed visual change",
    )
    return [f"BRANDBOOK.md: missing {item!r} section" for item in required if item not in text]


def check_component_registry() -> list[str]:
    page = ROOT / "COMPONENTS.md"
    if not page.exists():
        return ["COMPONENTS.md: missing component registry"]
    text = page.read_text(encoding="utf-8")
    required = (
        "Do not use one class for two visual roles",
        "Layout Templates",
        "`hero-split`",
        "`split-media`",
        "`card-grid`",
        "Images must not depend on `width: 100%` alone",
        "Text Labels",
        "`pretitle`",
        "`eyebrow`",
        "No visual variant is implicit",
    )
    return [f"COMPONENTS.md: missing {item!r} rule" for item in required if item not in text]


def check_pretitle_alignment(lines: list[str]) -> list[str]:
    errors: list[str] = []
    css = "\n".join(lines)
    expected = {
        "padding": "0",
        "color": "var(--pretitle)",
        "background": "transparent",
        "border": "0",
        "border-radius": "0",
    }
    declarations = last_selector_declarations(css, ".pretitle")
    if not declarations:
        errors.append(f"{CSS_PATH.relative_to(ROOT)}: missing shared .pretitle component")
    for name, value in expected.items():
        if declarations.get(name) != value:
            errors.append(
                f"{CSS_PATH.relative_to(ROOT)}: .pretitle must keep {name}: {value}; "
                "hero pretitle must not look like a technical badge"
            )

    forbidden_selectors = (
        ".home-landing .hero .eyebrow",
        ".apply-hero .eyebrow",
    )
    for selector in forbidden_selectors:
        if last_selector_declarations(css, selector):
            errors.append(
                f"{CSS_PATH.relative_to(ROOT)}: {selector} reintroduces page-specific hero label styling; "
                "use the shared .pretitle component"
            )

    source_contracts = ((ROOT / "src" / "components" / "blocks" / "HeroSplitBlock.astro", 'class="pretitle"'),)
    for path, marker in source_contracts:
        if not path.exists():
            errors.append(f"{path.relative_to(ROOT)}: missing source file for hero pretitle contract")
            continue
        if marker not in path.read_text(encoding="utf-8"):
            errors.append(f"{path.relative_to(ROOT)}: hero pretitle must use shared .pretitle component")
    return errors


def check_eyebrow_alignment(lines: list[str]) -> list[str]:
    errors: list[str] = []
    css = "\n".join(lines)
    expected = {
        "display": "inline-flex",
        "color": "var(--accent-dark)",
        "background": "var(--accent-soft)",
        "border": "1px solid var(--accent-line)",
        "border-radius": "999px",
        "padding": "5px 10px",
    }
    declarations = last_selector_declarations(css, ".eyebrow")
    if not declarations:
        errors.append(f"{CSS_PATH.relative_to(ROOT)}: missing shared .eyebrow component")
    for name, value in expected.items():
        if declarations.get(name) != value:
            errors.append(f"{CSS_PATH.relative_to(ROOT)}: .eyebrow must keep {name}: {value}")

    forbidden_selectors = (
        ".section-head p,",
        ".section-head p {",
        ".home-landing .section-head p {",
        ".placeholder-panel p {",
        ".system-example-card p,",
    )
    for selector in forbidden_selectors:
        if selector in css:
            errors.append(
                f"{CSS_PATH.relative_to(ROOT)}: broad selector {selector!r} can override component labels; "
                "exclude .eyebrow/.pretitle explicitly"
            )
    return errors


def check_homepage_recipe() -> list[str]:
    if not HOME_CONTENT_PATH.exists():
        return ["src/content/pages/home.md: missing homepage source"]
    text = HOME_CONTENT_PATH.read_text(encoding="utf-8")
    templates = re.findall(r'^\s*(?:-\s*)?template:\s*["\']?([a-z0-9-]+)', text, flags=re.MULTILINE)
    if not templates:
        return ["src/content/pages/home.md: homepage must be assembled from blocks[] templates"]

    cursor = 0
    missing: list[str] = []
    for expected in HOMEPAGE_RECIPE:
        try:
            cursor = templates.index(expected, cursor) + 1
        except ValueError:
            missing.append(expected)
    if missing:
        return [f"src/content/pages/home.md: homepage recipe is missing ordered templates: {', '.join(missing)}"]

    unknown = sorted(set(templates) - APPROVED_TEMPLATES)
    if unknown:
        return [f"src/content/pages/home.md: unknown block templates: {', '.join(unknown)}"]
    return []


def last_selector_declarations(css: str, selector: str) -> dict[str, str]:
    matches: list[re.Match[str]] = []
    pattern = re.compile(r"([^{}]+)\{([^{}]+)\}", re.DOTALL)
    for match in pattern.finditer(css):
        selectors = [item.strip() for item in match.group(1).split(",")]
        if selector in selectors:
            matches.append(match)

    declarations: dict[str, str] = {}
    if not matches:
        return declarations

    for declaration in matches[-1].group(2).split(";"):
        if ":" not in declaration:
            continue
        name, value = declaration.split(":", 1)
        declarations[name.strip()] = value.strip()
    return declarations


def check_home_hero_media_contract(lines: list[str]) -> list[str]:
    errors: list[str] = []
    css = "\n".join(lines)
    image_declarations = last_selector_declarations(css, ".home-landing .hero-visual img")

    expected = {
        "width": "auto",
        "max-width": "min(100%, var(--media-hero-max))",
        "height": "auto",
        "max-height": "none",
        "margin": "0 auto",
        "object-fit": "contain",
        "background": "transparent",
        "border": "0",
        "border-radius": "0",
    }
    for name, value in expected.items():
        if image_declarations.get(name) != value:
            errors.append(
                f"{CSS_PATH.relative_to(ROOT)}: home hero image must keep {name}: {value}; "
                "so the transparent student PNG is not clipped into a rectangular card"
            )

    if HOME_CONTENT_PATH.exists() and "assets/hero-student-organic.png" not in HOME_CONTENT_PATH.read_text(encoding="utf-8"):
        errors.append("src/content/pages/home.md: homepage hero must use assets/hero-student-organic.png")

    return errors


def check_media_max_widths(lines: list[str]) -> list[str]:
    errors: list[str] = []
    css = "\n".join(lines)
    expected = {
        ".home-landing .hero-visual img": "min(100%, var(--media-hero-max))",
        ".split-media-visual img": "min(100%, var(--media-split-max))",
        ".media-stack img": "min(100%, var(--media-stack-primary-max))",
        ".media-stack figure + figure img": "min(100%, var(--media-stack-secondary-max))",
        ".content-card-media img": "min(100%, var(--media-card-max))",
        ".image-showcase-large img": "min(100%, var(--media-showcase-max))",
    }
    for selector, max_width in expected.items():
        declarations = last_selector_declarations(css, selector)
        if not declarations:
            errors.append(f"{CSS_PATH.relative_to(ROOT)}: missing media selector {selector}")
            continue
        if declarations.get("max-width") != max_width:
            errors.append(
                f"{CSS_PATH.relative_to(ROOT)}: {selector} must keep max-width: {max_width}; "
                "media templates must not upscale images when layout columns change"
            )
        if declarations.get("width") == "100%":
            errors.append(
                f"{CSS_PATH.relative_to(ROOT)}: {selector} must not use width: 100%; "
                "use width: auto with max-width instead"
            )
    return errors


def check_home_content_contract() -> list[str]:
    if not HOME_CONTENT_PATH.exists():
        return ["src/content/pages/home.md: missing editable homepage content source"]

    text = HOME_CONTENT_PATH.read_text(encoding="utf-8")
    required = (
        "blocks:",
        'template: "hero-split"',
        'template: "split-media"',
        'template: "card-grid"',
        "Олимпиадная информатика",
        "C++ · Python · Java",
        "Малая группа не отменяет индивидуальный маршрут",
        "Преподаватель помогает",
        "3000 ₽ за занятие",
    )
    errors = [f"src/content/pages/home.md: missing required homepage content {item!r}" for item in required if item not in text]

    forbidden = (
        "постепенно выйти",
        "ведет движение",
        "контролирует движение",
        "видит движение",
        "движение ученика",
        "двигаться по траектории",
    )
    for item in forbidden:
        if item in text:
            errors.append(f"src/content/pages/home.md: forbidden homepage wording {item!r}")

    return errors


def check_layout_template_contract() -> list[str]:
    errors: list[str] = []
    renderer = ROOT / "src" / "components" / "BlockRenderer.astro"
    if not renderer.exists():
        return ["src/components/BlockRenderer.astro: missing layout template renderer"]

    renderer_text = renderer.read_text(encoding="utf-8")
    for template in APPROVED_TEMPLATES:
        if f"'{template}'" not in renderer_text and f'"{template}"' not in renderer_text:
            errors.append(f"src/components/BlockRenderer.astro: missing approved template {template!r}")

    for path in [CSS_PATH, *(ROOT / "src" / "components").rglob("*.astro")]:
        if not path.exists():
            continue
        text = path.read_text(encoding="utf-8")
        for marker in CONTENT_SPECIFIC_CSS_MARKERS:
            if marker in text:
                errors.append(
                    f"{path.relative_to(ROOT)}: content-specific marker {marker!r} found in component/CSS layer; "
                    "use layout template names instead"
                )
    return errors


def check_source_assets() -> list[str]:
    errors: list[str] = []
    layout = ROOT / "src" / "layouts" / "BaseLayout.astro"
    if not layout.exists():
        return ["src/layouts/BaseLayout.astro: missing layout"]

    text = layout.read_text(encoding="utf-8")
    for asset in ("assets/styles.css", "assets/main.js"):
        if asset not in text:
            errors.append(f"src/layouts/BaseLayout.astro: expected asset path {asset!r}")

    for path in (ROOT / "src").rglob("*.astro"):
        page_text = path.read_text(encoding="utf-8")
        if 'href="/' in page_text or 'src="/' in page_text:
            errors.append(f"{path.relative_to(ROOT)}: root-absolute local asset or page link is not allowed")
    return errors


def main() -> int:
    lines = css_lines()
    paths = [CSS_PATH, *collect_html_paths()]
    errors: list[str] = []
    errors.extend(check_tokens(lines))
    errors.extend(check_contrast(lines))
    errors.extend(check_forbidden_patterns(paths))
    errors.extend(check_box_shadows(lines))
    errors.extend(check_hardcoded_hex(paths))
    errors.extend(check_brandbook())
    errors.extend(check_component_registry())
    errors.extend(check_pretitle_alignment(lines))
    errors.extend(check_eyebrow_alignment(lines))
    errors.extend(check_home_content_contract())
    errors.extend(check_homepage_recipe())
    errors.extend(check_layout_template_contract())
    errors.extend(check_home_hero_media_contract(lines))
    errors.extend(check_media_max_widths(lines))
    errors.extend(check_source_assets())

    if errors:
        print("Design check failed:")
        for error in errors:
            print(f"- {error}")
        return 1

    print("Design check passed.")
    return 0


if __name__ == "__main__":
    sys.exit(main())

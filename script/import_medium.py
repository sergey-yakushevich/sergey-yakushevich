#!/usr/bin/env python3
"""Convert the Medium RSS export into markdown posts for the cyberjosef blog."""

import html
import os
import re
import subprocess
import sys
import unicodedata
import xml.etree.ElementTree as ET
from datetime import datetime
from email.utils import parsedate_to_datetime
from pathlib import Path
from urllib.parse import urlparse

from bs4 import BeautifulSoup, NavigableString, Tag

FEED = Path(sys.argv[1])
REPO = Path(sys.argv[2])
POSTS = REPO / "content" / "posts"
IMAGES = REPO / "public" / "images" / "posts"
NS = {"content": "http://purl.org/rss/1.0/modules/content/"}

UA = ("Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) "
      "AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131 Safari/537.36")

INLINE_ESCAPE = re.compile(r"([*_`\[\]])")


def slugify(text):
    text = unicodedata.normalize("NFKD", text).encode("ascii", "ignore").decode()
    text = re.sub(r"[^\w\s-]", "", text).strip().lower()
    return re.sub(r"[\s_-]+", "-", text)[:70].strip("-")


SKIP_HOSTS = ("medium.com/_/stat", "/_/stat?")


def medium_slug(link):
    """Medium URLs end in a hex post id; everything before it is the slug."""
    tail = urlparse(link).path.rstrip("/").split("/")[-1]
    return re.sub(r"-[0-9a-f]{8,}$", "", tail) or None


def download(url, dest):
    """Fetch an image, rejecting Medium's tracking pixel and any non-image body."""
    if any(marker in url for marker in SKIP_HOSTS):
        return False
    dest.parent.mkdir(parents=True, exist_ok=True)
    r = subprocess.run(
        ["curl", "-s", "-L", "-m", "60", "-A", UA, "-o", str(dest), url],
        capture_output=True,
    )
    ok = r.returncode == 0 and dest.exists() and dest.stat().st_size > 1000
    if ok:
        try:
            from PIL import Image

            with Image.open(dest) as im:
                im.verify()
        except Exception:
            ok = False
    if not ok and dest.exists():
        dest.unlink()
    return ok


def inline(node, escape=True):
    """Render inline content of a tag to markdown."""
    out = []
    for child in node.children:
        if isinstance(child, NavigableString):
            text = str(child)
            text = text.replace(" ", " ")
            out.append(INLINE_ESCAPE.sub(r"\\\1", text) if escape else text)
            continue
        if not isinstance(child, Tag):
            continue
        name = child.name
        if name in ("strong", "b"):
            inner = inline(child).strip()
            out.append(f"**{inner}**" if inner else "")
        elif name in ("em", "i"):
            inner = inline(child).strip()
            out.append(f"*{inner}*" if inner else "")
        elif name == "code":
            out.append(f"`{child.get_text()}`")
        elif name == "a":
            label = inline(child).strip()
            href = child.get("href", "")
            href = href.split("?source=")[0]
            out.append(f"[{label}]({href})" if href else label)
        elif name == "br":
            out.append("\n")
        else:
            out.append(inline(child))
    return "".join(out)


def code_block(pre):
    """Medium separates code lines with <br>, not newlines."""
    raw = pre.decode_contents()
    raw = re.sub(r"<br\s*/?>", "\n", raw, flags=re.I)
    text = html.unescape(re.sub(r"<[^>]+>", "", raw))
    text = text.replace(" ", " ").strip("\n")
    fence = "```"
    while fence in text:
        fence += "`"
    return f"{fence}\n{text}\n{fence}"


def list_block(node, ordered, depth=0):
    lines = []
    pad = "  " * depth
    for i, li in enumerate(node.find_all("li", recursive=False), 1):
        marker = f"{i}." if ordered else "-"
        nested = []
        for sub in li.find_all(["ul", "ol"], recursive=False):
            nested.append(list_block(sub, sub.name == "ol", depth + 1))
            sub.extract()
        body = inline(li).strip()
        body = re.sub(r"\n+", " ", body)
        lines.append(f"{pad}{marker} {body}")
        lines.extend(nested)
    return "\n".join(lines)


def convert(body_html, slug, images):
    soup = BeautifulSoup(body_html, "lxml")
    root = soup.body or soup
    blocks = []

    for node in root.find_all(True, recursive=False):
        name = node.name

        if name == "figure":
            img = node.find("img")
            if not img or not img.get("src"):
                continue
            local = images(img["src"])
            if not local:
                continue
            cap = node.find("figcaption")
            alt = inline(cap).strip() if cap else ""
            blocks.append(f"![{alt}]({local})")
            if alt:
                blocks.append(f"*{alt}*")
            continue

        if name == "img":
            local = images(node.get("src", ""))
            if local:
                blocks.append(f"![]({local})")
            continue

        if name == "pre":
            blocks.append(code_block(node))
            continue

        if name in ("h1", "h2", "h3", "h4", "h5", "h6"):
            level = {"h1": "##", "h2": "##", "h3": "##", "h4": "###"}.get(name, "###")
            text = inline(node).strip().replace("\n", " ")
            if text:
                blocks.append(f"{level} {text}")
            continue

        if name == "blockquote":
            text = inline(node).strip()
            if text:
                quoted = "\n".join(f"> {ln}".rstrip() for ln in text.split("\n"))
                blocks.append(quoted)
            continue

        if name in ("ul", "ol"):
            block = list_block(node, name == "ol")
            if block.strip():
                blocks.append(block)
            continue

        if name == "hr":
            blocks.append("---")
            continue

        if name == "p":
            # A paragraph that only wraps an image is a figure in disguise.
            only_img = node.find("img")
            if only_img and not node.get_text(strip=True):
                local = images(only_img.get("src", ""))
                if local:
                    blocks.append(f"![]({local})")
                continue
            text = inline(node).strip()
            text = re.sub(r"[ \t]+\n", "\n", text)
            if text:
                blocks.append(text)
            continue

        text = inline(node).strip()
        if text:
            blocks.append(text)

    md = "\n\n".join(blocks)
    md = re.sub(r"\n{3,}", "\n\n", md)
    return md.strip()


def yaml_str(value):
    return '"' + value.replace("\\", "\\\\").replace('"', '\\"') + '"'


def summarise(md):
    for para in md.split("\n\n"):
        p = para.strip()
        if not p or p.startswith(("#", "!", ">", "-", "`", "*")):
            continue
        p = re.sub(r"\[([^\]]*)\]\([^)]*\)", r"\1", p)
        p = re.sub(r"[*_`\\]", "", p)
        p = re.sub(r"\s+", " ", p).strip()
        if len(p) < 40:
            continue
        if len(p) <= 200:
            return p
        cut = p[:200]
        dot = max(cut.rfind(". "), cut.rfind("? "), cut.rfind("! "))
        return (cut[: dot + 1] if dot > 80 else cut.rsplit(" ", 1)[0] + "…").strip()
    return ""


def main():
    items = ET.parse(FEED).getroot().find("channel").findall("item")
    POSTS.mkdir(parents=True, exist_ok=True)
    written = []

    for item in items:
        title = (item.findtext("title") or "").strip()
        link = (item.findtext("link") or "").split("?")[0]
        date = parsedate_to_datetime(item.findtext("pubDate")).date()
        tags = [c.text for c in item.findall("category") if c.text]
        body = item.find("content:encoded", NS).text or ""
        slug = medium_slug(link) or slugify(title)

        counter = {"n": 0}
        seen = {}

        def fetch(src):
            if not src or not src.startswith("http"):
                return None
            if src in seen:
                return seen[src]
            counter["n"] += 1
            ext = os.path.splitext(urlparse(src).path)[1].lower()
            if ext not in (".jpg", ".jpeg", ".png", ".gif", ".webp"):
                ext = ".jpg"
            name = f"{counter['n']:02d}{ext}"
            dest = IMAGES / slug / name
            if not download(src, dest):
                print(f"    ! image failed: {src[:80]}")
                counter["n"] -= 1
                return None
            rel = f"/images/posts/{slug}/{name}"
            seen[src] = rel
            return rel

        md = convert(body, slug, fetch)
        summary = summarise(md)
        cover = next(iter(seen.values()), None)

        # The cover is shown by the card; drop the duplicate at the top of the body.
        if cover:
            md = re.sub(r"^!\[[^\]]*\]\(" + re.escape(cover) + r"\)\n*", "", md, count=1)
            md = md.lstrip("\n")

        fm = [
            "---",
            "title: " + yaml_str(title),
            "summary: " + yaml_str(summary),
            f"date: {date.isoformat()}",
            f"tags: [{', '.join(tags)}]" if tags else "tags: []",
        ]
        if cover:
            fm.append(f"cover_image: {cover}")
        fm.append(f"canonical: {link}")
        fm.append("status: published")
        fm.append("---")

        path = POSTS / f"{date.isoformat()}-{slug}.md"
        path.write_text("\n".join(fm) + "\n\n" + md + "\n")
        written.append((path, len(md), len(seen)))
        print(f"  ✓ {path.name}  ({len(md)} chars, {len(seen)} images)")

    print(f"\n{len(written)} posts written")


if __name__ == "__main__":
    main()

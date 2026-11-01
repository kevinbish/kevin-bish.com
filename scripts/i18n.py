"""Translation engine for kevin-bish.com (standard library only).

The English index.html is the single source. This module
  * finds every translatable string in it ("units") and in js/main.js (T('...') calls),
  * applies a language file (i18n/<code>.json) to produce <code>/index.html,
  * generates the language menu, hreflang tags and sitemap entries.

A unit is keyed by its English text itself, so editing the English automatically marks the old
translation as missing instead of silently showing a stale one.
"""
import json
import re
from html import unescape
from html.parser import HTMLParser
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://www.kevin-bish.com/"

VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "source", "track", "wbr"}
INLINE_OK = {"a", "b", "i", "em", "strong", "br", "span", "code", "kbd", "small", "time", "sup", "sub", "u", "mark", "abbr", "s"}
SKIP_TAGS = {"script", "style", "svg", "noscript", "head"}
UNIT_TAGS = {"p", "li", "h3", "summary", "title", "figcaption"}
UNIT_CLASSES = {"s", "cm", "in", "now", "date", "meta", "yr", "tagline", "ov", "lede", "tl-txt", "st-k", "top-link", "sig", "disclaimer", "now-x"}
ATTRS = ("title", "aria-label", "alt", "placeholder")
META_NAMES = {"description", "twitter:title", "twitter:description", "twitter:image:alt"}
META_PROPS = {"og:title", "og:description", "og:image:alt"}
BLOCK_DIR_TAGS = {"p", "li", "h3", "summary"}   # get dir="auto" on right-to-left pages

LANG_START, LANG_END = "<!-- lang:start -->", "<!-- lang:end -->"
HEAD_START, HEAD_END = "<!-- hreflang:start -->", "<!-- hreflang:end -->"


# ------------------------------------------------------------------ tiny HTML tree
class Node:
    __slots__ = ("tag", "start", "end", "kids", "parent", "text", "attrs")

    def __init__(self, tag=None, start="", end="", text=None, attrs=None, parent=None):
        self.tag, self.start, self.end, self.text = tag, start, end, text
        self.attrs = attrs or []
        self.kids = []
        self.parent = parent


class Tree(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=False)
        self.root = Node("#root")
        self.cur = self.root

    def _add(self, n):
        n.parent = self.cur
        self.cur.kids.append(n)

    def handle_starttag(self, tag, attrs):
        n = Node(tag, start=self.get_starttag_text(), attrs=attrs)
        self._add(n)
        if tag not in VOID:
            self.cur = n

    def handle_startendtag(self, tag, attrs):
        self._add(Node(tag, start=self.get_starttag_text(), attrs=attrs))

    def handle_endtag(self, tag):
        n = self.cur
        while n is not self.root and n.tag != tag:
            n = n.parent
        if n is not self.root:
            n.end = f"</{tag}>"
            self.cur = n.parent

    def _text(self, s):
        self._add(Node(text=s))

    def handle_data(self, d):
        self._text(d)

    def handle_entityref(self, name):
        self._text(f"&{name};")

    def handle_charref(self, name):
        self._text(f"&#{name};")

    def handle_comment(self, data):
        self._text(f"<!--{data}-->")

    def handle_decl(self, decl):
        self._text(f"<!{decl}>")


def parse(html):
    t = Tree()
    t.feed(html)
    t.close()
    return t.root


def classes(n):
    for k, v in n.attrs:
        if k == "class" and v:
            return set(v.split())
    return set()


def attr(n, name):
    for k, v in n.attrs:
        if k == name:
            return v
    return None


def serialize(n, fn=None):
    """fn(node) may return a replacement string for the whole node, or None."""
    if fn:
        r = fn(n)
        if r is not None:
            return r
    if n.text is not None:
        return n.text
    return n.start + "".join(serialize(k, fn) for k in n.kids) + n.end


def raw_inner(n, fn=None):
    return "".join(serialize(k, fn) for k in n.kids)


def has_letters(s):
    return bool(re.search(r"[^\W\d_]", unescape(re.sub(r"<[^>]+>", "", s))))


def inline_only(n):
    for k in n.kids:
        if k.text is None:
            if k.tag not in INLINE_OK or not inline_only(k):
                return False
    return True


def is_unit_element(n):
    if n.text is not None or n.tag in SKIP_TAGS - {"title"}:
        return False
    if n.tag not in UNIT_TAGS and not (classes(n) & UNIT_CLASSES):
        return False
    if attr(n, "data-i18n") == "skip":
        return False
    return inline_only(n) and has_letters(raw_inner(n))


# ------------------------------------------------------------------ units
def norm(s):
    return re.sub(r"\s+", " ", s).strip()


def split_quotes(core):
    """'"Foo"' -> ('"', 'Foo', '"') so translators only see the words."""
    if len(core) >= 2 and core[0] == '"' and core[-1] == '"':
        return '"', core[1:-1], '"'
    return "", core, ""


def walk_units(root, visit):
    """Calls visit(kind, node, key) for each unit. kind: 'el', 'text', 'attr'."""
    in_generated = [False]

    def rec(n):
        if n.text is not None:
            if n.text.startswith("<!--"):
                if LANG_START in n.text or HEAD_START in n.text:
                    in_generated[0] = True
                elif LANG_END in n.text or HEAD_END in n.text:
                    in_generated[0] = False
            return
        if in_generated[0]:
            return
        if n.tag == "meta":
            name, prop, content = attr(n, "name"), attr(n, "property"), attr(n, "content")
            if content and has_letters(content) and (name in META_NAMES or prop in META_PROPS):
                visit("attr", n, norm(content), "content")
            return
        if n.tag in SKIP_TAGS and n.tag != "head":
            return
        for a in ATTRS:
            v = attr(n, a)
            if v and has_letters(v) and not v.startswith("http"):
                visit("attr", n, norm(v), a)
        if n.tag == "h2":
            run = []
            for k in n.kids + [None]:
                if k is not None and k.text is not None and not k.text.strip().startswith("<!--"):
                    run.append(k)
                    continue
                joined = "".join(r.text for r in run)
                if run and has_letters(joined):
                    visit("run", run, norm(joined), None)
                run = []
        if is_unit_element(n):
            visit("el", n, norm(raw_inner(n)), None)
            return
        for k in n.kids:
            rec(k)

    rec(root)


def collect_units(html):
    out = []
    walk_units(parse(html), lambda kind, n, key, a=None: out.append(split_quotes(key)[1] if kind == "el" else key))
    seen, res = set(), []
    for k in out:
        if k not in seen:
            seen.add(k)
            res.append(k)
    return res


# ------------------------------------------------------------------ JS strings
JS_ESC = {"n": "\n", "t": "\t", "r": "\r", "'": "'", '"': '"', "\\": "\\", "`": "`", "/": "/"}


def parse_js_string(src, i):
    q = src[i]
    out, i = [], i + 1
    while i < len(src) and src[i] != q:
        c = src[i]
        if c == "\\":
            i += 1
            e = src[i]
            if e == "u":
                out.append(chr(int(src[i + 1:i + 5], 16)))
                i += 4
            elif e == "x":
                out.append(chr(int(src[i + 1:i + 3], 16)))
                i += 2
            else:
                out.append(JS_ESC.get(e, e))
        else:
            out.append(c)
        i += 1
    return "".join(out), i + 1


def collect_js(js):
    res, seen = [], set()
    for m in re.finditer(r"(?<![\w$.])T\(\s*(['\"])", js):
        s, _ = parse_js_string(js, m.end() - 1)
        if s not in seen:
            seen.add(s)
            res.append(s)
    return res


# ------------------------------------------------------------------ languages
def load_languages():
    return json.loads((ROOT / "i18n" / "languages.json").read_text(encoding="utf-8"))


def load_lang(code):
    p = ROOT / "i18n" / f"{code}.json"
    if not p.exists():
        return {"html": {}, "js": {}}
    d = json.loads(p.read_text(encoding="utf-8"))
    d.setdefault("html", {})
    d.setdefault("js", {})
    return d


def load_keep():
    p = ROOT / "i18n" / "keep.json"
    if not p.exists():
        return {"html": [], "js": []}
    return json.loads(p.read_text(encoding="utf-8"))


def page_url(code, default="en"):
    return SITE if code == default else f"{SITE}{code}/"


def switcher_html(langs, current, depth):
    """<details> menu; plain links, so it works without JavaScript."""
    up = "../" if depth else ""
    cur = next(l for l in langs if l["code"] == current)
    items = []
    for l in langs:
        href = (up if l["code"] == "en" else up + l["code"] + "/") or "./"
        if l["code"] == "en" and not depth:
            href = "./"
        cls = ' aria-current="true"' if l["code"] == current else ""
        items.append(f'<li><a href="{href}" hreflang="{l["code"]}" lang="{l["code"]}"{cls}>{l["native"]}</a></li>')
    return (
        f'{LANG_START}\n  <details class="lang" data-i18n="skip"><summary title="{cur["name"]}" aria-label="Language: {cur["name"]}">'
        f'<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/></svg>'
        f'<span class="tl-txt">{current.upper()}</span></summary><ul>{"".join(items)}</ul></details>\n  {LANG_END}'
    )


def hreflang_html(langs, current):
    lines = [HEAD_START]
    if len(langs) > 1:
        for l in langs:
            lines.append(f'  <link rel="alternate" hreflang="{l["code"]}" href="{page_url(l["code"])}">')
        lines.append(f'  <link rel="alternate" hreflang="x-default" href="{SITE}">')
    lines.append(f'  <link rel="canonical" href="{page_url(current)}">')
    lines.append(f'  <meta property="og:url" content="{page_url(current)}">')
    lines.append(f'  <meta property="og:locale" content="{next(l for l in langs if l["code"] == current)["locale"]}">')
    lines.append(f"  {HEAD_END}")
    return "\n".join(lines)


def with_generated(html, langs, current, depth=0):
    """Insert/refresh the language menu and hreflang block in an English-source page."""
    sw = switcher_html(langs, current, depth) if len(langs) > 1 else f"{LANG_START}{LANG_END}"
    html = re.sub(re.escape(LANG_START) + r".*?" + re.escape(LANG_END), lambda m: sw, html, flags=re.S)
    hl = hreflang_html(langs, current)
    html = re.sub(re.escape(HEAD_START) + r".*?" + re.escape(HEAD_END), lambda m: hl, html, flags=re.S)
    return html


# ------------------------------------------------------------------ building a language page
REL_ATTRS = ("href", "src", "srcset")


def prefix_paths(root_html):
    """Make local relative URLs work from /<lang>/index.html."""
    def fix(m):
        name, q, val = m.group(1), m.group(2), m.group(3)
        if re.match(r"(?i)(https?:|//|#|mailto:|tel:|data:|\.\./|/)", val) or val == "":
            return m.group(0)
        return f"{name}={q}../{val}{q}"
    return re.sub(r'(?<=[\s])(href|src|srcset)=(["\'])(.*?)\2', fix, root_html)


def js_translations(data, js_keys):
    """Translations for T('...') keys. A key with no scripts entry falls back to the identical page text."""
    plain = {unescape(k): unescape(v) for k, v in data["html"].items() if "<" not in v}
    out = {}
    for k in js_keys:
        v = data["js"].get(k) or plain.get(k)
        if v:
            out[k] = v
    return out


def build_page(english_html, langs, code, data, js_keys=()):
    """Return the finished HTML for language `code` (English returns the source with generated blocks)."""
    page = with_generated(english_html, langs, code, depth=0 if code == "en" else 1)
    if code == "en":
        return page
    meta = next(l for l in langs if l["code"] == code)
    tr = data["html"]
    root = parse(page)
    subs = {}  # id(node) -> replacement string for the whole node

    def esc_attr(s):
        return s.replace("&", "&amp;").replace('"', "&quot;") if "&amp;" not in s else s.replace('"', "&quot;")

    attr_changes = {}  # id(node) -> {attrname: new}

    def visit(kind, n, key, a):
        if kind == "attr":
            new = tr.get(key)
            if new:
                attr_changes.setdefault(id(n), {})[a] = new
        elif kind == "run":
            new = tr.get(key)
            if new:
                joined = "".join(r.text for r in n)
                lead = re.match(r"\s*", joined).group(0)
                trail = re.search(r"\s*$", joined).group(0)
                subs[id(n[0])] = lead + new + trail
                for extra in n[1:]:
                    subs[id(extra)] = ""
        else:
            pre, core, suf = split_quotes(key)
            new = tr.get(core)
            if new:
                raw = raw_inner(n)
                lead = re.match(r"\s*", raw).group(0)
                trail = re.search(r"\s*$", raw).group(0)
                inner_new = lead + pre + new + suf + trail
                subs[id(n)] = ("el", inner_new)

    walk_units(root, visit)
    rtl_dir = meta.get("dir") == "rtl"

    def fn(n):
        if n.text is not None:
            return subs.get(id(n))
        start = n.start
        ch = attr_changes.get(id(n))
        if ch:
            for a, v in ch.items():
                start = re.sub(r'(\b' + re.escape(a) + r'=")([^"]*)(")', lambda m: m.group(1) + esc_attr(v) + m.group(3), start, count=1)
        s = subs.get(id(n))
        if s and isinstance(s, tuple):
            if rtl_dir and n.tag in BLOCK_DIR_TAGS and "dir=" not in start:
                start = start[:-1] + ' dir="auto">'
            return start + s[1] + n.end
        if ch:
            return start + "".join(serialize(k, fn) for k in n.kids) + n.end
        return None

    out = serialize(root, fn)
    # <html lang>, local paths, JSON-LD page facts, translated JS strings
    out = re.sub(r'<html lang="en"', f'<html lang="{code}"', out, count=1)
    out = prefix_paths(out)
    out = re.sub(r'("@type": "ProfilePage",.*?"url": ")[^"]+(")', lambda m: m.group(1) + page_url(code) + m.group(2), out, count=1, flags=re.S)
    out = re.sub(r'("@type": "ProfilePage",.*?"inLanguage": ")en(")', lambda m: m.group(1) + code + m.group(2), out, count=1, flags=re.S)
    jst = js_translations(data, js_keys)
    payload = json.dumps({"lang": code, "t": jst}, ensure_ascii=False).replace("</", "<\\/")
    out = out.replace('<script src="../js/main.js">', f"<script>window.I18N={payload};</script>\n<script src=\"../js/main.js\">", 1)
    return out


def coverage(english_html, js_src, code):
    data, keep = load_lang(code), load_keep()
    units = collect_units(english_html)
    js = collect_js(js_src)
    k_html, k_js = set(keep["html"]), set(keep["js"])
    miss_html = [u for u in units if u not in data["html"] and u not in k_html]
    have = js_translations(data, js)
    miss_js = [s for s in js if s not in have and s not in k_js]
    return {
        "html_total": len(units), "html_missing": miss_html,
        "js_total": len(js), "js_missing": miss_js,
    }

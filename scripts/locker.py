"""The evidence locker: builds the Files & Documents listing from the files/ folder.

Put a file in files/<folder>/ (for example files/papers/report.pdf) and run scripts/build.py, or let the
GitHub Action do it after you upload. Name, type, size and date are read from the file itself (the date is
the last git commit that touched it). An optional one-line description comes from files/locker.json.
"""
import html
import json
import os
import subprocess
from datetime import date
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
FILES = ROOT / "files"
CONFIG = FILES / "locker.json"
START, END = "<!-- locker:start -->", "<!-- locker:end -->"
SKIP = {"locker.json", "README.md", ".gitkeep"}
COLOURS = {"pdf": "#ff6961", "ppt": "#ef7d22", "pptx": "#ef7d22", "doc": "#3aa9f2", "docx": "#3aa9f2",
           "xls": "#2fb36c", "xlsx": "#2fb36c", "csv": "#8fd14f", "json": "#8fd14f", "xml": "#8fd14f",
           "txt": "#a9a9a9", "md": "#a9a9a9", "zip": "#e0b400", "png": "#c26dff", "jpg": "#c26dff",
           "jpeg": "#c26dff", "gif": "#c26dff", "svg": "#c26dff", "webp": "#c26dff", "mp4": "#ff9fd0"}
ROOT_FOLDER = "evidence-locker"


def load_config():
    if CONFIG.exists():
        return json.loads(CONFIG.read_text(encoding="utf-8"))
    return {}


def git_date(rel):
    try:
        out = subprocess.run(["git", "log", "-1", "--format=%cs", "--", rel], cwd=ROOT,
                             capture_output=True, text=True, timeout=20).stdout.strip()
        if out:
            return out
    except (OSError, subprocess.SubprocessError):
        pass
    return date.fromtimestamp((ROOT / rel).stat().st_mtime).isoformat()


def human_size(n):
    for unit in ("B", "KB", "MB", "GB"):
        if n < 1024 or unit == "GB":
            return f"{n:.0f} {unit}" if unit in ("B", "KB") else f"{n:.1f} {unit}"
        n /= 1024


def collect():
    """Return the list of public files as dicts, newest first."""
    cfg = load_config()
    descs = cfg.get("descriptions", {})
    items = []
    if FILES.is_dir():
        for p in sorted(FILES.rglob("*")):
            if not p.is_file() or p.name in SKIP or any(part.startswith(".") for part in p.relative_to(FILES).parts):
                continue
            rel_files = p.relative_to(FILES).as_posix()
            parts = rel_files.split("/")
            items.append({
                "path": "files/" + rel_files,
                "folder": parts[0] if len(parts) > 1 else "",
                "name": p.name,
                "desc": descs.get(rel_files, ""),
            })
    for extra in cfg.get("extra", []):
        p = ROOT / extra["path"]
        if p.is_file():
            items.append({"path": extra["path"], "folder": extra.get("folder", ""), "name": p.name,
                          "desc": extra.get("description", "")})
    for it in items:
        p = ROOT / it["path"]
        it["bytes"] = p.stat().st_size
        it["size"] = human_size(it["bytes"])
        it["date"] = git_date(it["path"])
        ext = p.suffix.lower().lstrip(".")
        it["type"] = ext or "file"
    items.sort(key=lambda i: (i["date"], i["name"]), reverse=True)
    return items


def icon(t):
    c = COLOURS.get(t, "#a9a9a9")
    label = html.escape(t.upper()[:4])
    return (f'<svg class="fi" viewBox="0 0 24 30" aria-hidden="true"><path d="M2 1h14l6 6v22H2z"/><path d="M16 1v6h6"/>'
            f'<rect x="0" y="16" width="20" height="9" rx="1.5" style="fill:{c};stroke:none"/>'
            f'<text x="10" y="23" text-anchor="middle">{label}</text></svg>')


def nice_date(iso):
    d = date.fromisoformat(iso)
    return f"{d.day} {d.strftime('%b %Y')}"


def render(items):
    e = html.escape
    folders = {}
    for it in items:
        if it["folder"]:
            folders[it["folder"]] = folders.get(it["folder"], 0) + 1
    types = sorted({it["type"] for it in items})
    total = human_size(sum(i["bytes"] for i in items)) if items else "0 B"
    last = max((i["date"] for i in items), default="")
    tree = "".join(
        f'<li><button type="button" data-f="{e(f)}" aria-pressed="false"><svg class="fo" viewBox="0 0 24 20" aria-hidden="true">'
        f'<path d="M1 3h8l2 3h12v13H1z"/></svg>{e(f)}/<span>{n}</span></button></li>'
        for f, n in sorted(folders.items()))
    chips = '<button type="button" data-t="all" aria-pressed="true">*.*</button>' + "".join(
        f'<button type="button" data-t="{e(t)}" aria-pressed="false">*.{e(t)}</button>' for t in types)
    rows = "\n".join(
        f'        <tr data-folder="{e(i["folder"])}" data-type="{e(i["type"])}"><td class="fx-name">{icon(i["type"])}'
        f'<span><a href="{e(i["path"])}">{e(i["name"])}</a>'
        + (f'<small>{e(i["desc"])}</small>' if i["desc"] else "")
        + f'</span></td><td><span class="fx-badge" style="--c:{COLOURS.get(i["type"], "#a9a9a9")}">.{e(i["type"])}</span></td>'
        f'<td class="fx-num">{e(i["size"])}</td><td class="fx-num"><time datetime="{i["date"]}">{nice_date(i["date"])}</time></td>'
        f'<td><a class="fx-get" href="{e(i["path"])}" download aria-label="Download {e(i["name"])}">get()<span aria-hidden="true"> ↓</span></a></td></tr>'
        for i in items)
    if not items:
        rows = '        <tr><td colspan="5" class="cm">// the locker is empty for now.</td></tr>'
    last_html = (f'<span class="cm" id="fxLast" data-date="{last}">// last upload: {nice_date(last)}</span>' if last else "")
    return f"""{START}
  <div class="fx" id="fx" data-count="{len(items)}" data-size="{e(total)}">
    <div class="win-bar"><div class="lights"><span class="r"></span><span class="y"></span><span class="gdot"></span></div><span class="win-title">~/gotham/{ROOT_FOLDER} — ls -la</span><span class="win-state" id="fxState">{len(items)} files · {e(total)}</span></div>
    <div class="fx-tools js-only">
      <label class="fx-search"><span class="v">grep</span><input id="fxQ" type="search" placeholder="search the locker…" autocomplete="off" aria-label="Search the files"></label>
      <div class="fx-chips" role="group" aria-label="File type">{chips}</div>
    </div>
    <div class="fx-body">
      <nav class="fx-tree" aria-label="Folders"><ul><li><button type="button" data-f="all" aria-pressed="true"><svg class="bat" viewBox="0 0 60 26" aria-hidden="true"><use href="#bat"/></svg>{ROOT_FOLDER}/<span>{len(items)}</span></button></li>{tree}</ul></nav>
      <div class="fx-list-wrap"><table class="fx-list">
        <thead><tr><th>name</th><th>type</th><th class="fx-num">size</th><th class="fx-num">modified</th><th><span class="sr">get</span></th></tr></thead>
        <tbody id="fxRows">
{rows}
        </tbody>
      </table>
      <p class="fx-empty cm" id="fxEmpty" hidden>// no files match. try another search.</p></div>
    </div>
    <div class="fx-status"><span><span class="v">$</span> ls ~/gotham/{ROOT_FOLDER}</span>{last_html}</div>
  </div>
  {END}"""


def apply(page_html):
    """Replace the locker block in index.html with a fresh listing."""
    start, end = page_html.find(START), page_html.find(END)
    if start < 0 or end < 0:
        return page_html
    return page_html[:start] + render(collect()) + page_html[end + len(END):]


if __name__ == "__main__":
    for i in collect():
        print(i["date"], i["size"].rjust(8), i["path"], "-", i["desc"])

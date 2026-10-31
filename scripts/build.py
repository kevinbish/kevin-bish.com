#!/usr/bin/env python3
"""Regenerate the files that are derived from resume.json.

resume.json is the single source of truth for the CV facts. Run this after editing it:

    python3 scripts/build.py           # rewrite the generated files
    python3 scripts/build.py --check   # exit 1 if any generated file is out of date

It rewrites:
  llms-full.txt   the whole profile as plain Markdown (generated in full)
  sitemap.xml     the page URL with meta.lastModified as lastmod
  index.html      only these parts of the JSON-LD block in the <head>:
                    - ProfilePage.dateModified
                    - Person.hasCredential (degrees are kept, certificates come from resume.json)
                    - the ScholarlyArticle nodes (from publications)

It does not touch llms.txt (hand-written), the visible page text, or the rest of the JSON-LD.
Standard library only, no installs needed.
"""
import json
import re
import sys
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
SITE = "https://www.kevin-bish.com/"
PERSON = SITE + "#person"


def load():
    return json.loads((ROOT / "resume.json").read_text(encoding="utf-8"))


# ---------------------------------------------------------------- llms-full.txt
def llms_full(d):
    b = d["basics"]
    out = [
        f"# {b['name']}: full profile",
        "",
        f"Source: {b['url']} · Last updated: {d['meta']['lastModified']}",
        "",
        b["summary"],
        "",
        "## Experience",
        "",
    ]
    for w in d["work"]:
        end = w.get("endDate", "Present")
        out.append(f"### {w['position']}, {w['name']} ({w['startDate']} to {end})")
        out.append("")
        if w.get("location"):
            out += [f"Location: {w['location']}", ""]
        if w.get("summary"):
            out += [w["summary"], ""]
        for h in w.get("highlights", []):
            out.append(f"- {h}")
        if w.get("highlights"):
            out.append("")
    out += ["## Education", ""]
    for e in d["education"]:
        line = f"- {e['studyType']}, {e['area']}, {e['institution']}"
        if e.get("endDate"):
            line += f" ({e['endDate']})"
        out.append(line)
    out += ["", "## Certifications", ""]
    out += [f"- {c['name']}" for c in d["certificates"]]
    out += ["", "## Publications", ""]
    out += [f"- {p['name']}. {p['publisher']}, {p['releaseDate']}." for p in d["publications"]]
    out += ["", "## Honours and awards", ""]
    for a in d["awards"]:
        extra = ", ".join(x for x in (a.get("awarder"), a.get("date")) if x)
        out.append(f"- {a['title']}" + (f" ({extra})" if extra else ""))
    out += ["", "## Skills", ""]
    out += [f"- {s['name']}: {', '.join(s['keywords'])}" for s in d["skills"]]
    out += ["", "## Volunteer and community", ""]
    for v in d["volunteer"]:
        line = f"- {v['position']}, {v['organization']}"
        if v.get("summary"):
            line += f": {v['summary']}"
        out.append(line)
    out += ["", "## Featured", ""]
    out += [f"- {p['name']}: {p['url']}" for p in d["projects"]]
    out += ["", "## Languages", ""]
    out += [f"- {l['language']} ({l['fluency']})" for l in d["languages"]]
    out += ["", "## Interests", ""]
    out += [f"- {i['name']}: {', '.join(i['keywords'])}" for i in d["interests"]]
    out += ["", "## Links", ""]
    out += [f"- {p['network']}: {p['url']}" for p in b["profiles"]]
    out.append(f"- Website: {b['url']}")
    return "\n".join(out) + "\n"


# ---------------------------------------------------------------- sitemap.xml
def sitemap(d):
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
        f"  <url><loc>{SITE}</loc><lastmod>{d['meta']['lastModified']}</lastmod>"
        "<changefreq>monthly</changefreq><priority>1.0</priority></url>\n"
        "</urlset>\n"
    )


# ---------------------------------------------------------------- index.html JSON-LD
LD_RE = re.compile(r'(<script type="application/ld\+json">\n)(.*?)(\n  </script>)', re.S)


def index_html(d):
    html = (ROOT / "index.html").read_text(encoding="utf-8")
    m = LD_RE.search(html)
    if not m:
        sys.exit("index.html: JSON-LD block not found")
    ld = json.loads(m.group(2))
    graph = ld["@graph"]

    for node in graph:
        if node.get("@type") == "ProfilePage":
            node["dateModified"] = d["meta"]["lastModified"]
        if node.get("@type") == "Person":
            degrees = [c for c in node["hasCredential"] if c.get("credentialCategory") == "degree"]
            certs = [
                {
                    "@type": "EducationalOccupationalCredential",
                    "name": c["name"],
                    "credentialCategory": "diploma" if "diploma" in c["name"].lower() else "certification",
                }
                for c in d["certificates"]
            ]
            node["hasCredential"] = degrees + certs

    articles = [
        {
            "@type": "ScholarlyArticle",
            "name": p["name"],
            "datePublished": p["releaseDate"],
            "publisher": {"@type": "Organization", "name": p["publisher"]},
            "author": {"@id": PERSON},
        }
        for p in d["publications"]
    ]
    first = next(i for i, n in enumerate(graph) if n.get("@type") == "ScholarlyArticle")
    graph[:] = [n for n in graph if n.get("@type") != "ScholarlyArticle"]
    graph[first:first] = articles

    new_ld = json.dumps(ld, indent=2, ensure_ascii=False)
    return html[: m.start(2)] + new_ld + html[m.end(2):]


# ---------------------------------------------------------------- main
def main():
    check = "--check" in sys.argv[1:]
    d = load()
    outputs = {
        "llms-full.txt": llms_full(d),
        "sitemap.xml": sitemap(d),
        "index.html": index_html(d),
    }
    stale = []
    for name, text in outputs.items():
        path = ROOT / name
        current = path.read_text(encoding="utf-8") if path.exists() else None
        if current != text:
            stale.append(name)
            if not check:
                path.write_text(text, encoding="utf-8")
    if check:
        if stale:
            print("Out of date (run python3 scripts/build.py): " + ", ".join(stale))
            sys.exit(1)
        print("All generated files are up to date.")
    else:
        print("Updated: " + ", ".join(stale) if stale else "Nothing to change.")


if __name__ == "__main__":
    main()

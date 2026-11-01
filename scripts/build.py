#!/usr/bin/env python3
"""Regenerate the files that are derived from resume.json.

resume.json is the single source of truth for the CV facts. Run this after editing it:

    python3 scripts/build.py           # rewrite the generated files
    python3 scripts/build.py --check   # exit 1 if any generated file is out of date

It rewrites:
  llms-full.txt   the whole profile as plain Markdown (generated in full)
  sitemap.xml     the page URL with meta.lastModified as lastmod
  <code>/index.html  one page per published language (fr/, es/, ...), generated from the English
                  index.html plus i18n/<code>.json (see scripts/i18n.py and the README)
  index.html      the language menu and hreflang block, and only these parts of the JSON-LD block in the <head>:
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

sys.path.insert(0, str(Path(__file__).resolve().parent))
import i18n  # noqa: E402

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
def sitemap(d, langs):
    alts = "".join(
        f'\n    <xhtml:link rel="alternate" hreflang="{l["code"]}" href="{i18n.page_url(l["code"])}"/>' for l in langs
    ) + f'\n    <xhtml:link rel="alternate" hreflang="x-default" href="{SITE}"/>'
    rows = "".join(
        f"  <url>\n    <loc>{i18n.page_url(l['code'])}</loc>\n    <lastmod>{d['meta']['lastModified']}</lastmod>"
        f"\n    <changefreq>monthly</changefreq>\n    <priority>{'1.0' if l['code'] == 'en' else '0.8'}</priority>"
        + (alts if len(langs) > 1 else "") + "\n  </url>\n"
        for l in langs
    )
    return (
        '<?xml version="1.0" encoding="UTF-8"?>\n'
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n'
        + rows + "</urlset>\n"
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


def enabled_languages():
    return [l for l in i18n.load_languages() if l.get("enabled")]


# ---------------------------------------------------------------- translation report
def i18n_report():
    english = (ROOT / "index.html").read_text(encoding="utf-8")
    js = (ROOT / "js" / "main.js").read_text(encoding="utf-8")
    for l in i18n.load_languages():
        if l["code"] == "en":
            continue
        c = i18n.coverage(english, js, l["code"])
        done_h = c["html_total"] - len(c["html_missing"])
        done_j = c["js_total"] - len(c["js_missing"])
        print(f"{l['code']} ({l['name']}){' [published]' if l.get('enabled') else ''}: page {done_h}/{c['html_total']}, scripts {done_j}/{c['js_total']}")
        if "--verbose" in sys.argv[1:]:
            for k in c["html_missing"] + c["js_missing"]:
                print("   missing:", k[:110])


# ---------------------------------------------------------------- main
def main():
    check = "--check" in sys.argv[1:]
    d = load()
    langs = enabled_languages()
    if "--i18n-report" in sys.argv[1:]:
        return i18n_report()
    english = i18n.with_generated(index_html(d), langs, "en", 0)
    js_keys = i18n.collect_js((ROOT / "js" / "main.js").read_text(encoding="utf-8"))
    outputs = {
        "llms-full.txt": llms_full(d),
        "sitemap.xml": sitemap(d, langs),
        "index.html": english,
    }
    for l in langs:
        if l["code"] != "en":
            outputs[f"{l['code']}/index.html"] = i18n.build_page(english, langs, l["code"], i18n.load_lang(l["code"]), js_keys)
    stale = []
    for name, text in outputs.items():
        path = ROOT / name
        current = path.read_text(encoding="utf-8") if path.exists() else None
        if current != text:
            stale.append(name)
            if not check:
                path.parent.mkdir(exist_ok=True)
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

# kevin-bish.com: personal website

A static site with no build step on the host. Upload the folder as-is to any web host.
(A small optional script, `scripts/build.py`, keeps the machine-readable files in sync with `resume.json`; see below.)

## Files

```
index.html          the page
css/style.css       all styles (dark grey editor theme + light mode)
js/main.js          gutter line numbers, skyline/signal, skill rings, LOCODE Hunter, terminal
images/kevin.webp   portrait (served first; WebP, about 8 KB)
images/kevin.jpg    portrait fallback, also used for og:image and the JSON-LD
images/mascot.gif   pixel mascot from the original site
images/og-card.png  1200x630 social share card (Open Graph / Twitter)
favicon.svg         {KB} tab icon
fonts/              self-hosted Open Sans, Fira Code and Bebas Neue (latin WOFF2) + LICENSES.md
scripts/build.py    regenerates llms-full.txt, sitemap.xml and parts of the JSON-LD from resume.json
robots.txt          lets search engines and AI crawlers in; points to the sitemap
sitemap.xml         the page URL for search engines
llms.txt            short Markdown profile for AI assistants (llmstxt.org convention); hand-written
llms-full.txt       the whole profile as plain Markdown; generated from resume.json
resume.json         machine-readable CV in JSON Resume format (jsonresume.org); the source of truth
```

`index.html` also carries schema.org JSON-LD (Person, ProfilePage, publications) in its `<head>`,
plus canonical, Open Graph and Twitter tags.

All absolute URLs assume https://www.kevin-bish.com/. If you host elsewhere, search-and-replace that
address in index.html, llms.txt, llms-full.txt, resume.json, robots.txt and sitemap.xml.

After going live:
- Check the structured data at https://search.google.com/test/rich-results and https://validator.schema.org
- Submit sitemap.xml in Google Search Console and Bing Webmaster Tools

## Changing your CV

1. Edit `resume.json` (and set `meta.lastModified` to today's date).
2. Run `python3 scripts/build.py`. It rewrites `llms-full.txt`, `sitemap.xml` and, in `index.html`,
   the JSON-LD `dateModified`, certificates and publication entries. `--check` reports whether anything
   is out of date without changing files (handy for a future CI check).
3. Update the visible text in `index.html` by hand, and `llms.txt` if the headline facts changed.
   The script does not touch the page text, the rest of the JSON-LD, or `llms.txt`.

Everything, including the fonts, is served from this folder; the page makes no third-party requests
except the optional GitHub call for the footer "last signal" stamp.

## Deploy options

### Option 1: your existing host for kevin-bish.com
1. Open your hosting file manager or connect by FTP/SFTP.
2. Back up the current `public_html` (or `www`) folder.
3. Upload the contents of this folder (not the folder itself) so `index.html` sits at the root.
4. Visit https://www.kevin-bish.com and hard-refresh (Ctrl/Cmd + Shift + R).

### Option 2: GitHub Pages (free, github.com/kevinbish)
1. Create a repository, e.g. `kevinbish/kevin-bish.com`.
2. Upload these files to the `main` branch (drag and drop in the GitHub web UI works).
3. Settings → Pages → Source: "Deploy from a branch" → `main` / root → Save.
4. The site goes live at `https://kevinbish.github.io/kevin-bish.com/` within a minute or two.
5. Custom domain: in Settings → Pages enter `www.kevin-bish.com`, then at your DNS provider add a
   CNAME record `www` → `kevinbish.github.io`. Tick "Enforce HTTPS" once it appears.

### Option 3: Netlify or Cloudflare Pages (free, drag and drop)
- Netlify: app.netlify.com → "Add new site" → "Deploy manually" → drag this folder in.
- Cloudflare Pages: Workers & Pages → Create → Pages → "Upload assets" → drag this folder in.
- Both let you attach kevin-bish.com under Domain settings.

## Languages

`index.html` (English) is the only page you edit by hand. `python3 scripts/build.py` turns it into one page per
published language (`fr/index.html`, ...), adds the language menu, `hreflang` tags and the sitemap entries, and
writes `window.I18N` into each translated page for the strings that live in `js/main.js`.

- `i18n/languages.json`: the languages (code, English and native name, locale, direction) and an `enabled` flag. Only enabled languages are generated and linked.
- `i18n/<code>.json`: the translations, `{"html": {...}, "js": {...}}`. Each entry is keyed by the English text itself, so when you edit the English the old translation simply stops matching and that string falls back to English until it is translated again.
- `i18n/keep.json`: strings that stay as they are in every language (names, URLs, code-like words), so they are not reported as missing.
- In `js/main.js`, any text a visitor can see is written `T('English text')` (or `T('... {0} ...', value)`).
- `python3 scripts/build.py --i18n-report` shows how much of each language is translated (`--verbose` lists the gaps).
- Right-to-left (Arabic): the editor frame stays left-to-right, like a code editor, and paragraphs get `dir="auto"` so they read right-to-left.
- Fonts: Latin and Cyrillic are self-hosted; Arabic and Chinese use the visitor's system fonts.
- The machine-readable files (`resume.json`, `llms*.txt`) stay English.

## Contact form (compose_message)

The "compose_message()" link in Contact Me, and the `mail` terminal command both open one popup (`#mail` in `index.html`, logic in `js/main.js`).
It builds a ready-to-send email and opens it in the visitor's mail app (a `mailto:` link) addressed to the address in `MAIL_TO` near the top of that code. The address is assembled in JavaScript so it is not in the page text, and the form carries an invisible trap field and a minimum-time check for when a sending service is added later. Nothing is sent from the server, so there is no delivery to monitor; a visitor with no mail app gets copy buttons instead.
To change the address, edit `MAIL_TO` in `js/main.js`.

## Bat cursor and GitHub activity

- The bat cursor (end of `js/main.js`, styles at the end of `css/style.css`) only runs for a mouse or trackpad (`hover: hover` and `pointer: fine`): touch devices keep their normal behaviour. The real cursor comes back over text fields and the embedded Spotify player, and with "reduce motion" the bat follows without trailing or tilt.
- The GitHub activity section (`#activity`) draws the last 12 months of public contributions as a bat-signal heatmap. The data comes from the public service github-contributions-api.jogruber.de when the page loads (cached for an hour in the visitor's browser); if it cannot be reached the section shows a short message instead. To change the account, edit the `API` address in `js/main.js` and the profile link in `index.html`.

## Printing and no-JavaScript

- Printing or saving as PDF switches to a light layout, opens every collapsed section so the full text is on paper, and hides the controls, the skills circles, the music card and the footer stamp (`@media print` at the end of `css/style.css`, plus a small `beforeprint` handler in `js/main.js`).
- With scripts off the page still reads in full: the details toggles are native, the skills section falls back to a plain list (the `<ul class="ring-list">` inside `#rings`, which `main.js` replaces), and controls that need scripts are hidden by a `<noscript>` style block in the `<head>`. If you change the four skills text in `js/main.js`, change that list too.

## Test locally
Open `index.html` in a browser, or for a closer match to production run:
```
python3 -m http.server 8000
```
then visit http://localhost:8000.

## Editing tips
- Text content lives in `index.html`. Each job is a `<li>` inside `<ol class="tl" id="tl">`.
- Colours are tokens at the top of `css/style.css` (`:root` = dark, `[data-theme="light"]` = light).
- Game codes are the `LOC` list in `js/main.js` (`['CODE','City','Country']`).
- Terminal commands are the `CMDS` object in `js/main.js`; the text "files" are in `FILES`.
- Best scores and the light/dark choice are saved in each visitor's browser (localStorage).

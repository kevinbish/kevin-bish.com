# kevin-bish.com: personal website

A static site with no build step. Upload the folder as-is to any web host.

## Files

```
index.html          the page
css/style.css       all styles (dark grey editor theme + light mode)
js/main.js          gutter line numbers, skyline/signal, skill rings, LOCODE Hunter, terminal
images/kevin.jpg    portrait
images/mascot.gif   pixel mascot from the original site
images/og-card.png  1200x630 social share card (Open Graph / Twitter)
favicon.svg         {KB} tab icon
robots.txt          lets search engines and AI crawlers in; points to the sitemap
sitemap.xml         the page URL for search engines
llms.txt            short Markdown profile for AI assistants (llmstxt.org convention)
llms-full.txt       the whole profile as plain Markdown
resume.json         machine-readable CV in JSON Resume format (jsonresume.org)
```

`index.html` also carries schema.org JSON-LD (Person, ProfilePage, publications) in its `<head>`,
plus canonical, Open Graph and Twitter tags.

All absolute URLs assume https://www.kevin-bish.com/. If you host elsewhere, search-and-replace that
address in index.html, llms.txt, llms-full.txt, resume.json, robots.txt and sitemap.xml.

After going live:
- Check the structured data at https://search.google.com/test/rich-results and https://validator.schema.org
- Submit sitemap.xml in Google Search Console and Bing Webmaster Tools
- When you change your CV, update resume.json, llms-full.txt and the JSON-LD block too, so they match the page, and bump the date in sitemap.xml and the JSON-LD dateModified

Fonts (Open Sans, Fira Code) load from Google Fonts. Everything else is local.

## Deploy options

### Option 1: your existing host for kevin-bish.com
1. Open your hosting file manager or connect by FTP/SFTP.
2. Back up the current `public_html` (or `www`) folder.
3. Upload the contents of this folder (not the folder itself) so `index.html` sits at the root.
4. Visit https://www.kevin-bish.com and hard-refresh (Ctrl/Cmd + Shift + R).

### Option 2: GitHub Pages (free, github.com/exiax)
1. Create a repository, e.g. `exiax/kevin-bish.com`.
2. Upload these files to the `main` branch (drag and drop in the GitHub web UI works).
3. Settings → Pages → Source: "Deploy from a branch" → `main` / root → Save.
4. The site goes live at `https://exiax.github.io/kevin-bish.com/` within a minute or two.
5. Custom domain: in Settings → Pages enter `www.kevin-bish.com`, then at your DNS provider add a
   CNAME record `www` → `exiax.github.io`. Tick "Enforce HTTPS" once it appears.

### Option 3: Netlify or Cloudflare Pages (free, drag and drop)
- Netlify: app.netlify.com → "Add new site" → "Deploy manually" → drag this folder in.
- Cloudflare Pages: Workers & Pages → Create → Pages → "Upload assets" → drag this folder in.
- Both let you attach kevin-bish.com under Domain settings.

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

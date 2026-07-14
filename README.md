# Blessed Rafael Saigarai

Personal site — static HTML. Live at [masai2005.github.io](https://masai2005.github.io).

## Structure

```text
/
├── index.html           # Home
├── writing/             # Essays (plain HTML)
├── css/style.css
├── images/
├── rss.xml              # Feed for site essays
└── favicon.*
```

## Writing a new essay

1. Copy an existing file under `writing/` (e.g. `the-illusion-of-mastery.html`) to a new name.
2. Edit the title, date, and body.
3. Add an entry to `writing/essays.json` (newest first is applied automatically when built).
4. Run `node scripts/build-essays.mjs` to regenerate the writing index pages.
5. Add an `<item>` in `rss.xml` (use absolute `https://masai2005.github.io/...` URLs).

The build script paginates essays at 10 per page (`/writing/`, `/writing/page/2/`, etc.).

Newsletter: [blessedrafael.substack.com](https://blessedrafael.substack.com)

## Local preview

Open `index.html` in a browser, or serve the folder:

```sh
python3 -m http.server 8080
```

## Deploy

Push to `main`. GitHub Actions deploys the static files to GitHub Pages.

import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const writingDir = path.join(root, "writing");
const essaysPath = path.join(writingDir, "essays.json");
const ESSAYS_PER_PAGE = 10;

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function formatDate(isoDate) {
  return new Date(`${isoDate}T12:00:00Z`).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function pageUrl(page) {
  return page === 1 ? "/writing/" : `/writing/page/${page}/`;
}

function renderEssayList(essays) {
  if (essays.length === 0) {
    return "<p>No essays yet.</p>";
  }

  const items = essays
    .map(
      (essay) => `
        <li>
          <h2>
            <a href="/writing/${escapeHtml(essay.slug)}.html">${escapeHtml(essay.title)}</a>
          </h2>
          <p>${formatDate(essay.date)}</p>
          <p>${escapeHtml(essay.description)}</p>
        </li>`
    )
    .join("");

  return `<ul>${items}\n      </ul>`;
}

function renderPagination(page, totalPages) {
  if (totalPages <= 1) {
    return "";
  }

  const parts = [`Page ${page} of ${totalPages}`];

  if (page > 1) {
    const newerUrl = pageUrl(page - 1);
    parts.unshift(`<a href="${newerUrl}">← Newer essays</a>`);
  }

  if (page < totalPages) {
    const olderUrl = pageUrl(page + 1);
    parts.push(`<a href="${olderUrl}">Older essays →</a>`);
  }

  return `<nav aria-label="Essay pages">\n        ${parts.join("\n        ")}\n      </nav>`;
}

function renderPage({ page, totalPages, essays }) {
  const title =
    page === 1
      ? "Writing — Blessed Rafael Saigarai"
      : `Writing — Page ${page} — Blessed Rafael Saigarai`;

  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <meta
      name="description"
      content="Essays and notes by Blessed Rafael Saigarai."
    />
    <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <link
      rel="alternate"
      type="application/rss+xml"
      title="Blessed Rafael Saigarai — Writing"
      href="/rss.xml"
    />
  </head>
  <body>
    <header>
      <nav>
        <a href="/">Home</a>
        <a href="/writing/" aria-current="page">Writing</a>
        <a href="https://blessedrafael.substack.com">Substack</a>
        <a href="/rss.xml">RSS</a>
      </nav>
    </header>

    <main>
      <h1>Writing</h1>
      <p>
        Essays and notes published here. For the newsletter, visit
        <a href="https://blessedrafael.substack.com">Substack</a>. Subscribe to
        this site via <a href="/rss.xml">RSS</a>.
      </p>

      ${renderEssayList(essays)}
      ${renderPagination(page, totalPages)}
    </main>

    <footer>
      <p>Blessed Rafael Saigarai</p>
      <p>© 2026 Blessed Rafael Saigarai. All rights reserved.</p>
      <p>
        <a href="/">Home</a> ·
        <a href="/writing/">Writing</a> ·
        <a href="https://blessedrafael.substack.com">Substack</a> ·
        <a href="/rss.xml">RSS</a> ·
        <a href="https://github.com/Masai2005">GitHub</a> ·
        <a href="mailto:blessed.s@setoff.tax">Email</a> ·
        <a
          href="https://www.linkedin.com/in/blessed-rafael-saigarai-695317284/"
          >LinkedIn</a
        >
      </p>
    </footer>
  </body>
</html>
`;
}

const raw = await readFile(essaysPath, "utf8");
const essays = JSON.parse(raw).sort((a, b) => b.date.localeCompare(a.date));
const totalPages = Math.max(1, Math.ceil(essays.length / ESSAYS_PER_PAGE));

await rm(path.join(writingDir, "page"), { recursive: true, force: true });

for (let page = 1; page <= totalPages; page += 1) {
  const start = (page - 1) * ESSAYS_PER_PAGE;
  const pageEssays = essays.slice(start, start + ESSAYS_PER_PAGE);
  const html = renderPage({ page, totalPages, essays: pageEssays });

  if (page === 1) {
    await writeFile(path.join(writingDir, "index.html"), html);
    continue;
  }

  const pageDir = path.join(writingDir, "page", String(page));
  await mkdir(pageDir, { recursive: true });
  await writeFile(path.join(pageDir, "index.html"), html);
}

console.log(
  `Built ${totalPages} writing page${totalPages === 1 ? "" : "s"} (${essays.length} essay${essays.length === 1 ? "" : "s"}).`
);

export const description =
  "Madhu Srinivasan is a researcher working on generative world models, real-time graphics, and efficient AI.";

export function escapeHtml(value) {
  return String(value).replace(
    /[&<>"']/g,
    (character) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
      })[character],
  );
}

export function relativeRoot(path) {
  return (
    "../".repeat(Math.max(0, path.split("/").filter(Boolean).length - 1)) ||
    "./"
  );
}

export function siteHead({ title, path, data = {} }) {
  const fullTitle =
    title === "Madhu Srinivasan" ? title : `${title} | Madhu Srinivasan`;
  return `<meta name="description" content="${description}">
    ${data.index === false ? '<meta name="robots" content="noindex, nofollow">' : ""}
    <meta name="color-scheme" content="light">
    <meta property="og:type" content="website">
    <meta property="og:title" content="${escapeHtml(fullTitle)}">
    <meta property="og:description" content="${description}">
    <meta name="twitter:card" content="summary">
    <link rel="icon" href="${relativeRoot(path)}assets/monograms/sm-navigation.svg" type="image/svg+xml">`;
}

export function siteHeader({ path }) {
  const root = relativeRoot(path);
  const links = [
    ["Home", "index"],
    ["Projects", "projects"],
    ["Publications", "publications"],
    ["About", "about"],
  ];
  return `<a class="skip-link" href="#content">Skip to content</a>
    <div class="site-nav">
      <a class="wordmark" href="${root}index.html" aria-label="Madhu Srinivasan, home"><img src="${root}assets/monograms/sm-navigation.svg" alt="" width="56" height="40"></a>
      <nav aria-label="Main navigation">${links
        .map(([name, slug]) => {
          const active =
            slug === "index"
              ? path === "/index"
              : path === `/${slug}` || path.startsWith(`/${slug}/`);
          return `<a href="${root}${slug}.html"${active ? ' aria-current="page"' : ""}>${name}</a>`;
        })
        .join("")}</nav>
    </div>`;
}

export function siteFooter({ path }) {
  return `<div class="site-footer">
    <div><a href="${relativeRoot(path)}index.html">Madhu Srinivasan</a><p>Graphics, world models &amp; scientific visualization.</p></div>
    <div class="footer-links"><a href="mailto:madhu.srinivasan@outlook.com">Email</a><a href="https://github.com/secunit64">GitHub · secunit64</a><a href="https://github.com/madhuatx">GitHub · madhuatx</a><a href="https://scholar.google.com/citations?user=GxzYUjQAAAAJ">Scholar</a></div>
    </div>`;
}

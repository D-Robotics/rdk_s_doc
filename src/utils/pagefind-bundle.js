/**
 * Pagefind bundles may live either under `{base}/{product}/{version}/pagefind/`
 * (matrix / prepare-pagefind-dev) or `{base}pagefind/` (plain `npm run build` postbuild).
 */

export function toProductFolder(product) {
  return String(product)
    .trim()
    .replace(/\s+/g, "_")
    .replace(/[^\w.-]/g, "_");
}

/** @param {string} baseUrl siteConfig.baseUrl, e.g. /rdk_x_doc/ */
export function collectPagefindBundleCandidates(baseUrl, product, version, options = {}) {
  const baseNorm = `${String(baseUrl || "/").replace(/\/$/, "")}/`;
  const out = [];

  if (product && version) {
    const productFolder = toProductFolder(product);
    out.push(`${baseNorm}${productFolder}/${version}/pagefind/`);
  }

  if (options.includeFallback !== false) {
    out.push(`${baseNorm}pagefind/`);
  }

  return [...new Set(out)];
}

/**
 * Minimal GET check matching PagefindSearch pre-validation (reject HTML/error pages).
 * @returns {Promise<string|null>} working bundle prefix with trailing slash, or null.
 */
export async function pickReadablePagefindBundle(bundlePrefixes) {
  for (const prefix of bundlePrefixes) {
    const p = prefix.endsWith("/") ? prefix : `${prefix}/`;
    const src = `${p}pagefind-ui.js`;
    try {
      const resp = await fetch(src, { method: "GET", credentials: "same-origin" });
      if (!resp.ok) continue;
      const contentType = (resp.headers.get("content-type") || "").toLowerCase();
      const body = await resp.text();
      const looksLikeHtml =
        contentType.includes("text/html") || /^\s*</.test(body.slice(0, 50));
      if (looksLikeHtml) continue;
      return p;
    } catch {
      // skip
    }
  }
  return null;
}

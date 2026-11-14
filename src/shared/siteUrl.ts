// Astro does not prefix <a href> with the configured `base`. href() adds it and
// toAppPath() strips it. Templates do not call them directly: they go through
// localeHref(), canonicalPath() and switchLangHref() in ./i18n.ts, which add
// the language prefix too. Images and in-content links go through
// resolveAssetUrl in ./assetUrl.ts instead.
//
// import.meta.env.BASE_URL always ends with '/': astro.config.mjs adds it to
// BASE_PATH, since Astro does not under trailingSlash: 'ignore'.
const base = import.meta.env.BASE_URL

/** Internal path → base-prefixed href. External/absolute URLs pass through. */
export function href(path: string): string {
  if (/^([a-z][a-z0-9+.-]*:)?\/\//i.test(path) || /^(mailto|tel):/i.test(path)) return path
  return `${base}${path.replace(/^\//, '')}`
}

/** Base-prefixed pathname (e.g. Astro.url.pathname) → app path, '/'-rooted, no trailing slash. */
export function toAppPath(pathname: string): string {
  const stripped = pathname.startsWith(base)
    ? pathname.slice(base.length)
    : pathname.replace(/^\//, '')
  const clean = stripped.replace(/\/+$/, '')
  return clean ? `/${clean}` : '/'
}

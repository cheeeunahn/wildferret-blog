// Astro does not prefix <a href> with the configured `base`, and react-router's
// <Link to> (which did) is gone. These helpers own internal route hrefs; images
// and in-content links go through resolveAssetUrl in ./assetUrl.ts instead.
//
// import.meta.env.BASE_URL always ends with '/' — Astro normalizes it.
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

/** Nav active state. Compare Astro.url.pathname against an app path. */
export function isActive(pathname: string, path: string): boolean {
  return toAppPath(pathname) === toAppPath(path)
}

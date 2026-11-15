/**
 * A link or image target from article content, made to work under the
 * configured base path. A fragment (`#heading`) points into the page the reader
 * is already on, so it never takes the base: `/#heading` would send them home.
 */
export function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path) || path.startsWith('#')) return path

  const baseUrl = import.meta.env.BASE_URL
  return `${baseUrl}${path.startsWith('/') ? path.slice(1) : path}`
}

export function resolveAssetUrl(path: string): string {
  if (/^https?:\/\//.test(path)) return path

  const baseUrl = import.meta.env.BASE_URL
  return `${baseUrl}${path.startsWith('/') ? path.slice(1) : path}`
}

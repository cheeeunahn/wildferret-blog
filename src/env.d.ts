/// <reference types="astro/client" />

interface ImportMetaEnv {
  /** Supabase project URL, e.g. https://xxxx.supabase.co */
  readonly PUBLIC_SUPABASE_URL: string
  /**
   * The publishable (anon) key — never the service_role key, which bypasses RLS.
   * PUBLIC_ vars are inlined into the built JS at build time, so this is public
   * by design; RLS and the column grants are what enforce access.
   */
  readonly PUBLIC_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

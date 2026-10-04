import type { ClientDirective } from 'astro'

/**
 * `client:summarizer` — hydrate only in a browser that has Chrome's built-in
 * Prompt API (`LanguageModel`), which writes the summary. Everywhere else (Safari, Firefox, mobile, most Chrome
 * installs) the island and the React runtime are never downloaded.
 *
 * This checks only that the API exists. Whether the model can actually run
 * here (`LanguageModel.availability()`) is asked inside the island, since that is
 * async and language-dependent. Registered in astro.config.mjs.
 */
const summarizer: ClientDirective = (load) => {
  if (!('LanguageModel' in self)) return
  load().then((hydrate) => hydrate())
}

export default summarizer

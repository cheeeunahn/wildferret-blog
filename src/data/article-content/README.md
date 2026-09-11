# Article content folder

Store each article body in its own file and export a `...Content` string.

## Why
- Keeps `articles.ts` focused on metadata (title, slug, date, etc.)
- Reduces merge conflicts when writing/editing long posts
- Makes it easier to manage many articles over time

## How to add a new article
1. Create a file here (example: `my-new-article.ts`).
2. Export the content as a template string:
   - `export const myNewArticleContent = \`...\``
3. Prepend an item to the `articles` array in `src/data/articles.ts` with its
   metadata and a `loadContent` dynamic import — not a direct `content` value:
   ```ts
   loadContent: () =>
     import('./article-content/my-new-article').then(({ myNewArticleContent }) => myNewArticleContent),
   ```

The body is read at build time by `src/pages/article/[slug].astro`, so a broken
`loadContent` fails `pnpm build` rather than degrading in the browser.

## English versions

`en/` holds the English translation of each article, exporting the Korean export
name with an `En` suffix (`myNewArticleContent` → `myNewArticleContentEn`), and
the article's entry in `articles.ts` points at it through a `translations.en`
block.

You do not usually write these by hand. Pushing a new article triggers
`.github/workflows/translate-articles.yml`, which writes the English version and
commits it back to your branch. To do it locally instead, run `pnpm translate`
(or `/translate-articles <slug>` inside Claude Code), and `pnpm translation:status`
to see what is still missing. See "Automatic Translation" in CLAUDE.md.

A post with no English version is left out of the `/en` index rather than served
as untranslated Korean, so it is safe to push before the translation exists.

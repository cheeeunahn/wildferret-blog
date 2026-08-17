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

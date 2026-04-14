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
3. Import that constant in `src/data/articles.ts`.
4. Add a new item in `articles` with metadata + `content: myNewArticleContent`.

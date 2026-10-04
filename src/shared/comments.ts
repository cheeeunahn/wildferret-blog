/**
 * The /api/comments wire contract, shared by the browser client
 * (src/client/commentsApi.ts) and the server (src/server/comments/). Neither
 * side may import the other, so the shape they agree on lives here.
 *
 * Errors travel as `{ "reason": RejectionReason }` — see ./moderation.ts.
 */

/** A comment as the API returns it. `body` and `nickname` are attacker-controlled text. */
export interface Comment {
  id: string
  nickname: string
  body: string
  created_at: string
}

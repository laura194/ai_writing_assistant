### 1. NodeContent controller tests
increase test coverage.
---

## 2. Comment controller plan

### 2.1 Endpoints / handlers

For `CommentController`:

- `createComment`
  - Input: `projectId`, `username`, `content`, maybe `nodeId` or similar.
  - Call `Comment.create()`.
  - Response: created comment with readable `username` and `content`.
- `listCommentsForProject`
  - `Comment.find({ projectId })`.
  - Should return decrypted comments automatically.
- `updateComment`
  - If editing is allowed:
    - Load by id, update content, `save()`.
- `deleteComment`
  - Remove by id (soft/hard).

### 2.2 Comment controller tests

For `CommentController` tests:

- `createComment`:
  - Call controller with plaintext body.
  - Expect response with same plaintext.
- Raw DB check (optional):
  - Check `comments` collection directly to ensure encrypted `username`/`content`.
- `listCommentsForProject`:
  - Seed multiple comments for a project.
  - Call controller.
  - Ensure returned array has decrypted usernames and contents in correct order.
- `updateComment`:
  - Modify `content`.
  - Assert old value not in DB (encrypted) and new decrypted value returned from controller.
- Edge cases:
  - Comment not found → 404.
  - Invalid IDs / validation errors.

## Update NodeContent controller

### 3.2 NodeContent controller tests

For `NodeContent.test.ts`:

- Similar structure to Project tests:
  - Creation returns decrypted response.
  - Raw DB contains encrypted fields (optional).
  - Read endpoints always return decrypted content.
  - Updating content:
    - Modified fields change and remain readable.
    - Old versions are stored via `NodeContentVersion` with correct encryption (if relevant).
  - Behavior with encryption disabled flag.

---

## 4. Comment controller plan

### 4.1 Endpoints / handlers

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

### 4.2 Comment controller tests

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

---

## 5. Cross‑cutting concerns for controllers

### 5.1 Error handling

- Standardize error format (validation errors, 404, 500).
- Distinguish between:
  - Mongoose validation errors.
  - Cast errors (invalid ObjectId).
  - Unknown errors.

### 5.2 DTOs / response shaping

- Define DTO / response mappers to prevent:
  - Exposing raw internal IDs you do not want public.
  - Exposing any encryption metadata (if you store IV, etc.).

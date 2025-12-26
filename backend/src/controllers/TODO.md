## 1. Clarify controller responsibilities

For all controllers (Project, NodeContent, Comment):

- Do **not** re‑implement encryption logic in controllers. Let the model hooks handle it.
- Ensure controllers:
  - Always use the Mongoose models (not raw collections) so hooks run.
  - Never expose sensitive fields that should stay internal (even if decrypted).
  - Handle cases where encryption is disabled (env toggle) transparently.

***

## 2. Project controller plan

### 2.1 Endpoints / handlers

For `ProjectController` (or `Project.ts` controller file):

- `createProject`
  - Validate input DTO/body.
  - Call `Project.create()` (or `new Project().save()`).
  - Return created project with non‑sensitive fields only.
- `getProjectById`
  - Call `Project.findById(id)` or `findOne({ _id: id })`.
  - Rely on `post('findOne')` to give decrypted data.
  - If not found, return 404.
- `listProjects`
  - Call `Project.find(query)` for list/filter.
  - Rely on `post('find')` for decryption.
- `updateProject`
  - Call `Project.findByIdAndUpdate` **or**:
    - `const p = await Project.findById(id);`
    - mutate allowed fields;
    - `await p.save();` (ensures `pre('save')` runs).
  - Prefer the second pattern if your encryption logic only triggers correctly on `save`.
- `deleteProject`
  - Soft or hard delete as your domain requires.

### 2.2 Project controller tests

For `Project.test.ts`:

- Setup:
  - Use in‑memory MongoDB (same pattern as model tests).
  - Ensure encryption env vars are set.

- Test cases:
  - `createProject`:
    - Send request or call handler with plaintext fields.
    - Assert response contains correct plaintext values.
    - Optionally check raw DB (via separate collection) to ensure data is encrypted.
  - `getProjectById`:
    - Seed a project using the model.
    - Fetch via controller.
    - Assert returned data is correctly decrypted and matches original.
  - `listProjects`:
    - Seed multiple projects.
    - Fetch via controller.
    - Assert all items are readable.
  - `updateProject`:
    - Create project.
    - Update a subset of fields through controller.
    - Assert response shows updated plaintext.
    - Optionally verify that only changed fields are re‑encrypted (if you test that at controller level).
  - `encryption disabled`:
    - Temporarily set `ENCRYPTION_ENABLED=false`.
    - Create/fetch through controller.
    - Assert data still flows correctly, and DB holds plaintext (optional raw check).

***

## 3. NodeContent controller plan

### 3.1 Endpoints / handlers

For `NodeContent` (and `NodeContentVersion` if involved via controller):

- `createNodeContent`
  - Validate body (projectId, nodeId, content fields, etc.).
  - Use `NodeContent.create()` → encryption via `pre('save')`.
- `getNodeContentById` / `getNodeContentForNode`
  - Use `NodeContent.findOne({ _id: id })` or `find({ nodeId })`.
  - Decryption handled by `post('find')` / `post('findOne')`.
- `updateNodeContent`
  - Prefer load‑modify‑save pattern if required by your hooks:
    - `const nc = await NodeContent.findById(id);`
    - change fields;
    - `await nc.save();`.
- If `NodeContentVersion` is used for history:
  - When updating content, create a `NodeContentVersion` entry (which will also encrypt via its hooks).

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

***

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

***

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

### 5.3 Consistency with model behavior

- Wherever you need encryption hooks:
  - Avoid `updateOne` / `findOneAndUpdate` unless you are explicitly handling encryption for those.
  - Prefer `findById` → mutate → `save()` if your encryption is `pre('save')` only.
  
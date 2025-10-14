import { describe, it, expect, beforeEach, vi } from "vitest";
import CommentService from "./CommentService";
import { IComment } from "./types";

describe("CommentService", () => {
  const realFetch = globalThis.fetch;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const BASE_URL = "http://localhost:5001/api/comments";

  beforeEach(() => {
    (globalThis as any).fetch = vi.fn();
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (globalThis as any).fetch = realFetch;
    consoleErrorSpy.mockRestore();
  });

  it("createComment - posts and returns created comment on success", async () => {
    const newComment: Partial<IComment> = { content: "Testkommentar", projectId: "foo" };
    const savedComment: IComment = { ...newComment, id: "c1", createdAt: "2024-05-01" } as IComment;
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => savedComment,
    });

    const result = await CommentService.createComment(newComment);
    expect(result).toEqual(savedComment);

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as any).mock.calls[0];
    expect(url).toBe(BASE_URL);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toMatchObject(newComment);
  });

  it("createComment - throws error and logs when response not ok with error body", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "validation failed" }),
    });

    await expect(CommentService.createComment({ content: "fail" })).rejects.toThrow("validation failed");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("createComment - throws and logs on fetch error", async () => {
    (fetch as any).mockRejectedValue(new Error("network down"));
    await expect(CommentService.createComment({ content: "fail" })).rejects.toThrow("network down");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("getCommentsByProjectId - returns array of comments on success", async () => {
    const comments: IComment[] = [{username: "test1", content: "hi", projectId: "foo", createdAt: "2024-05-01" }];
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => comments,
    });

    const result = await CommentService.getCommentsByProjectId("foo");
    expect(result).toEqual(comments);

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url] = (fetch as any).mock.calls[0];
    expect(url).toBe(`${BASE_URL}/foo`);
  });

  it("getCommentsByProjectId - logs and returns empty array when response not ok", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: async () => [],
    });

    const result = await CommentService.getCommentsByProjectId("foo");
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("getCommentsByProjectId - logs and returns empty array on fetch error", async () => {
    (fetch as any).mockRejectedValue(new Error("network down"));
    const result = await CommentService.getCommentsByProjectId("foo");
    expect(result).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("deleteComment - calls DELETE and succeeds on ok response", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
    });

    await expect(CommentService.deleteComment("cid123")).resolves.toBeUndefined();
    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as any).mock.calls[0];
    expect(url).toBe(`${BASE_URL}/cid123`);
    expect(init.method).toBe("DELETE");
  });

  it("deleteComment - logs error on non-ok response", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
    });

    await expect(CommentService.deleteComment("cid123")).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("deleteComment - logs error on fetch reject", async () => {
    (fetch as any).mockRejectedValue(new Error("network fail"));

    await expect(CommentService.deleteComment("cid123")).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});

import request from "supertest";
import { describe, it, expect, vi, beforeEach } from "vitest";
import app from "../app"; // Express app export
import Comment from "../models/Comment";

vi.mock("../models/Comment", () => {
  return {
    default: Object.assign(
      vi.fn(() => ({ save: vi.fn() })), // constructor with save()
      {
        find: vi.fn(),
        findByIdAndDelete: vi.fn(),
      }, // static methods
    ),
  };
});

beforeEach(() => {
  vi.clearAllMocks();
});

describe("Comment Controller", () => {
  it("POST /api/comments creates a comment", async () => {
    const mockSave = vi.fn().mockResolvedValue({
      _id: "123",
      projectId: "p1",
      username: "Alice",
      content: "Hello",
    });
    (Comment as unknown as vi.Mock).mockImplementation(() => ({
      save: mockSave,
    }));

    const res = await request(app).post("/api/comments").send({
      projectId: "p1",
      username: "Alice",
      content: "Hello",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      projectId: "p1",
      username: "Alice",
      content: "Hello",
    });
    expect(mockSave).toHaveBeenCalled();
  });

  it("POST /api/comments missing fields returns 400", async () => {
    const res = await request(app).post("/api/comments").send({
      username: "Alice",
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Missing required fields");
  });

  it("POST /api/comments save error returns 500", async () => {
    const error = new Error("DB error");
    const mockSave = vi.fn().mockRejectedValue(error);
    (Comment as unknown as vi.Mock).mockImplementation(() => ({
      save: mockSave,
    }));
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).post("/api/comments").send({
      projectId: "p1",
      username: "Alice",
      content: "Hello",
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to create comment");
    expect(consoleErrorMock).toHaveBeenCalledWith(error);

    consoleErrorMock.mockRestore();
  });

  it("GET /api/comments/:projectId returns comments sorted", async () => {
    const mockComments = [
      {
        _id: "1",
        projectId: "p1",
        username: "Alice",
        content: "First",
        createdAt: new Date("2025-10-01"),
      },
      {
        _id: "2",
        projectId: "p1",
        username: "Bob",
        content: "Second",
        createdAt: new Date("2025-10-02"),
      },
    ];

    // find returns promise resolving to mockComments sorted descending
    (Comment.find as unknown as vi.Mock).mockReturnValue({
      sort: vi
        .fn()
        .mockResolvedValue(
          mockComments.sort((a, b) => b.createdAt - a.createdAt),
        ),
    });

    const res = await request(app).get("/api/comments/p1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ username: "Bob" }),
        expect.objectContaining({ username: "Alice" }),
      ]),
    );
    expect(Comment.find).toHaveBeenCalledWith({ projectId: "p1" });
  });

  it("GET /api/comments/:projectId error returns 500", async () => {
    const error = new Error("DB fail");
    (Comment.find as unknown as vi.Mock).mockReturnValue({
      sort: vi.fn().mockRejectedValue(error),
    });
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).get("/api/comments/p1");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to fetch comments");
    expect(consoleErrorMock).toHaveBeenCalledWith(error);

    consoleErrorMock.mockRestore();
  });

  it("DELETE /api/comments/:id deletes comment", async () => {
    (Comment.findByIdAndDelete as unknown as vi.Mock).mockResolvedValue({
      _id: "123",
      projectId: "p1",
      username: "Alice",
      content: "Hi",
    });

    const res = await request(app).delete("/api/comments/123");

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty("message", "Comment deleted successfully");
    expect(Comment.findByIdAndDelete).toHaveBeenCalledWith("123");
  });

  it("DELETE /api/comments/:id not found returns 404", async () => {
    (Comment.findByIdAndDelete as unknown as vi.Mock).mockResolvedValue(null);

    const res = await request(app).delete("/api/comments/unknown");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Comment not found");
  });

  it("DELETE /api/comments/:id error returns 500", async () => {
    const error = new Error("DB error");
    (Comment.findByIdAndDelete as unknown as vi.Mock).mockRejectedValue(error);
    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).delete("/api/comments/123");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Failed to delete comment");
    expect(consoleErrorMock).toHaveBeenCalledWith(error);

    consoleErrorMock.mockRestore();
  });
});

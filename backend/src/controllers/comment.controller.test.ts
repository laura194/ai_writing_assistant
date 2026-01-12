import { describe, it, expect, vi, beforeEach } from "vitest";
import type { Mock } from "vitest";
import Comment from "../models/Comment";
import * as commentController from "./comment.controller";

// Mock Request and Response objects
const mockRequest = (body: any = {}, params: any = {}, query: any = {}) => ({
  body,
  params,
  query,
});

const mockResponse = () => {
  const res: any = {};
  res.status = vi.fn().mockReturnValue(res);
  res.json = vi.fn().mockReturnValue(res);
  return res;
};

/* ------------------------------------------------------------------ */
/* MOCK MODEL                                                         */
/* ------------------------------------------------------------------ */
vi.mock("../models/Comment", () => {
  const Model = vi.fn();

  return {
    default: Object.assign(Model, {
      find: vi.fn(),
      findById: vi.fn(),
      findOne: vi.fn(),
      deleteOne: vi.fn(),
      save: vi.fn(),
    }),
  };
});

beforeEach(() => {
  vi.resetAllMocks();
});

/* ------------------------------------------------------------------ */
/* HELPER FUNCTIONS                                                   */
/* ------------------------------------------------------------------ */
const createMockComment = (overrides = {}) => ({
  _id: "1",
  projectId: "p1",
  username: "Alice",
  content: "Hello",
  createdAt: new Date(),
  save: vi.fn(),
  ...overrides,
});

/* ------------------------------------------------------------------ */
/* TESTS                                                             */
/* ------------------------------------------------------------------ */
describe("Comment Controller", () => {
  /* ---------------------------- createComment ---------------------------- */
  describe("createComment", () => {
    it("should create a comment successfully", async () => {
      const saved = {
        _id: "1",
        projectId: "p1",
        username: "Alice",
        content: "Hello",
        createdAt: new Date(),
      };

      const saveMock = vi.fn().mockResolvedValue(saved);
      (Comment as unknown as Mock).mockImplementation(() => ({
        save: saveMock,
      }));

      (Comment.findById as unknown as Mock).mockResolvedValue(saved);

      const req = mockRequest({
        projectId: "p1",
        username: "Alice",
        content: "Hello",
      });
      const res = mockResponse();

      await commentController.createComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(saved);
      expect(Comment).toHaveBeenCalledWith({
        projectId: "p1",
        username: "Alice",
        content: "Hello",
      });
    });

    it("should return 400 if projectId is missing", async () => {
      const req = mockRequest({
        username: "Alice",
        content: "Hello",
      });
      const res = mockResponse();

      await commentController.createComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields are required",
      });
    });

    it("should return 400 if username is missing", async () => {
      const req = mockRequest({
        projectId: "p1",
        content: "Hello",
      });
      const res = mockResponse();

      await commentController.createComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields are required",
      });
    });

    it("should return 400 if content is missing", async () => {
      const req = mockRequest({
        projectId: "p1",
        username: "Alice",
      });
      const res = mockResponse();

      await commentController.createComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "All fields are required",
      });
    });

    it("should return 500 on save error", async () => {
      (Comment as unknown as Mock).mockImplementation(() => ({
        save: vi.fn().mockRejectedValue(new Error("DB error")),
      }));

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({
        projectId: "p1",
        username: "Alice",
        content: "Hello",
      });
      const res = mockResponse();

      await commentController.createComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });

    it("should return 500 on findById error after save", async () => {
      const saved = {
        _id: "1",
        projectId: "p1",
        username: "Alice",
        content: "Hello",
      };

      const saveMock = vi.fn().mockResolvedValue(saved);
      (Comment as unknown as Mock).mockImplementation(() => ({
        save: saveMock,
      }));

      (Comment.findById as unknown as Mock).mockRejectedValue(
        new Error("DB error"),
      );

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({
        projectId: "p1",
        username: "Alice",
        content: "Hello",
      });
      const res = mockResponse();

      await commentController.createComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });
  });

  /* ---------------------------- getCommentsByProjectId ---------------------------- */
  describe("getCommentsByProjectId", () => {
    it("should return comments by projectId", async () => {
      const comments = [
        { _id: "1", content: "A", projectId: "p1", createdAt: new Date() },
        { _id: "2", content: "B", projectId: "p1", createdAt: new Date() },
      ];

      (Comment.find as unknown as Mock).mockReturnValue({
        sort: vi.fn().mockResolvedValue(comments),
      });

      const req = mockRequest({}, { projectId: "p1" });
      const res = mockResponse();

      await commentController.getCommentsByProjectId(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(comments);
      expect(Comment.find).toHaveBeenCalledWith({ projectId: "p1" });
    });

    it("should return 400 if projectId is missing", async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();

      await commentController.getCommentsByProjectId(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Project ID is required",
      });
    });

    it("should return 500 on DB error", async () => {
      (Comment.find as unknown as Mock).mockReturnValue({
        sort: vi.fn().mockRejectedValue(new Error("DB fail")),
      });

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({}, { projectId: "p1" });
      const res = mockResponse();

      await commentController.getCommentsByProjectId(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });
  });

  /* ---------------------------- getCommentById ---------------------------- */
  describe("getCommentById", () => {
    it("should return a comment by id", async () => {
      const comment = {
        _id: "1",
        projectId: "p1",
        username: "Alice",
        content: "Hello",
        createdAt: new Date(),
      };

      (Comment.findById as unknown as Mock).mockResolvedValue(comment);

      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      await commentController.getCommentById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(comment);
      expect(Comment.findById).toHaveBeenCalledWith("1");
    });

    it("should return 400 if id is missing", async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();

      await commentController.getCommentById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Comment ID is required",
      });
    });

    it("should return 404 if comment not found", async () => {
      (Comment.findById as unknown as Mock).mockResolvedValue(null);

      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      await commentController.getCommentById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Comment not found",
      });
    });

    it("should return 500 on DB error", async () => {
      (Comment.findById as unknown as Mock).mockRejectedValue(
        new Error("DB error"),
      );

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      await commentController.getCommentById(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });
  });

  /* ---------------------------- updateComment ---------------------------- */
  describe("updateComment", () => {
    it("should update a comment successfully", async () => {
      const comment = createMockComment({
        _id: "1",
        content: "Old content",
        save: vi.fn().mockResolvedValue(true),
      });

      const updatedComment = {
        _id: "1",
        projectId: "p1",
        username: "Alice",
        content: "New content",
        createdAt: new Date(),
      };

      (Comment.findById as unknown as Mock)
        .mockResolvedValueOnce(comment) // First call for finding
        .mockResolvedValueOnce(updatedComment); // Second call for response

      const req = mockRequest({ content: "New content" }, { id: "1" });
      const res = mockResponse();

      await commentController.updateComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedComment);
      expect(comment.content).toBe("New content");
      expect(comment.save).toHaveBeenCalled();
    });

    it("should return 400 if id is missing", async () => {
      const req = mockRequest({ content: "New content" }, {});
      const res = mockResponse();

      await commentController.updateComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Comment ID is required",
      });
    });

    it("should return 400 if content is missing", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      await commentController.updateComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Content is required",
      });
    });

    it("should return 404 if comment not found", async () => {
      (Comment.findById as unknown as Mock).mockResolvedValue(null);

      const req = mockRequest({ content: "New content" }, { id: "1" });
      const res = mockResponse();

      await commentController.updateComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Comment not found",
      });
    });

    it("should return 500 on findById error", async () => {
      (Comment.findById as unknown as Mock).mockRejectedValue(
        new Error("DB error"),
      );

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({ content: "New content" }, { id: "1" });
      const res = mockResponse();

      await commentController.updateComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });

    it("should return 500 on save error", async () => {
      const comment = createMockComment({
        save: vi.fn().mockRejectedValue(new Error("Save error")),
      });

      (Comment.findById as unknown as Mock).mockResolvedValue(comment);

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({ content: "New content" }, { id: "1" });
      const res = mockResponse();

      await commentController.updateComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });

    it("should return 500 on second findById error", async () => {
      const comment = createMockComment({
        save: vi.fn().mockResolvedValue(true),
      });

      (Comment.findById as unknown as Mock)
        .mockResolvedValueOnce(comment) // First call for finding
        .mockRejectedValueOnce(new Error("DB error")); // Second call for response

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({ content: "New content" }, { id: "1" });
      const res = mockResponse();

      await commentController.updateComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });
  });

  /* ---------------------------- deleteComment ---------------------------- */
  describe("deleteComment", () => {
    it("should delete a comment successfully", async () => {
      const comment = {
        _id: "1",
        projectId: "p1",
        username: "Alice",
        content: "Hello",
        createdAt: new Date(),
      };

      (Comment.findById as unknown as Mock).mockResolvedValue(comment);
      (Comment.deleteOne as unknown as Mock).mockResolvedValue({
        deletedCount: 1,
      });

      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      await commentController.deleteComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        message: "Comment successfully deleted",
        deletedComment: comment,
      });
      expect(Comment.deleteOne).toHaveBeenCalledWith({ _id: "1" });
    });

    it("should return 400 if id is missing", async () => {
      const req = mockRequest({}, {});
      const res = mockResponse();

      await commentController.deleteComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Comment ID is required",
      });
    });

    it("should return 404 if comment not found", async () => {
      (Comment.findById as unknown as Mock).mockResolvedValue(null);

      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      await commentController.deleteComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Comment not found",
      });
    });

    it("should return 500 on findById error", async () => {
      (Comment.findById as unknown as Mock).mockRejectedValue(
        new Error("DB error"),
      );

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      await commentController.deleteComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });

    it("should return 500 on deleteOne error", async () => {
      const comment = {
        _id: "1",
        projectId: "p1",
        username: "Alice",
        content: "Hello",
        createdAt: new Date(),
      };

      (Comment.findById as unknown as Mock).mockResolvedValue(comment);
      (Comment.deleteOne as unknown as Mock).mockRejectedValue(
        new Error("DB error"),
      );

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      await commentController.deleteComment(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });
  });

  /* ---------------------------- getCommentsByUsername ---------------------------- */
  describe("getCommentsByUsername", () => {
    it("should return comments by username", async () => {
      const comments = [
        {
          _id: "1",
          projectId: "p1",
          username: "Alice",
          content: "Hello",
          createdAt: new Date(),
        },
      ];

      (Comment.find as unknown as Mock).mockResolvedValue(comments);

      const req = mockRequest({}, {}, { username: "Alice" });
      const res = mockResponse();

      await commentController.getCommentsByUsername(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(comments);
      expect(Comment.find).toHaveBeenCalledWith({ username: "Alice" });
    });

    it("should return 400 if username is missing", async () => {
      const req = mockRequest({}, {}, {});
      const res = mockResponse();

      await commentController.getCommentsByUsername(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Username is required",
      });
    });

    it("should return 500 on DB error", async () => {
      (Comment.find as unknown as Mock).mockRejectedValue(
        new Error("DB error"),
      );

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({}, {}, { username: "Alice" });
      const res = mockResponse();

      await commentController.getCommentsByUsername(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });
  });

  /* ---------------------------- toggleUpvote ---------------------------- */
  describe("toggleUpvote", () => {
    it("should toggle upvote successfully", async () => {
      const comment = createMockComment({
        upvotes: [],
        save: vi.fn().mockResolvedValue(true),
      });

      const updatedComment = {
        _id: "1",
        projectId: "p1",
        username: "Alice",
        content: "Hello",
        upvotes: ["Bob"],
        createdAt: new Date(),
      };

      (Comment.findById as unknown as Mock)
        .mockResolvedValueOnce(comment) // First call for finding
        .mockResolvedValueOnce(updatedComment); // Second call for response

      const req = mockRequest({ username: "Bob" }, { id: "1" });
      const res = mockResponse();

      await commentController.toggleUpvote(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith(updatedComment);
      expect(comment.save).toHaveBeenCalled();
    });

    it("should return 400 if username is missing", async () => {
      const req = mockRequest({}, { id: "1" });
      const res = mockResponse();

      await commentController.toggleUpvote(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        error: "Username is required",
      });
    });

    it("should return 404 if comment not found", async () => {
      (Comment.findById as unknown as Mock).mockResolvedValue(null);

      const req = mockRequest({ username: "Bob" }, { id: "1" });
      const res = mockResponse();

      await commentController.toggleUpvote(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(404);
      expect(res.json).toHaveBeenCalledWith({
        error: "Comment not found",
      });
    });

    it("should return 500 on findById error", async () => {
      (Comment.findById as unknown as Mock).mockRejectedValue(
        new Error("DB error"),
      );

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({ username: "Bob" }, { id: "1" });
      const res = mockResponse();

      await commentController.toggleUpvote(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });

    it("should return 500 on save error", async () => {
      const comment = createMockComment({
        upvotes: [],
        save: vi.fn().mockRejectedValue(new Error("Save error")),
      });

      (Comment.findById as unknown as Mock).mockResolvedValue(comment);

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({ username: "Bob" }, { id: "1" });
      const res = mockResponse();

      await commentController.toggleUpvote(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });

    it("should return 500 on second findById error", async () => {
      const comment = createMockComment({
        upvotes: [],
        save: vi.fn().mockResolvedValue(true),
      });

      (Comment.findById as unknown as Mock)
        .mockResolvedValueOnce(comment) // First call for finding
        .mockRejectedValueOnce(new Error("DB error")); // Second call for response

      const spy = vi.spyOn(console, "error").mockImplementation(() => {});

      const req = mockRequest({ username: "Bob" }, { id: "1" });
      const res = mockResponse();

      await commentController.toggleUpvote(req as any, res as any);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith({
        error: "Internal Server Error",
      });

      spy.mockRestore();
    });
  });
});

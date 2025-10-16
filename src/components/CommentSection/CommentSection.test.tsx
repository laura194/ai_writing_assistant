import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { vi } from "vitest";
import CommentSection from "./CommentSection";
import CommentService from "../../utils/CommentService";
import { IComment } from "../../utils/types";

// Mock useUser from Clerk
vi.mock("@clerk/clerk-react", () => ({
  useUser: () => ({
    user: { username: "TestUser", id: "123" },
  }),
}));

// Mock useTheme
vi.mock("../../providers/ThemeProvider", () => ({
  useTheme: () => ({ theme: "light" }),
}));

describe("CommentSection", () => {
  const mockComments: IComment[] = [
    {
      _id: "c1",
      username: "Alice",
      projectId: "p1",
      content: "Hello world",
      createdAt: "2025-10-14T17:00:00Z",
    },
    {
      _id: "c2",
      username: "Bob",
      projectId: "p1",
      content: "Second comment",
      createdAt: "2025-09-01T15:30:00Z",
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(CommentService, "getCommentsByProjectId").mockResolvedValue(
      mockComments,
    );
    vi.spyOn(CommentService, "createComment").mockResolvedValue({
      ...mockComments[0],
      _id: "c3",
      content: "New comment",
      createdAt: "2025-10-14T18:00:00Z",
      username: "TestUser",
    });
  });

  it("loads and displays comments after opening", async () => {
    render(<CommentSection projectId="p1" />);

    // Start: collapsed. Click to expand
    const toggleBtn = screen.getByText(/Comment/).closest("button")!;
    expect(toggleBtn).toBeInTheDocument();

    // Reveal the comments
    userEvent.click(toggleBtn);

    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
      expect(screen.getByText("Hello world")).toBeInTheDocument();
      expect(screen.getByText("Bob")).toBeInTheDocument();
      expect(screen.getByText("Second comment")).toBeInTheDocument();
    });

    // Date formatting present
    expect(
      screen.getAllByText(
        (text, el) =>
          !!el && text.includes("2025") && el.className.includes("text-xs"),
      ).length,
    ).toBeGreaterThan(0);
  });

  it("shows empty message when no comments", async () => {
    vi.spyOn(CommentService, "getCommentsByProjectId").mockResolvedValueOnce(
      [],
    );
    render(<CommentSection projectId="p2" />);

    // Expand
    userEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(screen.getByText(/No comments yet/i)).toBeInTheDocument();
    });
  });

  it("does not add empty comment", async () => {
    render(<CommentSection projectId="p1" />);
    userEvent.click(screen.getByRole("button"));
    const input = await screen.findByPlaceholderText(/Write a comment/i);

    await userEvent.clear(input);
    const sendBtn = screen.getByText(/Send/i);
    await userEvent.click(sendBtn);

    // createComment not called
    expect(CommentService.createComment).not.toHaveBeenCalled();
  });

  it("can collapse and expand comments", async () => {
    render(<CommentSection projectId="p1" />);
    const btn = screen.getByRole("button");

    // Initially comments are hidden
    expect(screen.queryByText("Alice")).not.toBeInTheDocument();

    // Expand
    userEvent.click(btn);
    await waitFor(() => {
      expect(screen.getByText("Alice")).toBeInTheDocument();
    });

    // Collapse
    userEvent.click(btn);
    await waitFor(() => {
      expect(screen.queryByText("Alice")).not.toBeInTheDocument();
    });
  });

  it("handles fetch error gracefully", async () => {
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(CommentService, "getCommentsByProjectId").mockRejectedValueOnce(
      new Error("network"),
    );
    render(<CommentSection projectId="bad" />);
    userEvent.click(screen.getByRole("button"));
    await waitFor(() => {
      expect(errSpy).toHaveBeenCalled();
    });
    errSpy.mockRestore();
  });

  it("shows error if createComment fails", async () => {
    vi.spyOn(CommentService, "createComment").mockRejectedValueOnce(
      new Error("dbFail"),
    );
    const errSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    render(<CommentSection projectId="p1" />);
    userEvent.click(screen.getByRole("button"));
    const input = await screen.findByPlaceholderText(/Write a comment/i);
    await userEvent.type(input, "problem");
    await userEvent.click(screen.getByText(/Send/i));

    await waitFor(() => {
      expect(errSpy).toHaveBeenCalled();
    });
    errSpy.mockRestore();
  });
});

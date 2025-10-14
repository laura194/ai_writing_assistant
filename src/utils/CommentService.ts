// src/utils/CommentService.ts
import { IComment } from "./types";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001") +
  "/api/comments";

const CommentService = {
  // ➕ Kommentar erstellen → gibt das gespeicherte Kommentar zurück
  createComment: async (comment: Partial<IComment>): Promise<IComment> => {
    try {
      const response = await fetch(API_BASE_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(comment),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create comment.");
      }

      const data: IComment = await response.json();
      return data;
    } catch (error) {
      console.error("Error creating comment:", error);
      throw error; // Fehler weiterwerfen, damit handleAddComment ihn catchen kann
    }
  },

  // 📄 Kommentare für ein Projekt abrufen
  getCommentsByProjectId: async (projectId: string): Promise<IComment[]> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${projectId}`);
      if (!response.ok) throw new Error("Failed to fetch comments");
      return await response.json();
    } catch (error) {
      console.error("Error fetching comments:", error);
      return [];
    }
  },

  // 🗑 Kommentar löschen (optional)
  deleteComment: async (id: string): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/${id}`, {
        method: "DELETE",
      });
      if (!response.ok) throw new Error("Failed to delete comment");
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  },
};

export default CommentService;

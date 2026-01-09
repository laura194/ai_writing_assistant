// src/components/CommentSection/CommentSection.tsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  SendHorizonal,
  MessageCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";
import { useUser } from "@clerk/clerk-react";
import { IComment } from "../../utils/types"; // dein Typ-Interface
import CommentService from "../../utils/CommentService";

interface CommentSectionProps {
  projectId: string;
}

const CommentSection = ({ projectId }: CommentSectionProps) => {
  const [comments, setComments] = useState<IComment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const { user } = useUser();

  const { theme } = useTheme();
  const isDark = theme === "dark";

  // Load comments from API
  useEffect(() => {
    const fetchComments = async () => {
      try {
        const data = await CommentService.getCommentsByProjectId(projectId);
        setComments(data);
      } catch (error) {
        console.error("Error loading comments:", error);
      }
    };
    void fetchComments();
  }, [projectId]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;

    const comment: Partial<IComment> = {
      projectId,
      username: user?.username || user?.id || "Unknown User",
      content: newComment.trim(),
    };

    try {
      const savedComment = await CommentService.createComment(comment);
      setComments((prev) => [...prev, savedComment]);
      setNewComment("");
    } catch (error) {
      console.error("Error saving comment:", error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedComments = [...comments].sort(
    (a, b) =>
      new Date(b.date || b.createdAt || "").getTime() -
      new Date(a.date || a.createdAt || "").getTime()
  );

  return (
    <motion.div
      layout
      className={`mt-3 rounded-2xl overflow-hidden ${
        isDark ? "bg-[#241b3b]" : "bg-[#ece8f9]"
      } shadow-[0_2px_12px_rgba(139,92,246,0.15)]`}
    >
      {/* Header-Bar */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-full flex items-center justify-between px-4 py-3 text-left transition cursor-pointer ${
          isDark
            ? "hover:bg-[#2f2450] text-[#ef3573]"
            : "hover:bg-[#ddd6f3] text-[#c92058]"
        }`}
      >
        <div className="flex items-center gap-2 font-semibold">
          <MessageCircle className="w-5 h-5" />
          <span>
            {comments.length} Comment{comments.length !== 1 && "s"}
          </span>
        </div>
        {isOpen ? (
          <ChevronUp className="w-5 h-5" />
        ) : (
          <ChevronDown className="w-5 h-5" />
        )}
      </button>

      {/* Ein-/Ausklappbarer Bereich */}
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            key="comments"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="px-4 pb-4 pt-4"
          >
            {/* Kommentarformular */}
            <div className="flex flex-col sm:flex-row items-center gap-3 mb-4">
              <div
                className={`px-3 py-2 rounded-lg text-sm w-full sm:w-1/4 ${
                  isDark
                    ? "bg-[#2e2348] text-white"
                    : "bg-[#dad5ee] text-[#362466]"
                }`}
              >
                {user?.username || user?.id || "Anonymous"}
              </div>
              <input
                type="text"
                placeholder="Write a comment..."
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                className={`flex-1 px-3 py-2 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#f32469] transition ${
                  isDark
                    ? "bg-[#2e2348] text-white placeholder-[#aaa]"
                    : "bg-[#dad5ee] text-[#362466]"
                }`}
              />
              <motion.button
                whileTap={{ scale: 0.95 }}
                onClick={handleAddComment}
                className="flex items-center gap-2 px-4 py-2 bg-[#c92058] hover:bg-[#a11544] dark:bg-[#ef3573] dark:hover:bg-[#ac1245] text-white rounded-lg transition cursor-pointer"
              >
                <SendHorizonal size={16} /> Send
              </motion.button>
            </div>

            {/* Kommentar-Liste */}
            <div className="space-y-3">
              {comments.length === 0 ? (
                <p className="text-sm text-[#666] dark:text-[#aaa] italic">
                  No comments yet — be the first to write one!
                </p>
              ) : (
                sortedComments.map((c, i) => (
                  <motion.div
                    key={c._id || i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, delay: i * 0.05 }}
                    className={`p-3 rounded-xl ${isDark ? "bg-[#2e2348]" : "bg-[#e0dbf4]"}`}
                  >
                    <div className="flex justify-between text-sm mb-1">
                      <span className="font-medium text-[#362466] dark:text-[#ef3573]">
                        {c.username}
                      </span>
                      <span className="text-xs text-[#666] dark:text-[#aaa]">
                        {formatDate(c.date || c.createdAt || "")}
                      </span>
                    </div>
                    <p className="text-sm text-[#261e3b] dark:text-[#ddd]">
                      {c.content}
                    </p>
                  </motion.div>
                ))
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default CommentSection;

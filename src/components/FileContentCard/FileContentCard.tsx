import { useEffect, useState, useRef, useCallback } from "react";
import { useParams } from "react-router-dom";
import { Node } from "../../utils/types";
import { getIcon } from "../../utils/icons";
import AIBubble from "../ai/AIBubble/AIBubble";
import AIComponent from "../ai/AIComponent/AIComponent";
import { NodeContentService } from "../../utils/NodeContentService";
import toast from "react-hot-toast";
import GradientAtomIcon from "../GradientAtom/GradientAtom";
import { motion } from "framer-motion";
import { Save } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";

export interface FileContentCardProps {
  node: Node;
  onDirtyChange?: (dirty: boolean) => void;
  onSave?: () => void;
}

function FileContentCard({
  node,
  onDirtyChange,
  onSave,
}: FileContentCardProps) {
  const { projectId } = useParams<{ projectId: string }>();

  const [isAIBubbleOpen, setIsAIBubbleOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string>(node.content || "...");
  const [originalContent, setOriginalContent] = useState<string>(
    node.content || "...",
  );
  const [selectedText, setSelectedText] = useState("");
  const [isAIComponentShown, setIsAIComponentShown] = useState(false);
  const [aiNodeName, setAiNodeName] = useState(node.name || "");
  const [isDirty, setIsDirty] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    setFileContent(node.content || "...");
    setOriginalContent(node.content || "...");
    setAiNodeName(node.name || ""); // Aktualisiere den Namen
    setIsDirty(false);
  }, [node]);

  useEffect(() => {
    const dirty = fileContent !== originalContent;
    setIsDirty(dirty);
    onDirtyChange?.(dirty);
  }, [fileContent, originalContent, onDirtyChange]);

  const handleSave = useCallback(async () => {
    if (!projectId) {
      console.error("❌ Cannot save node content: projectId is missing");
      toast.error(
        "Project ID missing. Cannot save. Please try again or contact: plantfriends@gmail.com",
        {
          duration: 10000,
          icon: "❌",
          style: {
            background: "#2a1b1e",
            color: "#ffe4e6",
            padding: "16px 20px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(255, 0, 80, 0.1)",
            border: "1px solid #ef4444",
          },
        },
      );
      return;
    }

    try {
      await NodeContentService.updateNodeContent(node.id, {
        nodeId: node.id,
        name: node.name,
        category: node.category,
        content: fileContent,
        projectId,
      });

      setOriginalContent(fileContent);
      setIsDirty(false);
      onSave?.();
    } catch (error) {
      console.error("Error updating node content:", error);
      toast.error(
        "Failed to save content. Please try again or contact: plantfriends@gmail.com",
        {
          duration: 10000,
          icon: "❌",
          style: {
            background: "#2a1b1e",
            color: "#ffe4e6",
            padding: "16px 20px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(255, 0, 80, 0.1)",
            border: "1px solid #ef4444",
          },
        },
      );
    }
  }, [projectId, fileContent, node, onSave]);

  const handleReplace = (newContent: string) => {
    if (!selectedText) return;
    setFileContent((prev) =>
      prev.includes(selectedText)
        ? prev.replace(selectedText, newContent)
        : prev,
    );
  };

  const handleAppend = (additionalContent: string) => {
    setFileContent((prev) => `${prev}\n${additionalContent}`);
  };

  const handleTextSelect = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const selection = textarea.value
      .substring(textarea.selectionStart, textarea.selectionEnd)
      .trim();

    if (!selection) return;

    setSelectedText(selection);
    setIsAIBubbleOpen(true);
  };

  useEffect(() => {
    const handleSelectionChange = () => {
      const textarea = textareaRef.current;
      const activeElement = document.activeElement;

      if (!textarea || activeElement !== textarea) return;

      const selection = textarea.value
        .substring(textarea.selectionStart, textarea.selectionEnd)
        .trim();

      if (!selection) {
        setSelectedText("");
        setIsAIBubbleOpen(false);
      }
    };

    document.addEventListener("selectionchange", handleSelectionChange);
    return () =>
      document.removeEventListener("selectionchange", handleSelectionChange);
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const isCtrlS = (e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "s";

      if (isCtrlS && isDirty) {
        e.preventDefault();
        handleSave();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isDirty, handleSave]);

  const handleAIBubbleClick = () => {
    setIsAIBubbleOpen(false);
    setAiNodeName(`${node.name} (Selection)`);
    setIsAIComponentShown(true);
  };

  return (
    <div className="relative flex flex-col h-full p-6 rounded-3xl bg-[#e9e5f8] dark:bg-[#1e1538]">
      <div className="absolute mt-0.5 ml-4">
        <div className="rounded-lg bg-gradient-to-tr from-purple-500 via-pink-400 to-yellow-300 p-[2px]">
          <div className="rounded-lg bg-[#e1dcf8] dark:bg-[#2f214d] p-2">
            {getIcon(node, "w-8 h-8", node.icon)}
          </div>
        </div>
      </div>
      <div className="relative mb-6 px-21">
        <h2 className="text-3xl font-bold inline-block tracking-wide">
          {/* Gradient-Text */}
          <span className="text-[#261e3b] dark:text-[#ffffff]">
            {node.name}{" "}
          </span>
          <span className="block h-1 w-full mt-1.5 bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 rounded-full" />
        </h2>
      </div>

      <div className="absolute top-4 right-10 flex items-center">
        <motion.button
          whileHover={{
            scale: 1.075,
            boxShadow: isDark
              ? "0 0 20px rgba(120,69,239,0.4)"
              : "0 0 14px rgba(120,69,239,0.6)",
            transition: { duration: 0.2 },
          }}
          whileTap={{ scale: 0.95 }}
          className="p-3 rounded-full bg-[#e1dcf8] dark:bg-[#2f214d] hover:bg-[#c5baf5] dark:hover:bg-[#402b6d] transition-colors duration-300 shadow-inner shadow-purple-500/30 dark:shadow-purple-700/80 hover:shadow-purple-400/80 dark:hover:shadow-purple-400/95 cursor-pointer border-2 border-[#beb5e4] dark:border-white hover:border-purple-500 dark:hover:border-purple-400"
          onClick={() => {
            setSelectedText(fileContent);
            setAiNodeName(node.name || "");
            setIsAIComponentShown(true);
          }}
          title="Ask AI about this content"
        >
          <GradientAtomIcon />
        </motion.button>
      </div>

      {isAIComponentShown && (
        <AIComponent
          selectedText={selectedText}
          nodeName={aiNodeName || ""}
          isOpen={isAIComponentShown}
          onClose={() => setIsAIComponentShown(false)}
          onReplace={handleReplace}
          onAppend={handleAppend}
        />
      )}

      <textarea
        ref={textareaRef}
        value={fileContent}
        onChange={(e) => setFileContent(e.target.value)}
        onMouseUp={handleTextSelect}
        onKeyUp={handleTextSelect}
        className="w-full mt-1 flex-1 p-4 bg-[#eae5fc] dark:bg-[#1b1333] text-[#261e3b] dark:text-[#ffffff] rounded-xl
               border-2 border-[#afa4e0] dark:border-[#35285f] focus:outline-none focus:ring-2 focus:ring-purple-400 darK:focus:ring-purple-700
               placeholder:text-[#888] dark:placeholder:text-[#777] resize-none transition"
        placeholder="Write your content here..."
        spellCheck={true}
      />

      {isAIBubbleOpen && selectedText && (
        <AIBubble position={{ x: 50, y: 120 }} onClick={handleAIBubbleClick} />
      )}

      <div className="mt-5 flex justify-center">
        <motion.button
          disabled={!isDirty}
          title={!isDirty ? "No changes" : "Save changes"}
          onClick={handleSave}
          whileHover={
            isDirty
              ? {
                  scale: 1.05,
                  boxShadow: isDark
                    ? "0 0 20px rgba(120,69,239,0.4)"
                    : "0 0 10px rgba(120,69,239,0.7)",
                  transition: { duration: 0.1 },
                }
              : {}
          }
          className={`p-[2px] rounded-xl w-[230px] mx-auto transform transition-colors duration-250
            ${
              isDirty
                ? "bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 cursor-pointer"
                : "bg-[#cdc3f1] dark:bg-[#2c2544] opacity-60 cursor-not-allowed"
            }`}
        >
          <div
            className={`group flex items-center justify-center bg-[#e9e5f8] dark:bg-[#1e1538] dark:bg-opacity-90 backdrop-blur-md p-4 rounded-xl border transform transition-all duration-250
            ${
              isDirty
                ? "bg-[#e9e5f8] dark:bg-[#1e1538] border-[#beadee] dark:border-[#32265b] shadow-inner shadow-purple-500/35 dark:shadow-cyan-800/40"
                : "bg-[#e9e5f8] dark:bg-[#1e1538] border-[#d2c5ff] dark:border-[#2d244d]"
            }`}
          >
            <Save
              className={`w-7 h-7 ${isDirty ? "stroke-[#7558b3] dark:stroke-[#bea2ff]" : "stroke-[#9a98d1] dark:stroke-[#555476]"}`}
            />
            <span
              className={`ml-3 text-2xl font-semibold transition-colors duration-250 relative 
              ${
                isDirty
                  ? "text-[#7558b3] dark:text-[#bea2ff] group-hover:text-[#37177d] dark:group-hover:text-[#e7dcff] before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#7558b3] dark:before:bg-[#bea2ff] group-hover:before:w-full before:transition-all before:duration-300"
                  : "text-[#a5a3dd] dark:text-[#77748c]"
              }`}
            >
              SAVE
              <span
                className={`ml-2 text-sm ${
                  isDirty
                    ? "text-[#8c75c0] dark:text-[#9581bf]"
                    : "text-[#afaddb] dark:text-[#77748c]"
                }`}
              >
                [Ctrl+S]
              </span>
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}

export default FileContentCard;

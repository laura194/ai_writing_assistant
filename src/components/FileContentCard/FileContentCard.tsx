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

import nspell from "nspell";

// Typ für Spellchecker
type Spellchecker = ReturnType<typeof nspell>;

export interface FileContentCardProps {
  node: Node;
  onDirtyChange?: (dirty: boolean) => void;
  onSave?: () => void;
  onContentChangeForHistory?: (
    prevContent: string,
    nextContent: string
  ) => void;
  externalVersion?: number;
}

function FileContentCard({
  node,
  onDirtyChange,
  onSave,
  onContentChangeForHistory,
  externalVersion,
}: FileContentCardProps) {
  const { projectId } = useParams<{ projectId: string }>();

  const [isAIBubbleOpen, setIsAIBubbleOpen] = useState(false);
  const [fileContent, setFileContent] = useState<string>(node.content || "...");
  const [originalContent, setOriginalContent] = useState<string>(
    node.content || "..."
  );
  const [selectedText, setSelectedText] = useState("");
  const [isAIComponentShown, setIsAIComponentShown] = useState(false);
  const [aiNodeName, setAiNodeName] = useState(node.name || "");
  const [isDirty, setIsDirty] = useState(false);

  const { theme } = useTheme();
  const isDark = theme === "dark";

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const prevContentForHistoryRef = useRef<string>(node.content ?? "");
  const contentChangeTimerRef = useRef<NodeJS.Timeout | null>(null);

  const HISTORY_IDLE_MS = 500;
  const AUTOSAVE_INTERVAL_MS = 5 * 60 * 1000;

  const prevNodeIdRef = useRef<string | null>(null);
  const prevExternalVersionRef = useRef<number | undefined>(externalVersion);
  const overlayRef = useRef<HTMLDivElement>(null);

  // States für Spellchecker
  const [spellDe, setSpellDe] = useState<Spellchecker | null>(null);
  const [spellEn, setSpellEn] = useState<Spellchecker | null>(null);

  // Dictionaries laden und Spellchecker erstellen
  useEffect(() => {
    async function loadDictionaries() {
      try {
        const [affDe, dicDe, affEn, dicEn] = await Promise.all([
          fetch("/dictionaries/dictionary-de/index.aff").then((res) =>
            res.text()
          ),
          fetch("/dictionaries/dictionary-de/index.dic").then((res) =>
            res.text()
          ),
          fetch("/dictionaries/dictionary-en/index.aff").then((res) =>
            res.text()
          ),
          fetch("/dictionaries/dictionary-en/index.dic").then((res) =>
            res.text()
          ),
        ]);

        // ✅ nspell erwartet zwei Strings: aff + dic
        setSpellDe(nspell(affDe, dicDe));
        setSpellEn(nspell(affEn, dicEn));

        // Testausgaben
        const spellDeTest = nspell(affDe, dicDe);
        console.log("DE korrekt für 'Hallo':", spellDeTest.correct("Hallo"));
        console.log("DE korrekt für 'Haus':", spellDeTest.correct("Haus"));
        const spellEnTest = nspell(affEn, dicEn);
        console.log("EN korrekt für 'Hello':", spellEnTest.correct("Hello"));
        console.log("EN korrekt für 'World':", spellEnTest.correct("World"));
      } catch (e) {
        console.error("Fehler beim Laden der Dictionaries", e);
      }
    }

    loadDictionaries();
  }, []);

  /*function checkWord(word: string) {
    if (!spellDe || !spellEn) return true;
    if (word.trim() === "") return true;
    return spellDe.correct(word) || spellEn.correct(word);
  }
  */

  function checkWord(word: string) {
    if (!spellDe || !spellEn) return true;
    if (word.trim() === "") return true;
    const cleaned = word
      .replace(/^[.,!?;:"'()[\]{}<>-]+|[.,!?;:"'()[\]{}<>-]+$/g, "")
      .trim();
    if (cleaned === "") return true; // Was pure punctuation
    return spellDe.correct(cleaned) || spellEn.correct(cleaned);
  }

  // Aus dem Text HTML erzeugen: Fehlerwörter markieren
  function getHighlightedHtml(text: string) {
    // Splitte Zeilen und Wörter, baue HTML mit Fehler-Underline
    const lines = text.split("\n");
    return lines.map((line, lineIdx) => {
      const words = line.split(/(\s+)/); // Bewahrt Leerzeichen als eigene Elemente
      return (
        <div key={lineIdx} style={{ display: "block" }}>
          {words.map((word, i) => {
            const isError = !checkWord(word) && word.trim() !== "";
            return isError ? (
              <span key={i} className="border-b-2 border-red-600">
                {word}
              </span>
            ) : (
              <span key={i}>{word}</span>
            );
          })}
        </div>
      );
    });
  }

  // Scroll-Synchronisation: Overlay scrollt gleich mit Textarea
  const syncScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  useEffect(() => {
    setAiNodeName(node.name || "");

    if (prevNodeIdRef.current !== node.id) {
      setFileContent(node.content ?? "");
      setOriginalContent(node.content ?? "");
      setIsDirty(false);
      prevContentForHistoryRef.current = node.content ?? "";
      if (contentChangeTimerRef.current) {
        clearTimeout(contentChangeTimerRef.current);
        contentChangeTimerRef.current = null;
      }
      prevNodeIdRef.current = node.id;
    }
  }, [node.id, node.name]);

  useEffect(() => {
    if (prevExternalVersionRef.current !== externalVersion) {
      prevExternalVersionRef.current = externalVersion;
      if ((node.content ?? "") !== fileContent) {
        setFileContent(node.content ?? "");
        const dirty = (node.content ?? "") !== originalContent;
        setIsDirty(dirty);
        onDirtyChange?.(dirty);
        prevContentForHistoryRef.current = node.content ?? "";
      }
    }
  }, [
    externalVersion,
    node.content,
    fileContent,
    originalContent,
    onDirtyChange,
  ]);

  useEffect(() => {
    const dirty = fileContent !== originalContent;
    setIsDirty(dirty);
    onDirtyChange?.(dirty);
  }, [fileContent, originalContent, onDirtyChange]);

  const handleSave = useCallback(
    async (opts?: { skipVersion?: boolean }) => {
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
          }
        );
        return;
      }

      if (!isDirty && opts?.skipVersion) return;

      if (!isDirty && !opts?.skipVersion) {
        toast.success("No changes to save.", {
          duration: 5000,
          icon: "✅",
          style: {
            background: "#1e2b2d",
            color: "#d1fae5",
            padding: "16px 20px",
            borderRadius: "12px",
            fontSize: "15px",
            fontWeight: "500",
            boxShadow: "0 4px 12px rgba(0, 255, 170, 0.1)",
            border: "1px solid #10b981",
          },
        });
        return;
      }

      try {
        await NodeContentService.updateNodeContent(node.id, {
          nodeId: node.id,
          name: node.name,
          category: node.category,
          content: fileContent,
          projectId,
          skipVersion: opts?.skipVersion,
        });

        setOriginalContent(fileContent);
        setIsDirty(false);
        onSave?.();

        if (!opts?.skipVersion) {
          console.info("Porject was saved successfully.");
        }
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
          }
        );
      }
    },
    [projectId, fileContent, node.id, node.name, node.category, isDirty, onSave]
  );

  const handleSaveClick = useCallback(() => {
    handleSave();
  }, [handleSave]);

  const handleEditorChange = (value: string) => {
    setFileContent(value);
    setIsDirty(true);
    onDirtyChange?.(true);

    if (contentChangeTimerRef.current) {
      clearTimeout(contentChangeTimerRef.current);
      contentChangeTimerRef.current = null;
    }

    const prevContent = prevContentForHistoryRef.current;
    contentChangeTimerRef.current = setTimeout(() => {
      try {
        onContentChangeForHistory?.(prevContent, value);

        prevContentForHistoryRef.current = value;

        if (projectId) {
          NodeContentService.createContentVersion(
            node.id,
            projectId,
            value,
            node.name,
            node.category
          ).catch((err) => {
            console.error("Failed to create background version:", err);
          });
        }
      } catch (err) {
        console.error("Error in idle commit:", err);
      }
    }, HISTORY_IDLE_MS);
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

  useEffect(() => {
    const id = setInterval(() => {
      handleSave({ skipVersion: true });
    }, AUTOSAVE_INTERVAL_MS);
    return () => clearInterval(id);
  }, [handleSave]);

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
          onReplace={(newText) => setFileContent(newText)}
          onAppend={(extra) => setFileContent((prev) => prev + "\n" + extra)}
        />
      )}

      <div className="relative flex-1 mt-1 rounded-xl overflow-hidden border-2 border-[#afa4e0] dark:border-[#35285f] focus-within:ring-2 focus-within:ring-purple-400 dark:focus-within:ring-purple-700">
        {/* Spellcheck Overlay */}
        <div
          ref={overlayRef}
          aria-hidden="true"
          className="absolute top-0 left-0 w-full h-full pointer-events-none select-none p-4 whitespace-pre-wrap overflow-y-auto z-10 text-transparent"
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
        >
          <div className="text-inherit font-inherit min-h-full w-full">
            {getHighlightedHtml(fileContent)}
          </div>
        </div>

        {/* Das Textarea mit transparentem Hintergrund damit Overlay sichtbar ist */}
        <textarea
          ref={textareaRef}
          value={fileContent}
          onChange={(e) => handleEditorChange(e.target.value)}
          onMouseUp={handleTextSelect}
          onKeyUp={handleTextSelect}
          onScroll={syncScroll}
          placeholder="Write your content here..."
          spellCheck={false}
          className="relative z-20 w-full h-full p-4 bg-transparent text-[#261e3b] dark:text-[#ffffff] focus:outline-none placeholder:text-[#888] dark:placeholder:text-[#777] resize-none transition whitespace-pre-wrap"
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
        />
      </div>

      {isAIBubbleOpen && selectedText && (
        <AIBubble position={{ x: 50, y: 120 }} onClick={handleAIBubbleClick} />
      )}

      <div className="mt-5 flex justify-center">
        <motion.button
          disabled={!isDirty}
          title={!isDirty ? "No changes" : "Save changes"}
          onClick={handleSaveClick}
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

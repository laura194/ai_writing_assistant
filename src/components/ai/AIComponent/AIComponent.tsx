import { Dialog } from "@headlessui/react";
import { useState, useEffect, useRef } from "react";
import { Lightbulb, X, Check, Plus, SendHorizonal } from "lucide-react";
import {
  fetchAIResponse,
  createAIProtocolEntry,
} from "../../../utils/AIHandler";
import { AIResult } from "../../../models/IAITypes";
import MarkdownContent from "../../MarkdownContent/MarkdownContent";
import { useParams } from "react-router-dom";
import { motion } from "framer-motion";
import Spinner from "../../Spinner/Spinner";
import { useTheme } from "../../../providers/ThemeProvider";

interface AIComponentProps {
  selectedText: string;
  nodeName: string;
  isOpen: boolean;
  onClose: () => void;
  onReplace: (newContent: string) => void;
  onAppend: (additionalContent: string) => void;
}

const suggestions = [
  "Make this passage more concise.",
  "Check this for grammar.",
  "Expand on this idea.",
];

function AIComponent({
  selectedText,
  nodeName,
  isOpen,
  onClose,
  onReplace,
  onAppend,
}: AIComponentProps) {
  const [history, setHistory] = useState<AIResult[]>([]);
  const [prompts, setPrompts] = useState<string[]>([]);
  const [additionalPrompt, setAdditionalPrompt] = useState("");
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const dialogRef = useRef<HTMLDivElement>(null);
  const suggestionsMenuRef = useRef<HTMLDivElement>(null);
  const { projectId } = useParams<{ projectId: string }>();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  useEffect(() => {
    if (isOpen) {
      setAdditionalPrompt("");
      setShowSuggestions(false);
      setHistory([]);
      setPrompts([]);
    }
  }, [isOpen]);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (!showSuggestions) return;
      const target = e.target as Node;
      if (
        suggestionsMenuRef.current &&
        !suggestionsMenuRef.current.contains(target) &&
        toggleRef.current &&
        !toggleRef.current.contains(target)
      ) {
        setShowSuggestions(false);
      }
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, [showSuggestions]);

  const createProtocolAt = (index: number, action: "Replace" | "Append") => {
    const relevantPrompts = prompts.slice(0, index + 1);
    createAIProtocolEntry({
      aiName: history[index]?.modelVersion || "Unknown AI",
      usageForm: `${action}: ${relevantPrompts.join(" | ") || "Unknown prompt"}`,
      affectedParts: nodeName || "Unknown file",
      remarks: history[index]?.text || "No remarks",
      projectId: projectId || "unknown-project",
    });
  };

  const handleReplaceAt = (index: number) => {
    if (history[index]) {
      createProtocolAt(index, "Replace");
      onReplace(history[index].text);
      onClose();
    }
  };

  const handleAppendAt = (index: number) => {
    if (history[index]) {
      createProtocolAt(index, "Append");
      onAppend(history[index].text);
      onClose();
    }
  };

  const handleFetchResponse = async () => {
    if (!additionalPrompt.trim()) return;
    setLoading(true);
    const fullText = `${selectedText} ${additionalPrompt}`.trim();
    const result = await fetchAIResponse(fullText);
    result.originalText = selectedText;
    result.prompt = additionalPrompt;
    setPrompts((prev) => [...prev, additionalPrompt]);
    setHistory((prev) => [...prev, result]);
    setAdditionalPrompt("");
    setLoading(false);
  };

  const handleFollowUp = async () => {
    const last = history[history.length - 1];
    if (!last || !additionalPrompt.trim()) return;
    setLoading(true);
    const followUpText = `${last.text} ${additionalPrompt}`.trim();
    const result = await fetchAIResponse(followUpText);
    result.originalText = last.text;
    result.prompt = additionalPrompt;
    setPrompts((prev) => [...prev, additionalPrompt]);
    setHistory((prev) => [...prev, result]);
    setAdditionalPrompt("");
    setLoading(false);
  };

  return (
    <>
      {loading && <Spinner />}

      <Dialog
        open={isOpen}
        onClose={onClose}
        className="fixed inset-0 z-50 flex items-center justify-center"
      >
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm"
          aria-hidden="true"
        />

        {/* animierter Außen-Rahmen */}
        <motion.div
          ref={dialogRef}
          initial={{ backgroundPosition: "0% 50%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ repeat: Infinity, duration: 6, ease: "linear" }}
          className="relative p-[3px] rounded-3xl"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #7c3aed, #db2777, #facc15)",
            backgroundSize: "200% 200%",
            boxShadow: isDark
              ? "0 0 20px rgba(120,69,239,0.55)"
              : "0 0 20px rgba(120,69,239,0.75)",
          }}
        >
          {/* Inneres Panel */}
          <div className="flex flex-col h-full max-h-[90vh] w-[90vw] max-w-[1200px] rounded-3xl bg-[#e9e5f8] dark:bg-[#1e1538] shadow-2xl overflow-hidden">
            {/* Dein Header */}
            <div className="flex justify-between items-center px-6 py-4 border-b-2 border-[#beb5e4] dark:border-[#3e316e]">
              <h2 className="text-4xl font-semibold text-[#261e3b] dark:text-[#ffffff] uppercase">
                AI Assistant
              </h2>
              <motion.button
                whileHover={{
                  scale: 1.1,
                  transition: { duration: 0.15 },
                }}
                whileTap={{ scale: 0.95 }}
                onClick={onClose}
                className="p-2 rounded cursor-pointer"
              >
                <X className="w-6 h-6 dark:text-[#afa6c5] text-[#261e3b] hover:text-[#9c85d4] dark:hover:text-[#ffffff] transition-colors duration-250" />
              </motion.button>
            </div>

            {/* Scrollbarer Bereich für Originaltext + Verlauf */}
            <div className="flex-1 overflow-y-auto px-6 py-4 space-y-6 max-h-[60vh] pr-6">
              {/* Original Text */}
              <div>
                <h4 className="text-m dark:text-[#afa6c5] text-[#261e3b] mb-1.5 ml-4">
                  Original Text
                </h4>
                <div className="bg-[#e4dff7] dark:bg-[#2c2544] px-4 py-1 pb-3 rounded-lg text-[#322457] dark:text-[#e8e8ff]">
                  <MarkdownContent content={selectedText} />
                </div>
              </div>
              {/* AI Response History */}
              {history.map((item, index) => (
                <div
                  key={index}
                  className="border-t-2 border-[#c0b1f0] dark:border-[#34285e] pt-3 flex flex-col gap-1.5"
                >
                  <h4 className="text-m text-[#625393] dark:text-[#2c2544] mb-1.5 ml-4">
                    Your Prompt: {item.prompt}
                  </h4>
                  <div className="flex">
                    <div className="flex-1 bg-[#e0daf7] dark:bg-[#2c2544] px-4 py-1 pb-3 rounded-lg text-[#322457] dark:text-[#e8e8ff]">
                      <MarkdownContent content={item.text} />
                    </div>

                    <div className="ml-3 flex flex-col gap-2">
                      <motion.button
                        whileHover={{
                          scale: 1.1,
                          boxShadow: isDark
                            ? "0 0 16px rgba(120,69,239,0.3)"
                            : "0 0 12px rgba(120,69,239,0.6)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        title="Replace with this text"
                        onClick={() => handleReplaceAt(index)}
                        className="p-1 rounded-full bg-[#c8bde0] dark:bg-[#2e214b] hover:bg-[#9979dd] dark:hover:bg-[#443764] shadow-[0_0_8px_rgba(120,69,239,0.4)] dark:shadow-[0_0_10px_rgba(120,69,239,0.2)] transition-colors duration-200 cursor-pointer text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ece8fc] dark:bg-[#20173b]">
                          <Check className="w-5.5 h-5.5 " />
                        </div>
                      </motion.button>
                      <motion.button
                        whileHover={{
                          scale: 1.1,
                          boxShadow: isDark
                            ? "0 0 16px rgba(120,69,239,0.3)"
                            : "0 0 12px rgba(120,69,239,0.6)",
                        }}
                        whileTap={{ scale: 0.95 }}
                        title="Append this text"
                        onClick={() => handleAppendAt(index)}
                        className="p-1 rounded-full bg-[#c8bde0] dark:bg-[#2e214b] hover:bg-[#9979dd] dark:hover:bg-[#443764] shadow-[0_0_8px_rgba(120,69,239,0.4)] dark:shadow-[0_0_10px_rgba(120,69,239,0.2)] transition-colors duration-200 cursor-pointer text-cyan-600 dark:text-cyan-400 hover:text-cyan-800 dark:hover:text-cyan-300"
                      >
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-[#ece8fc] dark:bg-[#20173b]">
                          <Plus className="w-5.5 h-5.5" />
                        </div>
                      </motion.button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Prompt Input & Suggestions */}
            <div className="px-6 py-4 border-t-2 border-[#beb5e4] dark:border-[#3e316e] relative">
              <h4 className="text-m dark:text-[#afa6c5] text-[#261e3b] mb-1.5 ml-4">
                Refine or continue with a new prompt
              </h4>
              <textarea
                className="w-full bg-[#e0daf7] dark:bg-[#2c2544] text-[#322457] dark:text-[#e8e8ff] placeholder-[#9a8db1] dark:placeholder-[#787086]
                         rounded-lg border-2 border-[#afa4e0] dark:border-[#35285f]
                         resize-none mb-3 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-400 dark:focus:ring-purple-700 transition duration-200"
                placeholder="Note: This AI has no memory. Your prompt will only refer to the most recent version of the text."
                value={additionalPrompt}
                onChange={(e) => setAdditionalPrompt(e.target.value)}
                key={history.length}
              />

              <div className="flex items-center justify-between">
                <div className="relative">
                  {showSuggestions && (
                    <div
                      ref={suggestionsMenuRef}
                      data-testid="suggestions-menu"
                      className="absolute left-full bottom-0 bg-[#e0daf7] dark:bg-[#2c2544] border-1 border-[#beb5e4] dark:border-[#3e316e]
                     rounded-xl shadow-[0_0_8px_rgba(120,69,239,0.4)] dark:shadow-[0_0_10px_rgba(120,69,239,0.1)] py-1.5 space-y-0.5 max-h-50 overflow-y-auto z-50 w-67"
                    >
                      {suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          className="block w-full text-center px-4 py-2 text-[#322457] dark:text-[#e8e8ff]
                               hover:bg-[#d8d0f9]/90 dark:hover:bg-[#3a2e5a] transition duration-200 cursor-pointer"
                          onClick={() => {
                            setAdditionalPrompt(suggestion);
                            setShowSuggestions(false);
                          }}
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                  <motion.button
                    ref={toggleRef}
                    whileHover={{
                      scale: 1.1,
                      transition: { duration: 0.15 },
                    }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() =>
                      setShowSuggestions((suggestion) => !suggestion)
                    }
                    className="p-2 rounded cursor-pointer"
                    title="Show suggestions"
                  >
                    <Lightbulb className="w-6 h-6 ml-4 text-yellow-500 dark:text-yellow-400 hover:text-yellow-700 dark:hover:text-yellow-200 transition-colors duration-300" />
                  </motion.button>
                </div>
                <motion.button
                  title={"Ask AI"}
                  onClick={
                    history.length === 0 ? handleFetchResponse : handleFollowUp
                  }
                  whileHover={{
                    scale: 1.05,
                    boxShadow: isDark
                      ? "0 0 20px rgba(120,69,239,0.4)"
                      : "0 0 10px rgba(120,69,239,0.6)",
                    transition: { duration: 0.2 },
                  }}
                  className="p-[2px] rounded-xl w-[140px] transform transition-colors duration-250 bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 cursor-pointer"
                >
                  <div className="group flex items-center justify-center bg-[#e9e5f8] dark:bg-[#1e1538] bg-opacity-90 backdrop-blur-md p-2 rounded-xl border transform transition-all duration-250 border-[#beadee] dark:border-[#32265b] shadow-inner shadow-purple-500/30 dark:shadow-cyan-800/40">
                    <SendHorizonal className="w-6 h-6 stroke-[#7558b3] dark:stroke-[#bea2ff] transition-colors duration-250 group-hover:stroke-[#6848b2] dark:group-hover:stroke-[#e7dcff]" />
                    <span className="ml-3 text-xl font-semibold transition-colors duration-250 relative text-[#7558b3] dark:text-[#bea2ff] group-hover:text-[#37177d] dark:group-hover:text-[#e7dcff] before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#7558b3] dark:before:bg-[#bea2ff] group-hover:before:w-full before:transition-all before:duration-300">
                      {loading ? "Loading..." : "Ask AI"}
                    </span>
                  </div>
                </motion.button>
              </div>
            </div>
          </div>
        </motion.div>
      </Dialog>
    </>
  );
}

export default AIComponent;

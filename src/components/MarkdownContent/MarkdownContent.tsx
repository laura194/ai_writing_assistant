import React, { useRef, useEffect } from "react";
import ReactMarkdown from "react-markdown";

interface MarkdownContentProps {
  content: string;
  onTextSelect?: (text: string, coords: { x: number; y: number }) => void;
}

const MarkdownContent: React.FC<MarkdownContentProps> = ({
  content,
  onTextSelect,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);

  const isDefaultObjectToString = (fn?: any) =>
    typeof fn === "function" && fn === Object.prototype.toString;

  const handleMouseUp = () => {
    const selection = window.getSelection();
    if (!selection) return;

    const hasCallableToString =
      typeof selection.toString === "function" &&
      !isDefaultObjectToString(selection.toString);
    const text = hasCallableToString ? selection.toString().trim() : "";
    if (!text) return;

    const rangeCount =
      typeof (selection as any).rangeCount === "number"
        ? (selection as any).rangeCount
        : 0;
    if (rangeCount === 0 || typeof selection.getRangeAt !== "function") return;

    const range = selection.getRangeAt(0);
    const rect = range.getBoundingClientRect();
    const coords = {
      x: rect.left + rect.width / 2 + window.scrollX,
      y: rect.top + window.scrollY,
    };

    onTextSelect?.(selection.toString(), coords);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const selection = window.getSelection();
      if (!containerRef.current?.contains(e.target as Node)) {
        const hasCallableToString =
          selection &&
          typeof selection.toString === "function" &&
          !isDefaultObjectToString(selection.toString);
        const hasText = hasCallableToString
          ? selection!.toString().trim() !== ""
          : Boolean(selection && (selection as any).rangeCount);

        if (
          selection &&
          hasText &&
          typeof selection.removeAllRanges === "function"
        ) {
          selection.removeAllRanges();
        }
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div ref={containerRef} onMouseUp={handleMouseUp}>
      <ReactMarkdown
        components={{
          p: ({ children }) => <p className="mt-2">{children}</p>,
          strong: ({ children }) => (
            <strong className="font-bold">{children}</strong>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 mt-2">{children}</ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 mt-2">{children}</ol>
          ),
          li: ({ children }) => <li className="mt-1">{children}</li>,
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
};

export default MarkdownContent;

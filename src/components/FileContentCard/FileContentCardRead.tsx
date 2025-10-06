import { useState, useRef, useEffect } from "react";
import { Node } from "../../utils/types";
import { getIcon } from "../../utils/icons";

export interface FileContentCardProps {
  node: Node;
  onDirtyChange?: (dirty: boolean) => void;
  onSave?: () => void;
}

function FileContentCardRead({ node }: FileContentCardProps) {
  const [fileContent, setFileContent] = useState<string>(node.content || "...");

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  // 🔑 Synchronisiere State mit neuen Props
  useEffect(() => {
    setFileContent(node.content || "...");
  }, [node]);

  const syncScroll = () => {
    if (textareaRef.current && overlayRef.current) {
      overlayRef.current.scrollTop = textareaRef.current.scrollTop;
    }
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
          <span className="text-[#261e3b] dark:text-[#ffffff]">
            {node.name}{" "}
          </span>
          <span className="block h-1 w-full mt-1.5 bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-300 rounded-full" />
        </h2>
      </div>

      <div className="relative flex-1 mt-1 rounded-xl overflow-hidden border-2 border-[#afa4e0] dark:border-[#35285f] focus-within:ring-2 focus-within:ring-purple-400 dark:focus-within:ring-purple-700">
        <textarea
          ref={textareaRef}
          value={fileContent}
          onChange={(e) => setFileContent(e.target.value)}
          onScroll={syncScroll}
          placeholder="Write your content here..."
          spellCheck={false}
          className="relative z-20 w-full h-full p-4 bg-transparent text-[#261e3b] dark:text-[#ffffff] focus:outline-none placeholder:text-[#888] dark:placeholder:text-[#777] resize-none transition whitespace-pre-wrap"
          style={{ fontSize: "1rem", lineHeight: "1.5" }}
        />
      </div>
    </div>
  );
}

export default FileContentCardRead;

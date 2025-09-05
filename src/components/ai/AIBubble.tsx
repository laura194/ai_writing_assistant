import { FC } from "react";
import { Atom } from "lucide-react";

interface AIBubbleProps {
  position: { x: number; y: number };
  onClick: () => void;
}

const AIBubble: FC<AIBubbleProps> = ({ position, onClick }) => {
  return (
    <div
      className="
        absolute z-50
        w-11.5 h-11.5
        flex items-center justify-center
        rounded-full
        bg-gradient-to-tr from-yellow-300 via-pink-400 to-purple-500
        shadow-[0_0_8px_rgba(124,58,237,0.9)] dark:shadow-[0_0_10px_rgba(124,58,237,0.75)]
        hover:shadow-[0_0_12px_rgba(251,146,60,0.55)] dark:hover:shadow-[0_0_20px_rgba(251,146,60,0.6)]
        hover:scale-110
        transition-all duration-300
        cursor-pointer
      "
      style={{
        top: position.y,
        left: position.x,
      }}
      onClick={onClick}
      title="Ask the AI about the highlighted selection"
    >
      <span
        className="
        w-10 h-10
        flex items-center justify-center
        bg-[#e9e5f8] dark:bg-[#1e1538]
        rounded-full
        shadow-inner shadow-purple-400/80 dark:shadow-purple-600/60
      "
      >
        <Atom className="w-6 h-6 text-[#261e3b] dark:text-white" />
      </span>
    </div>
  );
};

export default AIBubble;

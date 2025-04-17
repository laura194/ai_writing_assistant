import { Node } from "../utils/types";

export interface FileContentCardProps {
  node: Node;
}

interface AIBubbleProps {
  position: { top: number; left: number };
  onClick: () => void;
}

const AIBubble: React.FC<AIBubbleProps> = ({ position, onClick }) => {
  return (
    <div
      className="absolute bg-blue-500 text-white px-3 py-1 rounded-lg text-sm cursor-pointer"
      style={{
        top: `${position.top + 70}px`,
        left: `${position.left}px`,
        transform: "translateX(-50%)",
      }}
      onClick={onClick}
    >
      ✨ AI?
    </div>
  );
};

export default AIBubble;

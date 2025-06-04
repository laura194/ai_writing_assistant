import { FC } from "react";
import { Atom } from "lucide-react";

interface AIBubbleProps {
  position: { x: number; y: number };
  onClick: () => void;
}

const AIBubble: FC<AIBubbleProps> = ({ position, onClick }) => {
  return (
    <div
      className="absolute z-50 bg-white rounded-full p-1 shadow-md hover:bg-gray-200 transition-colors cursor-pointer"
      style={{
        top: position.y,
        left: position.x,
        transform: "translate(-50%, -100%)",
      }}
      onClick={onClick}
      title="Ask AI about selection"
    >
      <Atom className="w-5 h-5 text-blue-700" />
    </div>
  );
};

export default AIBubble;

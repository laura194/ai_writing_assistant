import { Brain, Upload, FileText } from "lucide-react";
import { motion } from "framer-motion";

interface BottomNavigationBarProps {
  activeView: string;
  onChangeView: (view: string) => void;
  menuOpen: boolean;
}

const BottomNavigationBar = ({
  activeView,
  onChangeView,
  menuOpen,
}: BottomNavigationBarProps) => {
  const buttons = [
    { icon: <Brain className="w-5 h-5" />, view: "ai", label: "AI Protocol" },
    {
      icon: <FileText className="w-5 h-5" />,
      view: "fullDocument",
      label: "Full Document View",
    },
    {
      icon: <Upload className="w-5 h-5" />,
      view: "share",
      label: "Share Document",
    },
  ];

  return (
    <div
      className={`
        w-full
        ${menuOpen ? "flex justify-around" : "flex flex-col items-center space-y-2"}
        py-3
        bg-[#1e1538]/80 backdrop-blur-md
        border border-[#361e7c]
        shadow-[0_0_60px_rgba(120,69,239,0.2)]
        rounded-full
        transition
        mb-1
      `}
    >
      {buttons.map((btn) => {
        const isActive = activeView === btn.view;
        return (
          <motion.div whileHover={{ scale: 1.125 }} key={btn.view}>
            <button
              onClick={() => onChangeView(btn.view)}
              className={`
              cursor-pointer
              relative 
              flex items-center justify-center 
              p-2 rounded-full
              transition
              ${
                isActive
                  ? `bg-gradient-to-tr from-purple-600 via-pink-500 to-yellow-400 
                   shadow-[0_0_15px_rgba(255,200,0,0.5)]
                   before:absolute before:inset-0 before:rounded-full before:border-2
                   before:border-gradient-to-tr before:from-purple-600 before:via-pink-400 before:to-yellow-300`
                  : "hover:bg-[#44326a]/60 hover:shadow-[0_0_15px_rgba(120,69,239,0.3)]"
              }
            `}
              title={btn.label}
            >
              {btn.icon}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BottomNavigationBar;

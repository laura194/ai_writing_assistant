import { Brain, Upload, FileText } from "lucide-react";
import { motion } from "framer-motion";
import React from "react";

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
    {
      icon: <Brain className="w-5 h-5" />,
      view: "ai",
      label: "AI Protocol",
    },
    {
      icon: <FileText className="w-5 h-5" />,
      view: "fullDocument",
      label: "Full Document View",
    },
    {
      icon: <Upload className="w-5 h-5" />,
      view: "contribution",
      label: "Contribution View",
    },
  ];

  return (
    <div
      className={`
        w-full
        ${menuOpen ? "flex justify-around" : "flex flex-col items-center space-y-2"}
        py-3
      bg-[#e9e5f8]/80 dark:bg-[#1e1538]/80 backdrop-blur-md
        border border-[#b9a8eb] dark:border-[#361e7c]
        shadow-[0_0_60px_rgba(120,69,239,0.5)] dark:shadow-[0_0_60px_rgba(120,69,239,0.2)]
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
                   shadow-[0_0_6px_rgba(124,58,237,0.7)] dark:shadow-[0_0_15px_rgba(255,200,0,0.5)]
                   before:absolute before:inset-0 before:rounded-full before:border-2
                   before:border-gradient-to-tr before:from-purple-600 before:via-pink-400 before:to-yellow-300`
                  : "hover:bg-[#b89bf7]/40 dark:hover:bg-[#44326a]/60 shadow-[0_0_10px_rgba(120,69,239,0.35)] dark:hover:shadow-[0_0_15px_rgba(120,69,239,0.3)]"
              }
            `}
              title={btn.label}
            >
              {React.cloneElement(btn.icon, {
                className: `${btn.icon.props.className} ${
                  isActive ? "text-white" : "text-[#362466] dark:text-white"
                }`,
              })}
            </button>
          </motion.div>
        );
      })}
    </div>
  );
};

export default BottomNavigationBar;

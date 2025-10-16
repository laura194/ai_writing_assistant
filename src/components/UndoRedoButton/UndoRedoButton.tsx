import React, { useRef, useState, useEffect } from "react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/solid";
import { motion, AnimatePresence } from "framer-motion";

export interface UndoRedoProps {
  onUndo?: () => void;
  onRedo?: () => void;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

const tooltipVariants = {
  enter: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.14 } },
  exit: { opacity: 0, y: -6, scale: 0.98, transition: { duration: 0.12 } },
};

/**
 * UndoRedo
 * - Extracted component for undo/redo buttons + tooltips
 * - Tooltips are only shown (via AnimatePresence) when the user hovers a button for >= 3000ms
 */
export const UndoRedoButton: React.FC<UndoRedoProps> = ({
  onUndo,
  onRedo,
  canUndo = false,
  canRedo = false,
  className = "",
}) => {
  const [hovered, setHovered] = useState<"undo" | "redo" | null>(null);
  const [showTooltip, setShowTooltip] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    };
  }, []);

  const startTimer = () => {
    if (timeoutRef.current) window.clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setShowTooltip(true);
    }, 1500);
  };

  const clearTimerAndHide = () => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setShowTooltip(false);
  };

  const handleMouseEnter = (which: "undo" | "redo") => {
    setHovered(which);
    startTimer();
  };

  const handleMouseLeave = () => {
    setHovered(null);
    clearTimerAndHide();
  };

  const handleUndoClick = () => {
    clearTimerAndHide();
    onUndo?.();
  };
  const handleRedoClick = () => {
    clearTimerAndHide();
    onRedo?.();
  };

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Undo */}
      <div
        className="relative"
        onMouseEnter={() => handleMouseEnter("undo")}
        onMouseLeave={handleMouseLeave}
      >
        <motion.button
          type="button"
          onClick={handleUndoClick}
          disabled={!canUndo}
          aria-label="Undo — Ctrl/Cmd + Z"
          aria-disabled={!canUndo}
          className={`p-2 rounded-md focus:outline-none ${
            canUndo ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          whileHover={canUndo ? { scale: 1.1 } : {}}
          whileTap={canUndo ? { scale: 0.85 } : {}}
          animate={{
            scale: canUndo ? 1 : 0.96,
            opacity: canUndo ? 1 : 0.55,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <ChevronLeftIcon
            className={`h-5.5 w-5.5 ${
              canUndo
                ? "text-[#473885] dark:text-[#c4b5fd]"
                : "text-[#8b88b7] dark:text-[#504a6a]"
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {showTooltip && hovered === "undo" && (
            <motion.div
              key={canUndo ? "undo-tooltip" : "undo-tooltip-disabled"}
              initial="exit"
              animate="enter"
              exit="exit"
              variants={tooltipVariants}
              className={
                canUndo
                  ? "absolute -left-5 top-[40px] z-40 w-max rounded-md px-3 py-2 bg-[#faf7ff] dark:bg-[#0f172a] text-[#222] dark:text-white text-xs shadow-lg"
                  : "absolute -left-10 top-[40px] z-40 w-max rounded-md px-3 py-2 bg-[#ffffff] dark:bg-[#221633] text-[#222] dark:text-[#ddd] text-xs border-2 border-[#6e5eb4] dark:border-[#bfb6ee]"
              }
              role="status"
            >
              <div className="font-medium text-center">UNDO</div>
              <div className="text-xs opacity-80">
                {canUndo ? "Ctrl / Cmd + Z" : "No action available"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Redo */}
      <div
        className="relative"
        onMouseEnter={() => handleMouseEnter("redo")}
        onMouseLeave={handleMouseLeave}
      >
        <motion.button
          type="button"
          onClick={handleRedoClick}
          disabled={!canRedo}
          aria-label="Redo — Ctrl/Cmd + Y"
          aria-disabled={!canRedo}
          className={`p-2 rounded-md focus:outline-none ${
            canRedo ? "cursor-pointer" : "cursor-not-allowed"
          }`}
          whileHover={canRedo ? { scale: 1.1 } : {}}
          whileTap={canRedo ? { scale: 0.85 } : {}}
          animate={{
            scale: canRedo ? 1 : 0.96,
            opacity: canRedo ? 1 : 0.55,
          }}
          transition={{ type: "spring", stiffness: 380, damping: 28 }}
        >
          <ChevronRightIcon
            className={`h-5.5 w-5.5 ${
              canRedo
                ? "text-[#473885] dark:text-[#c4b5fd]"
                : "text-[#8b88b7] dark:text-[#504a6a]"
            }`}
          />
        </motion.button>

        <AnimatePresence>
          {showTooltip && hovered === "redo" && (
            <motion.div
              key={canRedo ? "redo-tooltip" : "redo-tooltip-disabled"}
              initial="exit"
              animate="enter"
              exit="exit"
              variants={tooltipVariants}
              className={
                canRedo
                  ? "absolute -left-10 top-[40px] z-40 w-max rounded-md px-3 py-2 bg-[#faf7ff] dark:bg-[#0f172a] text-[#222] dark:text-white text-xs shadow-lg"
                  : "absolute -left-12 top-[40px] z-40 w-max rounded-md px-3 py-2 bg-[#ffffff] dark:bg-[#221633] text-[#222] dark:text-[#ddd] text-xs border-2 border-[#6e5eb4] dark:border-[#bfb6ee]"
              }
              role="status"
            >
              <div className="font-medium text-center">REDO</div>
              <div className="text-xs opacity-80">
                {canRedo ? "Ctrl / Cmd + Y" : "No action available"}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};

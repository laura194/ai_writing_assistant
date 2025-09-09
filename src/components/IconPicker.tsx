import React from "react";
import { motion } from "framer-motion";
import {
  DocumentTextIcon,
  ListBulletIcon,
  CodeBracketIcon,
  PhotoIcon,
} from "@heroicons/react/24/solid";

interface IconPickerProps {
  currentIcon?: string; // Aktuell ausgewähltes Icon (falls vorhanden)
  onSelect: (icon: string) => void; // Callback, wenn ein Icon ausgewählt wird
}

// Liste aller verfügbaren Icons
const availableIcons = [
  { name: "text", label: "Text Section", component: DocumentTextIcon },
  { name: "list", label: "List Section", component: ListBulletIcon },
  { name: "code", label: "Code Section", component: CodeBracketIcon },
  { name: "image", label: "Image Section", component: PhotoIcon },
];

const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelect }) => (
  <div className="flex gap-2 bg-[#e9e5f8] dark:bg-[#1e1538] p-2 rounded-xl shadow-[0_0_10px_rgba(120,69,239,0.35)] dark:shadow-[0_0_20px_rgba(120,69,239,0.15)] border border-[#c5b7f4] dark:border-[#2e2450]">
    {availableIcons.map((icon) => {
      const isActive = (currentIcon ?? "text") === icon.name;

      return (
        <motion.button
          key={icon.name}
          onClick={() => onSelect(icon.name)}
          title={`Category: ${icon.label}`}
          whileHover={{ scale: 1.075, transition: { duration: 0.2 } }}
          whileTap={{ scale: 0.95 }}
          className={`
            group relative flex items-center justify-center 
            p-2 rounded-xl cursor-pointer transition-colors duration-300
            overflow-hidden
            ${
              isActive
                ? "border-2 border-white shadow-[0_0_8px_rgba(203,164,255,0.9)] dark:shadow-[0_0_12px_rgba(203,164,255,0.5)]"
                : "border border-transparent"
            }
            ${
              !isActive
                ? "hover:bg-purple-300/35 dark:hover:bg-purple-700/25 hover:shadow-[0_0_12px_rgba(203,164,255,0.2)]"
                : ""
            }
          `}
        >
          {isActive && (
            <motion.div
              layoutId="activeIconBackground"
              className="absolute inset-0 rounded-l z-0"
              initial={false}
              animate={{
                background:
                  "linear-gradient(225deg, #7c3aed, #db2777, #facc15)",
              }}
              transition={{ duration: 0.3 }}
            />
          )}

          <icon.component
            className={`
              w-6 h-6 z-10 transition-colors duration-300
              ${
                isActive
                  ? "text-white"
                  : "text-[#8c6fcf] dark:text-[#a88bed] group-hover:text-[#3e1e87] dark:group-hover:text-[#f1eff7]"
              }
            `}
          />
        </motion.button>
      );
    })}
  </div>
);

export default IconPicker;

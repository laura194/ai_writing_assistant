import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { CircleX, CircleArrowLeft } from "lucide-react";
import { useTheme } from "../../providers/ThemeProvider";

interface UnsavedChangesDialogProps {
  isOpen: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function UnsavedChangesDialog({
  isOpen,
  onConfirm,
  onCancel,
}: UnsavedChangesDialogProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <Dialog
      open={isOpen}
      onClose={onCancel}
      className="fixed inset-0 z-50 flex items-center justify-center"
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/70 backdrop-blur-sm"
        aria-hidden="true"
      />

      <Dialog.Panel className="relative w-full max-w-[525px] mx-4 min-h-[32vh]">
        <motion.div
          initial={{ backgroundPosition: "0% 50%" }}
          animate={{ backgroundPosition: ["0% 50%", "100% 50%", "0% 50%"] }}
          transition={{ ease: "linear", duration: 4, repeat: Infinity }}
          className="absolute -inset-[3px] rounded-2xl"
          style={{
            backgroundImage:
              "linear-gradient(90deg, #7c3aed, #db2777, #facc15)",
            backgroundSize: "200% 200%",
          }}
        />

        <div
          className="relative bg-[#e9e5f8] dark:bg-[#1e1538] rounded-2xl px-6 py-3
                    shadow-[0_0_40px_rgba(120,69,239,0.6)] dark:shadow-[0_0_40px_rgba(120,69,239,0.4)] min-h-[32vh] flex flex-col items-center"
        >
          <Dialog.Title className="text-4xl font-bold text-center text-[#362466] dark:text-white mb-3 uppercase leading-relaxed tracking-wide mt-2">
            Unsaved Changes
          </Dialog.Title>
          <Dialog.Description className="text-center text-[#261e3b] dark:text-[#aaa6c3] mb-10 text-lg">
            You have unsaved changes. <br /> Are you sure you want to leave this
            page?
          </Dialog.Description>

          <div className="flex justify-center gap-20 items-center">
            <motion.div
              onClick={onConfirm}
              whileHover={{
                scale: 1.05,
                boxShadow: isDark
                  ? "0 0 25px rgba(255, 100, 100, 0.45)"
                  : "0 0 10px rgba(255, 100, 100, 0.55)",
              }}
              className="group cursor-pointer p-[2px] rounded-xl 
             dark:bg-red-600 bg-red-700
             w-[200px] mx-auto"
            >
              <div className="group flex items-center justify-center bg-[#e9e5f8] dark:bg-[#1e1538] bg-opacity-90 backdrop-blur-md p-4 rounded-xl shadow-inner shadow-red-600/20 dark:shadow-red-500/30 border border-[#ab3939] dark:border-[#471717]">
                <CircleArrowLeft className="w-7 h-7 stroke-[#d58b8b] dark:stroke-[#ffcccc] transition-colors duration-300 group-hover:stroke-[#c74747] dark:group-hover:stroke-[#fff0f0]" />
                <span className="ml-3 text-2xl text-[#d58b8b] dark:text-[#ffcccc] font-semibold transition-colors duration-300 group-hover:text-[#c74747] dark:group-hover:text-[#fff0f0] relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#c74747] dark:before:bg-[#ffcccc] group-hover:before:w-full before:transition-all before:duration-300">
                  Leave Page
                </span>
              </div>
            </motion.div>

            <motion.div
              onClick={onCancel}
              whileHover={{
                scale: 1.05,
                boxShadow: isDark
                  ? "0 0 20px rgba(120,69,239,0.4)"
                  : "0 0 10px rgba(120,69,239,0.6)",
              }}
              className="group cursor-pointer p-[2px] rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 w-[160px] mx-auto"
            >
              <div className="group flex items-center justify-center bg-[#e9e5f8] dark:bg-[#1e1538] bg-opacity-90 backdrop-blur-md p-4 rounded-xl shadow-inner shadow-cyan-800/30 dark:shadow-cyan-800/40 border border-[#beadee] dark:border-[#32265b]">
                <CircleX className="w-7 h-7 stroke-[#9c80db] dark:stroke-[#af8efb] transition-colors duration-300 group-hover:stroke-[#6848b2] dark:group-hover:stroke-[#e7dcff]" />
                <span className="ml-3 text-2xl text-[#9c80db] dark:text-[#af8efb] font-semibold transition-colors duration-300 group-hover:text-[#6848b2] dark:group-hover:text-[#e7dcff] relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#6848b2] dark:before:bg-[#af8efb] group-hover:before:w-full before:transition-all before:duration-300">
                  Cancel
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      </Dialog.Panel>
    </Dialog>
  );
}

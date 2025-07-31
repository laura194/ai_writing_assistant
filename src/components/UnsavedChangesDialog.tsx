import { Dialog } from "@headlessui/react";
import { motion } from "framer-motion";
import { CircleX, CircleArrowLeft } from "lucide-react";

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
          className="relative bg-[#1e1538] rounded-2xl px-6 py-3
                    shadow-[0_0_40px_rgba(120,69,239,0.4)] min-h-[32vh] flex flex-col items-center"
        >
          <Dialog.Title className="text-4xl font-bold text-center text-white mb-3 uppercase leading-relaxed tracking-wide mt-2">
            Unsaved Changes
          </Dialog.Title>
          <Dialog.Description className="text-center text-[#aaa6c3] mb-10 text-lg">
            You have unsaved changes. <br /> Are you sure you want to leave this
            page?
          </Dialog.Description>

          <div className="flex justify-center gap-20 items-center">
            <motion.div
              onClick={onConfirm}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 25px rgba(255, 100, 100, 0.45)",
              }}
              className="cursor-pointer p-[2px] rounded-xl 
             bg-red-600
             w-[200px] mx-auto"
            >
              <div className="group flex items-center justify-center bg-[#1e1538] bg-opacity-90 backdrop-blur-md p-4 rounded-xl shadow-inner shadow-red-500/30 border border-[#471717]">
                <CircleArrowLeft className="w-7 h-7 stroke-[#ffcccc]" />
                <span className="ml-3 text-2xl text-[#ffcccc] font-semibold transition-colors duration-300 group-hover:text-[#fff0f0] relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#ffcccc] group-hover:before:w-full before:transition-all before:duration-300">
                  Leave Page
                </span>
              </div>
            </motion.div>

            <motion.div
              onClick={onCancel}
              whileHover={{
                scale: 1.05,
                boxShadow: "0 0 20px rgba(120,69,239,0.4)",
              }}
              className="cursor-pointer p-[2px] rounded-xl bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-400 w-[160px] mx-auto"
            >
              <div className="group flex items-center justify-center bg-[#1e1538] bg-opacity-90 backdrop-blur-md p-4 rounded-xl shadow-inner shadow-cyan-800/40 border border-[#32265b]">
                <CircleX className="w-7 h-7 stroke-[#af8efb]" />
                <span className="ml-3 text-2xl text-[#af8efb] font-semibold transition-colors duration-300 group-hover:text-[#e7dcff] relative before:absolute before:-bottom-1 before:left-0 before:w-0 before:h-[2px] before:bg-[#af8efb] group-hover:before:w-full before:transition-all before:duration-300">
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

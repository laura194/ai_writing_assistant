import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { AIResult } from "../../models/IAITypes";
import MarkdownContent from "../MarkdownContent";
interface AIResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: AIResult;
  onReplaceContent: (newContent: string) => void;
}

const AIResponseDialog = ({
  isOpen,
  onClose,
  result,
  onReplaceContent,
}: AIResponseDialogProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4"
    >
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-200 border border-gray-300">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-2">AI Response</h2>
        <div className="max-h-64 overflow-auto border-t pt-2">
          <MarkdownContent content={result.text} />
        </div>

        <button
          onClick={() => {
            onReplaceContent(result.text);
            onClose();
          }}
          className="mt-4 bg-gray-500 text-white px-4 py-2 rounded w-full"
        >
          Replace Text in File
        </button>
      </div>
    </Dialog>
  );
};
export default AIResponseDialog;

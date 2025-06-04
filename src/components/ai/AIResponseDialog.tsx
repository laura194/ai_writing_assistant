import { Dialog } from "@headlessui/react";
import { X } from "lucide-react";
import { AIResult } from "../../models/IAITypes";
import MarkdownContent from "../MarkdownContent";

interface AIResponseDialogProps {
  isOpen: boolean;
  onClose: () => void;
  result: AIResult;
  onReplaceContent: (newContent: string) => void;
  onAppendContent: (additionalContent: string) => void;
}

const AIResponseDialog = ({
  isOpen,
  onClose,
  result,
  onReplaceContent,
  onAppendContent,
}: AIResponseDialogProps) => {
  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      className="fixed inset-0 flex items-center justify-center p-4"
    >
      <div className="relative bg-white p-4 rounded-lg shadow-lg w-[600px] border border-gray-300">
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700"
          aria-label="Close"
        >
          <X className="w-5 h-5" />
        </button>

        <h2 className="text-lg font-bold mb-2">AI Response</h2>

        {/* Original Text */}
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            Original Text
          </h3>
          <div className="max-h-32 overflow-auto border rounded p-2 bg-gray-50 text-sm text-gray-800">
            {result.originalText}
          </div>
        </div>

        {/* AI Response */}
        <div>
          <h3 className="text-sm font-semibold text-gray-600 mb-1">
            AI Suggestion
          </h3>
          <div className="max-h-48 overflow-auto border-t pt-2">
            <MarkdownContent content={result.text} />
          </div>
        </div>

        <div className="mt-4 flex justify-between gap-2">
          <button
            onClick={() => {
              onReplaceContent(result.text);
              onClose();
            }}
            className="bg-gray-500 text-white px-4 py-2 rounded w-1/2"
          >
            Replace Text in File
          </button>

          <button
            onClick={() => {
              onAppendContent(result.text);
              onClose();
            }}
            className="bg-gray-300 text-black px-4 py-2 rounded w-1/2"
          >
            Append Text to File
          </button>
        </div>
      </div>
    </Dialog>
  );
};

export default AIResponseDialog;

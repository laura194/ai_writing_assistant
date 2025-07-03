import { Dialog } from "@headlessui/react";

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
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="bg-white p-6 rounded shadow-lg z-50 w-[400px]">
        <Dialog.Title className="text-lg font-semibold mb-2">
          Unsaved Changes
        </Dialog.Title>
        <Dialog.Description className="text-sm mb-4">
          You have unsaved changes. Are you sure you want to leave this page?
        </Dialog.Description>
        <div className="flex justify-end gap-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Leave Page
          </button>
        </div>
      </div>
    </Dialog>
  );
}

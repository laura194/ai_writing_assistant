import React from "react";
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
  { name: "text", label: "Text", component: DocumentTextIcon },
  { name: "list", label: "List", component: ListBulletIcon },
  { name: "code", label: "Code", component: CodeBracketIcon },
  { name: "image", label: "Image", component: PhotoIcon },
];

const IconPicker: React.FC<IconPickerProps> = ({ currentIcon, onSelect }) => (
  <div className="flex gap-2 bg-gray-100 p-2 rounded shadow-md">
    {availableIcons.map((icon) => (
      <button
        key={icon.name}
        className={`p-2 rounded ${
          currentIcon === icon.name ? "bg-blue-500 text-white" : "bg-gray-200"
        }`}
        onClick={() => onSelect(icon.name)} // Icon auswählen
        title={`Kategorie: ${icon.label}`}
      >
        <icon.component className="w-6 h-6" />
      </button>
    ))}
  </div>
);

export default IconPicker;

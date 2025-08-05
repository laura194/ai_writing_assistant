import React from "react";
import {
  DocumentTextIcon,
  ListBulletIcon,
  CodeBracketIcon,
  PhotoIcon,
} from "@heroicons/react/24/solid";
import { Node } from "./types";

/**
 * Returns the appropriate icon based on the file category.
 * @function
 * @param {Node} node - The node representing the file.
 * @param {string} size - The size class to apply to the icon.
 * @returns {React.ReactElement} - The icon corresponding to the file's category with the appropriate size.
 */
export function getIcon(
  node: Node,
  size: string = "size-8",
  customIcon?: string, // Neuer Parameter für benutzerdefiniertes Icon
): React.ReactElement {
  const common = { className: `${size} fill-current` };

  if (customIcon) {
    switch (customIcon) {
      case "text":
        return React.createElement(DocumentTextIcon, common);
      case "list":
        return React.createElement(ListBulletIcon, common);
      case "code":
        return React.createElement(CodeBracketIcon, common);
      case "image":
        return React.createElement(PhotoIcon, common);
      default:
        return React.createElement(DocumentTextIcon, common);
    }
  }

  // Fallback auf die Kategorie falls kein benutzerdefiniertes Icon vorhanden ist
  switch (node.category) {
    case "text":
      return React.createElement(DocumentTextIcon, common);
    case "list":
      return React.createElement(ListBulletIcon, common);
    case "code":
      return React.createElement(CodeBracketIcon, common);
    case "image":
      return React.createElement(PhotoIcon, common);
    default:
      return React.createElement(DocumentTextIcon, common);
  }
}

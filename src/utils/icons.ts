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
  export function getIcon(node: Node, size: string = "size-8"): React.ReactElement {
    switch (node.category) {
      case "text":
        return React.createElement(DocumentTextIcon, {
          className: `${size} text-gray-500`,
        });
      case "list":
        return React.createElement(ListBulletIcon, {
          className: `${size} text-gray-500`,
        });
      case "code":
        return React.createElement(CodeBracketIcon, {
          className: `${size} text-gray-500`,
        });
      case "image":
        return React.createElement(PhotoIcon, {
          className: `${size} text-gray-500`,
        });
      default:
        return React.createElement(DocumentTextIcon, {
          className: `${size} text-gray-500`,
        });
    }
  }
  
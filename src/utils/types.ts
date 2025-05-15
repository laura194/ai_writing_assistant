/**
 * Represents a file or folder node with optional content and nested nodes.
 * This is used to describe the structure of files and folders in a tree-like format.
 *
 * @interface Node
 * @property {string} id - A unique identifier for the node.
 * @property {string} name - The name of the node (e.g., file or folder name).
 * @property {string} [category] - An optional category for the node. It can be one of "text", "list", "code", or "image".
 * @property {string} [content] - An optional field that contains the content of the node, such as text or code.
 * @property {Node[]} [children] - An optional array of nested nodes, which allows for hierarchical structures (e.g., folders containing files).
 */
export interface Node {
  id: string;
  name: string;
  category?: "text" | "list" | "code" | "image"; // Optional field for categorizing the node type.
  content?: string; // Optional content for the node (e.g., file content).
  children?: Node[]; // Optional field for nested nodes (subfolders or files).
}
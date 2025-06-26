/**
 * Represents a file or folder node with optional content and nested nodes.
 * This is used to describe the structure of files and folders in a tree-like format.
 *
 * @interface Node
 * @property {string} id - A unique identifier for the node.
 * @property {string} name - The name of the node (e.g., file or folder name).
 * @property {string} [category] - An optional category for the node. It can be one of "text", "list", "code", or "image".
 * @property {string} [content] - An optional field that contains the content of the node, such as text or code.
 * @property {Node[]} [nodes] - An optional array of nested nodes, which allows for hierarchical structures (e.g., folders containing files).
 */
export interface Node {
  id: string;
  name: string;
  category?: string; // Optional field for categorizing the node type.
  content?: string; // Optional content for the node (e.g., file content).
  nodes?: Node[]; // Optional field for nested nodes (subfolders or files).
  nodeId?: string; // Unique identifier for the node, used for backend operations.
  icon?: string; // Neues Feld: Benutzerdefiniertes Icon
}

/**
 * Represents the project structure, which contains an ID, a username, and a hierarchical structure.
 * This can be used to describe a project in a tree-like format, with folders and files representing different parts of the project.
 *
 * @interface ProjectStructure
 * @property {string} id - The unique identifier for the project structure.
 * @property {string} username - The username of the user to whom the project structure belongs.
 * @property {Node[]} structure - An array of nodes representing the hierarchical structure of the project.
 */
export interface ProjectStructure {
  id: string;
  username: string;
  structure: Node[]; // Hierarchical structure of the project, composed of nodes.
}


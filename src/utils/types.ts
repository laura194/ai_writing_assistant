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
  projectId?: string; // Optional field to associate the node with a specific project.
}

export interface Project {
  _id?: string;
  name: string;
  username: string;
  projectStructure: Node[] | object; // optional: Mixed wie im Schema
  isPublic: boolean;                // neu: public/private toggle
  tags?: string[];                  // neu: Tags
  titleCommunityPage?: string;      // neu: Community Page Title
  category?: string;                // neu: Kategorie
  typeOfDocument?: string;          // neu: Dokumenttyp
  createdAt?: string;
  updatedAt?: string;
  authorName?: string;             // Optional: Name des Autors
}

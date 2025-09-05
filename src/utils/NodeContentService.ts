import axios from "axios";
import { Node } from "./types";

const API_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL || "http://localhost:5001") +
  "/api/nodeContent";

export class NodeContentService {
  /**
   * Creates a new node content by sending a POST request to the backend.
   * @param data The data for the new node content.
   * @returns The created node content.
   */
  static async createNodeContent(data: Omit<Node, "id">): Promise<Node> {
    try {
      const response = await axios.post<Node>(API_BASE_URL, {
        ...data,
        content: data.content || "...",
        category: data.category || "file",
      });
      return response.data;
    } catch (error) {
      console.error(
        "❌ [createNodeContent] Error creating node content:",
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves all node contents or filtered by nodeId and projectId.
   * @param nodeId Optional nodeId filter.
   * @param projectId Optional projectId filter.
   * @returns A list of node contents.
   */
  static async getNodeContents(
    nodeId?: string,
    projectId?: string,
  ): Promise<Node[]> {
    try {
      const params: Record<string, string> = {};
      if (nodeId) params.nodeId = nodeId;
      if (projectId) params.projectId = projectId;

      const response = await axios.get<Node[]>(API_BASE_URL, { params });
      return response.data;
    } catch (error) {
      console.error(
        "❌ [getNodeContents] Error fetching node contents:",
        error,
      );
      throw error;
    }
  }

  /**
   * Retrieves a specific node content by nodeId and projectId.
   * @param nodeId The nodeId.
   * @param projectId The projectId.
   * @returns The matched node content.
   */
  static async getNodeContentById(
    nodeId: string,
    projectId: string,
  ): Promise<Node> {
    try {
      const response = await axios.get<Node>(
        `${API_BASE_URL}/${nodeId}?projectId=${projectId}`,
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ [getNodeContentById] Error fetching node content for nodeId ${nodeId} and projectId ${projectId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Gets or creates a node content entry by nodeId and projectId.
   * @param node The node data (must include projectId).
   */
  static async getOrCreateNodeContent(node: {
    id: string;
    name: string;
    category?: string;
    projectId: string;
  }): Promise<Node> {
    try {
      const existing = await this.getNodeContents(node.id, node.projectId);
      if (existing.length > 0) return existing[0];

      const created = await this.createNodeContent({
        nodeId: node.id,
        name: node.name,
        category: node.category || "file",
        content: "",
        projectId: node.projectId,
      });

      return created;
    } catch (error) {
      console.error(
        "❌ [getOrCreateNodeContent] Error during get/create:",
        error,
      );
      throw error;
    }
  }

  /**
   * Updates a node content by nodeId and projectId.
   * @param nodeId The node ID to update.
   * @param data The node data including projectId.
   * @returns The updated node content.
   */
  static async updateNodeContent(
    nodeId: string,
    data: Partial<Node> & { projectId: string },
  ): Promise<Node> {
    try {
      const response = await axios.put<Node>(`${API_BASE_URL}/${nodeId}`, {
        ...data,
        content: data.content || "...",
        category: data.category || "file",
      });
      return response.data;
    } catch (error) {
      console.error(
        `❌ [updateNodeContent] Error updating node content with nodeId ${nodeId} and projectId ${data.projectId}:`,
        error,
      );
      throw error;
    }
  }
}

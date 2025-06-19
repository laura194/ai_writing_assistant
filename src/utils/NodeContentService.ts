import axios from 'axios';
import { Node } from './types';

const API_BASE_URL = '/api/nodeContent';



export class NodeContentService {
  /**
   * Creates a new node content by sending a POST request to the backend.
   * @param data The data for the new node content.
   * @returns The created node content.
   */
  static async createNodeContent(data: Omit<Node, 'id'>): Promise<Node> {
    try {
      if (!data.content) {
        data.content = "Default content";
      }
      const response = await axios.post<Node>(API_BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error('❌ [createNodeContent] Error creating node content:', error);
      throw error;
    }
  }

  /**
   * Retrieves all node contents by sending a GET request to the backend.
   * @returns A list of all node contents.
   */
  static async getNodeContents(): Promise<Node[]> {
    try {
      const response = await axios.get<Node[]>(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error('❌ [getNodeContents] Error fetching node contents:', error);
      throw error;
    }
  }

  /**
   * Retrieves a specific node content by nodeId.
   * @param nodeId The nodeId to retrieve.
   * @returns The node content with the specified nodeId.
   */
  static async getNodeContentById(nodeId: string): Promise<Node> {
    try {
      const response = await axios.get<Node>(`${API_BASE_URL}/${nodeId}`);
      return response.data;
    } catch (error) {
      console.error(`❌ [getNodeContentById] Error fetching node content with nodeId ${nodeId}:`, error);
      throw error;
    }
  }

  /**
   * Gets or creates a node content entry by node data (nodeId, name, category).
   * @param node The node to check or create.
   */
  static async getOrCreateNodeContent(node: { id: string; name: string; category?: string }): Promise<Node> {
    try {
      const response = await axios.get<Node[]>(`${API_BASE_URL}?nodeId=${node.id}`);
      if (response.data.length > 0) {
        return response.data[0];
      }

      const created = await this.createNodeContent({
        nodeId: node.id,
        name: node.name,
        category: node.category || "Uncategorized",
        content: "",
      });

      return created;
    } catch (error) {
      console.error('❌ [getOrCreateNodeContent] Error during get/create:', error);
      throw error;
    }
  }

  /**
   * Updates a node content entry by ID by sending a PUT request to the backend.
   * @param id The ID of the node content to update.
   * @param data The new data for the node content.
   * @returns The updated node content.
   */
  static async updateNodeContent(id: string, data: Partial<Node>): Promise<Node> {
    try {
      if (!data.content) {
        data.content = "Default content";
      }

      const response = await axios.put<Node>(`${API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ [updateNodeContent] Error updating node content with ID ${id}:`, error);
      throw error;
    }
  }
}

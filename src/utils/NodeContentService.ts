import axios from 'axios';

const API_BASE_URL = '/api/nodeContent';

export class NodeContentService {
    /**
     * Creates a new node content by sending a POST request to the backend.
     * @param data The data for the new node content.
     * @returns The created node content.
     */
    static async createNodeContent(data: any): Promise<any> {
        console.log('Attempting to create node content with data:', data);  // Log input data
        try {
          if (!data.content) {
            data.content = "Default content"; // Ensure content is not empty
          }
          const response = await axios.post(API_BASE_URL, data);
          console.log('Node content created successfully:', response.data);  // Log success response
          return response.data;
        } catch (error) {
          console.error('Error creating node content:', error);  // Log error if it occurs
          throw error;
        }
      }

    /**
     * Retrieves all node contents by sending a GET request to the backend.
     * @returns A list of all node contents.
     */
    static async getNodeContents(): Promise<any[]> {
        try {
            const response = await axios.get(API_BASE_URL);
            console.log('Node contents fetched successfully:', response.data);  // Log success response
            return response.data;
        } catch (error) {
            console.error('Error fetching node contents:', error);  // Log error if it occurs
            throw error;
        }
    }

    /**
     * Retrieves a specific node content by ID by sending a GET request to the backend.
     * @param id The ID of the node content to retrieve.
     * @returns The node content with the specified ID.
     */
    static async getNodeContentById(id: string): Promise<any> {
        try {
            const response = await axios.get(`${API_BASE_URL}/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error fetching node content with ID ${id}:`, error);  // Log error if it occurs
            throw error;
        }
    }

    /**
     * Gets or creates a node content entry by node data (nodeId, name, category).
     * @param node The node to check or create.
     */
    static async getOrCreateNodeContent(node: any): Promise<any> {
        try {
            // Retrieve the node contents by nodeId
            const response = await axios.get(`${API_BASE_URL}?nodeId=${node.id}`);

            if (response.data.length > 0) {
                return response.data[0]; // If node content exists, return the first one
            }

            // If no existing node content is found, create a new one
            const created = await this.createNodeContent({
                nodeId: node.id,
                name: node.name,
                category: node.category || "Uncategorized",
                content: "", // Default empty content
            });

            return created;
        } catch (error) {
            console.error('Error in getOrCreateNodeContent:', error);  // Log error if it occurs
            throw error;
        }
    }

    /**
     * Updates a node content entry by ID by sending a PUT request to the backend.
     * @param id The ID of the node content to update.
     * @param data The new data for the node content.
     * @returns The updated node content.
     */
    static async updateNodeContent(id: string, data: any): Promise<any> {
        try {
            if (!data.content) {
                data.content = "Default content";  // Ensure content is not empty
            }
            const response = await axios.put(`${API_BASE_URL}/${id}`, data);
            return response.data;
        } catch (error) {
            console.error(`Error updating node content with ID ${id}:`, error);  // Log error if it occurs
            throw error;
        }
    }
}

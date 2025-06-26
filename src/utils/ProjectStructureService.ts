import axios from "axios";
import { ProjectStructure } from "./types";

const API_BASE_URL = "/api/projectStructures";

export class ProjectStructureService {
  /**
   * Creates a new project structure by sending a POST request to the backend.
   * @param data The data for the new project structure.
   * @returns The created project structure.
   */
  static async createProjectStructure(
    data: ProjectStructure // Verwende hier den vollständigen Typ ProjectStructure
  ): Promise<ProjectStructure> {
    try {
      const response = await axios.post<ProjectStructure>(API_BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [createProjectStructure] Error creating project structure:",
        error
      );
      throw error;
    }
  }

  /**
   * Retrieves all project structures by sending a GET request to the backend.
   * @returns A list of all project structures.
   */
  static async getProjectStructures(): Promise<ProjectStructure[]> {
    try {
      const response = await axios.get<ProjectStructure[]>(API_BASE_URL);
      return response.data;
    } catch (error) {
      console.error(
        "❌ [getProjectStructures] Error fetching project structures:",
        error
      );
      throw error;
    }
  }

  /**
   * Retrieves a specific project structure by its id.
   * @param id The id of the project structure to retrieve.
   * @returns The project structure with the specified id.
   */
  static async getProjectStructureById(id: string): Promise<ProjectStructure> {
    try {
      const response = await axios.get<ProjectStructure>(
        `${API_BASE_URL}/${id}`
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ [getProjectStructureById] Error fetching project structure with id ${id}:`,
        error
      );
      throw error;
    }
  }

  /**
   * Gets or creates a project structure entry by id and username.
   * @param project The project structure to check or create.
   */
  static async getOrCreateProjectStructure(
    project: { id: string; username: string }
  ): Promise<ProjectStructure> {
    try {
      const response = await axios.get<ProjectStructure[]>(
        `${API_BASE_URL}?id=${project.id}`
      );
      if (response.data.length > 0) {
        return response.data[0];
      }

      const created = await this.createProjectStructure({
        id: project.id, // `id` ist jetzt erlaubt
        username: project.username,
        structure: [], // Leeres Array
      });

      return created;
    } catch (error) {
      console.error(
        "❌ [getOrCreateProjectStructure] Error during get/create:",
        error
      );
      throw error;
    }
  }

  /**
   * Updates a project structure entry by id by sending a PUT request to the backend.
   * @param id The id of the project structure to update.
   * @param data The new data for the project structure.
   * @returns The updated project structure.
   */
  static async updateProjectStructure(
    id: string,
    data: Partial<ProjectStructure>
  ): Promise<ProjectStructure> {
    try {
      const response = await axios.put<ProjectStructure>(
        `${API_BASE_URL}/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      console.error(
        `❌ [updateProjectStructure] Error updating project structure with id ${id}:`,
        error
      );
      throw error;
    }
  }
}

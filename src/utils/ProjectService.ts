import axios from "axios";
import { Project } from "./types"; // Importiere die angepasste Project-Schnittstelle

const API_BASE_URL = "/api/projects";

export class ProjectService {
  static async createProject(data: Omit<Project, "_id">): Promise<Project> {
    try {
      const response = await axios.post<Project>(API_BASE_URL, data);
      return response.data;
    } catch (error) {
      console.error("❌ Error creating project:", error);
      throw error;
    }
  }

  static async getProjectById(id: string): Promise<Project> {
    try {
      const response = await axios.get<Project[]>(`${API_BASE_URL}/${id}`);  // Antwort als Array
      const project = response.data[0]; // Hol das erste Projekt aus dem Array
      return project;
    } catch (error) {
      console.error(`❌ [getProjectById] Error fetching project with ID ${id}:`, error);
      throw error;
    }
  }

  static async updateProject(id: string, data: Partial<Project>): Promise<Project> {
    try {
      const response = await axios.put<Project>(`${API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(`❌ [updateProject] Error updating project with ID ${id}:`, error);
      throw error;
    }
  }
}

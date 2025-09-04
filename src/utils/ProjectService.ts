import axios from "axios";
import { Project } from "./types";

let base = import.meta.env.VITE_API_BASE_URL || "http://localhost:5001";
if (!base.endsWith("/api/projects")) {
  base = base.replace(/\/+$/, "") + "/api/projects";
}
const API_BASE_URL = base;

console.log("API_BASE_URL:", API_BASE_URL);
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
      const response = await axios.get<Project>(`${API_BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      console.error(
        `❌ [getProjectById] Error fetching project with ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  static async updateProject(
    id: string,
    data: Partial<Project>,
  ): Promise<Project> {
    try {
      const response = await axios.put<Project>(`${API_BASE_URL}/${id}`, data);
      return response.data;
    } catch (error) {
      console.error(
        `❌ [updateProject] Error updating project with ID ${id}:`,
        error,
      );
      throw error;
    }
  }

  static async getProjectsByUsername(username: string): Promise<Project[]> {
    try {
      const response = await axios.get<Project[]>(
        `${API_BASE_URL}/by-username`,
        { params: { username } },
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        // Kein Projekt gefunden, aber kein echter Fehler – gib leeres Array zurück
        return [];
      }

      console.error(
        `❌ [getProjectsByUsername] Error fetching projects for username ${username}:`,
        error,
      );
      throw error;
    }
  }

  static async getRecentProjectsByUsername(
    username: string,
  ): Promise<Project[]> {
    try {
      const response = await axios.get<Project[]>(
        `${API_BASE_URL}/by-username/recent`,
        { params: { username } },
      );
      return response.data;
    } catch (error: unknown) {
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return [];
      }
      console.error(
        `❌ [getRecentProjectsByUsername] Error fetching recent projects for ${username}:`,
        error,
      );
      throw error;
    }
  }

  static async deleteProject(id: string): Promise<void> {
    try {
      await axios.delete(`${API_BASE_URL}/${id}`);
    } catch (error) {
      console.error(
        `❌ [deleteProject] Error deleting project with ID ${id}:`,
        error,
      );
      throw error;
    }
  }
}

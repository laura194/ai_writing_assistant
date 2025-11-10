// ProjectService.test.ts
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mocked } from "vitest";
import axios, { AxiosResponse } from "axios";
import { ProjectService } from "./ProjectService";
import type { Project } from "./types";

vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;

function makeAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  } as unknown as AxiosResponse<T>;
}

const BASE_URL = "http://localhost:5001";

describe("ProjectService", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    (mockedAxios as any).isAxiosError = (err: any) =>
      !!(err && err.isAxiosError);
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  describe("createProject", () => {
    it("creates a project successfully", async () => {
      const input: Omit<Project, "_id"> = {
        name: "Test Project",
        username: "alice",
        projectStructure: [],
        isPublic: false,
      };

      const created: Project = {
        _id: "1",
        ...input,
      };

      mockedAxios.post.mockResolvedValueOnce(makeAxiosResponse(created));

      const result = await ProjectService.createProject(input);
      expect(result).toEqual(created);
      expect(mockedAxios.post).toHaveBeenCalledWith(
        `${BASE_URL}/api/projects`,
        input,
      );
    });

    it("logs and rethrows on error", async () => {
      const err = new Error("fail");
      mockedAxios.post.mockRejectedValueOnce(err);

      await expect(
        ProjectService.createProject({
          name: "X",
          username: "y",
          projectStructure: [],
          isPublic: false,
        }),
      ).rejects.toThrow(err);

      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("getProjectById", () => {
    it("fetches a project by id", async () => {
      const project: Project = {
        _id: "42",
        name: "Proj",
        username: "bob",
        projectStructure: [],
        isPublic: false,
      };
      mockedAxios.get.mockResolvedValueOnce(makeAxiosResponse(project));

      const result = await ProjectService.getProjectById("42");
      expect(result).toEqual(project);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/api/projects/42`,
      );
    });

    it("logs and rethrows on error", async () => {
      const err = new Error("not found");
      mockedAxios.get.mockRejectedValueOnce(err);

      await expect(ProjectService.getProjectById("42")).rejects.toThrow(err);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("updateProject", () => {
    it("updates a project successfully", async () => {
      const update: Partial<Project> = { name: "Updated" };
      const updated: Project = {
        _id: "7",
        name: "Updated",
        username: "bob",
        projectStructure: [],
        isPublic: false,
      };

      mockedAxios.put.mockResolvedValueOnce(makeAxiosResponse(updated));

      const result = await ProjectService.updateProject("7", update);
      expect(result).toEqual(updated);
      expect(mockedAxios.put).toHaveBeenCalledWith(
        `${BASE_URL}/api/projects/7`,
        update,
      );
    });

    it("logs and rethrows on error", async () => {
      const err = new Error("update fail");
      mockedAxios.put.mockRejectedValueOnce(err);

      await expect(
        ProjectService.updateProject("7", { name: "X" }),
      ).rejects.toThrow(err);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("getProjectsByUsername", () => {
    it("fetches projects by username", async () => {
      const projects: Project[] = [
        {
          _id: "1",
          name: "P1",
          username: "bob",
          projectStructure: [],
          isPublic: false,
        },
        {
          _id: "2",
          name: "P2",
          username: "bob",
          projectStructure: [],
          isPublic: false,
        },
      ];
      mockedAxios.get.mockResolvedValueOnce(makeAxiosResponse(projects));

      const result = await ProjectService.getProjectsByUsername("bob");
      expect(result).toEqual(projects);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/api/projects/by-username`,
        {
          params: { username: "bob" },
        },
      );
    });

    it("returns [] if 404 error is returned", async () => {
      const err = {
        isAxiosError: true,
        response: { status: 404 },
      } as any;
      mockedAxios.get.mockRejectedValueOnce(err);

      const result = await ProjectService.getProjectsByUsername("bob");
      expect(result).toEqual([]);
    });

    it("logs and rethrows on other errors", async () => {
      const err = {
        isAxiosError: true,
        response: { status: 500 },
      } as any;
      mockedAxios.get.mockRejectedValueOnce(err);

      await expect(ProjectService.getProjectsByUsername("bob")).rejects.toEqual(
        err,
      );
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("getRecentProjectsByUsername", () => {
    it("fetches recent projects", async () => {
      const projects: Project[] = [
        {
          _id: "3",
          name: "Recent",
          username: "bob",
          projectStructure: [],
          isPublic: false,
        },
      ];
      mockedAxios.get.mockResolvedValueOnce(makeAxiosResponse(projects));

      const result = await ProjectService.getRecentProjectsByUsername("bob");
      expect(result).toEqual(projects);
      expect(mockedAxios.get).toHaveBeenCalledWith(
        `${BASE_URL}/api/projects/by-username/recent`,
        {
          params: { username: "bob" },
        },
      );
    });

    it("returns [] if 404 error is returned", async () => {
      const err = { isAxiosError: true, response: { status: 404 } } as any;
      mockedAxios.get.mockRejectedValueOnce(err);

      const result = await ProjectService.getRecentProjectsByUsername("bob");
      expect(result).toEqual([]);
    });

    it("logs and rethrows on other errors", async () => {
      const err = { isAxiosError: true, response: { status: 500 } } as any;
      mockedAxios.get.mockRejectedValueOnce(err);

      await expect(
        ProjectService.getRecentProjectsByUsername("bob"),
      ).rejects.toEqual(err);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });

  describe("deleteProject", () => {
    it("deletes a project successfully", async () => {
      mockedAxios.delete.mockResolvedValueOnce(makeAxiosResponse({}));

      await ProjectService.deleteProject("123");
      expect(mockedAxios.delete).toHaveBeenCalledWith(
        `${BASE_URL}/api/projects/123`,
      );
    });

    it("logs and rethrows on error", async () => {
      const err = new Error("delete fail");
      mockedAxios.delete.mockRejectedValueOnce(err);

      await expect(ProjectService.deleteProject("123")).rejects.toThrow(err);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});

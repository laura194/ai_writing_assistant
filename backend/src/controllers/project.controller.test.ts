import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
// import { vi } from "vitest";
import request from "supertest";
import express from "express";
import bodyParser from "body-parser";

import projectRoutes from "../routes/project.routes";
import Project from "../models/Project";
import NodeContent from "../models/NodeContent";
import AiProtocol from "../models/AIProtocol";

// Express App für die Tests
const app = express();
app.use(bodyParser.json());
app.use("/api/projects", projectRoutes);

// Mock Mongoose-Methoden
vi.mock("../models/Project");
vi.mock("../models/NodeContent");
vi.mock("../models/AIProtocol");

beforeEach(() => {
  vi.clearAllMocks();
});

describe("project.controller", () => {
  it("POST /api/projects erstellt ein neues Projekt und gibt entschlüsselte Daten zurück", async () => {
    const mockProject = {
      _id: "1",
      name: "Project1",
      username: "user1",
      projectStructure: [],
      isPublic: false,
      tags: [],
      titleCommunityPage: "",
      category: "",
      typeOfDocument: "",
      authorName: "",
    };

    // Mock the constructor and save
    const mockSave = vi.fn().mockResolvedValue(mockProject);
    vi.mocked(Project).mockImplementation(
      () =>
        ({
          save: mockSave,
          ...mockProject,
        }) as any,
    );

    // Mock the re-query for decrypted data
    (Project.findById as unknown as Mock).mockResolvedValue(mockProject);

    const res = await request(app).post("/api/projects").send({
      name: "Project1",
      username: "user1",
      projectStructure: [],
    });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockProject);
  });

  it("GET /api/projects/:id gibt ein Projekt zurück", async () => {
    const mockProject = { _id: "1", name: "Project1", username: "user1" };
    (Project.findById as unknown as Mock).mockResolvedValue(mockProject);

    const res = await request(app).get("/api/projects/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockProject);
  });

  it("GET /api/projects gibt alle Projekte zurück", async () => {
    const mockProjects = [
      { _id: "1", name: "Project1", username: "user1" },
      { _id: "2", name: "Project2", username: "user2" },
    ];
    (Project.find as unknown as Mock).mockResolvedValue(mockProjects);

    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockProjects);
  });

  it("PUT /api/projects/:id aktualisiert via Find-then-Save Pattern", async () => {
    const existingProject = {
      _id: "1",
      name: "OldName",
      username: "user1",
      projectStructure: [],
      isPublic: false,
      tags: [],
      titleCommunityPage: "",
      category: "",
      typeOfDocument: "",
      authorName: "",
      save: vi.fn().mockResolvedValue(true),
    };

    const updatedProject = {
      _id: "1",
      name: "NewName",
      username: "user1",
      projectStructure: [],
      isPublic: false,
      tags: [],
      titleCommunityPage: "",
      category: "",
      typeOfDocument: "",
      authorName: "",
    };

    (Project.findById as unknown as Mock)
      .mockResolvedValueOnce(existingProject) // First call: find to update
      .mockResolvedValueOnce(updatedProject); // Second call: query back decrypted

    const res = await request(app)
      .put("/api/projects/1")
      .send({ name: "NewName" });

    expect(res.status).toBe(200);
    expect(existingProject.save).toHaveBeenCalled();
    expect(res.body.name).toBe("NewName");
  });

  it("GET /api/projects/by-username gibt Projekte für einen Benutzer zurück", async () => {
    const mockProjects = [
      { _id: "1", name: "Project1", username: "user1" },
      { _id: "2", name: "Project2", username: "user1" },
    ];

    (Project.find as unknown as Mock).mockReturnValue({
      sort: vi.fn().mockResolvedValue(mockProjects),
    });

    const res = await request(app)
      .get("/api/projects/by-username")
      .query({ username: "user1" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockProjects);
  });

  it("GET /api/projects/by-username ohne Projekte gibt 404", async () => {
    (Project.find as unknown as Mock).mockReturnValue({
      sort: vi.fn().mockResolvedValue([]),
    });

    const res = await request(app)
      .get("/api/projects/by-username")
      .query({ username: "user1" });

    expect(res.status).toBe(404);
  });

  it("GET /api/projects/by-username/recent gibt die letzten 3 Projekte zurück", async () => {
    const mockProjects = [
      { _id: "1", name: "Project1", username: "user1" },
      { _id: "2", name: "Project2", username: "user1" },
      { _id: "3", name: "Project3", username: "user1" },
    ];

    (Project.find as unknown as Mock).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockResolvedValue(mockProjects),
      }),
    });

    const res = await request(app)
      .get("/api/projects/by-username/recent")
      .query({ username: "user1" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(mockProjects);
  });

  it("DELETE /api/projects/:id löscht Projekt und zugehörige Daten", async () => {
    const deletedProject = {
      _id: "1",
      name: "Project1",
      username: "user1", // Added username to match controller response
    };

    // Mock findById to return project (called first in controller)
    (Project.findById as unknown as Mock).mockResolvedValue(deletedProject);
    // Mock deleteOne for actual deletion
    (Project.deleteOne as unknown as Mock).mockResolvedValue({
      deletedCount: 1,
    });

    (NodeContent.deleteMany as unknown as Mock).mockResolvedValue({
      deletedCount: 2,
    });
    (AiProtocol.deleteMany as unknown as Mock).mockResolvedValue({
      deletedCount: 2,
    });

    const res = await request(app).delete("/api/projects/1");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({
      message: "Project and related data successfully deleted",
      deletedProject,
      deletedNodeContents: 2,
      deletedAiProtocols: 2,
    });
  }, 10000); // erhöhtes Timeout
});

describe("project.controller Fehlerfälle", () => {
  // --- CREATE ---
  it("POST /api/projects ohne alle Felder gibt 400 zurück", async () => {
    const res = await request(app).post("/api/projects").send({
      name: "Project1",
      username: "user1",
      // projectStructure fehlt
    });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty(
      "error",
      "Alle Pflichtfelder (name, username, projectStructure) sind erforderlich",
    );
  });

  it("POST /api/projects save() Fehler gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");

    // Mock the Project constructor
    const mockSave = vi.fn().mockRejectedValue(error);
    vi.mocked(Project).mockImplementation(
      () =>
        ({
          save: mockSave,
        }) as any,
    );

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).post("/api/projects").send({
      name: "Project1",
      username: "user1",
      projectStructure: [],
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Interner Serverfehler");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Fehler beim Erstellen des Projekts:",
      error,
    );

    consoleErrorMock.mockRestore();
  });

  // --- GET BY ID ---
  it("GET /api/projects/:id ungültige ID gibt 404 zurück", async () => {
    (Project.findById as unknown as Mock).mockResolvedValue(null);

    const res = await request(app).get("/api/projects/invalid-id");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Project not found");
  });

  it("GET /api/projects/:id Fehler gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");
    (Project.findById as unknown as Mock).mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).get("/api/projects/1");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching project by ID:",
      error,
    );

    consoleErrorMock.mockRestore();
  });

  // --- UPDATE ---
  it("PUT /api/projects/:id ohne alle Felder gibt 200 zurück (angepasst an Controller)", async () => {
    const existingProject = {
      _id: "1",
      name: "OldName",
      username: "user1",
      projectStructure: [],
      isPublic: false,
      tags: [],
      titleCommunityPage: "",
      category: "",
      typeOfDocument: "",
      authorName: "",
      save: vi.fn().mockResolvedValue(true),
    };

    const updatedProject = {
      _id: "1",
      name: "UpdatedProject",
      username: "user1",
      projectStructure: [],
      isPublic: false,
      tags: [],
      titleCommunityPage: "",
      category: "",
      typeOfDocument: "",
      authorName: "",
    };

    (Project.findById as unknown as Mock)
      .mockResolvedValueOnce(existingProject)
      .mockResolvedValueOnce(updatedProject);

    const res = await request(app).put("/api/projects/1").send({
      name: "UpdatedProject",
      username: "user1",
      // projectStructure fehlt
    });

    expect(res.status).toBe(200);
    // Optional: Prüfen, ob das zurückgegebene Objekt die erwarteten Felder enthält
    expect(res.body).toHaveProperty("name", "UpdatedProject");
    expect(res.body).toHaveProperty("username", "user1");
  });

  it("PUT /api/projects/:id nicht gefunden gibt 404 zurück", async () => {
    // Controller uses findById, not findOneAndUpdate
    (Project.findById as unknown as Mock).mockResolvedValue(null);

    const res = await request(app).put("/api/projects/1").send({
      name: "Project1",
      username: "user1",
      projectStructure: [],
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Project not found");
  });

  it("PUT /api/projects/:id Fehler gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");
    (Project.findById as unknown as Mock).mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).put("/api/projects/1").send({
      name: "Project1",
      username: "user1",
      projectStructure: [],
    });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error updating project:",
      error,
    );

    consoleErrorMock.mockRestore();
  });

  // --- GET BY USERNAME ---
  it("GET /api/projects/by-username ohne Username gibt 400 zurück", async () => {
    const res = await request(app).get("/api/projects/by-username");

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Username is required");
  });

  it("GET /api/projects/by-username Fehler gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");

    (Project.find as unknown as Mock).mockReturnValue({
      sort: vi.fn().mockRejectedValue(error),
    });

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app)
      .get("/api/projects/by-username")
      .query({ username: "user1" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching projects by username:",
      error,
    );

    consoleErrorMock.mockRestore();
  });
});

describe("project.controller zusätzliche Fehlerfälle", () => {
  // --- GET RECENT PROJECTS ---
  it("GET /api/projects/by-username/recent ohne Username gibt 400 zurück", async () => {
    const res = await request(app).get("/api/projects/by-username/recent");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Username is required");
  });

  it("GET /api/projects/by-username/recent Fehler gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");

    (Project.find as unknown as Mock).mockReturnValue({
      sort: vi.fn().mockReturnValue({
        limit: vi.fn().mockRejectedValue(error),
      }),
    });

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app)
      .get("/api/projects/by-username/recent")
      .query({ username: "user1" });

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching recent projects:",
      error,
    );

    consoleErrorMock.mockRestore();
  });

  // --- DELETE PROJECT ---
  it("DELETE /api/projects/:id nicht gefunden gibt 404 zurück", async () => {
    // Controller uses findById first, not findByIdAndDelete directly
    (Project.findById as unknown as Mock).mockResolvedValue(null);

    const res = await request(app).delete("/api/projects/invalid-id");

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "Project not found");
  });

  it("DELETE /api/projects/:id Fehler gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");
    (Project.findById as unknown as Mock).mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).delete("/api/projects/1");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error deleting project:",
      error,
    );

    consoleErrorMock.mockRestore();
  });

  describe("GET /api/projects/public", () => {
    it("gibt alle öffentlichen Projekte zurück", async () => {
      const mockProjects = [
        { _id: "1", name: "Public1", isPublic: true },
        { _id: "2", name: "Public2", isPublic: true },
      ];
      (Project.find as unknown as Mock).mockReturnValue({
        sort: vi.fn().mockResolvedValue(mockProjects),
      });

      const res = await request(app).get("/api/projects/public");

      expect(res.status).toBe(200);
      expect(res.body).toEqual(mockProjects);
    });

    it("gibt 404 zurück, wenn keine öffentlichen Projekte existieren", async () => {
      (Project.find as unknown as Mock).mockReturnValue({
        sort: vi.fn().mockResolvedValue([]),
      });

      const res = await request(app).get("/api/projects/public");

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error", "No public projects found");
    });

    it("gibt 500 zurück, wenn ein Fehler auftritt", async () => {
      const error = new Error("DB Fehler");

      (Project.find as unknown as Mock).mockReturnValue({
        sort: vi.fn().mockImplementation(() => {
          throw error;
        }),
      });

      const consoleErrorMock = vi
        .spyOn(console, "error")
        .mockImplementation(() => {});

      const res = await request(app).get("/api/projects/public");

      expect(res.status).toBe(500);
      expect(res.body).toHaveProperty("error", "Internal Server Error");
      expect(consoleErrorMock).toHaveBeenCalledWith(
        "Error fetching public projects:",
        error,
      );

      consoleErrorMock.mockRestore();
    });
  });
});

describe("project.controller Edge Cases", () => {
  // --- CREATE with optional fields ---
  it("POST /api/projects mit optionalen Feldern erstellt Projekt", async () => {
    const mockProject = {
      _id: "1",
      name: "Project1",
      username: "user1",
      projectStructure: [],
      isPublic: true,
      tags: ["tag1", "tag2"],
      titleCommunityPage: "Community Title",
      category: "Science",
      typeOfDocument: "Research",
      authorName: "John Doe",
    };

    const mockSave = vi.fn().mockResolvedValue(mockProject);
    vi.mocked(Project).mockImplementation(
      () =>
        ({
          save: mockSave,
          ...mockProject,
        }) as any,
    );

    (Project.findById as unknown as Mock).mockResolvedValue(mockProject);

    const res = await request(app)
      .post("/api/projects")
      .send({
        name: "Project1",
        username: "user1",
        projectStructure: [],
        isPublic: true,
        tags: ["tag1", "tag2"],
        titleCommunityPage: "Community Title",
        category: "Science",
        typeOfDocument: "Research",
        authorName: "John Doe",
      });

    expect(res.status).toBe(201);
    expect(res.body).toEqual(mockProject);
  });

  // --- GET ALL PROJECTS error case ---
  it("GET /api/projects Fehler gibt 500 zurück", async () => {
    const error = new Error("DB Fehler");
    (Project.find as unknown as Mock).mockRejectedValue(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).get("/api/projects");

    expect(res.status).toBe(500);
    expect(res.body).toHaveProperty("error", "Internal Server Error");
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error fetching all projects:",
      error,
    );

    consoleErrorMock.mockRestore();
  });

  // --- UPDATE with all fields ---
  it("PUT /api/projects/:id aktualisiert alle Felder", async () => {
    const existingProject = {
      _id: "1",
      name: "OldName",
      username: "oldUser",
      projectStructure: [],
      isPublic: false,
      tags: [],
      titleCommunityPage: "",
      category: "",
      typeOfDocument: "",
      authorName: "",
      save: vi.fn().mockResolvedValue(true),
    };

    const updatedProject = {
      _id: "1",
      name: "NewName",
      username: "newUser",
      projectStructure: [{ id: "node1" }],
      isPublic: true,
      tags: ["tag1", "tag2"],
      titleCommunityPage: "New Title",
      category: "New Category",
      typeOfDocument: "New Document Type",
      authorName: "New Author",
    };

    (Project.findById as unknown as Mock)
      .mockResolvedValueOnce(existingProject)
      .mockResolvedValueOnce(updatedProject);

    const res = await request(app)
      .put("/api/projects/1")
      .send({
        name: "NewName",
        username: "newUser",
        projectStructure: [{ id: "node1" }],
        isPublic: true,
        tags: ["tag1", "tag2"],
        titleCommunityPage: "New Title",
        category: "New Category",
        typeOfDocument: "New Document Type",
        authorName: "New Author",
      });

    expect(res.status).toBe(200);
    expect(existingProject.save).toHaveBeenCalled();
    expect(res.body).toEqual(updatedProject);
  });

  // --- UPDATE with partial fields ---
  it("PUT /api/projects/:id aktualisiert nur einige Felder", async () => {
    const existingProject = {
      _id: "1",
      name: "OldName",
      username: "user1",
      projectStructure: [],
      isPublic: false,
      tags: [],
      titleCommunityPage: "",
      category: "",
      typeOfDocument: "",
      authorName: "",
      save: vi.fn().mockResolvedValue(true),
    };

    const updatedProject = {
      _id: "1",
      name: "OldName", // Unchanged
      username: "user1", // Unchanged
      projectStructure: [{ id: "node1" }], // Changed
      isPublic: true, // Changed
      tags: ["newTag"], // Changed
      titleCommunityPage: "", // Unchanged
      category: "", // Unchanged
      typeOfDocument: "", // Unchanged
      authorName: "", // Unchanged
    };

    (Project.findById as unknown as Mock)
      .mockResolvedValueOnce(existingProject)
      .mockResolvedValueOnce(updatedProject);

    const res = await request(app)
      .put("/api/projects/1")
      .send({
        projectStructure: [{ id: "node1" }],
        isPublic: true,
        tags: ["newTag"],
      });

    expect(res.status).toBe(200);
    expect(res.body.projectStructure).toEqual([{ id: "node1" }]);
    expect(res.body.isPublic).toBe(true);
  });

  // --- UPDATE save error ---
  it("PUT /api/projects/:id save Fehler gibt 500 zurück", async () => {
    const existingProject = {
      _id: "1",
      name: "OldName",
      save: vi.fn().mockRejectedValue(new Error("Save failed")),
    };

    (Project.findById as unknown as Mock).mockResolvedValue(existingProject);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).put("/api/projects/1").send({
      name: "NewName",
    });

    expect(res.status).toBe(500);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error updating project:",
      expect.any(Error),
    );

    consoleErrorMock.mockRestore();
  });

  // --- DELETE with error in related data deletion ---
  it("DELETE /api/projects/:id löscht Projekt trotz Fehler bei zugehörigen Daten", async () => {
    const deletedProject = {
      _id: "1",
      name: "Project1",
      username: "user1",
    };

    (Project.findById as unknown as Mock).mockResolvedValue(deletedProject);
    (Project.deleteOne as unknown as Mock).mockResolvedValue({
      deletedCount: 1,
    });

    // Simulate error in NodeContent deletion
    (NodeContent.deleteMany as unknown as Mock).mockRejectedValue(
      new Error("NodeContent deletion failed"),
    );

    (AiProtocol.deleteMany as unknown as Mock).mockResolvedValue({
      deletedCount: 2,
    });

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app).delete("/api/projects/1");

    expect(res.status).toBe(500);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error deleting project:",
      expect.any(Error),
    );

    consoleErrorMock.mockRestore();
  });

  // --- DELETE with no related data ---
  it("DELETE /api/projects/:id löscht Projekt ohne zugehörige Daten", async () => {
    const deletedProject = {
      _id: "1",
      name: "Project1",
      username: "user1",
    };

    (Project.findById as unknown as Mock).mockResolvedValue(deletedProject);
    (Project.deleteOne as unknown as Mock).mockResolvedValue({
      deletedCount: 1,
    });

    (NodeContent.deleteMany as unknown as Mock).mockResolvedValue({
      deletedCount: 0,
    });

    (AiProtocol.deleteMany as unknown as Mock).mockResolvedValue({
      deletedCount: 0,
    });

    const res = await request(app).delete("/api/projects/1");

    expect(res.status).toBe(200);
    expect(res.body.deletedNodeContents).toBe(0);
    expect(res.body.deletedAiProtocols).toBe(0);
  });
});

describe("project.controller Toggle Functions", () => {
  // --- TOGGLE UPVOTE ---
  it("POST /api/projects/:id/toggle-upvote toggle upvote hinzufügen", async () => {
    const mockProject = {
      _id: "1",
      name: "Project1",
      upvotedBy: [],
      save: vi.fn().mockResolvedValue(true),
    };

    const updatedProject = {
      _id: "1",
      name: "Project1",
      upvotedBy: ["user1"],
    };

    (Project.findById as unknown as Mock)
      .mockResolvedValueOnce(mockProject)
      .mockResolvedValueOnce(updatedProject);

    const res = await request(app)
      .post("/api/projects/1/toggle-upvote")
      .send({ username: "user1" });

    expect(res.status).toBe(200);
    expect(res.body.upvotedBy).toContain("user1");
  });

  it("POST /api/projects/:id/toggle-upvote toggle upvote entfernen", async () => {
    const mockProject = {
      _id: "1",
      name: "Project1",
      upvotedBy: ["user1", "user2"],
      save: vi.fn().mockResolvedValue(true),
    };

    const updatedProject = {
      _id: "1",
      name: "Project1",
      upvotedBy: ["user2"],
    };

    (Project.findById as unknown as Mock)
      .mockResolvedValueOnce(mockProject)
      .mockResolvedValueOnce(updatedProject);

    const res = await request(app)
      .post("/api/projects/1/toggle-upvote")
      .send({ username: "user1" });

    expect(res.status).toBe(200);
    expect(res.body.upvotedBy).not.toContain("user1");
    expect(res.body.upvotedBy).toContain("user2");
  });

  it("POST /api/projects/:id/toggle-upvote ohne username gibt 400 zurück", async () => {
    const res = await request(app)
      .post("/api/projects/1/toggle-upvote")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Username is required");
  });

  it("POST /api/projects/:id/toggle-upvote Projekt nicht gefunden gibt 404 zurück", async () => {
    (Project.findById as unknown as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post("/api/projects/1/toggle-upvote")
      .send({ username: "user1" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Project not found");
  });

  it("POST /api/projects/:id/toggle-upvote Fehler gibt 500 zurück", async () => {
    (Project.findById as unknown as Mock).mockRejectedValue(
      new Error("DB Error"),
    );

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app)
      .post("/api/projects/1/toggle-upvote")
      .send({ username: "user1" });

    expect(res.status).toBe(500);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error toggling upvote:",
      expect.any(Error),
    );

    consoleErrorMock.mockRestore();
  });

  // --- TOGGLE FAVORITE ---
  it("POST /api/projects/:id/toggle-favorite toggle favorite hinzufügen", async () => {
    const mockProject = {
      _id: "1",
      name: "Project1",
      favoritedBy: [],
      save: vi.fn().mockResolvedValue(true),
    };

    const updatedProject = {
      _id: "1",
      name: "Project1",
      favoritedBy: ["user1"],
    };

    (Project.findById as unknown as Mock)
      .mockResolvedValueOnce(mockProject)
      .mockResolvedValueOnce(updatedProject);

    const res = await request(app)
      .post("/api/projects/1/toggle-favorite")
      .send({ username: "user1" });

    expect(res.status).toBe(200);
    expect(res.body.favoritedBy).toContain("user1");
  });

  it("POST /api/projects/:id/toggle-favorite toggle favorite entfernen", async () => {
    const mockProject = {
      _id: "1",
      name: "Project1",
      favoritedBy: ["user1", "user2"],
      save: vi.fn().mockResolvedValue(true),
    };

    const updatedProject = {
      _id: "1",
      name: "Project1",
      favoritedBy: ["user2"],
    };

    (Project.findById as unknown as Mock)
      .mockResolvedValueOnce(mockProject)
      .mockResolvedValueOnce(updatedProject);

    const res = await request(app)
      .post("/api/projects/1/toggle-favorite")
      .send({ username: "user1" });

    expect(res.status).toBe(200);
    expect(res.body.favoritedBy).not.toContain("user1");
    expect(res.body.favoritedBy).toContain("user2");
  });

  it("POST /api/projects/:id/toggle-favorite ohne username gibt 400 zurück", async () => {
    const res = await request(app)
      .post("/api/projects/1/toggle-favorite")
      .send({});

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Username is required");
  });

  it("POST /api/projects/:id/toggle-favorite Projekt nicht gefunden gibt 404 zurück", async () => {
    (Project.findById as unknown as Mock).mockResolvedValue(null);

    const res = await request(app)
      .post("/api/projects/1/toggle-favorite")
      .send({ username: "user1" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Project not found");
  });

  it("POST /api/projects/:id/toggle-favorite Fehler gibt 500 zurück", async () => {
    (Project.findById as unknown as Mock).mockRejectedValue(
      new Error("DB Error"),
    );

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app)
      .post("/api/projects/1/toggle-favorite")
      .send({ username: "user1" });

    expect(res.status).toBe(500);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error toggling favorite:",
      expect.any(Error),
    );

    consoleErrorMock.mockRestore();
  });
});

describe("project.controller Uncovered Lines Coverage", () => {
  // --- TOGGLE UPVOTE Edge Cases ---
  it("POST /api/projects/:id/toggle-upvote save Fehler gibt 500 zurück", async () => {
    const project = {
      _id: "1",
      name: "Project1",
      upvotedBy: [],
      save: vi.fn().mockRejectedValue(new Error("Save failed")),
    };

    (Project.findById as unknown as Mock)
      .mockResolvedValueOnce(project) // First call in toggle
      .mockResolvedValueOnce(null); // Second call after save fails

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    const res = await request(app)
      .post("/api/projects/1/toggle-upvote")
      .send({ username: "user1" });

    expect(res.status).toBe(500);
    expect(consoleErrorMock).toHaveBeenCalledWith(
      "Error toggling upvote:",
      expect.any(Error),
    );

    consoleErrorMock.mockRestore();
  });
});

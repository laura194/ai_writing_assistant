import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Import model and encryption utilities
import Project, { IProject } from "./Project";
import { isEncryptionEnabled } from "../utils/encryption";

/**
 * Generate a secure test encryption key
 */
const generateTestEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

describe("Project Model", () => {
  let testEncryptionKey: string;
  let originalEncryptionKey: string | undefined;
  let originalEncryptionEnabled: string | undefined;
  let mongoServer: MongoMemoryServer;

  beforeAll(async () => {
    // Save original environment variables
    originalEncryptionKey = process.env.ENCRYPTION_KEY;
    originalEncryptionEnabled = process.env.ENCRYPTION_ENABLED;

    // Generate test encryption key
    testEncryptionKey = generateTestEncryptionKey();
    process.env.ENCRYPTION_KEY = testEncryptionKey;
    process.env.ENCRYPTION_ENABLED = "true";

    // Start in-memory MongoDB server
    mongoServer = await MongoMemoryServer.create();
    const mongoUri = mongoServer.getUri();

    await mongoose.connect(mongoUri);
  }, 30000);

  afterAll(async () => {
    // Restore original environment variables
    if (originalEncryptionKey !== undefined) {
      process.env.ENCRYPTION_KEY = originalEncryptionKey;
    } else {
      delete process.env.ENCRYPTION_KEY;
    }

    if (originalEncryptionEnabled !== undefined) {
      process.env.ENCRYPTION_ENABLED = originalEncryptionEnabled;
    } else {
      delete process.env.ENCRYPTION_ENABLED;
    }

    await mongoose.disconnect();
    await mongoServer.stop();
  }, 30000);

  beforeEach(async () => {
    process.env.ENCRYPTION_ENABLED = "true";
    process.env.ENCRYPTION_KEY = testEncryptionKey;
    await Project.deleteMany({});
  });

  afterEach(() => {
    process.env.ENCRYPTION_ENABLED = "true";
    process.env.ENCRYPTION_KEY = testEncryptionKey;
  });

  describe("Schema Validation", () => {
    it("should create a project with required fields", async () => {
      const projectData = {
        name: "Test Project",
        username: "testuser",
        projectStructure: { nodes: [] },
      };

      const project = new Project(projectData);
      await project.save();

      expect(project._id).toBeDefined();
      expect(project.name).toBe(projectData.name);
      expect(project.username).toBe(projectData.username);
      expect(project.projectStructure).toEqual(projectData.projectStructure);
    });

    it("should fail validation without required name field", async () => {
      const projectData = {
        username: "testuser",
        projectStructure: { nodes: [] },
      };

      const project = new Project(projectData);

      await expect(project.save()).rejects.toThrow(/name.*required/i);
    });

    it("should fail validation without required username field", async () => {
      const projectData = {
        name: "Test Project",
        projectStructure: { nodes: [] },
      };

      const project = new Project(projectData);

      await expect(project.save()).rejects.toThrow(/username.*required/i);
    });

    it("should fail validation without required projectStructure field", async () => {
      const projectData = {
        name: "Test Project",
        username: "testuser",
      };

      const project = new Project(projectData);

      await expect(project.save()).rejects.toThrow(/projectStructure.*required/i);
    });

    it("should set default values for optional fields", async () => {
      const projectData = {
        name: "Test Project",
        username: "testuser",
        projectStructure: { nodes: [] },
      };

      const project = new Project(projectData);
      await project.save();

      expect(project.isPublic).toBe(false);
      expect(project.tags).toEqual([]);
      expect(project.titleCommunityPage).toBe("");
      expect(project.category).toBe("");
      expect(project.typeOfDocument).toBe("");
      expect(project.authorName).toBe("");
      expect(project.upvotedBy).toEqual([]);
      expect(project.favoritedBy).toEqual([]);
    });

    it("should create a project with all optional fields", async () => {
      const projectData = {
        name: "Complete Project",
        username: "testuser",
        projectStructure: { nodes: [{ id: "1" }] },
        isPublic: true,
        tags: ["tag1", "tag2"],
        titleCommunityPage: "My Project",
        category: "Fiction",
        typeOfDocument: "Novel",
        authorName: "John Doe",
      };

      const project = new Project(projectData);
      await project.save();

      expect(project.isPublic).toBe(true);
      expect(project.tags).toEqual(["tag1", "tag2"]);
      expect(project.titleCommunityPage).toBe("My Project");
      expect(project.category).toBe("Fiction");
      expect(project.typeOfDocument).toBe("Novel");
      expect(project.authorName).toBe("John Doe");
    });

    it("should automatically add timestamps", async () => {
      const project = new Project({
        name: "Test Project",
        username: "testuser",
        projectStructure: {},
      });

      await project.save();

      expect(project.created_at).toBeDefined();
      expect(project.updated_at).toBeDefined();
      expect(project.created_at).toBeInstanceOf(Date);
      expect(project.updated_at).toBeInstanceOf(Date);
    });
  });

  describe("Encryption Functionality", () => {
    it("should encrypt name field when saving", async () => {
      const projectData = {
        name: "Secret Project Name",
        username: "testuser",
        projectStructure: { data: "test" },
      };

      const project = new Project(projectData);
      await project.save();

      // Fetch raw document from database
      const rawDoc = await mongoose.connection.collection("projects").findOne({
        _id: new mongoose.Types.ObjectId(project._id as string),
      });

      expect(rawDoc?.name).not.toBe(projectData.name);
      expect(rawDoc?.name).toBeTruthy();
      expect(typeof rawDoc?.name).toBe("string");
    });

    it("should encrypt projectStructure when saving", async () => {
      const projectData = {
        name: "Test Project",
        username: "testuser",
        projectStructure: { nodes: [{ id: "1", content: "secret" }] },
      };

      const project = new Project(projectData);
      await project.save();

      const rawDoc = await mongoose.connection.collection("projects").findOne({
        _id: new mongoose.Types.ObjectId(project._id as string),
      });

      expect(typeof rawDoc?.projectStructure).toBe("string");
      expect(rawDoc?.projectStructure).not.toContain("secret");
    });

    it("should encrypt authorName when provided", async () => {
      const projectData = {
        name: "Test Project",
        username: "testuser",
        projectStructure: {},
        authorName: "Jane Smith",
      };

      const project = new Project(projectData);
      await project.save();

      const rawDoc = await mongoose.connection.collection("projects").findOne({
        _id: new mongoose.Types.ObjectId(project._id as string),
      });

      expect(rawDoc?.authorName).not.toBe(projectData.authorName);
      expect(rawDoc?.authorName).toBeTruthy();
    });

    it("should encrypt titleCommunityPage when provided", async () => {
      const projectData = {
        name: "Test Project",
        username: "testuser",
        projectStructure: {},
        titleCommunityPage: "My Community Title",
      };

      const project = new Project(projectData);
      await project.save();

      const rawDoc = await mongoose.connection.collection("projects").findOne({
        _id: new mongoose.Types.ObjectId(project._id as string),
      });

      expect(rawDoc?.titleCommunityPage).not.toBe(projectData.titleCommunityPage);
      expect(rawDoc?.titleCommunityPage).toBeTruthy();
    });

    it("should decrypt fields when querying with findOne", async () => {
      const projectData = {
        name: "Test Project",
        username: "testuser",
        projectStructure: { nodes: [{ id: "1" }] },
        authorName: "John Doe",
        titleCommunityPage: "My Page",
      };

      const project = new Project(projectData);
      await project.save();

      const found = await Project.findOne({ _id: project._id });

      expect(found?.name).toBe(projectData.name);
      expect(found?.projectStructure).toEqual(projectData.projectStructure);
      expect(found?.authorName).toBe(projectData.authorName);
      expect(found?.titleCommunityPage).toBe(projectData.titleCommunityPage);
    });

    it("should decrypt fields when querying with find", async () => {
      const projects = [
        {
          name: "Project 1",
          username: "user1",
          projectStructure: { data: "structure1" },
          authorName: "Author 1",
        },
        {
          name: "Project 2",
          username: "user2",
          projectStructure: { data: "structure2" },
          authorName: "Author 2",
        },
      ];

      for (const projectData of projects) {
        const project = new Project(projectData);
        await project.save();
      }

      const found = await Project.find({});

      expect(found).toHaveLength(2);
      expect(found[0].name).toBe(projects[0].name);
      expect(found[1].name).toBe(projects[1].name);
      expect(found[0].authorName).toBe(projects[0].authorName);
      expect(found[1].authorName).toBe(projects[1].authorName);
    });

    it("should handle encryption disabled scenario", async () => {
      process.env.ENCRYPTION_ENABLED = "false";

      const projectData = {
        name: "Unencrypted Project",
        username: "testuser",
        projectStructure: { data: "test" },
      };

      const project = new Project(projectData);
      await project.save();

      const rawDoc = await mongoose.connection.collection("projects").findOne({
        _id: new mongoose.Types.ObjectId(project._id as string),
      });

      // Should remain unencrypted
      expect(rawDoc?.name).toBe(projectData.name);
    });

    it("should only encrypt modified fields on update", async () => {
      const project = new Project({
        name: "Original Name",
        username: "testuser",
        projectStructure: { data: "original" },
        authorName: "Original Author",
      });
      await project.save();

      // Update only name
      project.name = "Updated Name";
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.name).toBe("Updated Name");
      expect(found?.authorName).toBe("Original Author");
    });
  });

  describe("Query Operations", () => {
    it("should find projects by username", async () => {
      const projects = [
        { name: "P1", username: "user1", projectStructure: {} },
        { name: "P2", username: "user1", projectStructure: {} },
        { name: "P3", username: "user2", projectStructure: {} },
      ];

      for (const data of projects) {
        await new Project(data).save();
      }

      const found = await Project.find({ username: "user1" });
      expect(found).toHaveLength(2);
    });

    it("should find public projects", async () => {
      const projects = [
        { name: "P1", username: "user1", projectStructure: {}, isPublic: true },
        { name: "P2", username: "user2", projectStructure: {}, isPublic: false },
        { name: "P3", username: "user3", projectStructure: {}, isPublic: true },
      ];

      for (const data of projects) {
        await new Project(data).save();
      }

      const found = await Project.find({ isPublic: true });
      expect(found).toHaveLength(2);
    });

    it("should find projects by tags", async () => {
      const project = new Project({
        name: "Tagged Project",
        username: "testuser",
        projectStructure: {},
        tags: ["fiction", "adventure"],
      });
      await project.save();

      const found = await Project.findOne({ tags: "fiction" });
      expect(found?.name).toBe("Tagged Project");
    });

    it("should find projects by category", async () => {
      const projects = [
        { name: "P1", username: "u1", projectStructure: {}, category: "Fiction" },
        { name: "P2", username: "u2", projectStructure: {}, category: "Non-Fiction" },
      ];

      for (const data of projects) {
        await new Project(data).save();
      }

      const found = await Project.find({ category: "Fiction" });
      expect(found).toHaveLength(1);
      expect(found[0].name).toBe("P1");
    });

    it("should update a project", async () => {
      const project = new Project({
        name: "Original",
        username: "testuser",
        projectStructure: {},
      });
      await project.save();

      project.name = "Updated";
      project.isPublic = true;
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.name).toBe("Updated");
      expect(found?.isPublic).toBe(true);
    });

    it("should delete a project", async () => {
      const project = new Project({
        name: "To Delete",
        username: "testuser",
        projectStructure: {},
      });
      await project.save();

      await Project.deleteOne({ _id: project._id });

      const found = await Project.findOne({ _id: project._id });
      expect(found).toBeNull();
    });
  });

  describe("Array Fields (upvotedBy, favoritedBy)", () => {
    it("should add users to upvotedBy array", async () => {
      const project = new Project({
        name: "Test Project",
        username: "testuser",
        projectStructure: {},
      });
      await project.save();

      project.upvotedBy.push("user1", "user2");
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.upvotedBy).toEqual(["user1", "user2"]);
    });

    it("should add users to favoritedBy array", async () => {
      const project = new Project({
        name: "Test Project",
        username: "testuser",
        projectStructure: {},
      });
      await project.save();

      project.favoritedBy.push("user1");
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.favoritedBy).toEqual(["user1"]);
    });

    it("should remove users from upvotedBy array", async () => {
      const project = new Project({
        name: "Test Project",
        username: "testuser",
        projectStructure: {},
        upvotedBy: ["user1", "user2", "user3"],
      });
      await project.save();

      project.upvotedBy = project.upvotedBy.filter((u) => u !== "user2");
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.upvotedBy).toEqual(["user1", "user3"]);
    });

    it("should find projects upvoted by a user", async () => {
      const projects = [
        { name: "P1", username: "u1", projectStructure: {}, upvotedBy: ["user1"] },
        { name: "P2", username: "u2", projectStructure: {}, upvotedBy: ["user2"] },
        { name: "P3", username: "u3", projectStructure: {}, upvotedBy: ["user1"] },
      ];

      for (const data of projects) {
        await new Project(data).save();
      }

      const found = await Project.find({ upvotedBy: "user1" });
      expect(found).toHaveLength(2);
    });
  });

  describe("Complex ProjectStructure", () => {
    it("should handle complex nested structure", async () => {
      const complexStructure = {
        nodes: [
          {
            id: "1",
            name: "Chapter 1",
            children: [
              { id: "1-1", name: "Scene 1", content: "Content here" },
              { id: "1-2", name: "Scene 2", content: "More content" },
            ],
          },
        ],
        metadata: {
          version: 1,
          lastModified: "2024-01-01",
        },
      };

      const project = new Project({
        name: "Complex Project",
        username: "testuser",
        projectStructure: complexStructure,
      });
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.projectStructure).toEqual(complexStructure);
    });

    it("should preserve empty projectStructure", async () => {
      const project = new Project({
        name: "Empty Structure",
        username: "testuser",
        projectStructure: {},
      });
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.projectStructure).toEqual({});
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in name", async () => {
      const specialName = "Project with 特殊文字 & émojis 🚀";
      const project = new Project({
        name: specialName,
        username: "testuser",
        projectStructure: {},
      });
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.name).toBe(specialName);
    });

    it("should handle empty optional string fields", async () => {
      const project = new Project({
        name: "Test",
        username: "testuser",
        projectStructure: {},
        authorName: "",
        titleCommunityPage: "",
      });
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.authorName).toBe("");
      expect(found?.titleCommunityPage).toBe("");
    });

    it("should handle undefined optional fields", async () => {
      const project = new Project({
        name: "Test",
        username: "testuser",
        projectStructure: {},
      });

      // Don't set optional fields
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.authorName).toBe("");
      expect(found?.titleCommunityPage).toBe("");
    });

    it("should handle very long tag arrays", async () => {
      const manyTags = Array.from({ length: 50 }, (_, i) => `tag${i}`);
      const project = new Project({
        name: "Many Tags",
        username: "testuser",
        projectStructure: {},
        tags: manyTags,
      });
      await project.save();

      const found = await Project.findOne({ _id: project._id });
      expect(found?.tags).toHaveLength(50);
    });
  });
});

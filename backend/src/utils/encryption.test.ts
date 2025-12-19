import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Import models
import Project, { IProject } from "../models/Project";
import NodeContent, { INodeContent } from "../models/NodeContent";
import NodeContentVersion, { INodeContentVersion } from "../models/NodeContentVersion";
import Comment, { IComment } from "../models/Comment";

/**
 * Generate a secure test encryption key
 */
const generateTestEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

describe("Model Encryption Hooks", () => {
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
    
    try {
      await mongoose.connect(mongoUri);
      console.log("Connected to in-memory MongoDB for testing");
    } catch (error) {
      console.error("MongoDB connection error:", error);
      throw error;
    }
  }, 30000); // Increase timeout for MongoDB startup

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

    // Clean up and disconnect
    try {
      await mongoose.disconnect();
      await mongoServer.stop();
    } catch (error) {
      console.warn("Error during cleanup:", error);
    }
  }, 30000);

  beforeEach(async () => {
    // Ensure encryption is enabled for each test
    process.env.ENCRYPTION_ENABLED = "true";
    process.env.ENCRYPTION_KEY = testEncryptionKey;

    // Clear all collections before each test
    try {
      await Project.deleteMany({});
      await NodeContent.deleteMany({});
      await NodeContentVersion.deleteMany({});
      await Comment.deleteMany({});
    } catch (error) {
      console.warn("Could not clear collections:", error);
    }
  });

  afterEach(() => {
    // Reset encryption settings after each test
    process.env.ENCRYPTION_ENABLED = "true";
    process.env.ENCRYPTION_KEY = testEncryptionKey;
  });

  describe("Project Model Encryption", () => {
    it("should encrypt sensitive fields on save", async () => {
      const projectData = {
        name: "Test Project",
        username: "testuser",
        projectStructure: { nodes: [{ id: "1", name: "Node 1" }] },
        isPublic: false,
        authorName: "John Doe",
        titleCommunityPage: "My Community Page",
      };

      const project = new Project(projectData);
      await project.save();

      // Fetch raw document from database
      const rawDoc = await mongoose.connection.collection("projects").findOne({ 
        _id: new mongoose.Types.ObjectId(project._id as string) 
      });

      // Check that sensitive fields are encrypted in the database
      expect(rawDoc?.name).not.toBe(projectData.name);
      expect(rawDoc?.name).toBeTruthy();
      expect(rawDoc?.authorName).not.toBe(projectData.authorName);
      expect(rawDoc?.titleCommunityPage).not.toBe(projectData.titleCommunityPage);
      expect(typeof rawDoc?.projectStructure).toBe("string");
    });

    it("should decrypt fields when querying with findOne", async () => {
      const projectData = {
        name: "Test Project",
        username: "testuser",
        projectStructure: { nodes: [{ id: "1", name: "Node 1" }] },
        authorName: "John Doe",
        titleCommunityPage: "My Community Page",
      };

      const project = new Project(projectData);
      await project.save();

      // Query the project
      const foundProject = await Project.findOne({ _id: project._id });

      // Check that fields are decrypted
      expect(foundProject?.name).toBe(projectData.name);
      expect(foundProject?.authorName).toBe(projectData.authorName);
      expect(foundProject?.titleCommunityPage).toBe(projectData.titleCommunityPage);
      expect(foundProject?.projectStructure).toEqual(projectData.projectStructure);
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

      // Save individually to trigger pre-save hooks
      for (const projectData of projects) {
        const project = new Project(projectData);
        await project.save();
      }

      // Query all projects
      const foundProjects = await Project.find({});

      expect(foundProjects).toHaveLength(2);
      expect(foundProjects[0].name).toBe(projects[0].name);
      expect(foundProjects[1].name).toBe(projects[1].name);
      expect(foundProjects[0].authorName).toBe(projects[0].authorName);
      expect(foundProjects[1].authorName).toBe(projects[1].authorName);
    });

    it("should handle updates correctly", async () => {
      const project = new Project({
        name: "Original Name",
        username: "testuser",
        projectStructure: { data: "original" },
      });
      await project.save();

      // Update the project
      project.name = "Updated Name";
      project.projectStructure = { data: "updated" };
      await project.save();

      // Fetch and verify
      const updated = await Project.findOne({ _id: project._id });
      expect(updated?.name).toBe("Updated Name");
      expect(updated?.projectStructure).toEqual({ data: "updated" });
    });
  });

  describe("NodeContent Model Encryption", () => {
    it("should encrypt content and name on save", async () => {
      const nodeData = {
        nodeId: "node-123",
        name: "Test Node",
        category: "file",
        content: "This is sensitive content",
        projectId: "project-123",
      };

      const node = new NodeContent(nodeData);
      await node.save();

      // Fetch raw document
      const rawDoc = await mongoose.connection.collection("nodecontents").findOne({ 
        _id: new mongoose.Types.ObjectId(node._id as string) 
      });

      expect(rawDoc?.name).not.toBe(nodeData.name);
      expect(rawDoc?.content).not.toBe(nodeData.content);
    });

    it("should decrypt fields when querying with findOne", async () => {
      const nodeData = {
        nodeId: "node-123",
        name: "Test Node",
        category: "file",
        content: "This is sensitive content",
        projectId: "project-123",
      };

      const node = new NodeContent(nodeData);
      await node.save();

      const found = await NodeContent.findOne({ nodeId: nodeData.nodeId });

      expect(found?.name).toBe(nodeData.name);
      expect(found?.content).toBe(nodeData.content);
    });

    it("should decrypt fields when querying with find", async () => {
      const nodes = [
        {
          nodeId: "node-1",
          name: "Node 1",
          category: "file",
          content: "Content 1",
          projectId: "project-1",
        },
        {
          nodeId: "node-2",
          name: "Node 2",
          category: "folder",
          content: "Content 2",
          projectId: "project-1",
        },
      ];

      // Save individually to trigger pre-save hooks
      for (const nodeData of nodes) {
        const node = new NodeContent(nodeData);
        await node.save();
      }

      const found = await NodeContent.find({ projectId: "project-1" });

      expect(found).toHaveLength(2);
      expect(found[0].name).toBe(nodes[0].name);
      expect(found[0].content).toBe(nodes[0].content);
      expect(found[1].name).toBe(nodes[1].name);
      expect(found[1].content).toBe(nodes[1].content);
    });
  });

  describe("NodeContentVersion Model Encryption", () => {
    it("should encrypt content and name on save", async () => {
      const versionData = {
        nodeId: "node-123",
        projectId: "project-123",
        name: "Version Name",
        category: "file",
        content: "Version content",
        userId: "user-123",
      };

      const version = new NodeContentVersion(versionData);
      await version.save();

      const rawDoc = await mongoose.connection.collection("nodecontentversions").findOne({ 
        _id: new mongoose.Types.ObjectId(version._id as string) 
      });

      expect(rawDoc?.name).not.toBe(versionData.name);
      expect(rawDoc?.content).not.toBe(versionData.content);
    });

    it("should decrypt fields when querying", async () => {
      const versionData = {
        nodeId: "node-123",
        projectId: "project-123",
        name: "Version Name",
        category: "file",
        content: "Version content",
      };

      const version = new NodeContentVersion(versionData);
      await version.save();

      const found = await NodeContentVersion.findOne({ nodeId: versionData.nodeId });

      expect(found?.name).toBe(versionData.name);
      expect(found?.content).toBe(versionData.content);
    });

    it("should handle multiple versions correctly", async () => {
      const versions = [
        {
          nodeId: "node-1",
          projectId: "project-1",
          name: "V1",
          content: "Content V1",
          category: "file",
        },
        {
          nodeId: "node-1",
          projectId: "project-1",
          name: "V2",
          content: "Content V2",
          category: "file",
        },
      ];

      // Save individually to trigger pre-save hooks
      for (const versionData of versions) {
        const version = new NodeContentVersion(versionData);
        await version.save();
      }

      const found = await NodeContentVersion.find({ nodeId: "node-1" }).sort({ createdAt: 1 });

      expect(found).toHaveLength(2);
      expect(found[0].content).toBe(versions[0].content);
      expect(found[1].content).toBe(versions[1].content);
    });
  });

  describe("Comment Model Encryption", () => {
    it("should encrypt content and username on save", async () => {
      const projectId = new mongoose.Types.ObjectId();
      const commentData = {
        projectId,
        username: "testuser",
        content: "This is a comment",
      };

      const comment = new Comment(commentData);
      await comment.save();

      const rawDoc = await mongoose.connection.collection("comments").findOne({ 
        _id: new mongoose.Types.ObjectId(comment._id as string) 
      });

      expect(rawDoc?.username).not.toBe(commentData.username);
      expect(rawDoc?.content).not.toBe(commentData.content);
    });

    it("should decrypt fields when querying with findOne", async () => {
      const projectId = new mongoose.Types.ObjectId();
      const commentData = {
        projectId,
        username: "testuser",
        content: "This is a comment",
      };

      const comment = new Comment(commentData);
      await comment.save();

      const found = await Comment.findOne({ _id: comment._id });

      expect(found?.username).toBe(commentData.username);
      expect(found?.content).toBe(commentData.content);
    });

    it("should decrypt fields when querying with find", async () => {
      const projectId = new mongoose.Types.ObjectId();
      const comments = [
        {
          projectId,
          username: "user1",
          content: "Comment 1",
        },
        {
          projectId,
          username: "user2",
          content: "Comment 2",
        },
      ];

      // Save individually to trigger pre-save hooks
      for (const commentData of comments) {
        const comment = new Comment(commentData);
        await comment.save();
      }

      const found = await Comment.find({ projectId });

      expect(found).toHaveLength(2);
      expect(found[0].username).toBe(comments[0].username);
      expect(found[0].content).toBe(comments[0].content);
      expect(found[1].username).toBe(comments[1].username);
      expect(found[1].content).toBe(comments[1].content);
    });
  });

  describe("Encryption Disabled", () => {
    it("should not encrypt when encryption is disabled", async () => {
      process.env.ENCRYPTION_ENABLED = "false";

      const projectData = {
        name: "Test Project",
        username: "testuser",
        projectStructure: { data: "test" },
      };

      const project = new Project(projectData);
      await project.save();

      const rawDoc = await mongoose.connection.collection("projects").findOne({ 
        _id: new mongoose.Types.ObjectId(project._id as string) 
      });

      // Fields should remain unencrypted
      expect(rawDoc?.name).toBe(projectData.name);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty strings", async () => {
      const project = new Project({
        name: "Non-empty name", // Changed: name is required
        username: "testuser",
        projectStructure: {},
        authorName: "",
      });

      await project.save();
      const found = await Project.findOne({ _id: project._id });

      expect(found?.name).toBe("Non-empty name");
      expect(found?.authorName).toBe("");
    });

    it("should handle special characters in content", async () => {
      const specialContent = "Special: !@#$%^&*()_+-=[]{}|;:',.<>?/`~";
      
      const node = new NodeContent({
        nodeId: "node-special",
        name: "Special Node",
        category: "file",
        content: specialContent,
        projectId: "project-1",
      });

      await node.save();
      const found = await NodeContent.findOne({ nodeId: "node-special" });

      expect(found?.content).toBe(specialContent);
    });

    it("should handle unicode and emoji in names", async () => {
      const unicodeName = "Hello 世界 🌍 🚀";

      const project = new Project({
        name: unicodeName,
        username: "testuser",
        projectStructure: {},
      });

      await project.save();
      const found = await Project.findOne({ _id: project._id });

      expect(found?.name).toBe(unicodeName);
    });

    it("should handle large content", async () => {
      const largeContent = "x".repeat(50000);

      const node = new NodeContent({
        nodeId: "node-large",
        name: "Large Content",
        category: "file",
        content: largeContent,
        projectId: "project-1",
      });

      await node.save();
      const found = await NodeContent.findOne({ nodeId: "node-large" });

      expect(found?.content).toBe(largeContent);
    });

    it("should handle complex nested projectStructure", async () => {
      const complexStructure = {
        nodes: [
          {
            id: "1",
            name: "Node 1",
            children: [
              { id: "1-1", name: "Child 1-1" },
              { id: "1-2", name: "Child 1-2" },
            ],
          },
        ],
        metadata: {
          version: 1,
          tags: ["tag1", "tag2"],
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
  });
});
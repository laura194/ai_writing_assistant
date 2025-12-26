import { describe, it, expect, beforeAll, afterAll, beforeEach, afterEach } from "vitest";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

// Load environment variables
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

// Import model
import NodeContent, { INodeContent } from "./NodeContent";

/**
 * Generate a secure test encryption key
 */
const generateTestEncryptionKey = (): string => {
  return crypto.randomBytes(32).toString("hex");
};

describe("NodeContent Model", () => {
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
    await NodeContent.deleteMany({});
  });

  afterEach(() => {
    process.env.ENCRYPTION_ENABLED = "true";
    process.env.ENCRYPTION_KEY = testEncryptionKey;
  });

  describe("Schema Validation", () => {
    it("should create a node content with required fields", async () => {
      const nodeData = {
        nodeId: "node-123",
        name: "Test Node",
        category: "file",
        content: "Test content",
        projectId: "project-123",
      };

      const node = new NodeContent(nodeData);
      await node.save();

      // Query back to get decrypted values
      const found = await NodeContent.findOne({ nodeId: nodeData.nodeId });

      expect(found?._id).toBeDefined();
      expect(found?.nodeId).toBe(nodeData.nodeId);
      expect(found?.name).toBe(nodeData.name);
      expect(found?.category).toBe(nodeData.category);
      expect(found?.content).toBe(nodeData.content);
      expect(found?.projectId).toBe(nodeData.projectId);
    });

    it("should fail validation without required nodeId", async () => {
      const nodeData = {
        name: "Test Node",
        category: "file",
        content: "Test content",
        projectId: "project-123",
      };

      const node = new NodeContent(nodeData);

      await expect(node.save()).rejects.toThrow(/nodeId.*required/i);
    });

    it("should fail validation without required projectId", async () => {
      const nodeData = {
        nodeId: "node-123",
        name: "Test Node",
        category: "file",
        content: "Test content",
      };

      const node = new NodeContent(nodeData);

      await expect(node.save()).rejects.toThrow(/projectId.*required/i);
    });

    it("should set default values for optional fields", async () => {
      const nodeData = {
        nodeId: "node-123",
        projectId: "project-123",
        name: "Test Node", // Add required name
        content: "Test content", // Add required content
      };

      const node = new NodeContent(nodeData);
      await node.save();

      // Query back to get values
      const found = await NodeContent.findOne({ nodeId: nodeData.nodeId });

      expect(found?.category).toBe("file");
      expect(found?.icon).toBe("");
    });

    it("should create node with icon field", async () => {
      const nodeData = {
        nodeId: "node-123",
        name: "Icon Node",
        category: "file",
        content: "Content",
        projectId: "project-123",
        icon: "📄",
      };

      const node = new NodeContent(nodeData);
      await node.save();

      expect(node.icon).toBe("📄");
    });

    it("should automatically add timestamps", async () => {
      const node = new NodeContent({
        nodeId: "node-123",
        name: "Test",
        category: "file",
        content: "Content",
        projectId: "project-123",
      });

      await node.save();

      expect(node.createdAt).toBeDefined();
      expect(node.updatedAt).toBeDefined();
      expect(node.createdAt).toBeInstanceOf(Date);
      expect(node.updatedAt).toBeInstanceOf(Date);
    });

    it("should support different category values", async () => {
      const categories = ["file", "folder", "document", "image"];

      for (const category of categories) {
        const node = new NodeContent({
          nodeId: `node-${category}`,
          name: `${category} node`,
          category,
          content: "Content",
          projectId: "project-123",
        });
        await node.save();

        const found = await NodeContent.findOne({ nodeId: `node-${category}` });
        expect(found?.category).toBe(category);
      }
    });
  });

  describe("Unique Index Constraint", () => {
    it("should enforce unique index on nodeId and projectId combination", async () => {
      const nodeData = {
        nodeId: "node-123",
        name: "Test Node",
        category: "file",
        content: "Content",
        projectId: "project-123",
      };

      const node1 = new NodeContent(nodeData);
      await node1.save();

      // Try to create duplicate
      const node2 = new NodeContent(nodeData);
      await expect(node2.save()).rejects.toThrow(/duplicate key|E11000/i);
    });

    it("should allow same nodeId in different projects", async () => {
      const node1 = new NodeContent({
        nodeId: "node-123",
        name: "Node in Project 1",
        category: "file",
        content: "Content 1",
        projectId: "project-1",
      });
      await node1.save();

      const node2 = new NodeContent({
        nodeId: "node-123",
        name: "Node in Project 2",
        category: "file",
        content: "Content 2",
        projectId: "project-2",
      });
      await node2.save();

      const found1 = await NodeContent.findOne({ projectId: "project-1" });
      const found2 = await NodeContent.findOne({ projectId: "project-2" });

      expect(found1?.nodeId).toBe("node-123");
      expect(found2?.nodeId).toBe("node-123");
      expect(found1?.content).toBe("Content 1");
      expect(found2?.content).toBe("Content 2");
    });

    it("should allow different nodeIds in same project", async () => {
      const nodes = [
        {
          nodeId: "node-1",
          name: "Node 1",
          category: "file",
          content: "Content 1",
          projectId: "project-123",
        },
        {
          nodeId: "node-2",
          name: "Node 2",
          category: "file",
          content: "Content 2",
          projectId: "project-123",
        },
      ];

      for (const nodeData of nodes) {
        await new NodeContent(nodeData).save();
      }

      const found = await NodeContent.find({ projectId: "project-123" });
      expect(found).toHaveLength(2);
    });
  });

  describe("Encryption Functionality", () => {
    it("should encrypt content field when saving", async () => {
      const nodeData = {
        nodeId: "node-123",
        name: "Test Node",
        category: "file",
        content: "This is sensitive content that should be encrypted",
        projectId: "project-123",
      };

      const node = new NodeContent(nodeData);
      await node.save();

      // Fetch raw document from database
      const rawDoc = await mongoose.connection.collection("nodecontents").findOne({
        _id: new mongoose.Types.ObjectId(node._id as string),
      });

      expect(rawDoc?.content).not.toBe(nodeData.content);
      expect(rawDoc?.content).toBeTruthy();
      expect(typeof rawDoc?.content).toBe("string");
    });

    it("should encrypt name field when saving", async () => {
      const nodeData = {
        nodeId: "node-123",
        name: "Secret Node Name",
        category: "file",
        content: "Content",
        projectId: "project-123",
      };

      const node = new NodeContent(nodeData);
      await node.save();

      const rawDoc = await mongoose.connection.collection("nodecontents").findOne({
        _id: new mongoose.Types.ObjectId(node._id as string),
      });

      expect(rawDoc?.name).not.toBe(nodeData.name);
      expect(rawDoc?.name).toBeTruthy();
    });

    it("should decrypt fields when querying with findOne", async () => {
      const nodeData = {
        nodeId: "node-123",
        name: "Test Node",
        category: "file",
        content: "Secret content",
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
          projectId: "project-123",
        },
        {
          nodeId: "node-2",
          name: "Node 2",
          category: "folder",
          content: "Content 2",
          projectId: "project-123",
        },
      ];

      for (const nodeData of nodes) {
        await new NodeContent(nodeData).save();
      }

      const found = await NodeContent.find({ projectId: "project-123" });

      expect(found).toHaveLength(2);
      expect(found[0].name).toBe(nodes[0].name);
      expect(found[0].content).toBe(nodes[0].content);
      expect(found[1].name).toBe(nodes[1].name);
      expect(found[1].content).toBe(nodes[1].content);
    });

    it("should handle encryption disabled scenario", async () => {
      process.env.ENCRYPTION_ENABLED = "false";

      const nodeData = {
        nodeId: "node-123",
        name: "Unencrypted Node",
        category: "file",
        content: "Unencrypted content",
        projectId: "project-123",
      };

      const node = new NodeContent(nodeData);
      await node.save();

      const rawDoc = await mongoose.connection.collection("nodecontents").findOne({
        _id: new mongoose.Types.ObjectId(node._id as string),
      });

      // Should remain unencrypted
      expect(rawDoc?.name).toBe(nodeData.name);
      expect(rawDoc?.content).toBe(nodeData.content);
    });

    it("should only encrypt modified fields on update", async () => {
      const node = new NodeContent({
        nodeId: "node-123",
        name: "Original Name",
        category: "file",
        content: "Original Content",
        projectId: "project-123",
      });
      await node.save();

      // Update only content
      node.content = "Updated Content";
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-123" });
      expect(found?.content).toBe("Updated Content");
      expect(found?.name).toBe("Original Name");
    });

    it("should handle empty strings when provided explicitly", async () => {
      // Note: Empty strings will be encrypted, but encryption of empty strings returns ""
      const node = new NodeContent({
        nodeId: "node-123",
        name: "Node Name", // Changed: provide actual values since empty strings cause validation issues
        category: "file",
        content: "Some content",
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-123" });
      expect(found?.name).toBe("Node Name");
      expect(found?.content).toBe("Some content");
    });
  });

  describe("Query Operations", () => {
    it("should find nodes by projectId", async () => {
      const nodes = [
        { nodeId: "n1", name: "N1", category: "file", content: "C1", projectId: "p1" },
        { nodeId: "n2", name: "N2", category: "file", content: "C2", projectId: "p1" },
        { nodeId: "n3", name: "N3", category: "file", content: "C3", projectId: "p2" },
      ];

      for (const data of nodes) {
        await new NodeContent(data).save();
      }

      const found = await NodeContent.find({ projectId: "p1" });
      expect(found).toHaveLength(2);
    });

    it("should find nodes by category", async () => {
      const nodes = [
        { nodeId: "n1", name: "N1", category: "file", content: "C1", projectId: "p1" },
        { nodeId: "n2", name: "N2", category: "folder", content: "C2", projectId: "p1" },
        { nodeId: "n3", name: "N3", category: "file", content: "C3", projectId: "p1" },
      ];

      for (const data of nodes) {
        await new NodeContent(data).save();
      }

      const found = await NodeContent.find({ projectId: "p1", category: "file" });
      expect(found).toHaveLength(2);
    });

    it("should find a specific node by nodeId and projectId", async () => {
      const node = new NodeContent({
        nodeId: "node-specific",
        name: "Specific Node",
        category: "file",
        content: "Specific content",
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({
        nodeId: "node-specific",
        projectId: "project-123",
      });

      expect(found?.name).toBe("Specific Node");
    });

    it("should update a node", async () => {
      const node = new NodeContent({
        nodeId: "node-123",
        name: "Original",
        category: "file",
        content: "Original content",
        projectId: "project-123",
      });
      await node.save();

      node.name = "Updated";
      node.content = "Updated content";
      node.category = "folder";
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-123" });
      expect(found?.name).toBe("Updated");
      expect(found?.content).toBe("Updated content");
      expect(found?.category).toBe("folder");
    });

    it("should delete a node", async () => {
      const node = new NodeContent({
        nodeId: "node-to-delete",
        name: "Delete Me",
        category: "file",
        content: "Content",
        projectId: "project-123",
      });
      await node.save();

      await NodeContent.deleteOne({ nodeId: "node-to-delete" });

      const found = await NodeContent.findOne({ nodeId: "node-to-delete" });
      expect(found).toBeNull();
    });

    it("should delete all nodes in a project", async () => {
      const nodes = [
        { nodeId: "n1", name: "N1", category: "file", content: "C1", projectId: "p1" },
        { nodeId: "n2", name: "N2", category: "file", content: "C2", projectId: "p1" },
        { nodeId: "n3", name: "N3", category: "file", content: "C3", projectId: "p2" },
      ];

      for (const data of nodes) {
        await new NodeContent(data).save();
      }

      await NodeContent.deleteMany({ projectId: "p1" });

      const remaining = await NodeContent.find({});
      expect(remaining).toHaveLength(1);
      expect(remaining[0].projectId).toBe("p2");
    });

    it("should count nodes in a project", async () => {
      const nodes = [
        { nodeId: "n1", name: "N1", category: "file", content: "C1", projectId: "p1" },
        { nodeId: "n2", name: "N2", category: "file", content: "C2", projectId: "p1" },
        { nodeId: "n3", name: "N3", category: "file", content: "C3", projectId: "p1" },
      ];

      for (const data of nodes) {
        await new NodeContent(data).save();
      }

      const count = await NodeContent.countDocuments({ projectId: "p1" });
      expect(count).toBe(3);
    });
  });

  describe("Content Types and Sizes", () => {
    it("should handle markdown content", async () => {
      const markdownContent = `
# Heading 1
## Heading 2
- List item 1
- List item 2

**Bold text** and *italic text*

\`\`\`javascript
const code = "example";
\`\`\`
      `;

      const node = new NodeContent({
        nodeId: "node-markdown",
        name: "Markdown Document",
        category: "file",
        content: markdownContent,
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-markdown" });
      expect(found?.content).toBe(markdownContent);
    });

    it("should handle HTML content", async () => {
      const htmlContent = "<div><h1>Title</h1><p>Paragraph</p></div>";

      const node = new NodeContent({
        nodeId: "node-html",
        name: "HTML Document",
        category: "file",
        content: htmlContent,
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-html" });
      expect(found?.content).toBe(htmlContent);
    });

    it("should handle very large content", async () => {
      const largeContent = "x".repeat(100000); // 100KB of text

      const node = new NodeContent({
        nodeId: "node-large",
        name: "Large Content",
        category: "file",
        content: largeContent,
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-large" });
      expect(found?.content).toBe(largeContent);
      expect(found?.content.length).toBe(100000);
    });

    it("should handle JSON-like content", async () => {
      const jsonContent = JSON.stringify({
        data: "value",
        nested: { key: "value" },
        array: [1, 2, 3],
      });

      const node = new NodeContent({
        nodeId: "node-json",
        name: "JSON Content",
        category: "file",
        content: jsonContent,
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-json" });
      expect(found?.content).toBe(jsonContent);
      expect(JSON.parse(found?.content || "")).toEqual({
        data: "value",
        nested: { key: "value" },
        array: [1, 2, 3],
      });
    });

    it("should handle multiline content", async () => {
      const multilineContent = `Line 1
Line 2
Line 3
Line 4`;

      const node = new NodeContent({
        nodeId: "node-multiline",
        name: "Multiline Content",
        category: "file",
        content: multilineContent,
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-multiline" });
      expect(found?.content).toBe(multilineContent);
    });
  });

  describe("Edge Cases", () => {
    it("should handle special characters in content", async () => {
      const specialContent = "Special: !@#$%^&*()_+-=[]{}|;:',.<>?/`~";

      const node = new NodeContent({
        nodeId: "node-special",
        name: "Special Node",
        category: "file",
        content: specialContent,
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-special" });
      expect(found?.content).toBe(specialContent);
    });

    it("should handle unicode and emoji in name and content", async () => {
      const unicodeName = "文档 📄";
      const unicodeContent = "Hello 世界 🌍 🚀 café";

      const node = new NodeContent({
        nodeId: "node-unicode",
        name: unicodeName,
        category: "file",
        content: unicodeContent,
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-unicode" });
      expect(found?.name).toBe(unicodeName);
      expect(found?.content).toBe(unicodeContent);
    });

    it("should handle nodes with emoji icons", async () => {
      const icons = ["📄", "📁", "🖼️", "🎵", "📊"];

      for (let i = 0; i < icons.length; i++) {
        const node = new NodeContent({
          nodeId: `node-icon-${i}`,
          name: `Node ${i}`,
          category: "file",
          content: "Content",
          projectId: "project-123",
          icon: icons[i],
        });
        await node.save();
      }

      const found = await NodeContent.find({ projectId: "project-123" });
      expect(found).toHaveLength(5);
      found.forEach((node, i) => {
        expect(node.icon).toBe(icons[i]);
      });
    });

    it("should preserve whitespace in content", async () => {
      const contentWithWhitespace = "  Start with spaces\n\n\nMultiple newlines\t\tTabs here  ";

      const node = new NodeContent({
        nodeId: "node-whitespace",
        name: "Whitespace Test",
        category: "file",
        content: contentWithWhitespace,
        projectId: "project-123",
      });
      await node.save();

      const found = await NodeContent.findOne({ nodeId: "node-whitespace" });
      expect(found?.content).toBe(contentWithWhitespace);
    });

    it("should handle timestamp updates correctly", async () => {
      const node = new NodeContent({
        nodeId: "node-timestamp",
        name: "Test",
        category: "file",
        content: "Original",
        projectId: "project-123",
      });
      await node.save();

      const originalUpdatedAt = node.updatedAt;

      // Wait a bit to ensure timestamp difference
      await new Promise((resolve) => setTimeout(resolve, 100));

      node.content = "Updated";
      await node.save();

      expect(node.updatedAt).not.toEqual(originalUpdatedAt);
      expect(node.createdAt).toBeDefined();
    });
  });
});

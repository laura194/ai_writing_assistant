import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

import NodeContentVersion from "./NodeContentVersion";

// Load env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Generate secure test encryption key
 */
const generateTestEncryptionKey = (): string =>
  crypto.randomBytes(32).toString("hex");

describe("NodeContentVersion Model", () => {
  let mongoServer: MongoMemoryServer;
  let testEncryptionKey: string;
  let originalEncryptionKey: string | undefined;
  let originalEncryptionEnabled: string | undefined;

  beforeAll(async () => {
    originalEncryptionKey = process.env.ENCRYPTION_KEY;
    originalEncryptionEnabled = process.env.ENCRYPTION_ENABLED;

    testEncryptionKey = generateTestEncryptionKey();
    process.env.ENCRYPTION_KEY = testEncryptionKey;
    process.env.ENCRYPTION_ENABLED = "true";

    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri());
  });

  afterAll(async () => {
    await mongoose.disconnect();
    await mongoServer.stop();

    originalEncryptionKey
      ? (process.env.ENCRYPTION_KEY = originalEncryptionKey)
      : delete process.env.ENCRYPTION_KEY;

    originalEncryptionEnabled
      ? (process.env.ENCRYPTION_ENABLED = originalEncryptionEnabled)
      : delete process.env.ENCRYPTION_ENABLED;
  });

  beforeEach(async () => {
    process.env.ENCRYPTION_ENABLED = "true";
    process.env.ENCRYPTION_KEY = testEncryptionKey;
    await NodeContentVersion.deleteMany({});
  });

  // ---------------------------------------------------------------------------
  // Schema Validation
  // ---------------------------------------------------------------------------

  describe("Schema Validation", () => {
    it("should create a valid node content version", async () => {
      const doc = await NodeContentVersion.create({
        nodeId: "node-1",
        projectId: "project-1",
        name: "Test File",
        content: "Hello World",
      });

      const found = await NodeContentVersion.findOne({ _id: doc._id });

      expect(found).toBeTruthy();
      expect(found?.nodeId).toBe("node-1");
      expect(found?.projectId).toBe("project-1");
      expect(found?.name).toBe("Test File");
      expect(found?.content).toBe("Hello World");
      expect(found?.category).toBe("file");
      expect(found?.createdAt).toBeInstanceOf(Date);
    });

    it("should fail without required nodeId", async () => {
      await expect(
        NodeContentVersion.create({
          projectId: "project-1",
          content: "data",
        }),
      ).rejects.toThrow(/nodeId.*required/i);
    });

    it("should fail without required projectId", async () => {
      await expect(
        NodeContentVersion.create({
          nodeId: "node-1",
          content: "data",
        }),
      ).rejects.toThrow(/projectId.*required/i);
    });

    it("should apply default values", async () => {
      const doc = await NodeContentVersion.create({
        nodeId: "node-1",
        projectId: "project-1",
      });

      const found = await NodeContentVersion.findOne({ _id: doc._id });

      expect(found?.name).toBe("");
      expect(found?.content).toBe("");
      expect(found?.category).toBe("file");
      expect(found?.meta).toEqual({});
      expect(found?.userId).toBeNull();
    });
  });

  // ---------------------------------------------------------------------------
  // Encryption
  // ---------------------------------------------------------------------------

  describe("Encryption", () => {
    it("should encrypt name and content in the database", async () => {
      const doc = await NodeContentVersion.create({
        nodeId: "n1",
        projectId: "p1",
        name: "Secret Name",
        content: "Secret Content",
      });

      const raw = await mongoose.connection
        .collection("nodecontentversions")
        .findOne({ _id: doc._id });

      expect(raw?.name).not.toBe("Secret Name");
      expect(raw?.content).not.toBe("Secret Content");
      expect(typeof raw?.name).toBe("string");
      expect(typeof raw?.content).toBe("string");
    });

    it("should decrypt fields when querying with findOne", async () => {
      const original = {
        nodeId: "n1",
        projectId: "p1",
        name: "Readable Name",
        content: "Readable Content",
      };

      const doc = await NodeContentVersion.create(original);
      const found = await NodeContentVersion.findOne({ _id: doc._id });

      expect(found?.name).toBe(original.name);
      expect(found?.content).toBe(original.content);
    });

    it("should decrypt fields when querying with find", async () => {
      await NodeContentVersion.create([
        {
          nodeId: "n1",
          projectId: "p1",
          name: "File A",
          content: "A",
        },
        {
          nodeId: "n1",
          projectId: "p1",
          name: "File B",
          content: "B",
        },
      ]);

      const found = await NodeContentVersion.find({ projectId: "p1" });

      expect(found).toHaveLength(2);
      expect(found[0].name).toBe("File A");
      expect(found[1].content).toBe("B");
    });

    it("should not encrypt when encryption is disabled", async () => {
      process.env.ENCRYPTION_ENABLED = "false";

      const doc = await NodeContentVersion.create({
        nodeId: "n1",
        projectId: "p1",
        name: "Plain Name",
        content: "Plain Content",
      });

      const raw = await mongoose.connection
        .collection("nodecontentversions")
        .findOne({ _id: doc._id });

      expect(raw?.name).toBe("Plain Name");
      expect(raw?.content).toBe("Plain Content");
    });

    it("should only encrypt modified fields on update", async () => {
      const doc = await NodeContentVersion.create({
        nodeId: "n1",
        projectId: "p1",
        name: "Original Name",
        content: "Original Content",
      });

      doc.name = "Updated Name";
      await doc.save();

      const found = await NodeContentVersion.findOne({ _id: doc._id });

      expect(found?.name).toBe("Updated Name");
      expect(found?.content).toBe("Original Content");
    });
  });

  // ---------------------------------------------------------------------------
  // Index & Query Behavior
  // ---------------------------------------------------------------------------

  describe("Indexes & Queries", () => {
    it("should retrieve latest version by nodeId + projectId", async () => {
      await NodeContentVersion.create({
        nodeId: "node-1",
        projectId: "project-1",
        content: "v1",
      });

      await NodeContentVersion.create({
        nodeId: "node-1",
        projectId: "project-1",
        content: "v2",
      });

      const latest = await NodeContentVersion.findOne({
        nodeId: "node-1",
        projectId: "project-1",
      }).sort({ createdAt: -1 });

      expect(latest?.content).toBe("v2");
    });
  });
});

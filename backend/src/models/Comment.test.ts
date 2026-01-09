import { describe, it, expect, beforeAll, afterAll, beforeEach } from "vitest";
import mongoose from "mongoose";
import crypto from "crypto";
import dotenv from "dotenv";
import path from "path";
import { MongoMemoryServer } from "mongodb-memory-server";

import Comment from "./Comment";

// Load env
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

/**
 * Generate secure test encryption key
 */
const generateTestEncryptionKey = (): string =>
  crypto.randomBytes(32).toString("hex");

describe("Comment Model", () => {
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
    await Comment.deleteMany({});
  });

  // ---------------------------------------------------------------------------
  // Schema Validation
  // ---------------------------------------------------------------------------

  describe("Schema Validation", () => {
    it("should create a valid comment", async () => {
      const doc = await Comment.create({
        projectId: new mongoose.Types.ObjectId(),
        username: "eileen",
        content: "Hello world",
      });

      const found = await Comment.findOne({ _id: doc._id });

      expect(found).toBeTruthy();
      expect(found?.username).toBe("eileen");
      expect(found?.content).toBe("Hello world");
      expect(found?.projectId).toBeInstanceOf(mongoose.Types.ObjectId);
      expect(found?.createdAt).toBeInstanceOf(Date);
      expect(found?.updatedAt).toBeInstanceOf(Date);
      expect(found?.date).toBeInstanceOf(Date);
    });

    it("should fail without required projectId", async () => {
      await expect(
        Comment.create({
          username: "alice",
          content: "text",
        }),
      ).rejects.toThrow(/projectId.*required/i);
    });

    it("should fail without required username", async () => {
      await expect(
        Comment.create({
          projectId: new mongoose.Types.ObjectId(),
          content: "text",
        }),
      ).rejects.toThrow(/username.*required/i);
    });

    it("should fail without required content", async () => {
      await expect(
        Comment.create({
          projectId: new mongoose.Types.ObjectId(),
          username: "alice",
        }),
      ).rejects.toThrow(/content.*required/i);
    });
  });

  // ---------------------------------------------------------------------------
  // Encryption
  // ---------------------------------------------------------------------------

  describe("Encryption", () => {
    it("should encrypt username and content in the database", async () => {
      const doc = await Comment.create({
        projectId: new mongoose.Types.ObjectId(),
        username: "secretUser",
        content: "Secret comment",
      });

      const coll: any = mongoose.connection.collection("comments");
      const raw = await coll.findOne({ _id: doc._id });

      expect(raw?.username).not.toBe("secretUser");
      expect(raw?.content).not.toBe("Secret comment");
      expect(typeof raw?.username).toBe("string");
      expect(typeof raw?.content).toBe("string");
    });

    it("should decrypt fields when querying with findOne", async () => {
      const original = {
        projectId: new mongoose.Types.ObjectId(),
        username: "bob",
        content: "Readable comment",
      };

      const doc = await Comment.create(original);
      const found = await Comment.findOne({ _id: doc._id });

      expect(found?.username).toBe(original.username);
      expect(found?.content).toBe(original.content);
    });

    it("should decrypt fields when querying with find", async () => {
      const projectId = new mongoose.Types.ObjectId();

      await Comment.create([
        {
          projectId,
          username: "alice",
          content: "First",
        },
        {
          projectId,
          username: "bob",
          content: "Second",
        },
      ]);

      const found = await Comment.find({ projectId });

      const usernames = found.map((c) => c.username).sort();
      const contents = found.map((c) => c.content).sort();

      expect(usernames).toEqual(["alice", "bob"]);
      expect(contents).toEqual(["First", "Second"]);
    });

    it("should not encrypt when encryption is disabled", async () => {
      process.env.ENCRYPTION_ENABLED = "false";

      const doc = await Comment.create({
        projectId: new mongoose.Types.ObjectId(),
        username: "plainUser",
        content: "plain text",
      });

      const coll: any = mongoose.connection.collection("comments");
      const raw = await coll.findOne({ _id: doc._id });

      expect(raw?.username).toBe("plainUser");
      expect(raw?.content).toBe("plain text");
    });

    it("should only encrypt modified fields on update", async () => {
      const doc = await Comment.create({
        projectId: new mongoose.Types.ObjectId(),
        username: "originalUser",
        content: "Original content",
      });

      doc.content = "Updated content";
      await doc.save();

      const found = await Comment.findOne({ _id: doc._id });

      expect(found?.username).toBe("originalUser");
      expect(found?.content).toBe("Updated content");
    });
  });
});

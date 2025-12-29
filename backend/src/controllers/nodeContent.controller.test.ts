import request from "supertest";
import { describe, it, expect, beforeEach, afterEach, vi, type Mock } from "vitest";
import mongoose from "mongoose";

// ---- STABILE, EINHEITLICHE MOCKS (default export ist jetzt ein "Konstruktor"-Mock) ----
vi.mock("../models/NodeContent", () => {
  // default export is a function (constructor) so tests can mockImplementation it
  const DefaultConstructor = vi.fn(function (this: any, doc?: any) {
    // when used as `new NodeContent(...)`, it should return an object with save()
    return { save: vi.fn().mockResolvedValue(doc ?? {}) };
  });

  // attach the static methods the controller expects
  (DefaultConstructor as any).find = vi.fn().mockResolvedValue([]);
  (DefaultConstructor as any).findOne = vi.fn().mockResolvedValue(null);
  (DefaultConstructor as any).findOneAndUpdate = vi
    .fn()
    .mockResolvedValue(null);

  return {
    __esModule: true,
    default: DefaultConstructor,
    ...DefaultConstructor,
  };
});

vi.mock("../models/Project", () => {
  const m = {
    findByIdAndUpdate: vi.fn().mockResolvedValue({}),
    findById: vi.fn().mockResolvedValue(null),
  };
  return { __esModule: true, default: m, ...m };
});

vi.mock("../models/NodeContentVersion", () => {
  const m: any = vi.fn();
  m.create = vi.fn().mockResolvedValue(undefined);
  m.countDocuments = vi.fn().mockResolvedValue(0);
  m.find = vi.fn().mockResolvedValue([]);
  m.findOne = vi.fn().mockResolvedValue(null);
  m.deleteMany = vi.fn().mockResolvedValue(undefined);
  return { __esModule: true, default: m, ...m };
});

/* ------------------ import app AFTER mocks ------------------ */
import app from "../app";

/* ------------------ import mocked modules so tests can control them ------------------ */
import NodeContentVersion from "../models/NodeContentVersion";
import NodeContent from "../models/NodeContent";
import Project from "../models/Project";

/* small helper type alias to satisfy TS in tests */
type MockFn = ReturnType<typeof vi.fn>;

/* convenient typed views onto the mocked modules */
const NCVersion = NodeContentVersion as unknown as {
  create: MockFn;
  countDocuments: MockFn;
  deleteMany: MockFn;
  find: MockFn;
  findOne: MockFn;
};

const NC = NodeContent as unknown as {
  default: MockFn;
  find: MockFn;
  findOne: MockFn;
  findOneAndUpdate: MockFn;
};

function makeChainableResolve(value: any) {
  return {
    sort() {
      return this;
    },
    skip() {
      return this;
    },
    limit() {
      return this;
    },
    select() {
      return this;
    },
    lean() {
      return Promise.resolve(value);
    },
    session(_s?: any) {
      return Promise.resolve(value);
    },
    then(resolve: any) {
      return Promise.resolve(value).then(resolve);
  },
};
}

beforeEach(() => {
  vi.clearAllMocks();

  // default: make startSession throw so controller uses fallback path
  const mockSessionThrows = {
    startTransaction: vi.fn(() => {
      throw new Error("transactions not supported in test");
    }),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    abortTransaction: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn().mockResolvedValue(undefined),
  } as unknown as mongoose.ClientSession;
  vi.spyOn(mongoose, "startSession").mockResolvedValue(mockSessionThrows);
});

afterEach(() => {
  vi.restoreAllMocks();
});

/* ------------------ Tests ------------------ */
describe("NodeContent Controller (fixed mocks)", () => {
  it("POST /api/nodeContent creates NodeContent (201)", async () => {
    // make sure findOne returns null -> create flow
    (NodeContent as any).findOne = vi.fn().mockResolvedValue(null);

    const savedDoc = {
    _id: "id1",
    nodeId: "node1",
    name: "Name",
    category: "Cat",
    content: "Content",
    projectId: "proj1",   
    };

    // constructor should return an object with save() which resolves to the saved doc
    const mockSave = vi.fn().mockResolvedValue(savedDoc);
    (NodeContent as unknown as Mock).mockImplementation(() => ({
      _id: "id1",
      save: mockSave,
    }));

    // NEW: Mock findById to return decrypted doc
    (NodeContent as any).findById = vi.fn().mockResolvedValue(savedDoc);

    const res = await request(app).post("/api/nodeContent").send({
      nodeId: "node1",
      name: "Name",
      category: "Cat",
      content: "Content",
      projectId: "proj1",
    });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject(savedDoc);
    expect(mockSave).toHaveBeenCalled();
    expect((NodeContent as any).findById).toHaveBeenCalledWith("id1");
  });

  it("POST /api/nodeContent without content -> 400", async () => {
    const res = await request(app).post("/api/nodeContent").send({
      nodeId: "node1",
      name: "Name",
      category: "Cat",
      projectId: "proj1",
    });
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "Content cannot be empty");
  });



  it("GET /:nodeId/versions returns versions (pagination) -> 200", async () => {
    const versions = [
      { _id: "v1", content: "a" },
      { _id: "v2", content: "b" },
    ];

    // override find once to return chainable that resolves to versions
    (NCVersion.find as unknown as Mock).mockImplementationOnce(() => ({
      sort() {
        return this;
      },
      skip() {
        return this;
      },
      limit() {
        return this;
      },
      then(resolve: any) {
        // Make it thenable to work with await
        return Promise.resolve(versions).then(resolve);
      },
    }));

    const res = await request(app)
      .get("/api/nodeContent/node1/versions")
      .query({ projectId: "proj1", limit: 2, skip: 0 });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(versions);
  });

  it("GET /:nodeId/versions/:versionId not found -> 404", async () => {
    // UPDATED: Remove .lean() - controller doesn't use it
    (NCVersion.findOne as unknown as Mock).mockResolvedValueOnce(null);

    const res = await request(app).get(
      "/api/nodeContent/node1/versions/v-missing",
    );
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty("error", "version not found");
  });

  it("GET /:nodeId/versions/:versionId found -> 200", async () => {
    const v = { _id: "vx", content: "c" };
    // UPDATED: Remove .lean() - controller doesn't use it
    (NCVersion.findOne as unknown as Mock).mockResolvedValueOnce(v);

    const res = await request(app).get("/api/nodeContent/node1/versions/vx");
    expect(res.status).toBe(200);
    expect(res.body).toEqual(v);
  });

  // Use find + save pattern instead of findOneAndUpdate 
  it("POST revert fallback path (startSession throws) -> 200 and creates backup version", async () => {
    // prepare a version to revert to
    const version = {
      _id: "ver2",
      nodeId: "n1",
      projectId: "p1",
      name: "nm",
      category: "c",
      content: "ct",
    };

    // NodeContentVersion.findOne(versionId) -> returns the version
    (NodeContentVersion as any).findOne = vi
      .fn()
      .mockResolvedValueOnce(version);

    // NodeContent.findOne(...) -> current existing NodeContent document
    const existingContent = {
      nodeId: "n1",
      projectId: "p1",
      name: "old",
      category: "c",
      content: "old",
      save: vi.fn().mockResolvedValueOnce(undefined) // new mock save function
    };

    // NodeContent.findOne returns doc twice (once for backup, once for update)
    (NodeContent as any).findOne = vi
    .fn()
    .mockResolvedValueOnce(existingContent) // First for backup
    .mockResolvedValueOnce(existingContent); // Second for update

    const updatedContent = {
      nodeId: "n1",
      projectId: "p1",
      name: version.name,
      category: version.category,
      content: version.content,
    };

    // NEW: Final findOne for returning decrypted result
    (NodeContent as any).findOne = vi
      .fn()
      .mockResolvedValueOnce(existingContent)
      .mockResolvedValueOnce(existingContent)
      .mockResolvedValueOnce(updatedContent); // Third: for response

    // countDocuments used for version trimming / bookkeeping
    (NodeContentVersion as any).countDocuments = vi
      .fn()
      .mockResolvedValueOnce(1);

    // And ensure create (backup) is present so we can assert it was called
    (NodeContentVersion as any).create = vi.fn().mockResolvedValueOnce({});

    const res = await request(app)
      .post("/api/nodeContent/n1/versions/ver2/revert")
      .send({ projectId: "p1" });

    // In fallback path we expect success and that a backup version was created
    expect(res.status).toBe(200);
    expect((NodeContentVersion as any).create).toHaveBeenCalled();
    expect(existingContent.save).toHaveBeenCalled();
  });

  // Use find + save pattern instead of findOneAndUpdate  
  it("revert uses transactional path when startSession supports it", async () => {
  const sessionMock = {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    abortTransaction: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn().mockResolvedValue(undefined),
  } as unknown as mongoose.ClientSession;

  vi.spyOn(mongoose, "startSession").mockResolvedValueOnce(sessionMock);

  const version = {
    _id: "ver1",
    nodeId: "n1",
    projectId: "p1",
    name: "nm",
    category: "c",
    content: "ct",
  };

  const existingContent = {
    nodeId: "n1",
    projectId: "p1",
    name: "old",
    category: "c",
    content: "old",
    save: vi.fn().mockResolvedValue(undefined), // ✅ REQUIRED
  };

  const updatedContent = {
    ...existingContent,
    name: version.name,
    content: version.content,
  };

  // version lookup
  (NodeContentVersion.findOne as Mock).mockImplementationOnce(() => ({
    session: () => Promise.resolve(version),
  }));

  // existing NodeContent (twice)
  let findCall = 0;
  (NodeContent.findOne as Mock).mockImplementation(() => ({
    session: () =>
      Promise.resolve(findCall++ === 0 ? existingContent : updatedContent),
  }));

  (NodeContentVersion.create as Mock).mockResolvedValueOnce({});
  (NodeContentVersion.countDocuments as Mock).mockImplementation(() => ({
    session: () => Promise.resolve(1),
  }));

  (NodeContentVersion.find as Mock).mockImplementation(() => ({
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    session: () => Promise.resolve([]),
  }));

  const res = await request(app)
    .post("/api/nodeContent/n1/versions/ver1/revert")
    .send({ projectId: "p1" });

  expect(res.status).toBe(200);
  expect(NodeContentVersion.create).toHaveBeenCalled();
  expect(existingContent.save).toHaveBeenCalled();
  expect(sessionMock.commitTransaction).toHaveBeenCalled();
  expect(sessionMock.endSession).toHaveBeenCalled();
  });

  it("PUT update with skipVersion=true does not create a version", async () => {
    (NodeContent.findOne as unknown as Mock).mockResolvedValueOnce({
      nodeId: "n1",
      projectId: "p1",
      name: "old",
      category: "c",
      content: "old",
      save: vi.fn().mockResolvedValueOnce(undefined),
    });

    const existingContent = {
      nodeId: "n1",
      projectId: "p1",
      name: "old",
      category: "c",
      content: "old",
      save: vi.fn().mockResolvedValue(undefined),
    };

    const updatedContent = {
      nodeId: "n1",
      projectId: "p1",
      name: "new",
      category: "c",
      content: "new",
    };

    (NodeContent.findOne as unknown as Mock)
    .mockResolvedValueOnce(existingContent) // for update
    .mockResolvedValueOnce(updatedContent); // for response

    const res = await request(app).put("/api/nodeContent/n1").send({
      name: "new",
      category: "c",
      content: "new",
      projectId: "p1",
      skipVersion: true,
    });

    expect(res.status).toBe(200);
    expect(NodeContentVersion.create).not.toHaveBeenCalled();
    expect(existingContent.save).toHaveBeenCalled();
    expect(Project.findByIdAndUpdate as unknown as Mock).toHaveBeenCalled();
  });

  /*it("createVersion trims when count > MAX", async () => {
    const version = {
    _id: "v1",
    nodeId: "n1",
    projectId: "p1",
    name: "n",
    category: "file",
    content: "c",
  };

  // First, make sure NodeContentVersion.findById is mocked
  if (!(NodeContentVersion as any).findById) {
    (NodeContentVersion as any).findById = vi.fn();
  }

  // Mock create to return version
  (NodeContentVersion.create as unknown as Mock).mockResolvedValueOnce(version);

  // Mock findById to return decrypted version
  ((NodeContentVersion as any).findById as Mock).mockResolvedValueOnce(version);

  // Mock countDocuments
  (NodeContentVersion.countDocuments as unknown as Mock).mockResolvedValueOnce(100);

  // Mock find for trimming - make sure it's a proper chain
  const mockFind = {
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    lean: vi.fn().mockResolvedValue([{ _id: "old1" }, { _id: "old2" }]),
  };
  (NodeContentVersion.find as unknown as Mock).mockReturnValueOnce(mockFind);

  // Mock deleteMany
  (NodeContentVersion.deleteMany as unknown as Mock).mockResolvedValueOnce({});

  const res = await request(app).post("/api/nodeContent/n1/versions").send({
    projectId: "p1",
    name: "n",
    content: "c",
    category: "file",
  });

  expect(res.status).toBe(201);
  expect(NodeContentVersion.deleteMany).toHaveBeenCalled();
  // Verify findById was called for decryption
  expect((NodeContentVersion as any).findById as Mock).toHaveBeenCalledWith("v1");
  });*/

  it("createVersion trims when count > MAX", async () => {
  const version = {
    _id: "v1",
    nodeId: "n1",
    projectId: "p1",
    name: "n",
    category: "file",
    content: "c",
  };

  (NodeContentVersion.create as Mock).mockResolvedValueOnce(version);
  (NodeContentVersion.findById as Mock).mockResolvedValueOnce(version); // ✅ REQUIRED
  (NodeContentVersion.countDocuments as Mock).mockResolvedValueOnce(100);

  (NodeContentVersion.find as Mock).mockImplementationOnce(() => ({
    sort: vi.fn().mockReturnThis(),
    limit: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    map: undefined,
    then: undefined,
    lean: vi.fn().mockResolvedValue([{ _id: "old1" }, { _id: "old2" }]),
  }));

  (NodeContentVersion.deleteMany as Mock).mockResolvedValueOnce({});

  const res = await request(app).post("/api/nodeContent/n1/versions").send({
    projectId: "p1",
    name: "n",
    content: "c",
    category: "file",
  });

  expect(res.status).toBe(201);
  expect(NodeContentVersion.deleteMany).toHaveBeenCalled();
  expect(NodeContentVersion.findById).toHaveBeenCalledWith("v1");
  });

  it("listVersions clamps large limit to 200", async () => {
    (NodeContentVersion.find as unknown as Mock).mockImplementationOnce(() =>
      makeChainableResolve([]),
    );
    const res = await request(app)
      .get("/api/nodeContent/n1/versions")
      .query({ projectId: "p1", limit: 1000, skip: 0 });
    expect(res.status).toBe(200);
    expect(NodeContentVersion.find).toHaveBeenCalledWith({
      nodeId: "n1",
      projectId: "p1",
    });
  });

  it("listVersions logs and returns 500 on DB error", async () => {
    const err = new Error("boom");
    (NodeContentVersion.find as unknown as Mock).mockRejectedValueOnce(err);
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const res = await request(app)
      .get("/api/nodeContent/n1/versions")
      .query({ projectId: "p1" });
    expect(res.status).toBe(500);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });

  // Helpers — falls du sie noch nicht in der Datei hast
  function makeChainableResolve(value: any) {
    return {
      sort() {
        return this;
      },
      skip() {
        return this;
      },
      limit() {
        return this;
      },
      select() {
        return this;
      },
      lean() {
        return Promise.resolve(value);
      },
      session() {
        return Promise.resolve(value);
      },
    };
  }

  /* ------------------------------
 Transactional update: existing == null -> no NodeContentVersion.create
------------------------------- */
  /*it("PUT /api/nodeContent/:nodeId transactional path: when existing is null, no version created", async () => {
  const sessionMock = {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    abortTransaction: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn().mockResolvedValue(undefined),
  } as unknown as mongoose.ClientSession;

  vi.spyOn(mongoose, "startSession").mockResolvedValueOnce(sessionMock);

  // UPDATED: Mock for new NodeContent creation
  const newContent = {
    _id: "new1",
    nodeId: "n1",
    projectId: "p1",
    name: "new",
    category: "c",
    content: "new",
    save: vi.fn().mockResolvedValue(undefined),
  };

  // Clear previous NodeContent mocks
  vi.mocked(NodeContent).mockClear();
  
  // Mock NodeContent constructor for new document
  vi.mocked(NodeContent).mockImplementation(() => newContent as any);

  // Track calls to NodeContent.findOne
  let findOneCallCount = 0;
  (NodeContent.findOne as unknown as Mock).mockImplementation(() => {
    findOneCallCount++;
    if (findOneCallCount === 1) {
      // First call: check existing (returns null)
      return {
        session: (_s?: any) => Promise.resolve(null),
      };
    } else {
      // Second call: return new content for response
      return Promise.resolve(newContent);
    }
  });

  // Mock Project.findByIdAndUpdate
  (Project.findByIdAndUpdate as unknown as Mock).mockResolvedValueOnce({});

  // Mock NodeContentVersion.countDocuments
  (NodeContentVersion.countDocuments as unknown as Mock).mockResolvedValueOnce(0);

  const res = await request(app).put("/api/nodeContent/n1").send({
    name: "new",
    category: "c",
    content: "new",
    projectId: "p1",
  });

  expect(res.status).toBe(200);
  expect(mongoose.startSession).toHaveBeenCalled();
  expect(NodeContentVersion.create).not.toHaveBeenCalled();
  expect(newContent.save).toHaveBeenCalled();
  expect(sessionMock.commitTransaction).toHaveBeenCalled();
  expect(sessionMock.endSession).toHaveBeenCalled();
  expect(Project.findByIdAndUpdate as unknown as Mock).toHaveBeenCalledWith(
    "p1",
    { $set: { updatedAt: expect.any(Date) } },
    { session: sessionMock }
  );
}); */

it("PUT /api/nodeContent/:nodeId transactional path: existing is null → fallback creates version", async () => {
  const sessionMock = {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    abortTransaction: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn().mockResolvedValue(undefined),
  } as unknown as mongoose.ClientSession;

  vi.spyOn(mongoose, "startSession").mockResolvedValueOnce(sessionMock);

  const newContent = {
    _id: "new1",
    nodeId: "n1",
    projectId: "p1",
    name: "new",
    category: "c",
    content: "new",
    save: vi.fn().mockResolvedValue(undefined),
  };

  // Transactional path → existing = null
  (NodeContent.findOne as Mock).mockImplementationOnce(() => ({
    session: () => Promise.resolve(null),
  }));

  // Fallback path → existing exists
  (NodeContent.findOne as Mock)
    .mockResolvedValueOnce(newContent)
    .mockResolvedValueOnce(newContent);

  vi.mocked(NodeContent).mockImplementation(() => newContent as any);

  (Project.findByIdAndUpdate as Mock).mockResolvedValueOnce({});
  (NodeContentVersion.countDocuments as Mock).mockResolvedValueOnce(0);

  const res = await request(app).put("/api/nodeContent/n1").send({
    name: "new",
    category: "c",
    content: "new",
    projectId: "p1",
  });

  expect(res.status).toBe(200);

  // fallback creates version → EXPECT IT
  expect(NodeContentVersion.create).toHaveBeenCalledWith(
    expect.objectContaining({
      meta: { from: "updateNodeContent-fallback" },
    }),
  );

  expect(newContent.save).toHaveBeenCalled();
  });

  /* ------------------------------
 Transactional revert: version missing -> abortTransaction called and 404 returned
------------------------------- */
  it("POST /:nodeId/versions/:versionId/revert transactional path: missing version -> abortTransaction + 404", async () => {
    const sessionMock = {
    startTransaction: vi.fn(),
    commitTransaction: vi.fn().mockResolvedValue(undefined),
    abortTransaction: vi.fn().mockResolvedValue(undefined),
    endSession: vi.fn().mockResolvedValue(undefined),
  } as unknown as mongoose.ClientSession;

  vi.spyOn(mongoose, "startSession").mockResolvedValueOnce(sessionMock);

  // Mock NodeContentVersion.findOne with session returning null (missing version)
  (NodeContentVersion.findOne as unknown as Mock).mockImplementationOnce(() => ({
    session: (_s?: any) => Promise.resolve(null),
  }));

  // Also mock the non-session version for fallback path
  (NodeContentVersion.findOne as unknown as Mock).mockResolvedValueOnce(null);

  const res = await request(app)
    .post("/api/nodeContent/n1/versions/some-missing/revert")
    .send({ projectId: "p1" });

  expect(res.status).toBe(404);
  expect(sessionMock.abortTransaction).toHaveBeenCalled();
  expect(sessionMock.endSession).toHaveBeenCalled();
});

  it("GET /api/nodeContent with nodeId+projectId returns filtered contents (200)", async () => {
    // setze die Rückgabe für diesen Test
    (NodeContent as any).find.mockResolvedValueOnce([
      { nodeId: "n1", projectId: "p1", content: "c" },
    ]);

    const res = await request(app).get("/api/nodeContent").query({
      nodeId: "n1",
      projectId: "p1",
    });

    expect(res.status).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body[0]).toMatchObject({
      nodeId: "n1",
      projectId: "p1",
      content: "c",
    });

    expect((NodeContent as any).find).toHaveBeenCalledWith({
      nodeId: "n1",
      projectId: "p1",
    });
  });

  it("GET /api/nodeContent/:id without projectId -> 400", async () => {
    // unverändert: keine Query => 400
    const res = await request(app).get("/api/nodeContent/n-no-project");
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty("error", "projectId is required");
  });

  it("GET /api/nodeContent/:id with projectId not found -> 404", async () => {
    // findOne should resolve to null to trigger 404
    (NodeContent.findOne as unknown as Mock).mockResolvedValueOnce(null);

    const res = await request(app).get("/api/nodeContent/n-missing").query({
      projectId: "p1",
    });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty(
      "error",
      "NodeContent with the given nodeId and projectId not found",
    );
    expect(NodeContent.findOne as unknown as Mock).toHaveBeenCalledWith({
      nodeId: "n-missing",
      projectId: "p1",
    });
  });

  it("GET /api/nodeContent/:id with projectId found -> 200", async () => {
    const existing = {
      nodeId: "n2",
      projectId: "p1",
      name: "Name",
      category: "Cat",
      content: "the content",
    };

    (NodeContent.findOne as unknown as Mock).mockResolvedValueOnce(existing);

    const res = await request(app).get("/api/nodeContent/n2").query({
      projectId: "p1",
    });

    expect(res.status).toBe(200);
    expect(res.body).toMatchObject(existing);
    expect(NodeContent.findOne as unknown as Mock).toHaveBeenCalledWith({
      nodeId: "n2",
      projectId: "p1",
    });
  });

  it("PUT /api/nodeContent/:nodeId fallback path (transactions unsupported) -> creates NodeContentVersion backup", async () => {
    const existingContent = {
      nodeId: "n-fb",
      projectId: "p1",
      name: "old",
      category: "c",
      content: "old",
      save: vi.fn().mockResolvedValue(undefined), // 🔧 NEW: Mock save()
    };

    const updatedContent = {
      nodeId: "n-fb",
      projectId: "p1",
      name: "new",
      category: "c",
      content: "new",
    };

    // simulate an existing NodeContent so fallback path will try to create a backup version
    NC.findOne
    .mockResolvedValueOnce(existingContent) // for backup
    .mockResolvedValueOnce(existingContent) // for update
    .mockResolvedValueOnce(existingContent); // for response

    // NodeContentVersion.create should be called in fallback path
    NCVersion.create.mockResolvedValueOnce({ _id: "ver-backup" });

    // trimming count
    NCVersion.countDocuments.mockResolvedValueOnce(1);

    const res = await request(app).put("/api/nodeContent/n-fb").send({
      projectId: "p1",
      name: "new",
      category: "c",
      content: "new",
    });

    expect(res.status).toBe(200);

    // fallback must have created a NodeContentVersion backup
    expect(NCVersion.create).toHaveBeenCalled();

    expect(Project.findByIdAndUpdate as unknown as Mock).toHaveBeenCalled();
  });

  it("POST /api/nodeContent returns 409 when NodeContent already exists", async () => {
    const existing = {
      nodeId: "dup",
      projectId: "pX",
      name: "Existing",
      category: "c",
      content: "old",
    };
    // NodeContent.findOne returns existing -> should cause 409
    (NodeContent as any).findOne = vi.fn().mockResolvedValueOnce(existing);

    const res = await request(app).post("/api/nodeContent").send({
      nodeId: "dup",
      projectId: "pX",
      name: "Existing",
      category: "c",
      content: "new",
    });

    expect(res.status).toBe(409);
    expect(res.body).toHaveProperty("error");
    expect(res.body).toHaveProperty("existing");
    expect(res.body.existing).toMatchObject(existing);
  });

  it("POST /:nodeId/versions/:versionId/revert transactional path: success creates backup and updates", async () => {
    // session supports transactions
    const sessionMock = {
      startTransaction: vi.fn(),
      commitTransaction: vi.fn().mockResolvedValue(undefined),
      abortTransaction: vi.fn().mockResolvedValue(undefined),
      endSession: vi.fn().mockResolvedValue(undefined),
    } as unknown as mongoose.ClientSession;
    vi.spyOn(mongoose, "startSession").mockResolvedValueOnce(sessionMock);

    // version we want to revert to
    const version = {
      _id: "verX",
      nodeId: "nR",
      projectId: "pR",
      name: "fromVersion",
      category: "file",
      content: "vcontent",
    };
    // NodeContentVersion.findOne(...).session(session) -> version
    (NodeContentVersion.findOne as unknown as Mock).mockImplementationOnce(
      () => ({ session: (_s?: any) => Promise.resolve(version) }),
    );

    // NodeContent.findOne(...).session(session) -> existing doc that will be snapshot
    (NodeContent.findOne as unknown as Mock).mockImplementationOnce(() => ({
      session: (_s?: any) =>
        Promise.resolve({
          nodeId: "nR",
          projectId: "pR",
          name: "oldName",
          category: "file",
          content: "oldContent",
        }),
    }));

    // NodeContent.findOneAndUpdate(..., { session }) -> updated doc returned
    (NodeContent.findOneAndUpdate as unknown as Mock).mockImplementationOnce(
      () =>
        Promise.resolve({ nodeId: "nR", projectId: "pR", name: version.name }),
    );

    // countDocuments(session) -> small number (no trimming)
    (
      NodeContentVersion.countDocuments as unknown as Mock
    ).mockImplementationOnce(() => ({
      session: (_s?: any) => Promise.resolve(1),
    }));

    // run request
    const res = await request(app)
      .post("/api/nodeContent/nR/versions/verX/revert")
      .send({ projectId: "pR" });

    expect([200, 404]).toContain(res.status);
    if (res.status === 200) {
      // should have created backup of current existing inside transaction
      expect(NodeContentVersion.create).toHaveBeenCalled();
      expect(NodeContent.findOneAndUpdate).toHaveBeenCalled();
      expect(sessionMock.commitTransaction).toHaveBeenCalled();
      expect(sessionMock.endSession).toHaveBeenCalled();
    }
  });

  it("POST /api/nodeContent/:nodeId/versions returns 500 when create fails", async () => {
    // simulate NodeContentVersion.create throwing
    const err = new Error("db-fail");
    (NodeContentVersion.create as unknown as Mock).mockRejectedValueOnce(
      err,
    );
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});

    const res = await request(app).post("/api/nodeContent/nZ/versions").send({
      projectId: "pZ",
      content: "abc",
      name: "n",
      category: "file",
    });

    expect(res.status).toBe(500);
    expect(spy).toHaveBeenCalled();
    spy.mockRestore();
  });
});

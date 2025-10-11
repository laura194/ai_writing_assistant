import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import type { Mocked } from "vitest";
import axios, { AxiosResponse } from "axios";
import { NodeContentService } from "./NodeContentService";
import type { Node } from "./types";

vi.mock("axios");
const mockedAxios = axios as Mocked<typeof axios>;
const BASE_URL = "http://localhost:5001";

function makeAxiosResponse<T>(data: T): AxiosResponse<T> {
  return {
    data,
    status: 200,
    statusText: "OK",
    headers: {},
    config: {},
  } as unknown as AxiosResponse<T>;
}

describe("NodeContentService", () => {
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;

  beforeEach(() => {
    vi.resetAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    consoleErrorSpy.mockRestore();
  });

  // -----------------------------
  // createNodeContent
  // -----------------------------
  it("creates node content successfully", async () => {
    const input: Omit<Node, "id"> = {
      nodeId: "n1",
      name: "TestNode",
      projectId: "p1",
      content: "Hello",
      category: "file",
    };
    const created: Node = { id: "1", ...input };
    mockedAxios.post.mockResolvedValueOnce(makeAxiosResponse(created));

    const result = await NodeContentService.createNodeContent(input);
    expect(result).toEqual(created);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${BASE_URL}/api/nodeContent`,
      input,
    );
  });

  it("uses default content and category if not provided", async () => {
    const input: Omit<Node, "id"> = {
      nodeId: "n2",
      name: "NoDefaults",
      projectId: "p2",
    };
    const created: Node = {
      id: "2",
      ...input,
      content: "...",
      category: "file",
    };
    mockedAxios.post.mockResolvedValueOnce(makeAxiosResponse(created));

    const result = await NodeContentService.createNodeContent(input);
    expect(result.content).toBe("...");
    expect(result.category).toBe("file");
  });

  it("logs error when createNodeContent fails", async () => {
    const input: Omit<Node, "id"> = {
      nodeId: "n3",
      name: "Fail",
      projectId: "p3",
    };
    const error = new Error("Network Error");
    mockedAxios.post.mockRejectedValueOnce(error);

    await expect(NodeContentService.createNodeContent(input)).rejects.toThrow(
      error,
    );
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // -----------------------------
  // getNodeContents
  // -----------------------------
  it("fetches node contents successfully with filters", async () => {
    const nodes: Node[] = [
      {
        id: "1",
        nodeId: "n1",
        name: "A",
        projectId: "p1",
        content: "x",
        category: "file",
      },
    ];
    mockedAxios.get.mockResolvedValueOnce(makeAxiosResponse(nodes));

    const result = await NodeContentService.getNodeContents("n1", "p1");
    expect(result).toEqual(nodes);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BASE_URL}/api/nodeContent`,
      {
        params: { nodeId: "n1", projectId: "p1" },
      },
    );
  });

  it("logs error when getNodeContents fails", async () => {
    const error = new Error("Failed");
    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(NodeContentService.getNodeContents()).rejects.toThrow(error);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // -----------------------------
  // getNodeContentById
  // -----------------------------
  it("fetches node content by id", async () => {
    const node: Node = {
      id: "1",
      nodeId: "n1",
      name: "A",
      projectId: "p1",
      content: "x",
      category: "file",
    };
    mockedAxios.get.mockResolvedValueOnce(makeAxiosResponse(node));

    const result = await NodeContentService.getNodeContentById("n1", "p1");
    expect(result).toEqual(node);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BASE_URL}/api/nodeContent/n1?projectId=p1`,
    );
  });

  it("logs error when getNodeContentById fails", async () => {
    const error = new Error("Failed");
    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(
      NodeContentService.getNodeContentById("n1", "p1"),
    ).rejects.toThrow(error);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // -----------------------------
  // getOrCreateNodeContent
  // -----------------------------
  it("returns existing node if found", async () => {
    const node: Node = {
      id: "1",
      nodeId: "n1",
      name: "A",
      projectId: "p1",
      content: "x",
      category: "file",
    };
    mockedAxios.get.mockResolvedValueOnce(makeAxiosResponse([node]));

    const result = await NodeContentService.getOrCreateNodeContent({
      id: "n1",
      name: "A",
      projectId: "p1",
    });
    expect(result).toEqual(node);
  });

  it("creates new node if not found", async () => {
    mockedAxios.get.mockResolvedValueOnce(makeAxiosResponse([]));
    const createdNode: Node = {
      id: "2",
      nodeId: "n2",
      name: "B",
      projectId: "p2",
      content: "",
      category: "file",
    };
    mockedAxios.post.mockResolvedValueOnce(makeAxiosResponse(createdNode));

    const result = await NodeContentService.getOrCreateNodeContent({
      id: "n2",
      name: "B",
      projectId: "p2",
    });
    expect(result).toEqual(createdNode);
  });

  it("logs error when getOrCreateNodeContent fails", async () => {
    const error = new Error("Fail");
    mockedAxios.get.mockRejectedValueOnce(error);

    await expect(
      NodeContentService.getOrCreateNodeContent({
        id: "x",
        name: "Y",
        projectId: "p3",
      }),
    ).rejects.toThrow(error);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  // -----------------------------
  // updateNodeContent
  // -----------------------------
  it("updates node content successfully", async () => {
    const updated: Node = {
      id: "1",
      nodeId: "n1",
      name: "Updated",
      projectId: "p1",
      content: "new",
      category: "file",
    };
    mockedAxios.put.mockResolvedValueOnce(makeAxiosResponse(updated));

    const result = await NodeContentService.updateNodeContent("n1", {
      projectId: "p1",
      content: "new",
      name: "Updated",
    });
    expect(result).toEqual(updated);
    expect(mockedAxios.put).toHaveBeenCalledWith(
      `${BASE_URL}/api/nodeContent/n1`,
      {
        projectId: "p1",
        content: "new",
        name: "Updated",
        category: "file",
      },
    );
  });

  it("uses default content/category if not provided when updating", async () => {
    const updated: Node = {
      id: "1",
      nodeId: "n1",
      name: "Updated",
      projectId: "p1",
      content: "...",
      category: "file",
    };
    mockedAxios.put.mockResolvedValueOnce(makeAxiosResponse(updated));

    const result = await NodeContentService.updateNodeContent("n1", {
      projectId: "p1",
      name: "Updated",
    });
    expect(result.content).toBe("...");
    expect(result.category).toBe("file");
  });

  it("logs error when updateNodeContent fails", async () => {
    const error = new Error("Fail");
    mockedAxios.put.mockRejectedValueOnce(error);

    await expect(
      NodeContentService.updateNodeContent("n1", {
        projectId: "p1",
        name: "X",
      }),
    ).rejects.toThrow(error);
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("createContentVersion posts a new version and returns result", async () => {
    const nodeId = "nV1";
    const projectId = "pV1";
    const content = "version-content";
    const name = "vname";
    const category = "file";

    const createdVersion = {
      _id: "ver1",
      nodeId,
      projectId,
      content,
      name,
      category,
    };
    mockedAxios.post.mockResolvedValueOnce(makeAxiosResponse(createdVersion));

    const res = await NodeContentService.createContentVersion(
      nodeId,
      projectId,
      content,
      name,
      category,
    );
    expect(res).toEqual(createdVersion);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${BASE_URL}/api/nodeContent/${nodeId}/versions`,
      { projectId, content, name, category },
    );
  });

  it("getContentVersions fetches versions with params (limit/skip)", async () => {
    const nodeId = "nV2";
    const projectId = "pV2";
    const versions = [{ _id: "v1" }, { _id: "v2" }];
    mockedAxios.get.mockResolvedValueOnce(makeAxiosResponse(versions));

    const res = await NodeContentService.getContentVersions(nodeId, projectId, {
      limit: 10,
      skip: 5,
    });
    expect(res).toEqual(versions);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BASE_URL}/api/nodeContent/${nodeId}/versions`,
      { params: { projectId, limit: 10, skip: 5 } },
    );
  });

  it("getContentVersion fetches a single version by id", async () => {
    const nodeId = "nV3";
    const versionId = "verX";
    const version = { _id: versionId, content: "abc" };
    mockedAxios.get.mockResolvedValueOnce(makeAxiosResponse(version));

    const res = await NodeContentService.getContentVersion(nodeId, versionId);
    expect(res).toEqual(version);
    expect(mockedAxios.get).toHaveBeenCalledWith(
      `${BASE_URL}/api/nodeContent/${nodeId}/versions/${versionId}`,
    );
  });

  it("revertToVersion posts revert request and returns result", async () => {
    const nodeId = "nR1";
    const versionId = "verR";
    const projectId = "pR1";
    const updated = { nodeId, projectId, content: "reverted-content" };
    mockedAxios.post.mockResolvedValueOnce(makeAxiosResponse(updated));

    const res = await NodeContentService.revertToVersion(
      nodeId,
      versionId,
      projectId,
    );
    expect(res).toEqual(updated);
    expect(mockedAxios.post).toHaveBeenCalledWith(
      `${BASE_URL}/api/nodeContent/${nodeId}/versions/${versionId}/revert`,
      { projectId },
    );
  });
});

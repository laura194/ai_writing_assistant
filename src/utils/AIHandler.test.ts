import { describe, it, expect, beforeEach, vi } from "vitest";
import { fetchAIResponse, createAIProtocolEntry } from "./AIHandler";
import type { IAiProtocolEntry } from "../models/IAITypes";

describe("AI client helpers", () => {
  const realFetch = globalThis.fetch;
  let consoleErrorSpy: ReturnType<typeof vi.spyOn>;
  const BASE_URL = "http://localhost:5001";

  beforeEach(() => {
    // Mock fetch for each test
    (globalThis as any).fetch = vi.fn();
    vi.clearAllMocks();
    consoleErrorSpy = vi.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    (globalThis as any).fetch = realFetch;
    consoleErrorSpy.mockRestore();
  });

  it("fetchAIResponse - returns candidate text, modelVersion and usageMetadata when present", async () => {
    const mockJson = {
      candidates: [{ content: { parts: [{ text: "Hallo vom Model" }] } }],
      modelVersion: "gemini-v1",
      usageMetadata: {
        promptTokenCount: 1,
        candidatesTokenCount: 2,
        totalTokenCount: 3,
      },
    };
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => mockJson,
    });

    const res = await fetchAIResponse("foo prompt");

    expect(res.text).toBe("Hallo vom Model");
    expect(res.modelVersion).toBe("gemini-v1");
    expect(res.usageMetadata).toEqual(mockJson.usageMetadata);

    // ensure request shape is correct
    expect(fetch).toHaveBeenCalledTimes(1);
    const [calledUrl, calledInit] = (fetch as any).mock.calls[0];
    expect(typeof calledUrl).toBe("string");
    expect(calledInit.method).toBe("POST");
    expect(calledInit.headers["Content-Type"]).toBe("application/json");
    const body = JSON.parse(calledInit.body);
    expect(body.contents?.[0]?.parts?.[0]?.text).toBe("foo prompt");
  });

  it("fetchAIResponse - returns default message when no candidates present", async () => {
    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({}),
    });

    const res = await fetchAIResponse("anything");

    expect(res.text).toBe("Keine Antwort erhalten.");
  });

  it("fetchAIResponse - handles non-ok response and returns error text", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      status: 400,
      statusText: "Bad Request",
      json: async () => ({ message: "bad" }),
    });

    const res = await fetchAIResponse("broke me");

    expect(res.text).toBe("An error occurred while making the request..");
    // error should be logged
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("fetchAIResponse - handles fetch throwing (network error) and returns error text", async () => {
    (fetch as any).mockRejectedValue(new Error("network down"));

    const res = await fetchAIResponse("ping");

    expect(res.text).toBe("An error occurred while making the request..");
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("createAIProtocolEntry - posts entry and succeeds when server returns ok", async () => {
    const entry: IAiProtocolEntry = {
      aiName: "X",
      usageForm: "text",
      affectedParts: "parts",
      remarks: "r",
      projectId: "p1",
    };

    (fetch as any).mockResolvedValue({
      ok: true,
      json: async () => ({ success: true }),
    });

    await expect(createAIProtocolEntry(entry)).resolves.toBeUndefined();

    expect(fetch).toHaveBeenCalledTimes(1);
    const [url, init] = (fetch as any).mock.calls[0];
    expect(url).toBe(`${BASE_URL}/api/ai/aiProtocol`);
    expect(init.method).toBe("POST");
    expect(init.headers["Content-Type"]).toBe("application/json");
    expect(JSON.parse(init.body)).toMatchObject(entry);
  });

  it("createAIProtocolEntry - logs error when server responds non-ok with error body", async () => {
    (fetch as any).mockResolvedValue({
      ok: false,
      json: async () => ({ error: "validation failed" }),
    });

    const entry: IAiProtocolEntry = {
      aiName: "X",
      usageForm: "text",
      affectedParts: "parts",
      remarks: "r",
      projectId: "p1",
    };

    await expect(createAIProtocolEntry(entry)).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });

  it("createAIProtocolEntry - handles fetch throwing and logs error", async () => {
    (fetch as any).mockRejectedValue(new Error("network"));

    const entry: IAiProtocolEntry = {
      aiName: "X",
      usageForm: "text",
      affectedParts: "parts",
      remarks: "r",
      projectId: "p1",
    };

    await expect(createAIProtocolEntry(entry)).resolves.toBeUndefined();
    expect(consoleErrorSpy).toHaveBeenCalled();
  });
});

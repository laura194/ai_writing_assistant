import { describe, it, expect, beforeAll, afterAll, vi } from "vitest";

describe("index.ts Serverstart", () => {
  let listenMock: ReturnType<typeof vi.fn>;
  let appModule: any;

  beforeAll(async () => {
    // app.ts dynamisch importieren
    appModule = await import("./app");

    // listen-Methode mocken
    listenMock = vi.fn((port, cb) => {
      if (cb) cb();
      return {} as any;
    });

    (appModule.default.listen as unknown) = listenMock;

    // console.log mocken
    vi.spyOn(console, "log").mockImplementation(() => {});

    // index.ts importieren (dadurch wird app.listen aufgerufen)
    await import("./index");
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("sollte app.listen mit dem richtigen Port aufrufen", () => {
    expect(listenMock).toHaveBeenCalledTimes(1);
    expect(listenMock).toHaveBeenCalledWith(5001, expect.any(Function));
    expect(console.log).toHaveBeenCalledWith(
      "Server is running on http://localhost:5001",
    );
  });
});

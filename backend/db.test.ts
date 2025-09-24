import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";

// Mongoose mocken
vi.mock("mongoose", () => ({
  connect: vi.fn().mockResolvedValue({}),
}));

// dotenv mocken
vi.mock("dotenv", () => ({
  config: vi.fn(),
}));

// path mocken, damit dotenv config funktioniert
vi.mock("path", () => ({
  resolve: (...args: string[]) => args.join("/"),
}));

describe("connectDB", () => {
  let connectDB: any;
  let mongoose: any;

  beforeAll(async () => {
    mongoose = await import("mongoose");
    connectDB = (await import("./src/db")).default;
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  it("sollte mongoose.connect mit MONGO_URI aufrufen und Erfolg loggen", async () => {
    process.env.MONGO_URI = "mongodb://root:example@localhost:27017/testdb";

    const consoleLogMock = vi
      .spyOn(console, "log")
      .mockImplementation(() => {});

    await connectDB();

    expect(mongoose.connect).toHaveBeenCalledTimes(1);
    expect(mongoose.connect).toHaveBeenCalledWith(
      "mongodb://root:example@localhost:27017/testdb",
      { authSource: "admin" },
    );
    expect(consoleLogMock).toHaveBeenCalledWith("MongoDB verbunden");

    consoleLogMock.mockRestore();
  });

  it("sollte Fehler beim Connect catchen und loggen", async () => {
    const error = new Error("Verbindungsfehler");
    mongoose.connect.mockRejectedValueOnce(error);

    const consoleErrorMock = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});

    await connectDB();

    expect(consoleErrorMock).toHaveBeenCalledTimes(1);
    expect(consoleErrorMock).toHaveBeenCalledWith("MongoDB Fehler:", error);

    consoleErrorMock.mockRestore();
  });
});

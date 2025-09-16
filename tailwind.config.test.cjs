import config from "./tailwind.config.cjs";

describe("Tailwind Config", () => {
  test("should have correct content paths", () => {
    expect(config.content).toEqual([
      "./index.html",
      "./src/**/*.{js,jsx,ts,tsx}",
    ]);
  });

  test("should have correct darkMode configuration", () => {
    expect(config.darkMode).toEqual(["selector", '[data-theme="dark"]']);
  });

  test("should have an extend object in theme", () => {
    expect(config.theme).toHaveProperty("extend");
    expect(config.theme.extend).toEqual({});
  });

  test("should have plugins array", () => {
    expect(config.plugins).toEqual([]);
  });
});

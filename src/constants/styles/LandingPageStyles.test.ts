import { describe, it, expect } from "vitest";
import { LandingPageStyles } from "./LandingPageStyles";

describe("LandingPageStyles", () => {
  it("exports an object with expected keys", () => {
    expect(LandingPageStyles).toBeDefined();
    expect(typeof LandingPageStyles).toBe("object");

    const expectedKeys = [
      "paddingX",
      "paddingY",
      "padding",
      "heroHeadText",
      "heroSubText",
      "sectionHeadText",
      "sectionSubText",
    ];

    expectedKeys.forEach((k) => {
      // @ts-ignore
      expect(LandingPageStyles[k]).toBeDefined();
      // @ts-ignore
      expect(typeof LandingPageStyles[k]).toBe("string");
      // simple sanity-check: not empty
      // @ts-ignore
      expect(LandingPageStyles[k].length).toBeGreaterThan(0);
    });
  });

  it("contains tailwind-like classes in a couple of keys", () => {
    expect(LandingPageStyles.paddingX).toMatch(/px|sm:|md:|lg:/);
    expect(LandingPageStyles.heroHeadText).toMatch(/text-|font-black|mt-2/);
  });
});

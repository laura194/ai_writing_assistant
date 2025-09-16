import { describe, it, expect } from "vitest";
import * as hocIndex from "./index";
import SectionWrapper from "./SectionWrapper";

describe("hoc/index re-exports", () => {
  it("exports SectionWrapper as named export", () => {
    expect(hocIndex.SectionWrapper).toBe(SectionWrapper);
  });
});

import { describe, it, expect } from "vitest";
import {
  textVariant,
  fadeIn,
  zoomIn,
  slideIn,
  staggerContainer,
} from "./motion";

describe("utils/motion", () => {
  describe("textVariant", () => {
    it("returns correct default hidden and show states with default delay", () => {
      const v = textVariant();
      expect(v).toHaveProperty("hidden");
      expect(v.hidden).toEqual({ y: -50, opacity: 0 });

      expect(v).toHaveProperty("show");
      expect(v.show).toHaveProperty("y", 0);
      expect(v.show).toHaveProperty("opacity", 1);
      // transition object exact values
      expect(v.show).toHaveProperty("transition");
      expect((v.show as any).transition).toMatchObject({
        type: "spring",
        duration: 1.25,
        delay: 0,
      });
    });

    it("applies provided delay to the show.transition.delay", () => {
      const v = textVariant(0.7);
      expect((v.show as any).transition.delay).toBe(0.7);
    });
  });

  describe("fadeIn", () => {
    it("fadeIn from left yields x=100, y=0", () => {
      const v = fadeIn("left");
      expect(v.hidden).toEqual({ x: 100, y: 0, opacity: 0 });
      expect(v.show).toHaveProperty("x", 0);
      expect(v.show).toHaveProperty("y", 0);
      expect((v.show as any).transition).toMatchObject({
        type: "spring",
        delay: 0,
        duration: 0.5,
        ease: "easeOut",
      });
    });

    it("fadeIn from right yields x=-100", () => {
      const v = fadeIn("right");
      expect(v.hidden).toEqual({ x: -100, y: 0, opacity: 0 });
    });

    it("fadeIn from up yields y=100", () => {
      const v = fadeIn("up");
      expect(v.hidden).toEqual({ x: 0, y: 100, opacity: 0 });
    });

    it("fadeIn from down yields y=-100", () => {
      const v = fadeIn("down");
      expect(v.hidden).toEqual({ x: 0, y: -100, opacity: 0 });
    });

    it("fadeIn with unknown direction falls back to center (x=0,y=0)", () => {
      const v = fadeIn("diagonal");
      expect(v.hidden).toEqual({ x: 0, y: 0, opacity: 0 });
    });

    it("fadeIn accepts custom type, delay and duration", () => {
      const v = fadeIn("left", "tween", 0.2, 2);
      expect((v.show as any).transition).toMatchObject({
        type: "tween",
        delay: 0.2,
        duration: 2,
        ease: "easeOut",
      });
    });
  });

  describe("zoomIn", () => {
    it("default zoomIn returns expected hidden and show", () => {
      const v = zoomIn();
      expect(v.hidden).toEqual({ scale: 0, opacity: 0 });
      expect(v.show).toHaveProperty("scale", 1);
      expect(v.show).toHaveProperty("opacity", 1);
      expect((v.show as any).transition).toMatchObject({
        type: "tween",
        delay: 0,
        duration: 0.5,
        ease: "easeOut",
      });
    });

    it("zoomIn accepts custom delay and duration", () => {
      const v = zoomIn(0.3, 1.2);
      expect((v.show as any).transition).toMatchObject({
        type: "tween",
        delay: 0.3,
        duration: 1.2,
      });
    });
  });

  describe("slideIn", () => {
    it("slideIn left produces x='-100%' and y='0%'", () => {
      const v = slideIn("left");
      expect(v.hidden).toEqual({ x: "-100%", y: "0%" });
      expect(v.show).toHaveProperty("x", "0%");
      expect(v.show).toHaveProperty("y", "0%");
      expect((v.show as any).transition).toMatchObject({
        type: "tween",
        delay: 0,
        duration: 0.5,
        ease: "easeOut",
      });
    });

    it("slideIn right produces x='100%'", () => {
      const v = slideIn("right");
      expect(v.hidden).toEqual({ x: "100%", y: "0%" });
    });

    it("slideIn up and down use y='100%' (keeps original behavior)", () => {
      const up = slideIn("up");
      const down = slideIn("down");
      expect(up.hidden).toEqual({ x: "0%", y: "100%" });
      expect(down.hidden).toEqual({ x: "0%", y: "100%" });
    });

    it("slideIn accepts custom animType, delay and duration", () => {
      const v = slideIn("left", "spring", 0.4, 1.5);
      expect((v.show as any).transition).toMatchObject({
        type: "spring",
        delay: 0.4,
        duration: 1.5,
        ease: "easeOut",
      });
    });
  });

  describe("staggerContainer", () => {
    it("default returns empty hidden and show.transition with defaults", () => {
      const v = staggerContainer();
      expect(v.hidden).toEqual({});
      expect(v.show).toHaveProperty("transition");
      expect((v.show as any).transition).toMatchObject({
        staggerChildren: 0,
        delayChildren: 0,
      });
    });

    it("returns provided staggerChildren and delayChildren", () => {
      const v = staggerContainer(0.2, 0.5);
      expect((v.show as any).transition).toMatchObject({
        staggerChildren: 0.2,
        delayChildren: 0.5,
      });
    });
  });
});

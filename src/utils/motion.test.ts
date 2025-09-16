import { describe, it, expect } from "vitest";
import { textVariant, fadeIn, zoomIn, slideIn, staggerContainer } from "./motion";

// Helper to assert object (variants) has required keys/shape without strict equality on object identity
const hasKeys = (obj: any, keys: string[]) => keys.every((k) => Object.prototype.hasOwnProperty.call(obj, k));

describe("utils/motion", () => {
  describe("textVariant", () => {
    it("returns hidden/show variants with default delay 0", () => {
      const v = textVariant();
      expect(hasKeys(v, ["hidden", "show"])) .toBe(true);
      expect(v.hidden).toEqual({ y: -50, opacity: 0 });
      expect(v.show.y).toBe(0);
      expect(v.show.opacity).toBe(1);
      expect(v.show.transition).toEqual(expect.objectContaining({ type: "spring", duration: 1.25, delay: 0 }));
    });

    it("applies provided delay", () => {
      const v = textVariant(0.35);
      expect(v.show.transition).toEqual(expect.objectContaining({ delay: 0.35 }));
    });
  });

  describe("fadeIn", () => {
    it("maps left/right/up/down directions to correct x/y offsets", () => {
      const L = fadeIn("left");
      const R = fadeIn("right");
      const U = fadeIn("up");
      const D = fadeIn("down");
      const N = fadeIn("");

      expect(L.hidden).toEqual(expect.objectContaining({ x: 100, y: 0, opacity: 0 }));
      expect(R.hidden).toEqual(expect.objectContaining({ x: -100, y: 0, opacity: 0 }));
      expect(U.hidden).toEqual(expect.objectContaining({ x: 0, y: 100, opacity: 0 }));
      expect(D.hidden).toEqual(expect.objectContaining({ x: 0, y: -100, opacity: 0 }));
      expect(N.hidden).toEqual(expect.objectContaining({ x: 0, y: 0, opacity: 0 }));
    });

    it("uses provided transition type, delay, and duration with ease 'easeOut'", () => {
      const v = fadeIn("left", "tween", 0.4, 2);
      expect(v.show).toEqual(
        expect.objectContaining({ x: 0, y: 0, opacity: 1, transition: expect.objectContaining({ type: "tween", delay: 0.4, duration: 2, ease: "easeOut" }) })
      );
    });

    it("unknown direction falls back to zero offsets", () => {
      const v = fadeIn("diagonal", "spring", 0, 1);
      expect(v.hidden.x).toBe(0);
      expect(v.hidden.y).toBe(0);
    });
  });

  describe("zoomIn", () => {
    it("returns scale/opacity variants with tween transition and provided delay/duration", () => {
      const v = zoomIn(0.2, 0.75);
      expect(v.hidden).toEqual({ scale: 0, opacity: 0 });
      expect(v.show.scale).toBe(1);
      expect(v.show.opacity).toBe(1);
      expect(v.show.transition).toEqual(expect.objectContaining({ type: "tween", delay: 0.2, duration: 0.75, ease: "easeOut" }));
    });
  });

  describe("slideIn", () => {
    it("maps direction to percentage x/y and returns show with 0%", () => {
      const L = slideIn("left", "spring", 0.1, 0.3);
      const R = slideIn("right", "spring", 0.1, 0.3);
      const U = slideIn("up", "spring", 0.1, 0.3);
      const D = slideIn("down", "spring", 0.1, 0.3);

      expect(L.hidden).toEqual({ x: "-100%", y: "0%" });
      expect(R.hidden).toEqual({ x: "100%", y: "0%" });
      expect(U.hidden).toEqual({ x: "0%", y: "100%" });
      expect(D.hidden).toEqual({ x: "0%", y: "100%" });

      for (const v of [L, R, U, D]) {
        expect(v.show).toEqual(expect.objectContaining({ x: "0%", y: "0%", transition: expect.objectContaining({ type: "spring", delay: 0.1, duration: 0.3, ease: "easeOut" }) }));
      }
    });

    it("uses default direction 'left' and animType 'tween' when not provided", () => {
      const v = slideIn();
      expect(v.hidden).toEqual({ x: "-100%", y: "0%" });
      expect(v.show.transition).toEqual(expect.objectContaining({ type: "tween" }));
    });
  });

  describe("staggerContainer", () => {
    it("returns variants with staggerChildren and delayChildren", () => {
      const v = staggerContainer(0.25, 0.5);
      expect(hasKeys(v, ["hidden", "show"])) .toBe(true);
      expect(v.show.transition).toEqual(expect.objectContaining({ staggerChildren: 0.25, delayChildren: 0.5 }));
    });

    it("uses default zeros when not provided", () => {
      const v = staggerContainer();
      expect(v.show.transition).toEqual(expect.objectContaining({ staggerChildren: 0, delayChildren: 0 }));
    });
  });
});

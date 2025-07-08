// utils/motion.ts
import type { Variants, Transition } from "framer-motion";

export const textVariant = (delay = 0): Variants => ({
  hidden: {
    y: -50,
    opacity: 0,
  },
  show: {
    y: 0,
    opacity: 1,
    transition: {
      type: "spring",
      duration: 1.25,
      delay,
    } as Transition,
  },
});

export const fadeIn = (
  direction: string = "",
  type: string = "spring",
  delay = 0,
  duration = 0.5
): Variants => {
  // lenke alle unbekannten Richtungen auf 0
  const x = direction === "left" ? 100 : direction === "right" ? -100 : 0;
  const y = direction === "up" ? 100 : direction === "down" ? -100 : 0;

  const transition: Transition = {
    type: type as Transition["type"],
    delay,
    duration,
    ease: "easeOut",
  };

  return {
    hidden: { x, y, opacity: 0 },
    show: { x: 0, y: 0, opacity: 1, transition },
  };
};

export const zoomIn = (delay = 0, duration = 0.5): Variants => ({
  hidden: {
    scale: 0,
    opacity: 0,
  },
  show: {
    scale: 1,
    opacity: 1,
    transition: {
      type: "tween",
      delay,
      duration,
      ease: "easeOut",
    } as Transition,
  },
});

export const slideIn = (
  direction: "left" | "right" | "up" | "down" = "left",
  animType: string = "tween",
  delay = 0,
  duration = 0.5
): Variants => {
  const x =
    direction === "left" ? "-100%" : direction === "right" ? "100%" : "0%";
  const y = direction === "up" ? "100%" : direction === "down" ? "100%" : "0%";

  const transition: Transition = {
    type: animType as Transition["type"],
    delay,
    duration,
    ease: "easeOut",
  };

  return {
    hidden: { x, y },
    show: { x: "0%", y: "0%", transition },
  };
};

export const staggerContainer = (
  staggerChildren: number = 0,
  delayChildren: number = 0
): Variants => ({
  hidden: {},
  show: {
    transition: {
      staggerChildren,
      delayChildren,
    } as Transition,
  },
});

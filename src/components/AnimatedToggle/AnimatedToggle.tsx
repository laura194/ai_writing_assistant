import React from "react";
import { motion } from "framer-motion";

type AnimatedToggleProps = {
  checked: boolean;
  onChange: (next: boolean) => void;
  disabled?: boolean;
  ariaLabel?: string;
  size?: "sm" | "md" | "lg";
};

export const AnimatedToggle: React.FC<AnimatedToggleProps> = ({
  checked,
  onChange,
  disabled = false,
  ariaLabel,
  size = "md",
}) => {
  const sizes = {
    sm: { trackW: 36, trackH: 18, knob: 14, travel: 18 },
    md: { trackW: 44, trackH: 22, knob: 18, travel: 20 },
    lg: { trackW: 56, trackH: 28, knob: 22, travel: 32 },
  }[size];

  return (
    <motion.button
      whileHover={{
        scale: 1.1,
      }}
      whileTap={{ scale: 0.98 }}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={ariaLabel ?? "Toggle"}
      onClick={() => !disabled && onChange(!checked)}
      onKeyDown={(e) => {
        if (disabled) return;
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onChange(!checked);
        }
      }}
      disabled={disabled}
      className={`relative inline-flex items-center p-0 border-0 bg-transparent focus:outline-none ${
        disabled ? "opacity-60 cursor-not-allowed" : "cursor-pointer"
      }`}
      style={{ WebkitTapHighlightColor: "transparent" }}
    >
      {/* Track */}
      <motion.div
        className="rounded-full flex-shrink-0 relative"
        style={{
          width: sizes.trackW,
          height: sizes.trackH,
        }}
        initial={false}
        animate={{
          boxShadow: checked
            ? "0 0 6px rgba(147,51,234,0.6), 0 0 8px rgba(147,51,234,0.3)"
            : "0 0 6px rgba(147,51,234,0.6)",
        }}
        whileHover={{
          boxShadow: checked
            ? "0 0 6px rgba(147,51,234,0.8), 0 0 8px rgba(236,72,153,0.4)"
            : "0 0 8px rgba(147,51,234,0.8)",
        }}
        transition={{ duration: 0.3, ease: "easeOut" }}
      >
        <div
          className={`relative rounded-full overflow-hidden flex-shrink-0`}
          style={{
            width: sizes.trackW,
            height: sizes.trackH,
          }}
        >
          {/* Animated gradient glow when checked */}
          <motion.div
            aria-hidden
            initial={false}
            animate={{
              opacity: checked ? 1 : 0,
              boxShadow: checked
                ? "0 0 15px rgba(147,51,234,0.45), 0 0 30px rgba(147,51,234,0.25)"
                : "0 0 6px rgba(0,0,0,0.1)",
            }}
            whileHover={{
              boxShadow: checked
                ? "0 0 22px rgba(147,51,234,0.7), 0 0 45px rgba(236,72,153,0.4)"
                : "0 0 12px rgba(124,58,237,0.3)",
            }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            style={{
              position: "absolute",
              inset: 0,
              background:
                "linear-gradient(90deg, rgba(147,51,234,1), rgba(236,72,153,1) 40%, rgba(253,224,71,1) 80%)",
              transform: "scale(1.05)",
              zIndex: 0,
            }}
          />
          {/* Base track */}
          <div
            className={`absolute inset-0 rounded-full`}
            style={{
              background: checked ? "rgba(255,255,255,0.06)" : "#E6E9EE",
              zIndex: 1,
            }}
          />
          {/* Knob */}
          <motion.span
            className="block bg-white rounded-full"
            initial={false}
            animate={{
              x: checked ? sizes.travel : 2,
              scale: checked ? 1.03 : 1,
              boxShadow: checked
                ? "0 8px 26px rgba(124,58,237,0.3), 0 4px 10px rgba(0,0,0,0.2)"
                : "0 4px 10px rgba(2,6,23,0.3)",
            }}
            transition={{ type: "spring", stiffness: 650, damping: 32 }}
            style={{
              width: sizes.knob,
              height: sizes.knob,
              zIndex: 3,
              position: "absolute",
              top: (sizes.trackH - sizes.knob) / 2,
              left: 2,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {/* small icon hint (optional) */}
            <motion.span
              initial={false}
              animate={{ rotate: checked ? 0 : 0, opacity: 1 }}
              transition={{ duration: 0.18 }}
              style={{ width: "60%", height: "60%", display: "block" }}
            />
          </motion.span>
        </div>
      </motion.div>
    </motion.button>
  );
};

export default AnimatedToggle;

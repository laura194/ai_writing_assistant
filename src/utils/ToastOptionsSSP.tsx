import type { Theme } from "../providers/ThemeProvider";

export const getToastOptions = (theme: Theme) => {
  const common = {
    duration: 4000,
    icon: "⚠️",
    style: {
      padding: "16px 20px",
      borderRadius: "12px",
      fontSize: "18px",
      fontWeight: 600,
      boxShadow: "",
      border: "",
    } as React.CSSProperties,
  };

  if (theme === "dark") {
    return {
      ...common,
      style: {
        ...common.style,
        background: "#1e1538",
        color: "#c4b5fd",
        boxShadow: "0 4px 12px rgba(139, 92, 246, 0.2)",
        border: "1px solid #7c3aed",
      },
    };
  }

  return {
    ...common,
    style: {
      ...common.style,
      background: "#e0dbf4",
      color: "#261e3b",
      boxShadow: "0 6px 20px rgba(2,6,23,0.4)",
      border: "1px solid #c5b6f7",
    },
  };
};

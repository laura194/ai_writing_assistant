import js from "@eslint/js";
import globals from "globals";
import reactHooks from "eslint-plugin-react-hooks";
import reactRefresh from "eslint-plugin-react-refresh";
import tseslint from "typescript-eslint";

export default tseslint.config(
  {
    ignores: [
      "dist",
      "**/*.test.ts",
      "**/*.test.tsx",
      "**/*.spec.ts",
      "**/*.spec.tsx",
      "tailwind.config.*",
      "test/**/*",
      "src/providers/ThemeProvider.tsx",
      "src/components/landing-page/LandingAbout/LandingAbout.tsx",
      "src/components/landing-page/LandingContact/LandingContact.tsx",
      "src/components/landing-page/LandingTeam/LandingTeam.tsx",
      "src/components/landing-page/LandingTech/LandingTech.tsx",
      "src/components/landing-page/LandingWorks/LandingWorks.tsx",
    ],
  },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ["**/*.{ts,tsx}"],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      "react-hooks": reactHooks,
      "react-refresh": reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      "react-refresh/only-export-components": [
        "warn",
        { allowConstantExport: true },
      ],
    },
  }
);

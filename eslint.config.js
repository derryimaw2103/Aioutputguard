import js from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    files: ["**/*.js", "**/*.mjs", "**/*.cjs"],
    languageOptions: {
      globals: {
        process: "readonly",
        URL: "readonly"
      }
    }
  },
  {
    ignores: ["dist/**", "coverage/**", "node_modules/**"]
  }
);

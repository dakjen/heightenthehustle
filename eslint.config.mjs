import globals from "globals";
import pluginJs from "@eslint/js";
// import tseslint from "typescript-eslint";
import pluginReactConfig from "eslint-plugin-react/configs/recommended.js";
import nextPlugin from "eslint-config-next";

const eslintConfig = [
  { languageOptions: { globals: globals.browser } },
  pluginJs.configs.recommended,
  // ...tseslint.configs.recommended,
  pluginReactConfig,
  ...nextPlugin,
  {
    // TypeScript already reports undefined identifiers; ESLint's no-undef
    // false-positives on the ambient `React` namespace type in .ts/.tsx files.
    files: ["**/*.ts", "**/*.tsx"],
    rules: {
      "no-undef": "off",
      // Use the TypeScript-aware rule: the base one flags parameter names in
      // function-type annotations like `(url: string) => void`.
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": [
        "error",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_", ignoreRestSiblings: true },
      ],
    },
  },
  {
    rules: {
      // "@typescript-eslint/no-unused-vars": "off",
      "react-hooks/exhaustive-deps": "off",
      "react-hooks/rules-of-hooks": "off",
      "react-hooks/set-state-in-effect": "off", // Disable this rule as well
    }
  }
];

export default eslintConfig;

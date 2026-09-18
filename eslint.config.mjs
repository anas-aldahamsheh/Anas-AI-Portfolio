import nextConfig from "eslint-config-next";

const tsConfig = nextConfig.find((c) => c.plugins && c.plugins["@typescript-eslint"]);
const tsPlugin = tsConfig?.plugins?.["@typescript-eslint"];

const eslintConfig = [
  ...nextConfig,
  {
    plugins: {
      ...(tsPlugin ? { "@typescript-eslint": tsPlugin } : {}),
    },
    rules: {
      "@typescript-eslint/no-explicit-any": "error",
      "@typescript-eslint/no-unused-vars": [
        "error",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
      "prefer-const": "error",
      "no-console": ["warn", { allow: ["warn", "error", "info"] }],
    },
  },
  {
    ignores: [
      ".next/**",
      "node_modules/**",
      "dist/**",
      "build/**",
      "coverage/**",
      "anas-ai-portfolio-blueprint/**",
    ],
  },
];

export default eslintConfig;

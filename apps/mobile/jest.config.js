module.exports = {
  preset: "jest-expo",
  setupFilesAfterEnv: ["<rootDir>/test/jest.setup.js"],
  testMatch: ["<rootDir>/test/**/*.test.ts", "<rootDir>/test/**/*.test.tsx"],
  moduleNameMapper: {
    "^@jnd/core$": "<rootDir>/../../packages/core/src/index.ts",
  },
};

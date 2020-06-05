/**
 * @type {import("@jest/types").Config.InitialOptions}
 */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jest-environment-jsdom",
  testRunner: "jest-circus/runner",
  moduleNameMapper: {
    "\\.(jpg|jpeg|png|gif|eot|otf|webp|svg|ttf|woff|woff2|mp4|webm|wav|mp3|m4a|aac|oga)$":
      "<rootDir>/src/__mocks__/fileMock.js",
    "\\.css$": "identity-obj-proxy",
    "^lodash-es$": "lodash",
    "^test/(.*)": "<rootDir>/test/$1",
  },
  clearMocks: true,
};

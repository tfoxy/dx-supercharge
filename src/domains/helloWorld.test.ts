import "jest-webextension-mock";
import { expect, test } from "@jest/globals";
import { browser } from "webextension-polyfill-ts";

test("Hello World!", () => {
  expect("Hello World!").toBe("Hello World!");
});

test("WebExtension Mock", () => {
  browser.tabs.query({});
  expect(browser.tabs.query).toHaveBeenCalled();
});

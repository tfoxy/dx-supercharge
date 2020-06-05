import { GithubMessage, GITHUB_MESSAGE_TYPE } from "./types";
import { Runtime, WebNavigation, browser } from "webextension-polyfill-ts";

export function registerGithubListeners() {
  // messageType: GITHUB_MESSAGE_TYPE,
  // domainOptionKey: "githubDomain",
  // messageListener,
}

function messageListener(
  message: GithubMessage,
  sender: Runtime.MessageSender
) {
  console.log("Githubs");
}

function navigationListener(details: WebNavigation.OnCompletedDetailsType) {
  browser.tabs.executeScript(details.tabId, {
    file: "github.js",
    frameId: details.frameId,
  });
}

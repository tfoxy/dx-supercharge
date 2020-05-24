import { GithubMessage, GITHUB_MESSAGE_TYPE } from "./types";
import { Runtime, WebNavigation, browser } from "webextension-polyfill-ts";
import { capitalize } from "lodash-es";
import { createNotification } from "../notificationManager/background";
import { registerServiceListeners } from "../serviceUtils/background";

export function registerGithubListeners() {
  registerServiceListeners({
    messageType: GITHUB_MESSAGE_TYPE,
    domainOptionKey: "githubDomain",
    messageListener,
    navigationListener,
  });
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

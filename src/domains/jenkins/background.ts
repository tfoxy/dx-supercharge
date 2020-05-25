import {
  stop,
  check,
  times,
  play,
  exclamation,
  pause,
  question,
} from "../notificationIcons";
import { JenkinsMessage, JENKINS_MESSAGE_TYPE } from "./types";
import { Runtime, WebNavigation, browser } from "webextension-polyfill-ts";
import { capitalize } from "lodash-es";
import { registerServiceListeners } from "../serviceUtils/background";
import { addServiceStatusChange } from "../serviceStatuses";

const iconByStatusMap: Record<string, string | undefined> = {
  unknown: question,
  success: check,
  failure: times,
  running: play,
  notBuilt: stop,
  unstable: exclamation,
  aborted: stop,
  paused: pause,
};

export function registerJenkinsListeners() {
  registerServiceListeners({
    messageType: JENKINS_MESSAGE_TYPE,
    domainOptionKey: "jenkinsDomain",
    messageListener,
    navigationListener,
  });
}

function messageListener(
  message: JenkinsMessage,
  sender: Runtime.MessageSender
) {
  const iconUrl = iconByStatusMap[message.status] ?? "info";
  addServiceStatusChange({
    iconUrl,
    url: message.url,
    status: capitalize(message.status),
    tabId: sender.tab!.id!,
    name: message.title,
  });
}

function navigationListener(details: WebNavigation.OnCompletedDetailsType) {
  browser.tabs.executeScript(details.tabId, {
    file: "jenkins.js",
    frameId: details.frameId,
  });
}

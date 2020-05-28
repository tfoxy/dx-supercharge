import { JenkinsMessage, JENKINS_MESSAGE_TYPE } from "./types";
import { Runtime, WebNavigation, browser } from "webextension-polyfill-ts";
import { capitalize } from "lodash-es";
import { registerServiceListeners } from "../serviceUtils/background";
import { addServiceStatusChange } from "../serviceStatuses";
import * as iconByStatusMap from "./icons";

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
  const iconUrl =
    (iconByStatusMap as Record<string, string>)[message.status] ??
    iconByStatusMap.unknown;
  addServiceStatusChange({
    iconUrl,
    url: message.url,
    status: capitalize(message.status),
    tabId: sender.tab!.id!,
    name: message.name,
  });
}

function navigationListener(details: WebNavigation.OnCompletedDetailsType) {
  browser.tabs.executeScript(details.tabId, {
    file: "jenkins.js",
    frameId: details.frameId,
  });
}

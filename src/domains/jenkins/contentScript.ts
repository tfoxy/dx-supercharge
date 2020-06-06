import { executePageScriptFile } from "../pageScriptCommunication";
import { browser, Runtime } from "webextension-polyfill-ts";
import {
  HISTORY_MESSAGE_TYPE,
  JENKINS_PORT_NAME,
  PageScriptMessage,
  FAVICON_MESSAGE_TYPE,
} from "./types";
import { getIconUrlFromPipelineRunStatus } from "./jenkinsPipelineRun";

let iconLink: HTMLLinkElement | undefined;

export function executeJenkinsContentScript() {
  const port = browser.runtime.connect(undefined, { name: JENKINS_PORT_NAME });
  executePageScriptFile(
    browser.runtime.getURL("jenkinsPageScript.js")
  ).addEventListener((event) => pageScriptMessageListener(event.detail, port));
}

function pageScriptMessageListener(
  message: PageScriptMessage,
  port: Runtime.Port
) {
  if (message.type === FAVICON_MESSAGE_TYPE) {
    setOrRemoveDocumentIconUrl(message.status);
    if (message.historyChanged) {
      port.postMessage({
        type: HISTORY_MESSAGE_TYPE,
        url: window.location.href,
      });
    }
  } else {
    port.postMessage(message);
  }
}

function setOrRemoveDocumentIconUrl(status: string) {
  if (status) {
    const iconUrl = getIconUrlFromPipelineRunStatus(status);
    setDocumentIconUrl(iconUrl);
  } else {
    removeIcon();
  }
}

function setDocumentIconUrl(iconUrl: string) {
  if (!iconLink) {
    iconLink = document.createElement("link");
    iconLink.rel = "icon";
  }
  iconLink.type = "image/svg+xml";
  iconLink.href = browser.runtime.getURL(iconUrl);
  if (!iconLink.parentNode) {
    document.head.appendChild(iconLink);
  }
}

function removeIcon() {
  if (iconLink) {
    iconLink.type = "image/x-icon";
    iconLink.href = "/favicon.ico";
  }
}

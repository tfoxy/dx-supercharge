import { executePageScriptFile } from "../pageScriptCommunication";
import { browser } from "webextension-polyfill-ts";
import {
  JenkinsMessage,
  FaviconMessage,
  JENKINS_MESSAGE_TYPE,
  FAVICON_MESSAGE_TYPE,
} from "./types";
import { getIconUrlFromPipelineRunStatus } from "./jenkinsPipelineRun";

let iconLink: HTMLLinkElement | undefined;

export function executeJenkinsContentScript() {
  executePageScriptFile(
    browser.runtime.getURL("jenkinsPageScript.js")
  ).addEventListener(pageScriptMessageListener);
}

function pageScriptMessageListener({
  detail,
}: CustomEvent<JenkinsMessage | FaviconMessage>) {
  if (detail.type === JENKINS_MESSAGE_TYPE) {
    browser.runtime.sendMessage(detail);
  } else if (detail.type === FAVICON_MESSAGE_TYPE) {
    setOrRemoveDocumentIconUrl(detail.status);
  } else {
    throwInvalidType(detail!.type);
  }
}

function throwInvalidType(type: never) {
  throw new Error(`Invalid type ${type}`);
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

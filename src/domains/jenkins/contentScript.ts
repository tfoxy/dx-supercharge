import { browser, Runtime } from "webextension-polyfill-ts";
import { createFaviconManager, FaviconManager } from "../faviconManager";
import { executePageScriptFile } from "../pageScriptCommunication";
import {
  HISTORY_MESSAGE_TYPE,
  JENKINS_PORT_NAME,
  PageScriptMessage,
  FAVICON_MESSAGE_TYPE,
} from "./types";
import { getIconUrlFromPipelineRunStatus } from "./jenkinsPipelineRun";

export function executeJenkinsContentScript() {
  const port = browser.runtime.connect(undefined, { name: JENKINS_PORT_NAME });
  const faviconManager = createFaviconManager();
  executePageScriptFile(
    browser.runtime.getURL("jenkinsPageScript.js")
  ).addEventListener((event) =>
    pageScriptMessageListener(event.detail, port, faviconManager)
  );
}

function pageScriptMessageListener(
  message: PageScriptMessage,
  port: Runtime.Port,
  faviconManager: FaviconManager
) {
  if (message.type === FAVICON_MESSAGE_TYPE) {
    setOrRemoveDocumentIconUrl(message.status, faviconManager);
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

function setOrRemoveDocumentIconUrl(
  status: string,
  faviconManager: FaviconManager
) {
  if (status) {
    const iconUrl = getIconUrlFromPipelineRunStatus(status);
    faviconManager.setDocumentIconUrl(browser.runtime.getURL(iconUrl));
  } else {
    faviconManager.removeIcon();
  }
}

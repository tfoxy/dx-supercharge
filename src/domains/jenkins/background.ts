import { JENKINS_PORT_NAME } from "./types";
import { WebNavigation, browser } from "webextension-polyfill-ts";
import {
  getExtensionOptions,
  addExtensionOptionsChangeListener,
} from "../optionsManager/background";
import { addJenkinsPortListeners } from "./runtimeConnections";

export function registerJenkinsListeners() {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name === JENKINS_PORT_NAME) {
      addJenkinsPortListeners(port);
    }
  });
  registerNavigationListeners();
  addExtensionOptionsChangeListener(extensionOptionsChangeListener);
}

function registerNavigationListeners() {
  const { jenkinsOrigin: jenkinsDomain } = getExtensionOptions();
  browser.webNavigation.onCompleted.addListener(webNavgationCompletedListener, {
    url: [{ urlPrefix: `${jenkinsDomain}/blue/` }],
  });
}

function extensionOptionsChangeListener() {
  browser.webNavigation.onCompleted.removeListener(
    webNavgationCompletedListener
  );
  registerNavigationListeners();
}

async function webNavgationCompletedListener(
  details: WebNavigation.OnCompletedDetailsType
) {
  await browser.tabs.executeScript(details.tabId, {
    file: "jenkins.js",
    frameId: details.frameId,
  });
}

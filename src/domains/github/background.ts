import {
  GithubMessage,
  GITHUB_PORT_NAME,
  StatusMessage,
  STATUS_MESSAGE_TYPE,
} from "./types";
import {
  Runtime,
  WebNavigation,
  browser,
  Tabs,
} from "webextension-polyfill-ts";
import {
  addExtensionOptionsChangeListener,
  getExtensionOptions,
} from "../optionsManager/background";
import { createNotification } from "../notificationManager/background";

export function registerGithubBackgroundListeners() {
  browser.runtime.onConnect.addListener((port) => {
    if (port.name === GITHUB_PORT_NAME) {
      port.onMessage.addListener(messageListener);
    }
  });
  registerNavigationListeners();
  addExtensionOptionsChangeListener(extensionOptionsChangeListener);
}

function registerNavigationListeners() {
  const { githubOrigin } = getExtensionOptions();
  browser.webNavigation.onCompleted.addListener(webNavgationCompletedListener, {
    url: [{ urlPrefix: `${githubOrigin}/` }],
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
    file: "github.js",
    frameId: details.frameId,
  });
}

function messageListener(message: GithubMessage, port: Runtime.Port) {
  switch (message.type) {
    case STATUS_MESSAGE_TYPE:
      notifyPullRequestStatus(message, port);
      break;
    default:
      throwInvalidType(message.type);
  }
}

function throwInvalidType(type: never): never {
  throw new Error(`Invalid type ${type}`);
}

function notifyPullRequestStatus(message: StatusMessage, port: Runtime.Port) {
  console.log(message);
  createNotification(
    undefined,
    {
      type: "basic",
      title: message.pageTitle,
      message: message.status,
      iconUrl: message.iconUrl,
    },
    {
      onClick() {
        const tab = port.sender?.tab;
        if (tab) {
          onNotificationClick(tab);
        }
      },
    }
  );
}

async function onNotificationClick(tab: Tabs.Tab) {
  if (tab.id) {
    browser.tabs.update(tab.id, { active: true });
  }
  if (tab.windowId) {
    browser.windows.update(tab.windowId, { focused: true });
  }
}

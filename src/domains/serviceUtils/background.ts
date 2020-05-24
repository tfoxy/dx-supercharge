import { Runtime, WebNavigation, browser } from "webextension-polyfill-ts";
import {
  addExtensionOptionsChangeListener,
  getExtensionOptions,
} from "../optionsManager/background";
import { ExtensionOptions } from "../optionsManager/types";

interface ServiceListenerOptions {
  messageType: string;
  domainOptionKey: keyof ExtensionOptions;
  messageListener: (message: any, sender: Runtime.MessageSender) => void;
  navigationListener: (details: WebNavigation.OnCompletedDetailsType) => void;
}

export function registerServiceListeners(options: ServiceListenerOptions) {
  addMessageListener(options);
  addNavigationListener(options);
  addExtensionOptionsChangeListener(() => {
    extensionOptionsChangeListener(options);
  });
}

function addMessageListener(options: ServiceListenerOptions) {
  browser.runtime.onMessage.addListener((message, sender) => {
    if (message && message.type === options.messageType) {
      options.messageListener(message, sender);
    }
  });
}

function addNavigationListener(options: ServiceListenerOptions) {
  const serviceDomain = getExtensionOptions()[options.domainOptionKey];
  if (serviceDomain) {
    browser.webNavigation.onCompleted.addListener(options.navigationListener, {
      url: [{ urlPrefix: `${serviceDomain}/` }],
    });
  }
}

function extensionOptionsChangeListener(options: ServiceListenerOptions) {
  browser.webNavigation.onCompleted.removeListener(options.navigationListener);
  addNavigationListener(options);
}

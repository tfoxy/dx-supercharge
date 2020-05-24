import {
  OptionsMessage,
  ExtensionOptionChangeListener,
  OPTIONS_MESSAGE_TYPE,
} from "./types";
import { StorageWrapper } from "../storageManager";
import { pull } from "lodash-es";
import { browser } from "webextension-polyfill-ts";
import { defaultExtensionOptions } from "./shared";

const storageWrapper = new StorageWrapper("options", defaultExtensionOptions);
const optionsChangeListeners: ExtensionOptionChangeListener[] = [];

export function registerOptionsListener() {
  browser.runtime.onMessage.addListener(messageListener);
}

export function getExtensionOptions() {
  return storageWrapper.get();
}

export function addExtensionOptionsChangeListener(
  listener: ExtensionOptionChangeListener
) {
  optionsChangeListeners.push(listener);
}

export function removeExtensionOptionsChangeListener(
  listener: ExtensionOptionChangeListener
) {
  pull(optionsChangeListeners, listener);
}

function messageListener(message: OptionsMessage) {
  if (message.type === OPTIONS_MESSAGE_TYPE) {
    storageWrapper.set(message.options);
    optionsChangeListeners.forEach((listener) => listener(message.options));
  }
}

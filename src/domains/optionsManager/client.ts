import {
  OptionsMessage,
  OPTIONS_MESSAGE_TYPE,
  ExtensionOptions,
} from "./types";
import { browser } from "webextension-polyfill-ts";
import { StorageWrapper } from "../storageManager";
import { defaultExtensionOptions } from "./shared";

const storageWrapper = new StorageWrapper("options", defaultExtensionOptions);

export function getExtensionOptions() {
  return storageWrapper.get();
}

export async function setExtensionOptions(options: ExtensionOptions) {
  await applyOptions(options);
  const runtimeMessage: OptionsMessage = {
    options,
    type: OPTIONS_MESSAGE_TYPE,
  };
  return browser.runtime.sendMessage(runtimeMessage);
}

async function applyOptions(options: ExtensionOptions) {
  const { githubOrigin, jenkinsOrigin } = options;
  const origins: string[] = [];
  addOrigin(jenkinsOrigin, origins);
  addOrigin(githubOrigin, origins);
  await updateOrigins(origins);
}

async function updateOrigins(origins: string[]) {
  const oldPermissions = await browser.permissions.getAll();
  const oldOrigins = oldPermissions.origins ?? [];

  const newOrigins = origins.filter((origin) => !oldOrigins.includes(origin));
  if (newOrigins.length > 0) {
    const granted = await browser.permissions.request({
      origins: newOrigins,
    });
    if (!granted) {
      throw new Error("Permissions not granted.");
    }
  }

  const unusedOrigins = oldOrigins.filter(
    (origin) => !origins.includes(origin)
  );
  if (unusedOrigins.length > 0) {
    await browser.permissions.remove({
      origins: unusedOrigins,
    });
  }
}

function addOrigin(url: string, origins: string[]) {
  if (url === "") {
    return;
  }
  let urlObject: URL;
  try {
    urlObject = new URL(url);
  } catch {
    throw new Error(`Invalid url: ${url}`);
  }
  const { origin } = urlObject;
  if (origin !== url) {
    throw new Error(`Origin "${url}" should be "${origin}"`);
  }
  origins.push(`${origin}/*`);
}

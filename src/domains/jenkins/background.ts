import {
  JenkinsMessage,
  JENKINS_MESSAGE_TYPE,
  AddPipelineRunOptions,
} from "./types";
import { WebNavigation, browser } from "webextension-polyfill-ts";
import { StorageWrapper } from "../storageManager";
import {
  getPipelineRunStatus,
  getPipelineRunIconUrl,
  getPipelineRunName,
} from "./jenkinsPipelineRun";
import { BlueOceanPipelineRunImpl } from "./blueOceanTypes";
import {
  getExtensionOptions,
  addExtensionOptionsChangeListener,
} from "../optionsManager/background";
import {
  getParamsFromApiUrl,
  buildPipelineRunBrowserUrl,
} from "./blueOceanUrlUtils";
import { createNotification } from "../notificationManager/background";

const storageWrapper = new StorageWrapper("jenkinsData", { pipelineRuns: [] });

export function registerJenkinsListeners() {
  browser.runtime.onMessage.addListener(async (message: JenkinsMessage) => {
    if (message?.type === JENKINS_MESSAGE_TYPE) {
      await addJenkinsPipelineRun(message.pipelineRun, message.options);
    }
  });
  registerNavigationListeners();
  addExtensionOptionsChangeListener(extensionOptionsChangeListener);
}

export async function addJenkinsPipelineRun(
  pipelineRun: BlueOceanPipelineRunImpl,
  options: AddPipelineRunOptions
) {
  const storagePipelineRun = getPipelineRunFromStorage(
    pipelineRun._links.self.href
  );

  if (!storagePipelineRun) {
    if (options.store) {
      storageWrapper.get().pipelineRuns.push(pipelineRun);
      storageWrapper.save();
    }
    await notifyChange(pipelineRun, options);
  } else if (
    getPipelineRunStatus(pipelineRun) !==
    getPipelineRunStatus(storagePipelineRun)
  ) {
    Object.assign(storagePipelineRun, pipelineRun);
    storageWrapper.save();
    await notifyChange(pipelineRun, { store: true, notify: true });
  }
}

function getJenkinsDomain() {
  return getExtensionOptions().jenkinsDomain;
}

function registerNavigationListeners() {
  const jenkinsDomain = getJenkinsDomain();
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

function getPipelineRunFromStorage(apiUrl: string) {
  return storageWrapper
    .get()
    .pipelineRuns.find((pr) => pr._links.self.href === apiUrl);
}

async function notifyChange(
  pipelineRun: BlueOceanPipelineRunImpl,
  options: AddPipelineRunOptions
) {
  if (
    options.notify &&
    (options.store || (await queryTabs(pipelineRun)).all.length > 0)
  ) {
    createPipelineRunNotification(pipelineRun);
  }
}

function createPipelineRunNotification(pipelineRun: BlueOceanPipelineRunImpl) {
  createNotification(
    undefined,
    {
      type: "basic",
      title: getPipelineRunStatus(pipelineRun),
      message: getPipelineRunName(pipelineRun),
      iconUrl: getPipelineRunIconUrl(pipelineRun),
    },
    {
      async onClick() {
        const tabs = await queryTabs(pipelineRun);
        if (tabs.all.length > 0) {
          const tab = tabs.all[0];
          browser.tabs.update(tab.id, { active: true });
          browser.windows.update(tab.windowId!, { focused: true });
        }
      },
    }
  );
}

async function queryTabs(pipelineRun: BlueOceanPipelineRunImpl) {
  const jenkinsDomain = getJenkinsDomain();
  const pipelineRunUrlParams = getParamsFromApiUrl(
    pipelineRun._links.self.href
  );
  const pipelineRunBrowserUrl = `${jenkinsDomain}${buildPipelineRunBrowserUrl(
    pipelineRunUrlParams
  )}`;
  const pipelineBrowserUrl = `${jenkinsDomain}${buildPipelineRunBrowserUrl({
    ...pipelineRunUrlParams,
    branch: "",
    run: "",
  })}`;
  const tabs = await browser.tabs.query({
    url: [
      `${pipelineRunBrowserUrl}/*`,
      ...["activity", "branches", "pr"].map(
        (p) => `${pipelineBrowserUrl}/${p}*`
      ),
    ],
  });
  return {
    all: tabs,
    pipeline: tabs.filter((tab) => !tab.url?.startsWith(pipelineRunBrowserUrl)),
    pipelineRun: tabs.filter((tab) =>
      tab.url?.startsWith(pipelineRunBrowserUrl)
    ),
  };
}

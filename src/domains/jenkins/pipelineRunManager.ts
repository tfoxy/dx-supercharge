import { storageWrapper } from "./jenkinsStorage";
import { BlueOceanPipelineRunImpl } from "./blueOceanTypes";
import { AddPipelineRunOptions } from "./types";
import {
  getPipelineRunStatus,
  getPipelineRunIconUrl,
  getPipelineRunName,
  getPipelineRunDisplayUrl,
} from "./jenkinsPipelineRun";
import { createNotification } from "../notificationManager/background";
import { browser, Tabs } from "webextension-polyfill-ts";
import { filterTabsByPipelineRun } from "./pageTabs";
import { getExtensionOptions } from "../optionsManager/background";

export function addJenkinsPipelineRun(
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
    notifyChange(pipelineRun, options);
  } else if (
    getPipelineRunStatus(pipelineRun) !==
    getPipelineRunStatus(storagePipelineRun)
  ) {
    Object.assign(storagePipelineRun, pipelineRun);
    storageWrapper.save();
    notifyChange(pipelineRun, { store: true, notify: true });
  }
}

function getPipelineRunFromStorage(apiUrl: string) {
  return storageWrapper
    .get()
    .pipelineRuns.find((pr) => pr._links.self.href === apiUrl);
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
      onClick() {
        onNotificationClick(pipelineRun);
      },
    }
  );
}

function notifyChange(
  pipelineRun: BlueOceanPipelineRunImpl,
  options: AddPipelineRunOptions
) {
  if (
    options.notify &&
    (options.store || filterTabsByPipelineRun(pipelineRun).length > 0)
  ) {
    createPipelineRunNotification(pipelineRun);
  }
}

async function onNotificationClick(pipelineRun: BlueOceanPipelineRunImpl) {
  const pageTabs = filterTabsByPipelineRun(pipelineRun);
  let tab: Tabs.Tab;
  if (pageTabs.length > 0) {
    const pageTab = pageTabs[0];
    tab = await browser.tabs.get(pageTab.tabId);
  } else {
    const url = `${
      getExtensionOptions().jenkinsOrigin
    }${getPipelineRunDisplayUrl(pipelineRun)}`;
    tab = await browser.tabs.create({ url });
  }
  if (tab.id) {
    browser.tabs.update(tab.id, { active: true });
  }
  if (tab.windowId) {
    browser.windows.update(tab.windowId, { focused: true });
  }
}

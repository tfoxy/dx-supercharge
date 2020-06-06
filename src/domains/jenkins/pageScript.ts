import ScriptCommunication from "../pageScriptCommunication/ScriptCommunication";
import { PAGE_SCRIPT_MESSAGE_TYPE } from "../pageScriptCommunication/types";
import {
  BlueOceanWindow,
  JenkinsCIGlobalPlugin,
  JenkinsCIGlobalPlugins,
  JenkinsCIGlobalPluginModule,
  JenkinsCIGlobalLoadingModules,
  JenkinsCIGlobalPluginTypeMap,
  BlueOceanPipelineRunImpl,
  BlueOceanActivity,
} from "./blueOceanTypes";
import {
  PIPELINE_RUN_MESSAGE_TYPE,
  PipelineRunMessage,
  FAVICON_MESSAGE_TYPE,
} from "./types";
import { isPipelineRun, getPipelineRunStatus } from "./jenkinsPipelineRun";
import {
  getParamsFromDisplayUrl,
  buildPipelineRunApiUrl,
} from "./blueOceanUrlUtils";
import type MobX from "mobx";
import { addHistoryChangeListener } from "../historyChangeListener";

declare const window: Window & BlueOceanWindow;

export async function executeJenkinsPageScript() {
  const script = document.currentScript as HTMLScriptElement;
  const communication = new ScriptCommunication(
    script,
    PAGE_SCRIPT_MESSAGE_TYPE
  );

  const mobx = await waitForModuleToLoad("mobx");
  const blueOceanCoreJs = await waitForModuleToLoad(
    "jenkins-cd-blueocean-core-js"
  );

  const activityServiceData = blueOceanCoreJs.activityService._data;

  sendInitialActivityData(communication, mobx, activityServiceData);
  observeActivityChange(communication, mobx, activityServiceData);
  addHistoryChangeListener(() => {
    sendCurrentPageFavicon(communication, activityServiceData, true);
  });
}

function waitForModuleToLoad<K extends keyof JenkinsCIGlobalPlugins>(
  moduleName: K
): Promise<JenkinsCIGlobalPluginTypeMap[K]["module"]> {
  const module = window.jenkinsCIGlobal.plugins[
    moduleName
  ] as JenkinsCIGlobalPlugin<K>;
  const moduleAnyName = `${moduleName}@any` as JenkinsCIGlobalPluginTypeMap[K]["anyName"];
  const loadingModules = module.loadingModules as JenkinsCIGlobalLoadingModules<
    K
  >;
  const loadingModule = loadingModules[moduleAnyName];
  return new Promise((resolve) => {
    if (loadingModule.loaded) {
      resolve(
        (module[moduleAnyName] as JenkinsCIGlobalPluginModule<any>).exports
      );
    } else {
      loadingModule.waitList.push({ resolve });
    }
  });
}

function getAuthUser() {
  return window.$blueocean.user;
}

function isNewPipelineRun(pipelineRun: BlueOceanPipelineRunImpl) {
  const activityElement = document.querySelector("#outer > main > .activity");
  if (activityElement) {
    const activityTableElement = activityElement.querySelector(
      ":scope > .activity-table"
    );
    if (activityTableElement) {
      const branchAttr = pipelineRun.branch
        ? `[data-branch="${decodeURIComponent(pipelineRun.pipeline)}"]`
        : ":not([data-branch])";
      const runIdAttr = `[data-runid="${pipelineRun.id}"]`;
      const hasRun = Boolean(
        activityTableElement.querySelector(`:scope > ${branchAttr}${runIdAttr}`)
      );
      const hasAnyRun = Boolean(
        activityTableElement.querySelector(":scope > [data-runid]")
      );
      return hasAnyRun && !hasRun;
    }
  }
  return false;
}

function isAuthUserPipelineRun(pipelineRun: BlueOceanPipelineRunImpl) {
  const authUserId = getAuthUser().id;
  return pipelineRun.changeSet.some((cs) => cs.author.id === authUserId);
}

function sendInitialActivityData(
  communication: ScriptCommunication,
  mobx: typeof MobX,
  activityServiceData: MobX.ObservableMap<BlueOceanActivity>
) {
  activityServiceData.forEach((activity) => {
    if (isPipelineRun(activity)) {
      const message: PipelineRunMessage = {
        type: PIPELINE_RUN_MESSAGE_TYPE,
        pipelineRun: activity,
        options: {
          notify: isNewPipelineRun(activity),
          store: isAuthUserPipelineRun(activity),
        },
      };
      communication.postMessage(mobx.toJS(message));
      sendCurrentPageFavicon(communication, activityServiceData);
    }
  });
}

function observeActivityChange(
  communication: ScriptCommunication,
  mobx: typeof MobX,
  activityServiceData: MobX.ObservableMap<BlueOceanActivity>
) {
  mobx.observe(activityServiceData, (change) => {
    const pipelineRun = change.newValue;
    const oldPipelineRun = change.oldValue;
    if (
      pipelineRun &&
      isPipelineRun(pipelineRun) &&
      (!oldPipelineRun || isPipelineRun(oldPipelineRun))
    ) {
      const notify = oldPipelineRun
        ? getPipelineRunStatus(pipelineRun) !==
          getPipelineRunStatus(oldPipelineRun)
        : isNewPipelineRun(pipelineRun);
      const message: PipelineRunMessage = {
        type: PIPELINE_RUN_MESSAGE_TYPE,
        pipelineRun,
        options: {
          notify,
          store: isAuthUserPipelineRun(pipelineRun),
        },
      };
      communication.postMessage(mobx.toJS(message));
      sendCurrentPageFavicon(communication, activityServiceData);
    }
  });
}

function sendCurrentPageFavicon(
  communication: ScriptCommunication,
  activityServiceData: MobX.ObservableMap<BlueOceanActivity>,
  historyChanged = false
) {
  let status = "";
  const activity = getActivityFromLocationPathname(activityServiceData);
  if (activity && isPipelineRun(activity)) {
    status = getPipelineRunStatus(activity);
  }
  communication.postMessage({
    type: FAVICON_MESSAGE_TYPE,
    status,
    historyChanged,
  });
}

function getActivityFromLocationPathname(
  activityServiceData: MobX.ObservableMap<BlueOceanActivity>
) {
  const { pathname } = window.location;
  const urlParams = getParamsFromDisplayUrl(pathname);
  const pipelineRunApiUrl = buildPipelineRunApiUrl(urlParams);
  return activityServiceData.get(pipelineRunApiUrl);
}

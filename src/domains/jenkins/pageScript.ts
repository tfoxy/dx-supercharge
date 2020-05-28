import ScriptCommunication from "../pageScriptCommunication/ScriptCommunication";
import { PAGE_SCRIPT_MESSAGE_TYPE } from "../pageScriptCommunication/types";
import {
  BlueOceanWindow,
  JenkinsCIGlobalPlugin,
  JenkinsCIGlobalPlugins,
  JenkinsCIGlobalPluginModule,
  JenkinsCIGlobalLoadingModules,
  JenkinsCIGlobalPluginTypeMap,
} from "./blueOceanWindowTypes";
import {
  ActivityMessage,
  ACTIVITY_MESSAGE_TYPE,
  HistoryMessage,
  HISTORY_MESSAGE_TYPE,
} from "./types";
import { addHistoryChangeListener } from "../historyChangeListener";
import { getApiUrlFromBrowserUrl } from "./blueOceanUrlUtils";

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
  const authUserId = getAuthUser().id;

  const activityServiceData = blueOceanCoreJs.activityService._data;
  activityServiceData.forEach((activity, apiUrl) => {
    const message: ActivityMessage = {
      type: ACTIVITY_MESSAGE_TYPE,
      apiUrl,
      activity,
      authUserId,
    };
    communication.postMessage(mobx.toJS(message));
  });
  mobx.observe(activityServiceData, (change) => {
    if (change.type === "add" || change.type === "update") {
      const message: ActivityMessage = {
        type: ACTIVITY_MESSAGE_TYPE,
        apiUrl: change.name,
        activity: change.newValue,
        oldActivity: change.oldValue,
        authUserId,
      };
      communication.postMessage(mobx.toJS(message));
    }
  });

  addHistoryChangeListener(() => {
    const apiUrl = getApiUrlFromBrowserUrl(window.location.pathname);
    const activity = activityServiceData.get(apiUrl);
    const message: HistoryMessage = {
      type: HISTORY_MESSAGE_TYPE,
      apiUrl: apiUrl,
      activity,
      authUserId,
    };
    communication.postMessage(message);
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

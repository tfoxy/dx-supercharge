import { sendJenkinsStatusChange } from "./client";
import {
  BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME,
  BlueOceanPipelineImpl,
  BlueOceanActivity,
  BLUE_OCEAN_PIPELINE_IMPL_WITH_SUMMARY_CLASS_NAME,
} from "./blueOceanWindowTypes";
import { executePageScriptFile } from "../pageScriptCommunication";
import { browser } from "webextension-polyfill-ts";
import {
  ActivityMessage,
  PageScriptMessage,
  ACTIVITY_MESSAGE_TYPE,
  HISTORY_MESSAGE_TYPE,
  HistoryMessage,
} from "./types";
import {
  isBrowserUrlIncludedInApiUrl,
  getBrowserUrlFromApiUrl,
  getNameFromApiUrl,
  isBrowserUrlEqualToApiUrl,
} from "./blueOceanUrlUtils";
import * as iconByStatusMap from "./icons";

let iconLink: HTMLLinkElement | undefined;

export function executeJenkinsContentScript() {
  if (!window.location.pathname.startsWith("/blue/")) {
    return;
  }
  executePageScriptFile(
    browser.runtime.getURL("jenkinsPageScript.js")
  ).addEventListener(pageScriptMessageListener);
}

function pageScriptMessageListener(event: CustomEvent<PageScriptMessage>) {
  const { detail } = event;
  switch (detail.type) {
    case ACTIVITY_MESSAGE_TYPE:
      activityListener(detail);
      break;
    case HISTORY_MESSAGE_TYPE:
      historyListener(detail);
      break;
  }
}

function getPipelineRunStatus({
  result,
  state,
}: BlueOceanPipelineImpl): string {
  if (state === "FINISHED") {
    return result.toLowerCase();
  }
  return state.toLowerCase();
}

function isPipelineRun(
  activity: BlueOceanActivity
): activity is BlueOceanPipelineImpl {
  const className = activity._class;
  return (
    className === BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME ||
    className === BLUE_OCEAN_PIPELINE_IMPL_WITH_SUMMARY_CLASS_NAME
  );
}

function historyListener(message: HistoryMessage) {
  const { activity, apiUrl } = message;
  if (activity && isPipelineRun(activity)) {
    checkDocumentIcon(activity, apiUrl);
  } else {
    removeIcon();
  }
}

function activityListener(message: ActivityMessage) {
  const { activity, oldActivity } = message;
  if (isPipelineRun(activity) && (!oldActivity || isPipelineRun(oldActivity))) {
    pipelineRunListener(message as ActivityMessage<BlueOceanPipelineImpl>);
  }
}

function checkDocumentIcon(pipelineRun: BlueOceanPipelineImpl, apiUrl: string) {
  if (isBrowserUrlEqualToApiUrl(window.location.pathname, apiUrl)) {
    if (!iconLink) {
      iconLink = document.createElement("link");
      iconLink.rel = "icon";
    }
    const status = getPipelineRunStatus(pipelineRun);
    const icon =
      (iconByStatusMap as Record<string, string>)[status] ??
      iconByStatusMap.unknown;
    iconLink.type = "image/svg+xml";
    iconLink.href = browser.runtime.getURL(icon);
    if (!iconLink.parentNode) {
      document.head.appendChild(iconLink);
    }
  } else {
    removeIcon();
  }
}

function removeIcon() {
  if (iconLink) {
    iconLink.type = "image/x-icon";
    iconLink.href = "/favicon.ico";
  }
}

function pipelineRunListener({
  activity: pipelineRun,
  oldActivity: oldPipelineRun,
  apiUrl,
}: ActivityMessage<BlueOceanPipelineImpl>) {
  const browserUrl = window.location.pathname;
  if (isBrowserUrlIncludedInApiUrl(browserUrl, apiUrl)) {
    checkDocumentIcon(pipelineRun, apiUrl);
    if (!oldPipelineRun || pipelineRun.state !== oldPipelineRun.state) {
      sendJenkinsStatusChange({
        url: getBrowserUrlFromApiUrl(apiUrl),
        name: getNameFromApiUrl(apiUrl),
        status: getPipelineRunStatus(pipelineRun),
      });
    }
  }
}

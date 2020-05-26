import { sendJenkinsStatusChange } from "./client";
import {
  BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME,
  ActivityMessage,
  BlueOceanPipelineRunImpl,
  BlueOceanActivity,
} from "./blueOceanWindowTypes";
import { executePageScriptFile } from "../pageScriptCommunication";
import { browser } from "webextension-polyfill-ts";
import { PAGE_SCRIPT_MESSAGE_TYPE } from "../pageScriptCommunication/types";

const API_URL_REGEX = /^\/blue\/rest\/organizations\/([^/]+?)((?:\/pipelines\/[^/]+?)+?)\/branches\/([^/]+?)\/runs\/([^/]+?)\//;

export function executeJenkinsContentScript() {
  if (!window.location.pathname.startsWith("/blue/")) {
    return;
  }
  executePageScriptFile(
    browser.runtime.getURL("jenkinsPageScript.js")
  ).addEventListener(pageScriptMessageListener);
}

function pageScriptMessageListener(event: CustomEvent) {
  activityListener(event.detail);
}

function getUrlFromApiUrl(apiUrl: string) {
  const matchResults = apiUrl.match(API_URL_REGEX);
  if (!matchResults) {
    throw new Error(`Unknown API url: ${apiUrl}`);
  }
  const [, organization, pipelinesUrl, branch, run] = matchResults;
  const pipelines = pipelinesUrl
    .replace(/^\/pipelines\//, "")
    .replace(/\/pipelines\//g, "%2F");
  return `/blue/organizations/${organization}/${pipelines}/detail/${branch}/${run}`;
}

function getPipelineRunStatus({
  result,
  state,
}: BlueOceanPipelineRunImpl): string {
  if (state === "FINISHED") {
    return result.toLowerCase();
  }
  return state.toLowerCase();
}

function isPipelineRun(
  activity: BlueOceanActivity
): activity is BlueOceanPipelineRunImpl {
  const className = activity._class;
  return (
    className.startsWith(BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME) &&
    (className.length === BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME.length ||
      className[BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME.length] === "$")
  );
}

function activityListener({
  activity,
  authUserId,
  oldActivity,
  activityApiUrl,
}: ActivityMessage) {
  if (isPipelineRun(activity) && (!oldActivity || isPipelineRun(oldActivity))) {
    const userMatches: boolean = activity.changeSet.some(
      (change) => change.author.id === authUserId
    );
    if (userMatches && (!oldActivity || activity.state !== oldActivity.state)) {
      sendJenkinsStatusChange({
        url: getUrlFromApiUrl(activityApiUrl),
        title: document.title,
        status: getPipelineRunStatus(activity),
      });
    }
  }
}

// DEPRECATED:

function DEPRECATED_executeJenkinsContentScript() {
  let status = "";
  const observer = new MutationObserver(() => {
    status = detectStatusChange(status);
  });
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });
}

function detectStatusChange(status: string) {
  const resultPageHeader = document.querySelector(".ResultPageHeader");
  const newStatus = getNewStatus(resultPageHeader);

  if (newStatus && status !== newStatus) {
    sendJenkinsStatusChange({
      url: getPipelineUrl(resultPageHeader),
      title: document.title,
      status: newStatus,
    });
  }

  return newStatus;
}

function getNewStatus(resultPageHeader: Element | null): string {
  if (resultPageHeader) {
    const statusClass = [...resultPageHeader.classList].find((string) =>
      string.startsWith("BasicHeader--")
    );
    if (statusClass) {
      const match = statusClass.match(/BasicHeader--(.*)/);
      if (match) {
        return match[1];
      }
    }
  }
  return "";
}

function getPipelineUrl(resultPageHeader: Element | null): string {
  if (resultPageHeader) {
    const pipelineAnchor: HTMLAnchorElement | null = resultPageHeader.querySelector(
      "nav > a.pipeline"
    );
    if (pipelineAnchor) {
      return pipelineAnchor.href;
    }
  }
  return window.location.href;
}

import { sendJenkinsStatusChange } from "./client";
import {
  BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME,
  BlueOceanPipelineRunImpl,
  BlueOceanActivity,
} from "./blueOceanWindowTypes";
import { executePageScriptFile } from "../pageScriptCommunication";
import { browser } from "webextension-polyfill-ts";
import { ActivityMessage } from "./types";

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

function getPartsFromApiUrl(apiUrl: string) {
  const matchResults = apiUrl.match(API_URL_REGEX);
  if (!matchResults) {
    throw new Error(`Unknown API url: ${apiUrl}`);
  }
  const [, organization, pipelinesUrl, branch, run] = matchResults;
  return {
    organization,
    pipelines: pipelinesUrl.split("/pipelines/").slice(1),
    branch,
    run,
  };
}

function getUrlFromApiUrl(apiUrl: string) {
  const { organization, pipelines, branch, run } = getPartsFromApiUrl(apiUrl);
  const pipelinesUri = pipelines.join("%2F");
  return `/blue/organizations/${organization}/${pipelinesUri}/detail/${branch}/${run}`;
}

function getTitleFromApiUrl(apiUrl: string) {
  const { organization, pipelines, branch, run } = getPartsFromApiUrl(apiUrl);
  return [organization, pipelines.join("/"), branch, `#${run}`].join(" / ");
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
    if (!oldActivity || activity.state !== oldActivity.state) {
      sendJenkinsStatusChange({
        url: getUrlFromApiUrl(activityApiUrl),
        title: getTitleFromApiUrl(activityApiUrl),
        status: getPipelineRunStatus(activity),
      });
    }
  }
}

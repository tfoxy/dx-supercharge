import {
  BlueOceanPipelineRunImpl,
  BlueOceanActivity,
  BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME,
} from "./blueOceanTypes";
import * as iconByStatusMap from "./icons";
import {
  getParamsFromApiUrl,
  buildPipelineRunBrowserUrl,
} from "./blueOceanUrlUtils";

export interface StoredJenkinsPipelineRun {
  blueData: BlueOceanPipelineRunImpl;
  tabIds: Set<number>;
}

export function getPipelineRunIconUrl(pipelineRun: BlueOceanPipelineRunImpl) {
  const status = getPipelineRunStatus(pipelineRun);
  return getIconUrlFromPipelineRunStatus(status);
}

export function getIconUrlFromPipelineRunStatus(status: string) {
  return (
    (iconByStatusMap as Record<string, string>)[status] ??
    iconByStatusMap.unknown
  );
}

export function getPipelineRunStatus({
  result,
  state,
}: BlueOceanPipelineRunImpl): string {
  if (result !== "UNKNOWN") {
    return result.toLowerCase();
  }
  return state.toLowerCase();
}

export function isPipelineRun(
  activity: BlueOceanActivity
): activity is BlueOceanPipelineRunImpl {
  return activity._class === BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME;
}

export function getPipelineRunName(
  pipelineRun: BlueOceanPipelineRunImpl
): string {
  const { organization, pipelines, branch, run } = getParamsFromApiUrl(
    pipelineRun._links.self.href
  );
  return [organization, pipelines.join("/"), branch, `#${run}`].join(" / ");
}

export function getPipelineRunBrowserUrl(
  pipelineRun: BlueOceanPipelineRunImpl
): string {
  const urlParams = getParamsFromApiUrl(pipelineRun._links.self.href);
  return buildPipelineRunBrowserUrl(urlParams);
}

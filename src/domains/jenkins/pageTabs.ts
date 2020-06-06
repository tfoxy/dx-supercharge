import {
  getParamsFromApiUrl,
  buildPipelineRunDisplayUrl,
} from "./blueOceanUrlUtils";
import { getExtensionOptions } from "../optionsManager/background";
import { BlueOceanPipelineRunImpl } from "./blueOceanTypes";
import { PageTab } from "./types";

const pageTabs = new Map<string, PageTab>();

export function getPageTabs() {
  return pageTabs;
}

export function setPageTab(tab: PageTab) {
  pageTabs.set(getKey(tab), tab);
}

export function deletePageTab(tab: PageTab) {
  pageTabs.delete(getKey(tab));
}

export function filterTabsByPipelineRun(pipelineRun: BlueOceanPipelineRunImpl) {
  return filterTabsByApiUrl(pipelineRun._links.self.href);
}

export function filterTabsByApiUrl(apiUrl: string) {
  const { jenkinsOrigin: jenkinsDomain } = getExtensionOptions();
  const pipelineRunUrlParams = getParamsFromApiUrl(apiUrl);
  if (pipelineRunUrlParams.pipelines.length === 0) {
    return [];
  }
  const pipelineRunDisplayUrl = `${jenkinsDomain}${buildPipelineRunDisplayUrl(
    pipelineRunUrlParams
  )}`;
  const pipelineDisplayUrl = `${jenkinsDomain}${buildPipelineRunDisplayUrl({
    ...pipelineRunUrlParams,
    branch: "",
    run: "",
  })}`;
  const pipelineDetailDisplayUrl = `${pipelineDisplayUrl}/detail`;
  return [...pageTabs.values()].filter(
    (tab) =>
      startsWithUrl(tab.url!, pipelineRunDisplayUrl) ||
      (startsWithUrl(tab.url!, pipelineDisplayUrl) &&
        !startsWithUrl(tab.url!, pipelineDetailDisplayUrl))
  );
}

function startsWithUrl(url: string, urlPrefix: string) {
  const lastChar = url[urlPrefix.length];
  return (
    url.startsWith(urlPrefix) &&
    (lastChar === "/" || typeof lastChar === "undefined")
  );
}

function getKey(tab: PageTab) {
  return `${tab.tabId},${tab.frameId}`;
}

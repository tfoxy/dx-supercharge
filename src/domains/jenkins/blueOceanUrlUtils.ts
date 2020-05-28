const API_URL_REGEX = /^\/blue\/rest\/organizations\/([^/]+?)((?:\/pipelines\/[^/]+?)+?)\/branches\/([^/]+?)\/runs\/([^/]+?)\//;
const BROWSER_URL_REGEX = /^\/blue\/organizations\/([^/]+)(?:\/([^/]+)(?:\/detail\/([^/]+)(?:\/([^/]+))?)?)?/;

export interface ActivityUrlParams {
  organization: string;
  pipelines: string[];
  branch: string;
  run: string;
}

export function getParamsFromApiUrl(url: string): ActivityUrlParams {
  const matchResults = url.match(API_URL_REGEX) ?? [];
  const [
    ,
    organization = "",
    pipelineParams = "",
    branch = "",
    run = "",
  ] = matchResults;
  return {
    organization: decodeURIComponent(organization),
    pipelines: pipelineParams.split("/pipelines/").slice(1),
    // branch is encoded twice
    branch: decodeURIComponent(decodeURIComponent(branch)),
    run: decodeURIComponent(run),
  };
}

export function getParamsFromBrowserUrl(url: string): ActivityUrlParams {
  const matchResults = url.match(BROWSER_URL_REGEX) ?? [];
  const [
    ,
    organization = "",
    pipelineParams = "",
    branch = "",
    run = "",
  ] = matchResults;
  return {
    organization: decodeURIComponent(organization),
    pipelines: decodeURIComponent(pipelineParams).split("/"),
    branch: decodeURIComponent(branch),
    run: decodeURIComponent(run),
  };
}

export function isBrowserUrlIncludedInApiUrl(
  browserUrl: string,
  apiUrl: string
): boolean {
  const browserParams = getParamsFromBrowserUrl(browserUrl);
  const apiParams = getParamsFromApiUrl(apiUrl);
  return (
    (!browserParams.organization ||
      browserParams.organization === apiParams.organization) &&
    (!browserParams.pipelines.length ||
      browserParams.pipelines.join("/") === apiParams.pipelines.join("/")) &&
    (!browserParams.branch || browserParams.branch === apiParams.branch) &&
    (!browserParams.run || browserParams.run === apiParams.run)
  );
}

export function isBrowserUrlEqualToApiUrl(
  browserUrl: string,
  apiUrl: string
): boolean {
  const browserParams = getParamsFromBrowserUrl(browserUrl);
  const apiParams = getParamsFromApiUrl(apiUrl);
  return (
    browserParams.organization === apiParams.organization &&
    browserParams.pipelines.join("/") === apiParams.pipelines.join("/") &&
    browserParams.branch === apiParams.branch &&
    browserParams.run === apiParams.run
  );
}

export function getBrowserUrlFromApiUrl(apiUrl: string): string {
  const { organization, pipelines, branch, run } = getParamsFromApiUrl(apiUrl);
  if (!run) {
    return "";
  }
  return [
    "/blue/organizations",
    encodeURIComponent(organization),
    encodeURIComponent(pipelines.join("/")),
    "detail",
    encodeURIComponent(branch),
    encodeURIComponent(run),
  ].join("/");
}

export function getApiUrlFromBrowserUrl(browserUrl: string): string {
  const { organization, pipelines, branch, run } = getParamsFromBrowserUrl(
    browserUrl
  );
  if (!run) {
    return "";
  }
  return [
    "/blue/rest/organizations",
    encodeURIComponent(organization),
    pipelines
      .map((p) => `/pipelines/${p}`)
      .join("")
      .slice(1),
    "branches",
    // branch is encoded twice
    encodeURIComponent(encodeURIComponent(branch)),
    "runs",
    encodeURIComponent(run),
    "",
  ].join("/");
}

export function getNameFromApiUrl(apiUrl: string): string {
  const { organization, pipelines, branch, run } = getParamsFromApiUrl(apiUrl);
  return [organization, pipelines.join("/"), branch, `#${run}`].join(" / ");
}

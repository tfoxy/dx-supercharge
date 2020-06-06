const DISPLAY_URL_REGEX = /^\/blue\/organizations\/([^/]+)(?:\/([^/]+)(?:\/detail\/([^/]+)(?:\/([^/]+))?)?)?/;
const API_URL_REGEX = /^\/blue\/rest\/organizations\/([^/]+?)((?:\/pipelines\/[^/]+?)+?)\/(?:branches\/([^/]+?)\/)?runs\/([^/]+?)\//;

export interface PipelineRunUrlParams {
  organization: string;
  pipelines: string[];
  branch: string;
  run: string;
}

export function getParamsFromDisplayUrl(url: string): PipelineRunUrlParams {
  const matchResults = url.match(DISPLAY_URL_REGEX) ?? [];
  const [
    ,
    organization = "",
    pipelineParams = "",
    branch = "",
    run = "",
  ] = matchResults;
  const pipelines = decodeURIComponent(pipelineParams).split("/");
  return {
    organization: decodeURIComponent(organization),
    pipelines: decodeURIComponent(pipelineParams).split("/"),
    branch:
      branch === pipelines[pipelines.length - 1]
        ? ""
        : decodeURIComponent(branch),
    run: decodeURIComponent(run),
  };
}

export function getParamsFromApiUrl(url: string): PipelineRunUrlParams {
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

export function buildPipelineRunApiUrl({
  organization,
  pipelines,
  branch,
  run,
}: PipelineRunUrlParams) {
  const parts = ["/blue/rest/organizations"];
  if (organization) {
    parts.push(organization);
    if (pipelines.length > 0) {
      pipelines.forEach((p) => {
        parts.push("pipelines", p);
      });
      if (branch) {
        // branch is encoded twice
        parts.push("branches", encodeURIComponent(encodeURIComponent(branch)));
      }
      if (run) {
        parts.push("runs", run);
      }
    }
  }
  // add "" in order to have a "/" at the end
  parts.push("");
  return parts.join("/");
}

export function buildPipelineRunDisplayUrl({
  organization,
  pipelines,
  branch,
  run,
}: PipelineRunUrlParams) {
  const parts = ["/blue/organizations"];
  if (organization) {
    parts.push(encodeURIComponent(organization));
    if (pipelines.length > 0) {
      parts.push(encodeURIComponent(pipelines.join("/")));
      if (!branch && run) {
        branch = pipelines[pipelines.length - 1];
      }
      if (branch) {
        parts.push("detail", encodeURIComponent(branch));
        if (run) {
          parts.push(run);
        }
      }
    }
  }
  return parts.join("/");
}

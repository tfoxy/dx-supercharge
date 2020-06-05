import { BlueOceanPipelineRunImpl } from "./blueOceanTypes";

export const JENKINS_MESSAGE_TYPE = "JENKINS";
export const FAVICON_MESSAGE_TYPE = "FAVICON";

export interface JenkinsData {
  pipelineRuns: BlueOceanPipelineRunImpl[];
}

export interface JenkinsMessage {
  type: typeof JENKINS_MESSAGE_TYPE;
  pipelineRun: BlueOceanPipelineRunImpl;
  options: AddPipelineRunOptions;
}

export interface FaviconMessage {
  type: typeof FAVICON_MESSAGE_TYPE;
  status: string;
}

export interface AddPipelineRunOptions {
  store: boolean;
  notify: boolean;
}

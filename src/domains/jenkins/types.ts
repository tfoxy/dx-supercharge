import { BlueOceanPipelineRunImpl } from "./blueOceanTypes";

export const JENKINS_PORT_NAME = "JENKINS";
export const PIPELINE_RUN_MESSAGE_TYPE = "PIPELINE_RUN";
export const HISTORY_MESSAGE_TYPE = "HISTORY";
export const FAVICON_MESSAGE_TYPE = "FAVICON";

export interface JenkinsData {
  pipelineRuns: BlueOceanPipelineRunImpl[];
}

export type JenkinsMessage = PipelineRunMessage | HistoryMessage;
export type PageScriptMessage = PipelineRunMessage | FaviconMessage;

export interface PipelineRunMessage {
  type: typeof PIPELINE_RUN_MESSAGE_TYPE;
  pipelineRun: BlueOceanPipelineRunImpl;
  options: AddPipelineRunOptions;
}

export interface FaviconMessage {
  type: typeof FAVICON_MESSAGE_TYPE;
  status: string;
  historyChanged: boolean;
}

export interface HistoryMessage {
  type: typeof HISTORY_MESSAGE_TYPE;
  url: string;
}

export interface AddPipelineRunOptions {
  store: boolean;
  notify: boolean;
}

export interface PageTab {
  tabId: number;
  frameId: number;
  url: string;
}

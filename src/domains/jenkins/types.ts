import { BlueOceanActivity } from "./blueOceanWindowTypes";

// runtime message type:
export const JENKINS_MESSAGE_TYPE = "JENKINS";
// content script message type:
export const ACTIVITY_MESSAGE_TYPE = "activity";
export const HISTORY_MESSAGE_TYPE = "history";

export interface JenkinsStatusChange {
  url: string;
  status: string;
  name: string;
}

export interface JenkinsMessage extends JenkinsStatusChange {
  type: typeof JENKINS_MESSAGE_TYPE;
}

export type PageScriptMessage<
  T extends BlueOceanActivity = BlueOceanActivity
> = ActivityMessage<T> | HistoryMessage<T>;

export interface ActivityMessage<
  T extends BlueOceanActivity = BlueOceanActivity
> {
  type: typeof ACTIVITY_MESSAGE_TYPE;
  apiUrl: string;
  activity: T;
  oldActivity?: T;
  authUserId: string;
}

export interface HistoryMessage<
  T extends BlueOceanActivity = BlueOceanActivity
> {
  type: typeof HISTORY_MESSAGE_TYPE;
  apiUrl: string;
  activity: T | undefined;
  authUserId: string;
}

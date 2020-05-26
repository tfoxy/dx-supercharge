import { BlueOceanActivity } from "./blueOceanWindowTypes";

export const JENKINS_MESSAGE_TYPE = "JENKINS";

export interface JenkinsStatusChange {
  url: string;
  status: string;
  title: string;
}

export interface JenkinsMessage extends JenkinsStatusChange {
  type: typeof JENKINS_MESSAGE_TYPE;
}

export const ACTIVITY_MESSAGE_TYPE = "activity";

export interface ActivityMessage<
  T extends BlueOceanActivity = BlueOceanActivity
> {
  type: typeof ACTIVITY_MESSAGE_TYPE;
  activityApiUrl: string;
  activity: T;
  oldActivity?: T;
  authUserId: string;
}

export const JENKINS_MESSAGE_TYPE = "JENKINS";

export interface JenkinsStatusChange {
  url: string;
  status: string;
  title: string;
}

export interface JenkinsMessage extends JenkinsStatusChange {
  type: typeof JENKINS_MESSAGE_TYPE;
}

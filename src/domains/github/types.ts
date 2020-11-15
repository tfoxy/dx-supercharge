export const GITHUB_PORT_NAME = "GITHUB";
export const STATUS_MESSAGE_TYPE = "STATUS";

export type GithubMessage = StatusMessage;

export interface StatusMessage {
  type: typeof STATUS_MESSAGE_TYPE;
  pageTitle: string;
  statusMessage: string;
  statusList: ActionStatus[];
  iconUrl: string;
}

export interface ActionStatus {
  type: ActionStatusType;
  message: string;
}

export enum ActionStatusType {
  ERROR,
  CONFLICT,
  WARNING,
  MERGE_REQUIRED,
  PROGRESS,
  SUCCESS,
  UNKNOWN,
}

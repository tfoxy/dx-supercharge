export const GITHUB_PORT_NAME = "GITHUB";
export const STATUS_MESSAGE_TYPE = "STATUS";

export type GithubMessage = StatusMessage;

export interface StatusMessage {
  type: typeof STATUS_MESSAGE_TYPE;
  pageTitle: string;
  statusMessage: string;
  statusMapping: ActionStatusMapping;
  iconUrl: string;
}

export interface ActionStatusMapping {
  review: ActionStatus;
  check: ActionStatus;
  merge: ActionStatus;
}

export interface ActionStatus {
  type: ActionStatusType;
  message: string;
}

export enum ActionStatusType {
  UNKNOWN,
  MERGED,
  SUCCESS,
  COMMENT,
  PROGRESS,
  MERGE_REQUIRED,
  WARNING,
  CONFLICT,
  CHANGES_REQUESTED,
  ERROR,
  CLOSED,
}

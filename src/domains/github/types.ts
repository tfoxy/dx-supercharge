export const GITHUB_PORT_NAME = "GITHUB";
export const STATUS_MESSAGE_TYPE = "STATUS";

export type GithubMessage = StatusMessage;

export interface StatusMessage {
  type: typeof STATUS_MESSAGE_TYPE;
  pageTitle: string;
  status: string;
  iconUrl: string;
}

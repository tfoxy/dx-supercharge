export const GITHUB_MESSAGE_TYPE = "GITHUB";

export interface GithubStatusChange {
  status: string;
  title: string;
}

export interface GithubMessage extends GithubStatusChange {
  type: typeof GITHUB_MESSAGE_TYPE;
}

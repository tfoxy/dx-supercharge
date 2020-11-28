import { ActionStatus, ActionStatusType } from "./types";

const statusTypeByPrState: Record<string, ActionStatusType> = {
  purple: ActionStatusType.MERGED,
  red: ActionStatusType.CLOSED,
};

const messageByStatusType: Record<number, string> = {
  [ActionStatusType.MERGED]: "Merged",
  [ActionStatusType.CLOSED]: "Closed",
};

export default function getMergeStatus(pageContainer: Element): ActionStatus {
  const prState = pageContainer.querySelector(".gh-header-meta .State");
  if (!prState) {
    return {
      message: "",
      type: ActionStatusType.UNKNOWN,
    };
  }

  const stateClass = [...prState.classList].find((c) =>
    c.startsWith("State--")
  );
  const state = stateClass?.slice("State--".length);
  const mergeType = statusTypeByPrState[state ?? ""];

  return {
    message: messageByStatusType[mergeType ?? ""] ?? "",
    type: mergeType ?? ActionStatusType.UNKNOWN,
  };
}

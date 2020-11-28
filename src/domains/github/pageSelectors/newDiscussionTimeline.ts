import { ActionStatus, ActionStatusType } from "../types";
import { getStatusTypeFromIconElement } from "../utils";

export function getLastCheckStatusFromNewDiscussionTimeline(
  pageContainer: Element
): ActionStatus {
  const commitBuildStatuses = pageContainer.querySelectorAll(
    ".new-discussion-timeline .commit-build-statuses"
  );

  if (commitBuildStatuses.length) {
    const lastStatus = commitBuildStatuses[commitBuildStatuses.length - 1];
    const octicon = lastStatus.querySelector(".octicon");

    if (octicon) {
      return {
        message: octicon.getAttribute("aria-label") ?? "",
        type: getStatusTypeFromIconElement(octicon),
      };
    }
  }

  return {
    message: "",
    type: ActionStatusType.UNKNOWN,
  };
}

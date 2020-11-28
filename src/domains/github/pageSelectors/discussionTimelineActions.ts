import { ActionStatus, ActionStatusMapping, ActionStatusType } from "../types";
import { createActionStatusMapping } from "../utils";

export default function getActionStatusMappingFromDiscussionTimelineActions(
  pageContainer: Element
): ActionStatusMapping {
  const discussionTimelineActions = pageContainer.querySelector(
    ".discussion-timeline-actions"
  );
  if (!discussionTimelineActions) {
    return createActionStatusMapping();
  }

  const actionItemElements = discussionTimelineActions.querySelectorAll(
    ".js-details-container > .branch-action-item"
  );

  if (actionItemElements.length < 3) {
    return createActionStatusMapping();
  }

  const newStatusList = [...actionItemElements].map(
    getStatusFromActionItemElement
  );

  return {
    review: newStatusList[0],
    check: newStatusList[1],
    merge: newStatusList[2],
  };
}

function getStatusFromActionItemElement(element: Element): ActionStatus {
  let type = ActionStatusType.UNKNOWN;
  let message = "";

  const statusHeading = element.querySelector(".status-heading");
  if (statusHeading) {
    const { classList } = statusHeading;
    if (classList.contains("text-red")) {
      type = ActionStatusType.ERROR;
    } else if (classList.contains("text-yellow")) {
      type = ActionStatusType.PROGRESS;
    }
    message = statusHeading.textContent?.trim() ?? "";
  }

  const updateBranchFormElement = element.querySelector(
    ".js-update-branch-form"
  );
  const resolveConflictAnchorElement = element.querySelector(
    '[href$="/conflicts"]'
  );
  if (updateBranchFormElement) {
    type = ActionStatusType.MERGE_REQUIRED;
  }
  if (resolveConflictAnchorElement) {
    type = ActionStatusType.CONFLICT;
  }

  if (type <= ActionStatusType.PROGRESS) {
    const icon = element.querySelector(
      ":not(.merging-body-merge-warning) > .branch-action-item-icon"
    );
    if (icon) {
      const { classList } = icon;
      if (classList.contains("completeness-indicator-success")) {
        type = ActionStatusType.SUCCESS;
      } else if (classList.contains("completeness-indicator-problem")) {
        type = ActionStatusType.WARNING;
      }
    }
  }

  return {
    type,
    message,
  };
}

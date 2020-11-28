import { ActionStatusType } from "../types";
import { getStatusTypeFromIconElement } from "../utils";

export default function getReviewTypeFromIssueSidebarForm(
  pageContainer: Element
): ActionStatusType {
  const sidebarForm = pageContainer.querySelector(".js-issue-sidebar-form");
  if (!sidebarForm) {
    return ActionStatusType.UNKNOWN;
  }

  const iconElements = sidebarForm.querySelectorAll(
    ".reviewers-status-icon.float-right:not(.mr-2) > .octicon"
  );
  const types = [...iconElements]
    .map(getStatusTypeFromIconElement)
    .filter((type) => typeof type !== "undefined");

  if (!types.length) {
    return ActionStatusType.UNKNOWN;
  }

  return Math.max(...types);
}

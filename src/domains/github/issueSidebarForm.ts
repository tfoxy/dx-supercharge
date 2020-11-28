import { ActionStatusType } from "./types";

const statusTypeByIcon: Record<string, ActionStatusType> = {
  check: ActionStatusType.SUCCESS,
  "dot-fill": ActionStatusType.PROGRESS,
  comment: ActionStatusType.COMMENT,
  "file-diff": ActionStatusType.CHANGES_REQUESTED,
};

export default function getReviewType(
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
    .map((el) => {
      const iconClass = [...el.classList].find((c) => c.startsWith("octicon-"));
      const icon = iconClass?.slice("octicon-".length);
      return statusTypeByIcon[icon ?? ""];
    })
    .filter((type) => typeof type !== "undefined");

  if (!types.length) {
    return ActionStatusType.UNKNOWN;
  }

  return Math.max(...types);
}

import { ActionStatusMapping, ActionStatusType } from "./types";

const statusTypeByIcon: Record<string, ActionStatusType> = {
  check: ActionStatusType.SUCCESS,
  comment: ActionStatusType.COMMENT,
  "dot-fill": ActionStatusType.PROGRESS,
  "file-diff": ActionStatusType.CHANGES_REQUESTED,
  x: ActionStatusType.ERROR,
};

export function createActionStatusMapping(): ActionStatusMapping {
  return {
    check: {
      message: "",
      type: ActionStatusType.UNKNOWN,
    },
    merge: {
      message: "",
      type: ActionStatusType.UNKNOWN,
    },
    review: {
      message: "",
      type: ActionStatusType.UNKNOWN,
    },
  };
}

export function getStatusTypeFromIconElement(
  iconElement: Element
): ActionStatusType {
  const iconClass = [...iconElement.classList].find((c) =>
    c.startsWith("octicon-")
  );
  const iconName = iconClass?.slice("octicon-".length);
  return statusTypeByIcon[iconName ?? ""] ?? ActionStatusType.UNKNOWN;
}

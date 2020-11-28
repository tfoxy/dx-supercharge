import { ActionStatusMapping, ActionStatusType } from "./types";

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

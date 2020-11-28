import { ActionStatusType } from "../types";

export default function getMergeTypeFromPreMergability(
  pageContainer: Element
): ActionStatusType {
  const hasConflict = pageContainer.querySelector(".pre-mergability .text-red");
  return hasConflict ? ActionStatusType.CONFLICT : ActionStatusType.UNKNOWN;
}

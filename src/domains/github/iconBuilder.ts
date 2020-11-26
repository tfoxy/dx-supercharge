import { ActionStatusMapping, ActionStatusType } from "./types";
import {
  favicon,
  octiconCheck,
  octiconComment,
  octiconDotFill,
  octiconFileDiff,
  octiconX,
} from "./icons";
import { assertUnreachable } from "../utils/assertions";

const SVG_MIME_TYPE = "image/svg+xml";

interface TemplateOptions {
  topRightIcon?: string;
  bottomRightIcon?: string;
  faviconColor?: string;
}

export function iconBuilder(statusMapping: ActionStatusMapping): string {
  const darkMode = window.matchMedia("(prefers-color-scheme: dark)").matches;
  const topRightIcon = getStatusIcon(statusMapping.review.type);
  const bottomRightIcon = getStatusIcon(statusMapping.check.type);
  const faviconColor = getFaviconColor(statusMapping.merge.type, darkMode);
  const newFavicon = buildFaviconFromTemplate({
    topRightIcon,
    bottomRightIcon,
    faviconColor,
  });
  const dataUri = `data:${SVG_MIME_TYPE};base64,${btoa(newFavicon)}`;
  return dataUri;
}

function getStatusIcon(type: ActionStatusType): string | undefined {
  switch (type) {
    case ActionStatusType.ERROR:
    case ActionStatusType.CONFLICT:
    case ActionStatusType.WARNING:
    case ActionStatusType.MERGE_REQUIRED:
      return octiconX;
    case ActionStatusType.CHANGES_REQUESTED:
      return octiconFileDiff;
    case ActionStatusType.COMMENT:
      return octiconComment;
    case ActionStatusType.PROGRESS:
      return octiconDotFill;
    case ActionStatusType.SUCCESS:
      return octiconCheck;
    case ActionStatusType.UNKNOWN:
    case ActionStatusType.CLOSED:
    case ActionStatusType.MERGED:
      return undefined;
    default:
      assertUnreachable(type);
  }
}

function getFaviconColor(
  type: ActionStatusType,
  darkMode: boolean
): string | undefined {
  switch (type) {
    case ActionStatusType.UNKNOWN:
    case ActionStatusType.ERROR:
    case ActionStatusType.CHANGES_REQUESTED:
    case ActionStatusType.COMMENT:
      return darkMode ? "white" : undefined;
    case ActionStatusType.CLOSED:
      return "#d82828";
    case ActionStatusType.CONFLICT:
    case ActionStatusType.WARNING:
      return "#f3582c";
    case ActionStatusType.MERGE_REQUIRED:
      return "#6a737d";
    case ActionStatusType.PROGRESS:
      return "#dbab09";
    case ActionStatusType.SUCCESS:
      return "#22863a";
    case ActionStatusType.MERGED:
      return "#73589a";
    default:
      assertUnreachable(type);
  }
}

function buildFaviconFromTemplate({
  faviconColor,
  bottomRightIcon,
  topRightIcon,
}: TemplateOptions): string {
  const document = new DOMParser().parseFromString(favicon, SVG_MIME_TYPE);
  if (faviconColor) {
    const faviconElement = document.getElementById("favicon");
    assertIsDefined(faviconElement);
    faviconElement.setAttribute("fill", faviconColor);
  }
  setFaviconInnerIcon(document, topRightIcon, "upper");
  setFaviconInnerIcon(document, bottomRightIcon, "lower");
  return new XMLSerializer().serializeToString(document.documentElement);
}

function setFaviconInnerIcon(
  document: Document,
  icon: string | undefined,
  position: "upper" | "lower"
) {
  if (icon) {
    const groupElement = document.getElementById(`${position}-right-group`);
    const cutElement = document.getElementById(`${position}-right-cut`);
    assertIsDefined(groupElement);
    assertIsDefined(cutElement);
    groupElement.innerHTML = icon;
    cutElement.parentElement?.removeChild(cutElement);
  }
}

function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(`Expected 'val' to be defined, but received ${val}`);
  }
}

import { browser } from "webextension-polyfill-ts";
import { createFaviconManager, FaviconManager } from "../faviconManager";
import { iconBuilder } from "./iconBuilder";
import {
  ActionStatus,
  ActionStatusMapping,
  ActionStatusType,
  GITHUB_PORT_NAME,
  StatusMessage,
  STATUS_MESSAGE_TYPE,
} from "./types";

interface PageState {
  statusList: ActionStatus[];
  iconUrl: string;
}

const statusTypeByPrState: Record<string, ActionStatusType> = {
  purple: ActionStatusType.MERGED,
  red: ActionStatusType.CLOSED,
};

const messageByStatusType: Record<number, string> = {
  [ActionStatusType.MERGED]: "Merged",
  [ActionStatusType.CLOSED]: "Closed",
};

const statusTypeByIcon: Record<string, ActionStatusType> = {
  "dot-fill": ActionStatusType.PROGRESS,
  comment: ActionStatusType.COMMENT,
  "file-diff": ActionStatusType.CHANGES_REQUESTED,
};

export function executeGithubContentScript() {
  const pageContainer = document.querySelector("#js-repo-pjax-container");
  if (pageContainer) {
    observePullRequestPageChanges(pageContainer);
  }
}

function observePullRequestPageChanges(pageContainer: Element) {
  const pageState: PageState = {
    statusList: [],
    iconUrl: "",
  };
  const faviconManager = createFaviconManager();

  const observer = new MutationObserver(triggerObserver);
  observer.observe(pageContainer, { childList: true });

  triggerObserver();

  function triggerObserver() {
    const discussionTimelineActions = pageContainer.querySelector(
      ".discussion-timeline-actions"
    );
    if (discussionTimelineActions) {
      observePullRequestStatusChanges(
        discussionTimelineActions,
        pageContainer,
        pageState,
        faviconManager
      );
    }
  }
}

function observePullRequestStatusChanges(
  discussionTimelineActions: Element,
  pageContainer: Element,
  pageState: PageState,
  faviconManager: FaviconManager
) {
  const port = browser.runtime.connect(undefined, { name: GITHUB_PORT_NAME });

  const observer = new MutationObserver(notifyStatusChange);
  observer.observe(discussionTimelineActions, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  notifyStatusChange();

  async function notifyStatusChange() {
    const actionItemElements = discussionTimelineActions.querySelectorAll(
      ".js-details-container > .branch-action-item"
    );

    if (actionItemElements.length !== 3) {
      const mergeType = getMergeTypeFromPrState(pageContainer);
      if (typeof mergeType === "undefined") return;
      const mergeStatus: ActionStatus = {
        message: messageByStatusType[mergeType],
        type: mergeType,
      };
      const statusMapping: ActionStatusMapping = {
        review: { message: "", type: ActionStatusType.UNKNOWN },
        check: { message: "", type: ActionStatusType.UNKNOWN },
        merge: mergeStatus,
      };
      const iconUrl = iconBuilder(statusMapping);
      if (pageState.iconUrl !== iconUrl) {
        faviconManager.setDocumentIconUrl(iconUrl);
        pageState.iconUrl = iconUrl;
      }
      if (
        pageState.statusList.length > 0 &&
        pageState.statusList[0].type !== mergeType
      ) {
        const message: StatusMessage = {
          type: STATUS_MESSAGE_TYPE,
          statusMessage: mergeStatus.message,
          statusMapping,
          pageTitle: document.title,
          iconUrl,
        };
        port.postMessage(message);
      }
      pageState.statusList = [mergeStatus];
      return;
    }

    const newStatusList = [...actionItemElements].map(
      getStatusFromActionItemElement
    );
    const statusMapping = {
      review: newStatusList[0],
      check: newStatusList[1],
      merge: newStatusList[2],
    };

    if (statusMapping.review.type !== ActionStatusType.SUCCESS) {
      const reviewType = getReviewTypeFromIssueSidebar(pageContainer);
      if (reviewType) {
        statusMapping.review.type = reviewType;
      }
    }

    const iconUrl = iconBuilder(statusMapping);
    if (pageState.iconUrl !== iconUrl) {
      faviconManager.setDocumentIconUrl(iconUrl);
      pageState.iconUrl = iconUrl;
    }

    if (
      [ActionStatusType.PROGRESS, ActionStatusType.UNKNOWN].includes(
        statusMapping.merge.type
      )
    ) {
      return;
    }
    const statusMessage = newStatusList
      .filter((s, i) => s.message !== pageState.statusList[i]?.message)
      .map((s) => s.message)
      .join(" / ");

    if (pageState.statusList.length > 0 && statusMessage) {
      const message: StatusMessage = {
        type: STATUS_MESSAGE_TYPE,
        statusMessage,
        statusMapping,
        pageTitle: document.title,
        iconUrl,
      };
      port.postMessage(message);
    }

    pageState.statusList = newStatusList;
  }
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

  if (type >= ActionStatusType.PROGRESS) {
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

function getMergeTypeFromPrState(
  pageContainer: Element
): ActionStatusType | undefined {
  const prState = pageContainer.querySelector(".gh-header-meta .State");
  if (!prState) {
    return;
  }

  const stateClass = [...prState.classList].find((c) =>
    c.startsWith("State--")
  );
  const state = stateClass?.slice("State--".length);
  return statusTypeByPrState[state ?? ""];
}

function getReviewTypeFromIssueSidebar(
  pageContainer: Element
): ActionStatusType | undefined {
  const sidebarForm = pageContainer.querySelector(".js-issue-sidebar-form");
  if (!sidebarForm) {
    return;
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
    return;
  }

  return Math.min(...types);
}

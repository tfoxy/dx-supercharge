import { browser } from "webextension-polyfill-ts";
import { createFaviconManager, FaviconManager } from "../faviconManager";
import { iconBuilder } from "./iconBuilder";
import {
  ActionStatus,
  ActionStatusType,
  GITHUB_PORT_NAME,
  StatusMessage,
  STATUS_MESSAGE_TYPE,
} from "./types";

interface PageState {
  statusList: ActionStatus[];
  iconUrl: string;
}

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
        pageState,
        faviconManager
      );
    }
  }
}

function observePullRequestStatusChanges(
  discussionTimelineActions: Element,
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
      return;
    }
    const newStatusList = [...actionItemElements].map(
      getStatusFromActionItemElement
    );
    const mergeStatus = newStatusList[2];

    const iconUrl = iconBuilder(newStatusList);
    if (pageState.iconUrl !== iconUrl) {
      faviconManager.setDocumentIconUrl(iconUrl);
      pageState.iconUrl = iconUrl;
    }

    if (
      mergeStatus.type === ActionStatusType.PROGRESS ||
      mergeStatus.type === ActionStatusType.UNKNOWN
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
        statusList: newStatusList,
        pageTitle: document.title,
        // iconUrl: await getFaviconDataUrl(),
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
  if (type > ActionStatusType.ERROR) {
    const icon = element.querySelector(
      ":not(.merging-body-merge-warning) > .branch-action-item-icon"
    );
    console.log(icon, element.textContent);
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

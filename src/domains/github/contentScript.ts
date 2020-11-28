import PageState from "./PageState";
import getActionStatusMapping from "./discussionTimelineActions";
import getMergeStatus from "./headerState";
import getReviewType from "./issueSidebarForm";
import { ActionStatusType } from "./types";

export function executeGithubContentScript() {
  const pageContainer = document.querySelector("#js-repo-pjax-container");

  if (!pageContainer) return;

  const callback = createObserverCallback(pageContainer);

  const observer = new MutationObserver(callback);
  observer.observe(pageContainer, { childList: true });

  callback();
}

function createObserverCallback(pageContainer: Element) {
  const pageState = new PageState();

  return callback;

  function callback() {
    const actionStatusMapping = getActionStatusMapping(pageContainer);
    const mergeStatus = getMergeStatus(pageContainer);
    const reviewType = getReviewType(pageContainer);

    if (mergeStatus.type) {
      actionStatusMapping.merge = mergeStatus;
    }

    if (
      reviewType &&
      actionStatusMapping.review.type !== ActionStatusType.SUCCESS
    ) {
      actionStatusMapping.review.type = reviewType;
    }

    pageState.setActionStatusMapping(actionStatusMapping);
  }
}

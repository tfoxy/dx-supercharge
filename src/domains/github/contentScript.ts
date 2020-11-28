import PageState from "./PageState";
import getActionStatusMappingFromDiscussionTimelineActions from "./pageSelectors/discussionTimelineActions";
import getMergeStatusFromHeaderState from "./pageSelectors/headerState";
import getReviewTypeFromIssueSidebarForm from "./pageSelectors/issueSidebarForm";
import { getLastCheckStatusFromNewDiscussionTimeline } from "./pageSelectors/newDiscussionTimeline";
import getMergeTypeFromPreMergability from "./pageSelectors/preMergability";
import { ActionStatusMapping, ActionStatusType } from "./types";
import { createActionStatusMapping } from "./utils";

export function executeGithubContentScript() {
  const pageContainer = document.querySelector("#js-repo-pjax-container");

  if (!pageContainer) return;

  const callback = createObserverCallback(pageContainer);

  const observer = new MutationObserver(callback);
  observer.observe(pageContainer, {
    attributes: true,
    subtree: true,
  });

  callback();
}

function createObserverCallback(pageContainer: Element) {
  const pageState = new PageState();

  return callback;

  function callback() {
    const actionStatusMapping = getPageActionStatusMapping(pageContainer);
    pageState.setActionStatusMapping(actionStatusMapping);
  }
}

function getPageActionStatusMapping(
  pageContainer: Element
): ActionStatusMapping {
  const { pathname } = window.location;
  if (pathname.includes("/pull/")) {
    return handlePullRequestPage(pageContainer);
  } else if (pathname.includes("/compare/")) {
    return handleComparePage(pageContainer);
  }
  return createActionStatusMapping();
}

function handlePullRequestPage(pageContainer: Element): ActionStatusMapping {
  const mapping = getActionStatusMappingFromDiscussionTimelineActions(
    pageContainer
  );
  const mergeStatus = getMergeStatusFromHeaderState(pageContainer);
  const reviewType = getReviewTypeFromIssueSidebarForm(pageContainer);

  if (mergeStatus.type) {
    mapping.merge = mergeStatus;
    mapping.check = getLastCheckStatusFromNewDiscussionTimeline(pageContainer);
  }

  if (reviewType && mapping.review.type !== ActionStatusType.SUCCESS) {
    mapping.review.type = reviewType;
  }

  return mapping;
}

function handleComparePage(pageContainer: Element): ActionStatusMapping {
  const mapping = createActionStatusMapping();
  mapping.merge.type = getMergeTypeFromPreMergability(pageContainer);
  mapping.check = getLastCheckStatusFromNewDiscussionTimeline(pageContainer);
  return mapping;
}

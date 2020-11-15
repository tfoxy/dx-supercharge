import { browser } from "webextension-polyfill-ts";
import { GITHUB_PORT_NAME, StatusMessage, STATUS_MESSAGE_TYPE } from "./types";

interface PageState {
  statusList: string[];
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
  };

  const observer = new MutationObserver(triggerObserver);
  observer.observe(pageContainer, { childList: true });

  triggerObserver();

  function triggerObserver() {
    const discussionTimelineActions = pageContainer.querySelector(
      ".discussion-timeline-actions"
    );
    if (discussionTimelineActions) {
      observePullRequestStatusChanges(discussionTimelineActions, pageState);
    }
  }
}

function observePullRequestStatusChanges(
  discussionTimelineActions: Element,
  pageState: PageState
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
      ".branch-action-item"
    );

    if (actionItemElements.length !== 3) {
      return;
    }
    const newStatusList = [...actionItemElements].map(
      (el) => el.querySelector(".status-heading")?.textContent ?? ""
    );
    const status = newStatusList
      .filter((s, i) => s !== pageState.statusList[i])
      .map((s) => s.trim())
      .join(" / ");
    if (status.includes("Checking for ability to merge automatically")) {
      console.log([...actionItemElements]);
    }
    if (pageState.statusList.length > 0 && status) {
      const message: StatusMessage = {
        type: STATUS_MESSAGE_TYPE,
        status,
        pageTitle: document.title,
        iconUrl: await getFaviconDataUrl(),
      };
      port.postMessage(message);
    }

    pageState.statusList = newStatusList;
  }
}

function getFaviconDataUrl() {
  const url =
    document.head.querySelector('link[rel="icon"]')?.getAttribute("href") ?? "";
  return toDataUrl(url);
}

function toDataUrl(url: string) {
  return new Promise<string>((resolve, reject) => {
    var xhr = new XMLHttpRequest();
    xhr.onload = () => {
      var reader = new FileReader();
      reader.onloadend = () => {
        resolve(getStringFromFileReaderResult(reader.result));
      };
      reader.readAsDataURL(xhr.response);
    };
    xhr.onerror = reject;
    xhr.open("GET", url);
    xhr.responseType = "blob";
    xhr.send();
  });
}

function getStringFromFileReaderResult(
  result: string | ArrayBuffer | null
): string {
  if (!result) return "";
  if (result instanceof ArrayBuffer) {
    const decoder = new TextDecoder("utf-8");
    return decoder.decode(result);
  }
  return result;
}

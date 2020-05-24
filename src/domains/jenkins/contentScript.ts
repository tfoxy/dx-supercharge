import { sendJenkinsStatusChange } from "./client";

export function executeJenkinsContentScript() {
  let status = "";

  const observer = new MutationObserver(detectStatusChange);
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  function detectStatusChange() {
    const resultPageHeader = document.querySelector(".ResultPageHeader");
    const newStatus = getNewStatus(resultPageHeader);

    if (newStatus && status !== newStatus) {
      sendJenkinsStatusChange({
        url: getPipelineUrl(resultPageHeader),
        title: document.title,
        status: newStatus,
      });
    }

    status = newStatus;
  }
}

function getNewStatus(resultPageHeader: Element | null): string {
  if (resultPageHeader) {
    const statusClass = [...resultPageHeader.classList].find((string) =>
      string.startsWith("BasicHeader--")
    );
    if (statusClass) {
      const match = statusClass.match(/BasicHeader--(.*)/);
      if (match) {
        return match[1];
      }
    }
  }
  return "";
}

function getPipelineUrl(resultPageHeader: Element | null): string {
  if (resultPageHeader) {
    const pipelineAnchor: HTMLAnchorElement | null = resultPageHeader.querySelector(
      "nav > a.pipeline"
    );
    if (pipelineAnchor) {
      return pipelineAnchor.href;
    }
  }
  return window.location.href;
}

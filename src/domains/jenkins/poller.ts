import { storageWrapper } from "./jenkinsStorage";
import { filterTabsByApiUrl } from "./pageTabs";

const POLLER_INTERVAL = 5000;

const timeoutByRun = new Map<string, ReturnType<typeof setTimeout>>();

export function reviewPolling() {
  const pendingUrls = getPendingUrls();
  const { openedUrls, closedUrls } = groupPendingUrlsByOpenedOrClosed(
    pendingUrls
  );

  removeNotPendingTimeouts(pendingUrls);
  removeOpenedUrlsTimeouts(openedUrls);
  addClosedUrlsTimeouts(closedUrls);
}

export function getPollers() {
  return timeoutByRun;
}

function getPendingUrls() {
  return storageWrapper
    .get()
    .pipelineRuns.filter((run) => run.result === "UNKNOWN")
    .map((run) => run._links.self.href);
}

function groupPendingUrlsByOpenedOrClosed(pendingUrls: string[]) {
  const openedUrls = pendingUrls.filter(
    (url) => filterTabsByApiUrl(url).length > 0
  );
  return {
    openedUrls,
    closedUrls: pendingUrls.filter((url) => !openedUrls.includes(url)),
  };
}

function removeNotPendingTimeouts(pendingUrls: string[]) {
  [...timeoutByRun.entries()].forEach(([url, timeoutId]) => {
    if (!pendingUrls.includes(url)) {
      timeoutByRun.delete(url);
      clearTimeout(timeoutId);
    }
  });
}

function removeOpenedUrlsTimeouts(openedUrls: string[]) {
  openedUrls.forEach((url) => {
    const timeoutId = timeoutByRun.get(url);
    if (timeoutId) {
      timeoutByRun.delete(url);
      clearTimeout(timeoutId);
    }
  });
}

function addClosedUrlsTimeouts(closedUrls: string[]) {
  closedUrls.forEach((url) => {
    if (!timeoutByRun.has(url)) {
      createPoller(url);
    }
  });
}

function createPoller(url: string) {
  timeoutByRun.set(
    url,
    setTimeout(async () => {
      await fetchData(url);
      createPoller(url);
    }, POLLER_INTERVAL)
  );
}

function fetchData(apiUrl: string) {}

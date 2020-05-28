type HistoryChangeListener = (event: PopStateEvent) => void;

export function addHistoryChangeListener(listener: HistoryChangeListener) {
  const { history } = window;
  const { pushState, replaceState } = history;
  window.addEventListener("popstate", listener);
  history.pushState = pushStateFromHistoryChangeListener;
  history.replaceState = replaceStateFromHistoryChangeListener;

  function pushStateFromHistoryChangeListener() {
    pushState.apply(history, arguments as any);
    listener(new PopStateEvent("pushstate", { state: arguments[0] }));
  }

  function replaceStateFromHistoryChangeListener() {
    replaceState.apply(history, arguments as any);
    listener(new PopStateEvent("replacestate", { state: arguments[0] }));
  }
}

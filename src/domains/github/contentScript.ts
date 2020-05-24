export function executeGithubContentScript() {
  let status = "";

  const observer = new MutationObserver(detectStatusChange);
  observer.observe(document.body, {
    attributes: true,
    childList: true,
    subtree: true,
  });

  function detectStatusChange() {
    const resultPageHeader = document.querySelector(".ResultPageHeader");
    let newStatus = "";

    if (resultPageHeader) {
      const statusClass = [...resultPageHeader.classList].find((string) =>
        string.startsWith("BasicHeader--")
      );
      if (statusClass) {
        const match = statusClass.match(/BasicHeader--(.*)/);
        if (match) {
          newStatus = match[1];
        }
      }
    }

    if (status && newStatus && status !== newStatus) {
      console.log("adsf");
    }

    status = newStatus;
  }
}

import { browser } from "webextension-polyfill-ts";

export interface FaviconManager {
  setDocumentIconUrl(iconUrl: string): void;
  removeIcon(): void;
}

export function createFaviconManager(): FaviconManager {
  let previousIconLink: HTMLLinkElement | undefined;
  let iconLink: HTMLLinkElement | undefined;

  return {
    setDocumentIconUrl(iconUrl) {
      if (!iconLink) {
        iconLink = document.createElement("link");
        iconLink.rel = "icon";
      }
      iconLink.type = "image/svg+xml";
      iconLink.href = iconUrl;
      if (!iconLink.parentNode) {
        previousIconLink = document.head.querySelector(
          'link[rel="icon"]'
        ) as HTMLLinkElement;
        document.head.appendChild(iconLink);
        if (previousIconLink) {
          document.head.removeChild(previousIconLink);
        }
      }
    },

    removeIcon() {
      if (iconLink) {
        if (previousIconLink) {
          document.head.appendChild(previousIconLink);
          document.head.removeChild(iconLink);
        } else {
          iconLink.type = "image/x-icon";
          iconLink.href = "/favicon.ico";
        }
      }
    },
  };
}

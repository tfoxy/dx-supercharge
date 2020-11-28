import { browser } from "webextension-polyfill-ts";
import { createFaviconManager } from "../faviconManager";
import { iconBuilder } from "./iconBuilder";
import {
  ActionStatusMapping,
  GITHUB_PORT_NAME,
  StatusMessage,
  STATUS_MESSAGE_TYPE,
} from "./types";
import { createActionStatusMapping } from "./utils";

export default class PageState {
  private readonly port = browser.runtime.connect(undefined, {
    name: GITHUB_PORT_NAME,
  });
  private readonly faviconManager = createFaviconManager();
  private statusMapping: ActionStatusMapping = createActionStatusMapping();

  public setActionStatusMapping(mapping: ActionStatusMapping) {
    const iconUrl = iconBuilder(mapping);
    this.faviconManager.setDocumentIconUrl(iconUrl);

    const oldStatusList = [
      this.statusMapping.review,
      this.statusMapping.check,
      this.statusMapping.merge,
    ];

    if (oldStatusList.every((s) => !s.type)) {
      this.statusMapping = mapping;
      return;
    }

    const statusMessage = [mapping.review, mapping.check, mapping.merge]
      .filter((s, i) => s.message && s.message !== oldStatusList[i].message)
      .map((s) => s.message)
      .join(" / ");

    if (!statusMessage) return;

    const message: StatusMessage = {
      type: STATUS_MESSAGE_TYPE,
      statusMessage,
      statusMapping: this.statusMapping,
      pageTitle: document.title,
      iconUrl,
    };
    this.port.postMessage(message);

    this.statusMapping = mapping;
  }
}

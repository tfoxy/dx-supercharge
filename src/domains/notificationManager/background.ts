import { browser, Notifications } from "webextension-polyfill-ts";
import { NotificationManagerOptions } from "./types";

interface NotificationData extends NotificationManagerOptions {
  timeoutId: ReturnType<typeof setTimeout>;
  notificationId: string;
}

const NOTIFICATION_TIMEOUT = 7500;

const notificationIdMap = new Map<string, NotificationData>();

export function registerNotificationListeners() {
  browser.notifications.onClicked.addListener(clickedListener);
  browser.notifications.onClosed.addListener(closedListener);
}

export async function createNotification(
  notificationId: string | undefined,
  options: Notifications.CreateNotificationOptions,
  managerOptions: NotificationManagerOptions = {}
) {
  const actualNotificationId = await browser.notifications.create(
    notificationId,
    options
  );
  const { tabId, onClose } = managerOptions;
  if (tabId || onClose) {
    const timeoutId = setTimeout(() => {
      clearNotification(actualNotificationId);
    }, NOTIFICATION_TIMEOUT);
    notificationIdMap.set(actualNotificationId, {
      notificationId: actualNotificationId,
      tabId,
      onClose,
      timeoutId,
    });
  }
  return actualNotificationId;
}

export function clearNotification(notificationId: string) {
  const data = notificationIdMap.get(notificationId);
  if (data) {
    clearTimeout(data.timeoutId);
  }
  notificationIdMap.delete(notificationId);
  browser.notifications.clear(notificationId);
}

function clickedListener(notificationId: string) {
  const data = notificationIdMap.get(notificationId);
  if (data) {
    if (data.tabId) {
      browser.tabs.update(data.tabId, { active: true });
    }
    clearNotification(notificationId);
  }
}

function closedListener(notificationId: string) {
  clearNotification(notificationId);
  const data = notificationIdMap.get(notificationId);
  if (data && data.onClose) {
    data.onClose();
  }
}

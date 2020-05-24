import { browser, Notifications } from "webextension-polyfill-ts";

interface NotificationData {
  tabId: number;
  timeoutId: ReturnType<typeof setTimeout>;
  notificationId: string;
}

const NOTIFICATION_TIMEOUT = 5000;

const notificationIdMap = new Map<string, NotificationData>();

export function registerNotificationListeners() {
  browser.notifications.onClicked.addListener(onNotificationClicked);
  browser.notifications.onClosed.addListener(clearNotification);
}

export async function createNotification(
  notificationId: string | undefined,
  options: Notifications.CreateNotificationOptions,
  managerOptions: { tabId?: number } = {}
) {
  const actualNotificationId = await browser.notifications.create(
    notificationId,
    options
  );
  const { tabId } = managerOptions;
  if (tabId) {
    const timeoutId = setTimeout(() => {
      clearNotification(actualNotificationId);
    }, NOTIFICATION_TIMEOUT);
    notificationIdMap.set(actualNotificationId, {
      notificationId: actualNotificationId,
      tabId,
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

function onNotificationClicked(notificationId: string) {
  const data = notificationIdMap.get(notificationId);
  if (data) {
    browser.tabs.update(data.tabId, { active: true });
    clearNotification(notificationId);
  }
}

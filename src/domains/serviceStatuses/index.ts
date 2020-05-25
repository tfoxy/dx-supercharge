import { StorageWrapper } from "../storageManager";
import { ServiceStatus, ServiceStatusChange } from "./types";
import { orderBy } from "lodash-es";
import { createNotification } from "../notificationManager/background";

const serviceStatusesStorageWrapper = new StorageWrapper("serviceStatuses", []);

export function addServiceStatusChange(change: ServiceStatusChange) {
  changeServiceStatuses((serviceStatuses) => {
    const serviceStatus = serviceStatuses.find((ss) => ss.url === change.url);
    if (serviceStatus && serviceStatus.status !== change.status) {
      updateServiceStatus(serviceStatus, change);
      createServiceStatusNotification(serviceStatus, change);
    } else {
      serviceStatuses.push(createServiceStatus(change));
    }
  });
}

export function turnOffChangedFlag(serviceUrl: string) {
  changeServiceStatuses((serviceStatuses) => {
    const serviceStatus = serviceStatuses.find((ss) => ss.url === serviceUrl);
    if (serviceStatus) {
      serviceStatus.changed = false;
    }
  });
}

export function turnOffAllChangedFlags() {
  changeServiceStatuses((serviceStatuses) => {
    serviceStatuses.forEach((ss) => {
      ss.changed = false;
    });
  });
}

function changeServiceStatuses(
  changer: (ServiceStatuses: ServiceStatus[]) => void
) {
  const serviceStatuses = serviceStatusesStorageWrapper.get();
  changer(serviceStatuses);
  orderBy(serviceStatuses, ["changed", "modifiedDate"], ["desc", "desc"]);
  serviceStatusesStorageWrapper.set(serviceStatuses);
}

function createServiceStatus(change: ServiceStatusChange): ServiceStatus {
  return {
    url: change.url,
    status: change.status,
    name: change.name,
    iconUrl: change.iconUrl,
    createdDate: change.createdDate ?? new Date().toISOString(),
    modifiedDate: change.modifiedDate ?? new Date().toISOString(),
    tabIds: [change.tabId],
    changed: false,
  };
}

function updateServiceStatus(
  serviceStatus: ServiceStatus,
  change: ServiceStatusChange
) {
  serviceStatus.status = change.status;
  serviceStatus.name = change.name;
  serviceStatus.iconUrl = change.iconUrl;
  serviceStatus.modifiedDate = change.modifiedDate ?? new Date().toISOString();
  if (!serviceStatus.tabIds.includes(change.tabId)) {
    serviceStatus.tabIds.push(change.tabId);
  }
  serviceStatus.changed = true;
}

function createServiceStatusNotification(
  serviceStatus: ServiceStatus,
  change: ServiceStatusChange
) {
  createNotification(
    undefined,
    {
      type: "basic",
      title: change.status,
      message: change.name,
      iconUrl: change.iconUrl,
    },
    {
      tabId: change.tabId,
      onClose: () => {
        turnOffChangedFlag(serviceStatus.url);
      },
    }
  );
}

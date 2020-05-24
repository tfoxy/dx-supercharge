export interface ServiceStatusChange {
  iconUrl: string;
  url: string;
  modifiedDate?: string;
  createdDate?: string;
  status: string;
  name: string;
  tabId: number;
}

export interface ServiceStatus {
  iconUrl: string;
  url: string;
  modifiedDate: string;
  createdDate: string;
  status: string;
  name: string;
  changed: boolean;
  tabIds: number[];
}

import { StorageData } from "./types";

export function getStorageData<K extends keyof StorageData>(
  key: K,
  defaultValue: StorageData[K]
): StorageData[K] | undefined {
  const item = localStorage.getItem(key);
  if (item == null) {
    return defaultValue;
  }
  return JSON.parse(item);
}

export function setStorageData<K extends keyof StorageData>(
  key: K,
  value: StorageData[K]
) {
  localStorage.setItem(key, JSON.stringify(value));
}

export class StorageWrapper<K extends keyof StorageData> {
  private key: K;
  private defaultValue: StorageData[K];
  private value?: StorageData[K];

  public constructor(key: K, defaultValue: StorageData[K]) {
    this.key = key;
    this.defaultValue = defaultValue;
  }

  public get(): StorageData[K] {
    if (!("value" in this)) {
      this.value = getStorageData(this.key, this.defaultValue);
    }
    return this.value as StorageData[K];
  }

  public set(value: StorageData[K]) {
    this.value = value;
    setStorageData(this.key, value);
  }

  public save() {
    setStorageData(this.key, this.get());
  }
}

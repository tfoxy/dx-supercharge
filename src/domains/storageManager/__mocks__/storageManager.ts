import type * as Module from "../storageManager";

export const getStorageData = jest.fn();

export const setStorageData = jest.fn();

export const StorageWrapper = (() => {
  function StorageWrapper() {}

  StorageWrapper.prototype.get = jest.fn();
  StorageWrapper.prototype.set = jest.fn();
  StorageWrapper.prototype.save = jest.fn();

  return StorageWrapper;
})();

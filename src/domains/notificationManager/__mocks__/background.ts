import type * as MockModule from "./background";
import type * as Module from "../background";

const __typecheck__: typeof Module = {} as typeof MockModule;

export const registerNotificationListeners = jest.fn();

export const createNotification = jest.fn();

export const clearNotification = jest.fn();

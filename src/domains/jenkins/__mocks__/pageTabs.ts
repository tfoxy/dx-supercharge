import type * as MockModule from "./pageTabs";
import type * as Module from "../pageTabs";

const __typecheck__: typeof Module = {} as typeof MockModule;

export const getPageTabs = jest.fn();

export const setPageTab = jest.fn();

export const deletePageTab = jest.fn();

export const filterTabsByPipelineRun = jest.fn();

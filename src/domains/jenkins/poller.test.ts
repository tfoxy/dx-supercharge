import { storageWrapper } from "./jenkinsStorage";
import { getPageTabs, setPageTab } from "./pageTabs";
import { getPollers, reviewPolling } from "./poller";
import { getMockFn, createPartialObject } from "test/utils";
import { BlueOceanPipelineRunImpl } from "./blueOceanTypes";
import { getExtensionOptions } from "../optionsManager/background";

jest.mock("../storageManager");
jest.mock("../optionsManager/background");

const BRANCH = "testBranch";
const RUN = "1";
const ORG = "testOrg";
const PIPELINE = "testPipe";
const JENKINS_ORIGIN = "https://example.com";
const PIPELINE_DISPLAY_URL = `/blue/organizations/${ORG}/${PIPELINE}`;
const PIPELINE_RUN_DISPLAY_URL = `${PIPELINE_DISPLAY_URL}/detail/${BRANCH}/${RUN}`;
const PIPELINE_RUN_API_URL = `/blue/rest/organizations/${ORG}/pipelines/${PIPELINE}/branches/${BRANCH}/runs/${RUN}/`;
const PIPELINE_FULL_DISPLAY_URL = `${JENKINS_ORIGIN}${PIPELINE_DISPLAY_URL}`;
const PIPELINE_RUN_FULL_DISPLAY_URL = `${JENKINS_ORIGIN}${PIPELINE_RUN_DISPLAY_URL}`;

const timeoutByRun = getPollers();
const pageTabs = getPageTabs();

jest.useFakeTimers();

describe("reviewPolling", () => {
  let pipelineRuns: BlueOceanPipelineRunImpl[];

  beforeAll(() => {
    getMockFn(storageWrapper.get).mockImplementation(() => ({ pipelineRuns }));
    getMockFn(getExtensionOptions).mockReturnValue(
      createPartialObject({ jenkinsOrigin: JENKINS_ORIGIN })
    );
  });

  beforeEach(() => {
    pipelineRuns = [];
  });

  afterEach(() => {
    timeoutByRun.clear();
    pageTabs.clear();
    jest.clearAllTimers();
  });

  it("should add poller for a pending run", () => {
    pipelineRuns.push(
      createPartialObject({
        result: "UNKNOWN",
        _links: { self: { href: PIPELINE_RUN_API_URL } },
      })
    );
    reviewPolling();
    expect([...timeoutByRun.keys()]).toEqual([PIPELINE_RUN_API_URL]);
    expect(setTimeout).toHaveBeenCalled();
  });

  it("should not call setTimeout if poller already exists", () => {
    const timeoutId = setTimeout(() => {}, 0);
    getMockFn(setTimeout).mockClear();
    timeoutByRun.set(PIPELINE_RUN_API_URL, timeoutId);
    pipelineRuns.push(
      createPartialObject({
        result: "UNKNOWN",
        _links: { self: { href: PIPELINE_RUN_API_URL } },
      })
    );
    reviewPolling();
    expect(setTimeout).not.toHaveBeenCalled();
    expect([...timeoutByRun.entries()]).toEqual([
      [PIPELINE_RUN_API_URL, timeoutId],
    ]);
  });

  it("should not add poller if pipeline run tab exists", () => {
    setPageTab({ tabId: 1, frameId: 0, url: PIPELINE_RUN_FULL_DISPLAY_URL });
    pipelineRuns.push(
      createPartialObject({
        result: "UNKNOWN",
        _links: { self: { href: PIPELINE_RUN_API_URL } },
      })
    );
    reviewPolling();
    expect([...timeoutByRun.keys()]).toEqual([]);
  });

  it("should not add poller if pipeline tab exists", () => {
    setPageTab({ tabId: 1, frameId: 0, url: PIPELINE_FULL_DISPLAY_URL });
    pipelineRuns.push(
      createPartialObject({
        result: "UNKNOWN",
        _links: { self: { href: PIPELINE_RUN_API_URL } },
      })
    );
    reviewPolling();
    expect([...timeoutByRun.keys()]).toEqual([]);
  });

  it("should remove poller if pipeline run tab exists", () => {
    const timeoutId = setTimeout(() => {}, 0);
    getMockFn(setTimeout).mockClear();
    timeoutByRun.set(PIPELINE_RUN_API_URL, timeoutId);
    setPageTab({ tabId: 1, frameId: 0, url: PIPELINE_RUN_FULL_DISPLAY_URL });
    pipelineRuns.push(
      createPartialObject({
        result: "UNKNOWN",
        _links: { self: { href: PIPELINE_RUN_API_URL } },
      })
    );
    reviewPolling();
    expect([...timeoutByRun.keys()]).toEqual([]);
    expect(clearTimeout).toHaveBeenCalled();
  });

  it("should remove poller if pipeline tab exists", () => {
    const timeoutId = setTimeout(() => {}, 0);
    getMockFn(setTimeout).mockClear();
    timeoutByRun.set(PIPELINE_RUN_API_URL, timeoutId);
    setPageTab({ tabId: 1, frameId: 0, url: PIPELINE_FULL_DISPLAY_URL });
    pipelineRuns.push(
      createPartialObject({
        result: "UNKNOWN",
        _links: { self: { href: PIPELINE_RUN_API_URL } },
      })
    );
    reviewPolling();
    expect([...timeoutByRun.keys()]).toEqual([]);
    expect(clearTimeout).toHaveBeenCalled();
  });

  it("should remove poller if pipeline run does not exists", () => {
    const timeoutId = setTimeout(() => {}, 0);
    getMockFn(setTimeout).mockClear();
    timeoutByRun.set(PIPELINE_RUN_API_URL, timeoutId);
    reviewPolling();
    expect([...timeoutByRun.keys()]).toEqual([]);
    expect(clearTimeout).toHaveBeenCalled();
  });

  it("should remove poller if pipeline run is finished", () => {
    const timeoutId = setTimeout(() => {}, 0);
    getMockFn(setTimeout).mockClear();
    timeoutByRun.set(PIPELINE_RUN_API_URL, timeoutId);
    setPageTab({ tabId: 1, frameId: 0, url: PIPELINE_FULL_DISPLAY_URL });
    pipelineRuns.push(
      createPartialObject({
        result: "SUCCESS",
        _links: { self: { href: PIPELINE_RUN_API_URL } },
      })
    );
    reviewPolling();
    expect([...timeoutByRun.keys()]).toEqual([]);
    expect(clearTimeout).toHaveBeenCalled();
  });
});

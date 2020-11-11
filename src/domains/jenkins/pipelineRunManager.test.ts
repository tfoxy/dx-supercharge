import "jest-webextension-mock";
import { addJenkinsPipelineRun } from "./pipelineRunManager";
import { getExtensionOptions } from "../optionsManager/background";
import { AddPipelineRunOptions, JenkinsData, PageTab } from "./types";
import { BlueOceanPipelineRunImpl } from "./blueOceanTypes";
import { StorageWrapper } from "../storageManager";
import { createNotification } from "../notificationManager/background";
import { getMockFn, createPartialObject } from "test/utils";
import { filterTabsByPipelineRun } from "./pageTabs";

jest.mock("../storageManager");
jest.mock("../optionsManager/background");
jest.mock("../notificationManager/background");
jest.mock("./pageTabs");

const JENKINS_DOMAIN = "https://example.com";
const REGULAR_API_URL =
  "/blue/rest/organizations/testOrg/pipelines/testPipe/branches/testBranch/runs/1/";
const REGULAR_PIPELINE_DISPLAY_URL = "/blue/organizations/testOrg/testPipe";
const REGULAR_DISPLAY_URL = `${REGULAR_PIPELINE_DISPLAY_URL}/detail/testBranch/1`;

describe("addJenkinsPipelineRun", () => {
  let pipelineRun: BlueOceanPipelineRunImpl;
  let options: AddPipelineRunOptions;
  let storageWrapperData: JenkinsData;
  let tabs: PageTab[];

  beforeAll(() => {
    getMockFn(getExtensionOptions).mockReturnValue(
      createPartialObject({
        jenkinsOrigin: JENKINS_DOMAIN,
      })
    );
  });

  beforeEach(() => {
    pipelineRun = undefined!;
    options = undefined!;
    storageWrapperData = createPartialObject({ pipelineRuns: [] });
    tabs = [];
    getMockFn(StorageWrapper.prototype.get).mockImplementation(
      () => storageWrapperData
    );
    getMockFn(filterTabsByPipelineRun).mockImplementation(() => tabs);
  });

  function withPipelineRun(
    partialPipelineRun: Partial<BlueOceanPipelineRunImpl>,
    fn: jest.EmptyFunction
  ) {
    describe(`with pipeline run ${JSON.stringify(partialPipelineRun)}`, () => {
      beforeEach(() => {
        const baseRun: Partial<BlueOceanPipelineRunImpl> = {
          changeSet: [],
          _links: { self: { href: REGULAR_API_URL } },
          result: "UNKNOWN",
        };
        pipelineRun = createPartialObject(
          Object.assign(baseRun, partialPipelineRun)
        );
      });

      fn();
    });
  }

  function withOptions(
    partialOptions: Partial<AddPipelineRunOptions>,
    fn: jest.EmptyFunction
  ) {
    describe(`with options ${JSON.stringify(partialOptions)}`, () => {
      beforeEach(() => {
        const base: Partial<AddPipelineRunOptions> = {
          store: false,
          notify: false,
        };
        options = createPartialObject(Object.assign(base, partialOptions));
      });

      fn();
    });
  }

  function withPipelineTab(
    partialTab: Partial<PageTab>,
    fn: jest.EmptyFunction
  ) {
    describe(`with pipeline tab ${JSON.stringify(partialTab)}`, () => {
      beforeEach(() => {
        const baseTab: Partial<PageTab> = {
          // id: tabs.length + 1,
          url: `${JENKINS_DOMAIN}${REGULAR_PIPELINE_DISPLAY_URL}`,
        };
        tabs.push(createPartialObject(Object.assign(baseTab, partialTab)));
      });

      fn();
    });
  }

  function withPipelineRunTab(
    partialTab: Partial<PageTab>,
    fn: jest.EmptyFunction
  ) {
    describe(`with pipeline run tab ${JSON.stringify(partialTab)}`, () => {
      beforeEach(() => {
        const baseTab: Partial<PageTab> = {
          // id: tabs.length + 1,
          url: `${JENKINS_DOMAIN}${REGULAR_DISPLAY_URL}`,
        };
        tabs.push(createPartialObject(Object.assign(baseTab, partialTab)));
      });

      fn();
    });
  }

  function withStoredPipelineRun(
    partialPipelineRun: Partial<BlueOceanPipelineRunImpl>,
    fn: jest.EmptyFunction
  ) {
    describe(`with stored pipeline run ${JSON.stringify(
      partialPipelineRun
    )}`, () => {
      beforeEach(() => {
        const baseRun: Partial<BlueOceanPipelineRunImpl> = {
          changeSet: [],
          _links: { self: { href: REGULAR_API_URL } },
          result: "UNKNOWN",
        };
        storageWrapperData.pipelineRuns.push(
          createPartialObject(Object.assign(baseRun, partialPipelineRun))
        );
      });

      fn();
    });
  }

  describe("on runtime message listener", () => {
    withPipelineRun({}, () => {
      withOptions({ notify: true }, () => {
        it("should do nothing", async () => {
          await addJenkinsPipelineRun(pipelineRun, options);
          expect(storageWrapperData.pipelineRuns).toHaveLength(0);
          expect(StorageWrapper.prototype.save).not.toHaveBeenCalled();
          expect(createNotification).not.toHaveBeenCalled();
        });
      });
    });

    withPipelineTab({}, () => {
      withPipelineRun({ state: "RUNNING" }, () => {
        withOptions({ notify: true, store: true }, () => {
          it("should create a notification and save to the storage", async () => {
            await addJenkinsPipelineRun(pipelineRun, options);
            expect(storageWrapperData.pipelineRuns).toEqual([pipelineRun]);
            expect(StorageWrapper.prototype.save).toHaveBeenCalled();
            expect(createNotification).toHaveBeenCalled();
          });
        });
      });
    });

    withPipelineRunTab({}, () => {
      withPipelineRun({ state: "RUNNING" }, () => {
        withOptions({ notify: true }, () => {
          it("should create a notification", async () => {
            await addJenkinsPipelineRun(pipelineRun, options);
            expect(storageWrapperData.pipelineRuns).toHaveLength(0);
            expect(StorageWrapper.prototype.save).not.toHaveBeenCalled();
            expect(createNotification).toHaveBeenCalled();
          });
        });
      });
    });

    withStoredPipelineRun({ state: "RUNNING" }, () => {
      withPipelineRun({ state: "FINISHED" }, () => {
        withOptions({}, () => {
          it("should save the new state and create a notification", async () => {
            await addJenkinsPipelineRun(pipelineRun, options);
            expect(storageWrapperData.pipelineRuns).toEqual([pipelineRun]);
            expect(StorageWrapper.prototype.save).toHaveBeenCalled();
            expect(createNotification).toHaveBeenCalled();
          });
        });
      });
    });
  });
});

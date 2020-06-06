import { getPageTabs, filterTabsByApiUrl } from "./pageTabs";
import { getExtensionOptions } from "../optionsManager/background";
import { getMockFn, createPartialObject } from "test/utils";

jest.mock("../optionsManager/background");

const BRANCH = "testBranch";
const RUN = "1";
const RUN2 = "11";
const ORG = "testOrg";
const PIPELINE = "testPipe";
const JENKINS_ORIGIN = "https://example.com";
const PIPELINE_DISPLAY_URL = `/blue/organizations/${ORG}/${PIPELINE}`;
const PIPELINE_RUN_DISPLAY_URL = `${PIPELINE_DISPLAY_URL}/detail/${BRANCH}/${RUN}`;
const PIPELINE_RUN2_DISPLAY_URL = `${PIPELINE_DISPLAY_URL}/detail/${BRANCH}/${RUN2}`;
const PIPELINE_RUN_API_URL = `/blue/rest/organizations/${ORG}/pipelines/${PIPELINE}/branches/${BRANCH}/runs/${RUN}/`;

describe("filterTabsByApiUrl", () => {
  let pageTabs: ReturnType<typeof getPageTabs>;

  beforeAll(() => {
    pageTabs = getPageTabs();
    getMockFn(getExtensionOptions).mockReturnValue(
      createPartialObject({
        jenkinsOrigin: JENKINS_ORIGIN,
      })
    );
  });

  beforeEach(() => {
    pageTabs.clear();
  });

  it("should get the pipeline run tab", () => {
    const pipelineRunTab = {
      url: `${JENKINS_ORIGIN}${PIPELINE_RUN_DISPLAY_URL}`,
    };
    pageTabs.set("1,0", createPartialObject(pipelineRunTab));
    const tabs = filterTabsByApiUrl(PIPELINE_RUN_API_URL);
    expect(tabs).toEqual([pipelineRunTab]);
  });

  it("should get the pipeline tab", () => {
    const pipelineTab = { url: `${JENKINS_ORIGIN}${PIPELINE_DISPLAY_URL}` };
    pageTabs.set("1,0", createPartialObject(pipelineTab));
    const tabs = filterTabsByApiUrl(PIPELINE_RUN_API_URL);
    expect(tabs).toEqual([pipelineTab]);
  });

  it("should not get the pipeline run tab of another run", () => {
    const pipelineRunTab = {
      url: `${JENKINS_ORIGIN}${PIPELINE_RUN2_DISPLAY_URL}`,
    };
    pageTabs.set("1,0", createPartialObject(pipelineRunTab));
    const tabs = filterTabsByApiUrl(PIPELINE_RUN_API_URL);
    expect(tabs).toEqual([]);
  });
});

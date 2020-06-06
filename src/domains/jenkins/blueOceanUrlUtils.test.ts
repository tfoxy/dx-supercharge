import {
  getParamsFromDisplayUrl,
  getParamsFromApiUrl,
  PipelineRunUrlParams,
  buildPipelineRunApiUrl,
  buildPipelineRunDisplayUrl,
} from "./blueOceanUrlUtils";

const BRANCH = "testBranch";
const RUN = "1";
const ORG = "testOrg";
const PIPELINE = "testPipe";
const REGULAR_API_URL = `/blue/rest/organizations/${ORG}/pipelines/${PIPELINE}/branches/${BRANCH}/runs/${RUN}/`;
const REGULAR_DISPLAY_URL = `/blue/organizations/${ORG}/${PIPELINE}/detail/${BRANCH}/${RUN}`;

describe("getParamsFromDisplayUrl", () => {
  it("should match with regular url", () => {
    const params = getParamsFromDisplayUrl(REGULAR_DISPLAY_URL);
    const expected: PipelineRunUrlParams = {
      branch: BRANCH,
      organization: ORG,
      pipelines: [PIPELINE],
      run: RUN,
    };
    expect(params).toEqual(expected);
  });
});

describe("getParamsFromApiUrl", () => {
  it("should match with regular url", () => {
    const params = getParamsFromApiUrl(REGULAR_API_URL);
    const expected: PipelineRunUrlParams = {
      branch: BRANCH,
      organization: ORG,
      pipelines: [PIPELINE],
      run: RUN,
    };
    expect(params).toEqual(expected);
  });
});

describe("buildPipelineRunApiUrl", () => {
  it("should match to regular url", () => {
    const url = buildPipelineRunApiUrl({
      branch: BRANCH,
      organization: ORG,
      pipelines: [PIPELINE],
      run: RUN,
    });
    expect(url).toEqual(REGULAR_API_URL);
  });
});

describe("buildPipelineRunDisplayUrl", () => {
  it("should match to regular url", () => {
    const url = buildPipelineRunDisplayUrl({
      branch: BRANCH,
      organization: ORG,
      pipelines: [PIPELINE],
      run: RUN,
    });
    expect(url).toEqual(REGULAR_DISPLAY_URL);
  });
});

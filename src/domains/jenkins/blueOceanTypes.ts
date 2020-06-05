import type MobX from "mobx";

export const BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME =
  "io.jenkins.blueocean.rest.impl.pipeline.PipelineRunImpl";

export interface BlueOceanWindow {
  $blueocean: BlueOceanData;
  jenkinsCIGlobal: JenkinsCIGlobal;
}

export interface BlueOceanData {
  organization: BlueOceanOrganization;
  user: BlueOceanUser;
}

export interface BlueOceanOrganization {
  displayName: string;
  name: string;
  organizationGroup: string;
}

export interface BlueOceanUser {
  avatar: string | null;
  email: string;
  fullName: string;
  id: string;
}

export interface JenkinsCIGlobal {
  plugins: JenkinsCIGlobalPlugins;
}

export interface JenkinsCIGlobalPluginTypeMap {
  "jenkins-cd-blueocean-core-js": {
    module: BlueOceanCoreJsModuleExports;
    anyName: "jenkins-cd-blueocean-core-js@any";
  };
  mobx: {
    module: typeof MobX;
    anyName: "mobx@any";
  };
}

export type JenkinsCIGlobalPlugins = {
  [K in keyof JenkinsCIGlobalPluginTypeMap]: JenkinsCIGlobalPlugin<K>;
};

export type JenkinsCIGlobalPlugin<
  K extends keyof JenkinsCIGlobalPluginTypeMap
> = Record<
  JenkinsCIGlobalPluginTypeMap[K]["anyName"],
  JenkinsCIGlobalPluginModule<JenkinsCIGlobalPluginTypeMap[K]["module"]>
> & {
  loadingModules: JenkinsCIGlobalLoadingModules<K>;
};

export type JenkinsCIGlobalLoadingModules<
  K extends keyof JenkinsCIGlobalPluginTypeMap
> = Record<
  JenkinsCIGlobalPluginTypeMap[K]["anyName"],
  JenkinsCIGlobalPluginLoadingModule<JenkinsCIGlobalPluginTypeMap[K]["module"]>
>;

export interface JenkinsCIGlobalPluginLoadingModule<T> {
  loaded: boolean;
  waitList: Array<{ resolve: (exports: T) => void }>;
}

export interface JenkinsCIGlobalPluginModule<T> {
  exports: T;
}

export interface BlueOceanCoreJsModuleExports {
  activityService: BlueOceanActivityService;
  pipelineService: BlueOceanPipelineService;
}

export type BlueOceanActivity = BlueOceanPipelineRunImpl | BlueOceanTestSummary;

export interface BlueOceanActivityService {
  _data: MobX.ObservableMap<BlueOceanActivity>;
  /**
   * @param href "/blue/rest/organizations/:organization/pipelines/:pipeline/branches/:branch/runs/:run/"
   */
  getActivity: (href: string) => BlueOceanActivity;
  /**
   * @param href "/blue/rest/organizations/:organization/pipelines/:pipeline/branches/:branch/runs/:run//blueTestSummary/"
   */
  getTestSummary: (href: string) => BlueOceanTestSummary;
}

export interface BlueOceanPipelineService {
  _data: MobX.ObservableMap<
    BlueOceanPipelineFolderImpl | BlueOceanMultiBranchPipelineImpl
  >;
  /**
   * @param href "/blue/rest/organizations/:organization/pipelines/:pipeline/"
   */
  getPipeline: (
    href: string
  ) => BlueOceanPipelineFolderImpl | BlueOceanMultiBranchPipelineImpl;
}

/**
 * @see https://javadoc.jenkins.io/plugin/blueocean-pipeline-api-impl/io/jenkins/blueocean/rest/impl/pipeline/PipelineRunImpl.html
 */
export interface BlueOceanPipelineRunImpl {
  _class: typeof BLUE_OCEAN_PIPELINE_RUN_IMPL_CLASS_NAME;
  actions: unknown[];
  branch: {
    isPrimary: boolean;
    issues: unknown[];
    url: string;
  } | null;
  causes: BlueOceanCause[];
  changeSet: BlueOceanChange[];
  commitId: string | null;
  commitUrl: string | null;
  description: string | null;
  durationInMillis: number;
  enQueueTime: string;
  endTime: string;
  estimatedDurationInMillis: number;
  id: string;
  name: string | null;
  organization: string;
  pipeline: string;
  pullRequest: string | null;
  replayable: boolean;
  /**
   * @see https://javadoc.jenkins.io/plugin/blueocean-rest/io/jenkins/blueocean/rest/model/BlueRun.BlueRunResult.html
   * @see https://javadoc.jenkins-ci.org/hudson/model/Result.html
   */
  result:
    | "ABORTED"
    | "FAILURE"
    | "NOT_BUILT"
    | "SUCCESS"
    | "UNKNOWN"
    | "UNSTABLE";
  runSummary: string;
  startTime: string;
  /**
   * @see https://javadoc.jenkins.io/plugin/blueocean-rest/io/jenkins/blueocean/rest/model/BlueRun.BlueRunState.html
   */
  state: "FINISHED" | "NOT_BUILT" | "PAUSED" | "QUEUED" | "RUNNING" | "SKIPPED";
  type: string;
  _links: {
    self: {
      href: string;
    };
  };
}

export interface BlueOceanCause {
  shortDescription: string;
  userId?: string;
  userName?: string;
}

export interface BlueOceanChange {
  affectedPaths: string[];
  author: BlueOceanUser;
  checkoutCount: number;
  commitId: string;
  issues: unknown[];
  msg: string;
  timestamp: string;
  url: string;
}

export interface BlueOceanTestSummary {
  _class: "io.jenkins.blueocean.rest.model.BlueTestSummary";
  existingFailed: number;
  failed: number;
  fixed: number;
  passed: number;
  regressions: number;
  skipped: number;
  total: number;
}

interface BlueOceanPipelineFolder {
  disabled: boolean | null;
  displayName: string;
  fullDisplayName: string;
  fullName: string;
  name: string;
  numberOfFolders: number;
  numberOfPipelines: number;
  organization: string;
  parameters: unknown | null;
  permissions: {
    configure: boolean;
    create: boolean;
    read: boolean;
    start: boolean;
    stop: boolean;
  };
  pipelineFolderNames: string[];
}

export interface BlueOceanPipelineFolderImpl extends BlueOceanPipelineFolder {
  _class: "io.jenkins.blueocean.service.embedded.rest.PipelineFolderImpl";
}

export interface BlueOceanMultiBranchPipelineImpl
  extends BlueOceanPipelineFolder {
  _class: "io.jenkins.blueocean.rest.impl.pipeline.MultiBranchPipelineImpl";
  branchNames: string;
  disabled: boolean | null;
  displayName: string;
  estimatedDurationInMillis: number;
  fullDisplayName: string;
  fullName: string;
  name: string;
  numberOfFailingBranches: number;
  numberOfFailingPullRequests: number;
  numberOfFolders: number;
  numberOfPipelines: number;
  numberOfSuccessfulBranches: number;
  numberOfSuccessfulPullRequests: number;
  organization: string;
  parameters: unknown | null;
  permissions: {
    configure: boolean;
    create: boolean;
    read: boolean;
    start: boolean;
    stop: boolean;
  };
  pipelineFolderNames: string[];
  scmSource: BlueOceanScmSource;
  scriptPath: string;
  totalNumberOfBranches: number;
  totalNumberOfPullRequests: number;
  weatherScore: number;
}

export interface BlueOceanScmSource {
  apiUrl: string;
  id: string;
}

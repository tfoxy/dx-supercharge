import { ExtensionOptions } from "../optionsManager/types";
import { JenkinsData } from "../jenkins/types";

export interface StorageData {
  options: ExtensionOptions;
  jenkinsData: JenkinsData;
}

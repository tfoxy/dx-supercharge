import {
  JenkinsStatusChange,
  JenkinsMessage,
  JENKINS_MESSAGE_TYPE,
} from "./types";
import { browser } from "webextension-polyfill-ts";

export async function sendJenkinsStatusChange(
  statusChange: JenkinsStatusChange
) {
  const runtimeMessage: JenkinsMessage = {
    ...statusChange,
    type: JENKINS_MESSAGE_TYPE,
  };
  return browser.runtime.sendMessage(runtimeMessage);
}

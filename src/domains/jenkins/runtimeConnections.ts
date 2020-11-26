import { Runtime } from "webextension-polyfill-ts";
import { assertUnreachable } from "../utils/assertions";
import { addJenkinsPipelineRun } from "./pipelineRunManager";
import {
  JenkinsMessage,
  PIPELINE_RUN_MESSAGE_TYPE,
  HISTORY_MESSAGE_TYPE,
} from "./types";
import { deletePageTab, setPageTab } from "./pageTabs";

export function addJenkinsPortListeners(port: Runtime.Port) {
  setPageTab(createPageTabFromPort(port));
  port.onMessage.addListener(portMessageListener);
  port.onDisconnect.addListener(portDisconnectListener);
}

async function portMessageListener(
  message: JenkinsMessage,
  port: Runtime.Port
) {
  switch (message.type) {
    case PIPELINE_RUN_MESSAGE_TYPE:
      addJenkinsPipelineRun(message.pipelineRun, message.options);
      break;
    case HISTORY_MESSAGE_TYPE:
      setPageTab(createPageTabFromPort(port, message.url));
      break;
    default:
      assertUnreachable(message);
  }
}

function portDisconnectListener(port: Runtime.Port) {
  deletePageTab(createPageTabFromPort(port));
}

function createPageTabFromPort(port: Runtime.Port, url?: string) {
  const { sender } = port;
  return {
    tabId: sender?.tab?.id!,
    frameId: sender?.frameId!,
    url: url ?? sender?.url ?? "",
  };
}

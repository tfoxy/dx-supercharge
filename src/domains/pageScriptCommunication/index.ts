import { CONTENT_SCRIPT_MESSAGE_TYPE, PAGE_SCRIPT_MESSAGE_TYPE } from "./types";
import ScriptCommunication from "./ScriptCommunication";

type PageScriptFn = (communication: ScriptCommunication) => void;

export function executePageScriptCode(scriptFn: PageScriptFn) {
  const script = document.createElement("script");
  script.textContent = `(
    ${initializePageScript.toString()}
  )(
    ${ScriptCommunication.toString()},
    ${JSON.stringify(PAGE_SCRIPT_MESSAGE_TYPE)},
    ${scriptFn.toString()}
  );`;
  return new ScriptCommunication(script, CONTENT_SCRIPT_MESSAGE_TYPE);
}

export function executePageScriptFile(scriptFile: string) {
  const script = document.createElement("script");
  script.src = scriptFile;
  return new ScriptCommunication(script, CONTENT_SCRIPT_MESSAGE_TYPE);
}

function initializePageScript(
  ScriptCommunicationClass: typeof ScriptCommunication,
  messageType: typeof PAGE_SCRIPT_MESSAGE_TYPE,
  scriptFn: PageScriptFn
) {
  const script = document.currentScript as HTMLScriptElement;
  const communication = new ScriptCommunicationClass(script, messageType);
  scriptFn(communication);
}

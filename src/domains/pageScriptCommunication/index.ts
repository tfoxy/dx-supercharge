import { CONTENT_SCRIPT_MESSAGE_TYPE, PAGE_SCRIPT_MESSAGE_TYPE } from "./types";
import ScriptCommunication from "./ScriptCommunication";

type PageScriptFn = (communication: ScriptCommunication) => void;

export function executePageScriptCode(scriptFn: PageScriptFn) {
  const scriptContent = `(
    ${initializePageScript.toString()}
  )(
    ${ScriptCommunication.toString()},
    ${JSON.stringify(PAGE_SCRIPT_MESSAGE_TYPE)},
    ${scriptFn.toString()}
  );`;
  return executePageScript((script) => {
    script.textContent = scriptContent;
  });
}

export function executePageScriptFile(scriptFile: string) {
  return executePageScript((script) => {
    script.src = scriptFile;
  });
}

function executePageScript(prepareScript: (script: HTMLScriptElement) => void) {
  const script = document.createElement("script");
  prepareScript(script);
  document.head.appendChild(script);
  if (script.parentNode) {
    script.parentNode.removeChild(script);
  }
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

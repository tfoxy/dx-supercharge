import { CONTENT_SCRIPT_MESSAGE_TYPE, PAGE_SCRIPT_MESSAGE_TYPE } from "./types";

type ScriptMessageType =
  | typeof CONTENT_SCRIPT_MESSAGE_TYPE
  | typeof PAGE_SCRIPT_MESSAGE_TYPE;

const messageTypeMap = {
  [CONTENT_SCRIPT_MESSAGE_TYPE]: PAGE_SCRIPT_MESSAGE_TYPE,
  [PAGE_SCRIPT_MESSAGE_TYPE]: CONTENT_SCRIPT_MESSAGE_TYPE,
} as const;

export default class ScriptCommunication {
  private script: HTMLScriptElement;
  private messageType: ScriptMessageType;
  private listenerType: ScriptMessageType;

  public constructor(
    script: HTMLScriptElement,
    messageType: ScriptMessageType
  ) {
    this.script = script;
    this.messageType = messageType;
    this.listenerType = messageTypeMap[messageType];
  }

  public postMessage(detail: any) {
    const event = new CustomEvent(this.messageType, {
      detail,
    });
    this.script.dispatchEvent(event);
  }

  public addEventListener(listener: (event: CustomEvent) => void) {
    this.script.addEventListener<any>(this.listenerType, listener);
  }

  public removeEventListener(listener: (event: CustomEvent) => void) {
    this.script.removeEventListener<any>(this.listenerType, listener);
  }
}

import { CONTENT_SCRIPT_MESSAGE_TYPE, PAGE_SCRIPT_MESSAGE_TYPE } from "./types";

type ScriptMessageType =
  | typeof CONTENT_SCRIPT_MESSAGE_TYPE
  | typeof PAGE_SCRIPT_MESSAGE_TYPE;

interface ScriptCommunicationEventMap {
  error: ErrorEvent;
  [CONTENT_SCRIPT_MESSAGE_TYPE]: CustomEvent;
  [PAGE_SCRIPT_MESSAGE_TYPE]: CustomEvent;
}

type ScriptCommunicationEventListener<
  K extends keyof ScriptCommunicationEventMap = keyof ScriptCommunicationEventMap
> = (event: ScriptCommunicationEventMap[K]) => void;

export default class ScriptCommunication {
  private script: HTMLScriptElement;
  private messageType: ScriptMessageType;

  public constructor(
    script: HTMLScriptElement,
    messageType: ScriptMessageType
  ) {
    this.script = script;
    this.messageType = messageType;
  }

  public start() {
    document.head.appendChild(this.script);
    if (this.script.parentNode) {
      this.script.parentNode.removeChild(this.script);
    }
  }

  public postMessage(detail: any) {
    const event = new CustomEvent(this.messageType, {
      detail,
    });
    this.script.dispatchEvent(event);
  }

  public addEventListener<K extends keyof ScriptCommunicationEventMap>(
    type: K,
    listener: ScriptCommunicationEventListener<K>
  ) {
    this.script.addEventListener<any>(type, listener);
  }

  public removeEventListener<K extends keyof ScriptCommunicationEventMap>(
    type: K,
    listener: ScriptCommunicationEventListener<K>
  ) {
    this.script.removeEventListener<any>(type, listener);
  }
}

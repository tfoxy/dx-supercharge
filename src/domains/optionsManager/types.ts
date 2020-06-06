export interface ExtensionOptions {
  jenkinsOrigin: string;
  githubOrigin: string;
}

export interface OptionsMessage {
  type: typeof OPTIONS_MESSAGE_TYPE;
  options: ExtensionOptions;
}

export const OPTIONS_MESSAGE_TYPE = "OPTIONS";

export type ExtensionOptionChangeListener = (options: ExtensionOptions) => void;

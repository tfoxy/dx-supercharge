import errorStackParser, { StackFrame } from "error-stack-parser";

export function getCodeLine() {
  const sf = errorStackParser.parse(new Error()).filter(isNotFromThisModule)[0];
  return `${sf.fileName}:${sf.lineNumber}:${sf.columnNumber}`;
}

export function removeModuleFromStackTrace(err: Error) {
  const stack = errorStackParser
    .parse(err)
    .filter(isNotFromThisModule)
    .map(({ source }) => source)
    .join("\n");
  err.stack = `${err.toString()}\n${stack}`;
  return err;
}

function isNotFromThisModule({ fileName }: StackFrame) {
  return !fileName || !fileName.startsWith(`${__dirname}/`);
}

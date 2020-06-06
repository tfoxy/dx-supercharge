import { removeModuleFromStackTrace } from "./errors";

export function getMockFn<T, Y extends unknown[]>(
  fn: (...args: Y) => T
): jest.Mock<T, Y> {
  if (!jest.isMockFunction(fn)) {
    throw removeModuleFromStackTrace(
      new Error(`Function is not a mock: ${fn}`)
    );
  }
  return fn;
}

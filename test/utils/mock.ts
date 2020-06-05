export function getMockFn<T, Y extends unknown[]>(
  fn: (...args: Y) => T
): jest.Mock<T, Y> {
  if (!jest.isMockFunction(fn)) {
    throw new Error("Function is not a mock");
  }
  return fn;
}

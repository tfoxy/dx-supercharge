export function assertIsDefined<T>(val: T): asserts val is NonNullable<T> {
  if (val === undefined || val === null) {
    throw new Error(`Expected 'val' to be defined, but received ${val}`);
  }
}

export function assertUnreachable(x: never): never {
  throw new Error(`Unreachable code for variable: ${JSON.stringify(x)}`);
}

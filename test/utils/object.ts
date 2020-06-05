import { getCodeLine, removeModuleFromStackTrace } from "./errors";

const SAFE_OBJECT = Symbol("safe object");

type DeepPartial<T> = {
  [K in keyof T]?: Required<T>[K] extends object ? DeepPartial<T[K]> : T[K];
};

interface CreateObjectOptions {
  /**
   * List of keys that will not throw an error if they are accessed without being set.
   *
   * An example where it can be useful is when doing `Promise.resolve(obj)`,
   * as JavaScript will check if `obj` is a `Promise` by checking if it has a property `then`.
   * So in that case:
   *
   * ```
   * Promise.resolve(createObject({}, { ignoredKeys: ["then"] }));
   * ```
   */
  ignoredKeys: Array<keyof any>;
  /**
   * Customize error that appears when a prop was not set.
   */
  errorMessage: (props: string, codeLine: string) => string;
}

const defaultOptions: CreateObjectOptions = {
  ignoredKeys: [],
  errorMessage: (props, codeLine) =>
    `Prop "${props}" was not setted in:\n"${codeLine}"`,
};

/**
 * Creates a proxy that wraps the received object.
 *
 * The proxy will throw an error if you want to access a property that wasn't set,
 * indicating the prop that was accessed and the line where this function was used.
 *
 * Useful when you need an object for testing but you don't want to declare every property of that object.
 *
 * @param obj the object that will be wrapped by the proxy
 * @param options the options to configure the proxy.
 */
export function createPartialObject<T extends object>(
  obj: T extends object ? DeepPartial<T> : never,
  options: Partial<CreateObjectOptions> = {}
): T {
  const codeLine = getCodeLine();
  const completeOptions: CreateObjectOptions = Object.assign(
    {},
    defaultOptions,
    options
  );
  return createInnerObject(obj, completeOptions, [], codeLine);
}

function createInnerObject<T extends object>(
  obj: DeepPartial<T>,
  options: CreateObjectOptions,
  path: string[],
  codeLine: string
): T {
  return new Proxy(obj, {
    get(target, prop, receiver) {
      if (prop === SAFE_OBJECT) {
        return true;
      } else if (typeof prop === "symbol" || prop in target) {
        const value = Reflect.get(target, prop, receiver);
        if (
          typeof value === "object" &&
          value !== null &&
          !(prop in Object.getPrototypeOf(target)) &&
          !value[SAFE_OBJECT]
        ) {
          return createInnerObject(
            value,
            options,
            [...path, String(prop)],
            codeLine
          );
        }
        return value;
      } else if (
        /^then$|^\$\$|^@@|^nodeType$|^asymmetricMatch$|^setEncoding$|^toJSON$/.test(
          String(prop)
        )
      ) {
        // Avoid Promise, "pretty-print" and "nock" keys
        return Reflect.get(target, prop, receiver);
      } else if (options.ignoredKeys.includes(prop)) {
        return Reflect.get(target, prop, receiver);
      } else {
        const props = [...path, String(prop)].join(".");
        throw removeModuleFromStackTrace(
          new Error(options.errorMessage(props, codeLine))
        );
      }
    },
  }) as T;
}

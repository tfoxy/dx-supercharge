import { isProxiable } from "./proxy";
import { removeModuleFromStackTrace } from "./errors";
import { getClassRepresentation } from "./utils";

const IS_FREEZED_PROXY = Symbol("is freezed proxy");

export type DeepReadonly<T> = T extends (...args: any) => any
  ? T
  : { readonly [P in keyof T]: DeepReadonly<T[P]> };

export type ShallowReadonly<T> = T extends (...args: any) => any
  ? T
  : { readonly [P in keyof T]: T[P] };

/**
 * Creates a proxy of the received parameter, that disables any change.
 * There are two main differences with `Object.freeze`:
 *
 * * Every child object is also freezed.
 * * It doesn't freeze the original value. You can still change the value when not using the proxy.
 *
 * @param target the value which will be frozen.
 */
export function createDeepFreezedProxy<T>(
  target: T[]
): ReadonlyArray<DeepReadonly<T>>;
export function createDeepFreezedProxy<T extends (...args: any[]) => any>(
  target: T
): T;
export function createDeepFreezedProxy<T extends object>(
  target: T
): DeepReadonly<T>;
export function createDeepFreezedProxy<T>(target: T): T;
export function createDeepFreezedProxy<T>(target: T) {
  if (!isProxiable(target) || IS_FREEZED_PROXY in target) {
    return target;
  }
  return new Proxy<any>(createShallowFreezedProxy(target), {
    get(pTarget, prop, receiver) {
      const value = Reflect.get(pTarget, prop, receiver);
      if (prop in Object.getPrototypeOf(pTarget)) {
        return value;
      }
      return createDeepFreezedProxy(value);
    },
  });
}

export function createShallowFreezedProxy<T>(a: T[]): ReadonlyArray<T>;
export function createShallowFreezedProxy<T extends (...args: any[]) => any>(
  f: T
): T;
export function createShallowFreezedProxy<T extends object>(
  o: T
): ShallowReadonly<T>;
export function createShallowFreezedProxy<T>(o: T): T;
export function createShallowFreezedProxy<T>(t: T) {
  if (!isProxiable(t) || IS_FREEZED_PROXY in t) {
    return t;
  }
  return new Proxy<any>(t, {
    has(pTarget, prop) {
      if (prop === IS_FREEZED_PROXY) {
        return true;
      }
      return Reflect.has(pTarget, prop);
    },
    set(pTarget, prop) {
      throw removeModuleFromStackTrace(
        new TypeError(
          `Cannot add property ${String(prop)}, object is not extensible`
        )
      );
    },
    defineProperty(pTarget, prop) {
      throw removeModuleFromStackTrace(
        new TypeError(
          `Cannot define property ${String(prop)}, object is not extensible`
        )
      );
    },
    deleteProperty(pTarget, prop) {
      if (prop in pTarget) {
        const classString = getClassRepresentation(pTarget);
        throw removeModuleFromStackTrace(
          new TypeError(
            `Cannot delete property '${String(prop)}' of ${classString}`
          )
        );
      }
      return delete pTarget[prop as any];
    },
    setPrototypeOf(pTarget) {
      const classString = getClassRepresentation(pTarget);
      throw removeModuleFromStackTrace(
        new TypeError(`${classString} is not extensible`)
      );
    },
  });
}

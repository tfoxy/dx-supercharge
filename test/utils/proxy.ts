export function isProxiable<T>(t: T) {
  return (typeof t === "object" && t !== null) || typeof t === "function";
}

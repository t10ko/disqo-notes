const objHasOwn = Object.prototype.hasOwnProperty;
export function hasOwn(obj: object, name: string|number): boolean {
  return objHasOwn.call(obj, name);
}

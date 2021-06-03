const objHasOwn = Object.prototype.hasOwnProperty;
export function hasOwn(obj: object, name: string|number): boolean {
  return objHasOwn.call(obj, name);
}

type Iterator<T, R> = (value: T, name: string, list: { [key: string]: T }) => R;
type ReduceIterator<T, R> = (acc: R, value: T, name: string, list: { [key: string]: T }) => R;

function universalIterator<T, R>(list: { [key: string]: T }, handler: Iterator<T, R>, method = 'forEach'): boolean {
  const isSome = method === 'some';
  const checkValue = isSome || method === 'every';
  const targetValue = checkValue && isSome;
  for (const key in list) {
    if (hasOwn(list, key)) {
      const value = list[key];
      const res = handler(value, key, list);
      // @ts-ignore
      if (checkValue && res === targetValue) {
        return targetValue;
      }
    }
  }
  if (checkValue) {
    return !targetValue;
  }
  return true;
}

export function objForEach<T>(list: { [key: string]: T }, handler: Iterator<T, void>): void {
  universalIterator<T, void>(list, handler);
}

export function objEvery<T>(list: { [key: string]: T }, handler: Iterator<T, boolean>): boolean {
  return universalIterator<T, boolean>(list, handler, 'every');
}

export function objSome<T>(list: { [key: string]: T }, handler: Iterator<T, boolean>): boolean {
  return universalIterator<T, boolean>(list, handler, 'some');
}

export function objMap<T, R>(list: { [key: string]: T }, handler: Iterator<T, R>): { [key: string]: R } {
  const accumulator: { [key: string]: R } = {};
  return objReduce<T, { [key: string]: R }>(list, (acc: { [key: string]: R }, value: T, name: string) => {
    acc[name] = handler(value, name, list);
    return acc;
  }, accumulator);
}

export function objReduce<T, R>(list: { [key: string]: T }, handler: ReduceIterator<T, R>, acc: R): R {
  objForEach(list, (value: T, name: string, items: { [key: string]: T }) => {
    acc = handler(acc, value, name, items);
  });
  return acc;
}

export function randomString(): string {
  return Math.random().toString(36).substring(2);
}

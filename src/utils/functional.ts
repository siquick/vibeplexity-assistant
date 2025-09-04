/**
 * Functional programming utilities
 * Demonstrates functional programming patterns preferred in this project
 */

// Generic pipe function for function composition
export const pipe =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduce((acc, fn) => fn(acc), value);

// Generic compose function (right-to-left)
export const compose =
  <T>(...fns: Array<(arg: T) => T>) =>
  (value: T): T =>
    fns.reduceRight((acc, fn) => fn(acc), value);

// Type-safe curry function
export const curry = <T extends any[], R>(fn: (...args: T) => R) => {
  const curried = (...args: any[]): any => {
    if (args.length >= fn.length) {
      return fn(...(args as T));
    }
    return (...moreArgs: any[]) => curried(...args, ...moreArgs);
  };
  return curried;
};

// Generic Result type for error handling
export type Result<T, E> = { success: true; data: T } | { success: false; error: E };

export const ok = <T>(data: T): Result<T, never> => ({
  success: true,
  data,
});

export const err = <E>(error: E): Result<never, E> => ({
  success: false,
  error,
});

// Option type (Maybe monad)
export type Option<T> = T | null | undefined;

export const some = <T>(value: T): Option<T> => value;
export const none = <T>(): Option<T> => null;

// Safe array operations
export const safeHead = <T>(arr: T[]): Option<T> => (arr.length > 0 ? arr[0] : none());

export const safeFind =
  <T>(predicate: (item: T) => boolean) =>
  (arr: T[]): Option<T> =>
    arr.find(predicate) ?? none();

// Immutable update helpers
export const updateProperty =
  <T extends Record<string, any>, K extends keyof T>(key: K, value: T[K]) =>
  (obj: T): T => ({
    ...obj,
    [key]: value,
  });

export const updateNestedProperty =
  <T extends Record<string, any>>(path: string[], value: any) =>
  (obj: T): T => {
    const [head, ...tail] = path;
    if (tail.length === 0) {
      return { ...obj, [head]: value };
    }
    const nested = obj[head] ?? {};
    return {
      ...obj,
      [head]: updateNestedProperty(tail, value)(nested as any),
    };
  };

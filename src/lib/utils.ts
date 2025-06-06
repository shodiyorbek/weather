import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Create a WeakMap to store throttle states
const throttleStates = new WeakMap<(...args: unknown[]) => Promise<unknown>, { inThrottle: boolean; lastPromise: Promise<unknown> | null }>();

export function throttle<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  limit: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  return async function(this: unknown, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    // Get or initialize throttle state for this function
    let state = throttleStates.get(func);
    if (!state) {
      state = { inThrottle: false, lastPromise: null };
      throttleStates.set(func, state);
    }

    if (!state.inThrottle) {
      state.inThrottle = true;
      const result = await func.apply(this, args);
      state.lastPromise = Promise.resolve(result);
      setTimeout(() => {
        state!.inThrottle = false;
      }, limit);
      return Promise.resolve(result) as Promise<Awaited<ReturnType<T>>>;
    }
    throw new Error(`Request throttled. Please wait ${limit / 1000} seconds before trying again.`);
  };
}


export function debounce<T extends (...args: unknown[]) => Promise<unknown>>(
  func: T,
  wait: number
): (...args: Parameters<T>) => Promise<Awaited<ReturnType<T>>> {
  let timeoutId: ReturnType<typeof setTimeout>;

  return async function(this: unknown, ...args: Parameters<T>): Promise<Awaited<ReturnType<T>>> {
    clearTimeout(timeoutId);
    //@ts-ignore
    return new Promise((resolve) => {
      timeoutId = setTimeout(async () => {
        const result = await func.apply(this, args);
        resolve(result as Awaited<ReturnType<T>>);
      }, wait);
    });
  };
}

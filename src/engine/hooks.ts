// Simple global to track the current runtime instance during render
// In real React, this is the "Dispatcher"
import { ReactRuntime } from './Runtime';

let currentRuntime: ReactRuntime | null = null;

export const setHookRuntime = (runtime: ReactRuntime | null) => {
  currentRuntime = runtime;
};

export function useState<S>(initialState: S): [S, (action: (S | ((p: S) => S))) => void] {
  if (!currentRuntime) {
    throw new Error('useState must be called within a component rendered by the engine.');
  }
  return currentRuntime.useState(initialState);
}

export function useEffect(create: () => (() => void) | void, deps?: any[]) {
  if (!currentRuntime) {
    throw new Error('useEffect must be called within a component rendered by the engine.');
  }
  return currentRuntime.useEffect(create, deps);
}

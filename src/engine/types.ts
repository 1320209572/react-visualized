export type ReactElement = {
  type: any;
  props: any;
  key: string | null;
};

export type FiberTag =
  | 'HostRoot'
  | 'HostComponent'
  | 'FunctionComponent'
  | 'HostText';

export type Fiber = {
  // Instance related
  tag: FiberTag;
  key: null | string;
  type: any; // The function component or HTML tag string
  stateNode: any; // The DOM element or null

  // Tree structure
  return: Fiber | null;
  child: Fiber | null;
  sibling: Fiber | null;
  index: number;

  // Props & State
  pendingProps: any;
  memoizedProps: any;
  memoizedState: any; // Linked list of hooks for FunctionComponents

  // Effects
  flags: number; // Binary flags for side effects
  subtreeFlags: number;
  deletions: Fiber[] | null;

  // Double Buffering
  alternate: Fiber | null;

  // For Visualization/Debugging
  _debugID?: number;
};

export type Effect = {
  tag: 'UPDATE' | 'LAYOUT'; // UPDATE = useEffect, LAYOUT = useLayoutEffect
  create: () => (() => void) | void;
  destroy: (() => void) | void;
  deps: any[] | null;
  next: Effect | null;
};

export type Hook = {
  memoizedState: any; // The state value OR the Effect object
  baseState: any;
  queue: UpdateQueue | null; // For setState updates
  next: Hook | null; // Next hook in the list
};

export type Update<State> = {
  action: State | ((prevState: State) => State);
  next: Update<State> | null;
};

export type UpdateQueue = {
  pending: Update<any> | null;
};

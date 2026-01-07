// Global counter for debug IDs
let debugIdCounter = 0;

import type { Fiber, ReactElement, Hook, Effect } from './types';
import { setHookRuntime } from './hooks';

// Micro-step actions describing what is happening right now
export type RuntimeAction =
  | { type: 'IDLE' }
  | { type: 'RENDER_START', fiber: Fiber }
  | { type: 'HOOK_ENTER', index: number, name: string }
  | { type: 'HOOK_READ_STATE', index: number, value: any }
  | { type: 'HOOK_COMPUTE', index: number, prev: any, next: any }
  | { type: 'HOOK_EXIT', index: number, value: any }
  | { type: 'EFFECT_CHECK', index: number, changed: boolean, deps: any[] }
  | { type: 'EFFECT_Run', index: number }
  | { type: 'EFFECT_CLEANUP', index: number }
    | { type: 'RECONCILE_START', parent: Fiber }
    | { type: 'COMMIT_START' }
    | { type: 'DISPATCH_ACTION', index: number }; // New action type

  export class ReactRuntime {
  // Fiber State
  workInProgress: Fiber | null = null;
  wipRoot: Fiber | null = null;
  currentRoot: Fiber | null = null;
  deletions: Fiber[] = [];

  // Pending Effects
  pendingEffects: Array<{ fiber: Fiber, hook: Hook, index: number }> = [];

  // Hooks State (during render)
  wipFiber: Fiber | null = null;
  hookIndex: number = 0;

  // Execution Control
  currentAction: RuntimeAction = { type: 'IDLE' };
  // Generator for the current unit of work
  private workGenerator: Generator<RuntimeAction, Fiber | null, void> | null = null;

  // Visualization Hooks
  listeners: Array<(state: any) => void> = [];

  subscribe(fn: (state: any) => void) {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter(l => l !== fn);
    };
  }

  private notify() {
    const state = {
      workInProgress: this.workInProgress,
      wipRoot: this.wipRoot,
      currentRoot: this.currentRoot,
      currentAction: this.currentAction,
    };
    this.listeners.forEach(fn => fn(state));
  }

  // Visualization only
  private notifyAction(action: any) {
      if ((this as any).onAction) {
          (this as any).onAction(action);
      }
  }

  scheduleUpdate() {
    if (this.currentRoot) {
        this.wipRoot = {
            ...this.currentRoot,
            alternate: this.currentRoot,
            memoizedProps: null,
            _debugID: ++debugIdCounter,
        };
        this.workInProgress = this.wipRoot;
        this.currentAction = { type: 'RENDER_START', fiber: this.wipRoot };
        this.workGenerator = null; // Reset generator
        this.notify();
    }
  }

  render(element: ReactElement) {
    this.wipRoot = {
      tag: 'HostRoot',
      stateNode: null,
      memoizedProps: null,
      pendingProps: { children: [element] },
      type: 'ROOT',
      key: null,
      return: null,
      child: null,
      sibling: null,
      index: 0,
      alternate: this.currentRoot,
      flags: 0,
      subtreeFlags: 0,
      deletions: null,
      memoizedState: null,
      _debugID: ++debugIdCounter,
    };

    this.deletions = [];
    this.pendingEffects = [];
    this.workInProgress = this.wipRoot;
    this.currentAction = { type: 'RENDER_START', fiber: this.wipRoot };
    this.workGenerator = null;
    this.notify();
  }

  // The "Work Loop" Step - Now Micro-Stepped
  step(): boolean {
    // 0. Priority: Consume Micro-Steps from Buffer
    // This allows us to "pause" inside a component's execution (simulated)
    if (this.microSteps.length > 0) {
        const action = this.microSteps.shift()!;
        this.currentAction = action;
        this.notify();
        this.notifyAction(action); // Trigger particle effects
        return true;
    }

    // 1. If we have an active generator (inside a component render), step it
    if (this.workGenerator) {
        const res = this.workGenerator.next();
        if (!res.done) {
            this.currentAction = res.value;
            this.notify();
            this.notifyAction(res.value); // Trigger particle effects
            return true; // Still inside component
        } else {
            // Generator finished. workInProgress has been updated inside the generator.
            this.workGenerator = null;

            // CRITICAL: Check buffer again!
            // The generator execution (component function) might have populated the buffer.
            if (this.microSteps.length > 0) {
                const action = this.microSteps.shift()!;
                this.currentAction = action;
                this.notify();
                this.notifyAction(action); // Trigger particle effects
                return true;
            }

            // Fall through to pick next fiber
            return this.step();
        }
    }

    // 2. Start processing new fiber
    if (this.workInProgress) {
      this.workGenerator = this.performUnitOfWorkGenerator(this.workInProgress);
      return this.step(); // Execute immediately
    }

    // 3. Commit Phase
    if (this.wipRoot) {
      this.currentAction = { type: 'COMMIT_START' };
      this.commitRoot();
      this.flushPassiveEffects(); // Run effects after commit
      this.notify();
      return false; // Finished render
    }

    this.currentAction = { type: 'IDLE' };
    this.notify();
    return false; // Idle
  }

  // Generator version of performUnitOfWork
  private *performUnitOfWorkGenerator(fiber: Fiber): Generator<RuntimeAction, Fiber | null, void> {
    const isFunctionComponent = fiber.tag === 'FunctionComponent';

    if (isFunctionComponent) {
      // Delegate to updateFunctionComponent generator
      // We need to yield* from it? No, because we want to intercept hooks?
      // Yes, updateFunctionComponent will yield Hook Actions
      yield* this.updateFunctionComponentGenerator(fiber);
    } else {
      this.updateHostComponent(fiber);
    }

    // Return next unit of work
    let next: Fiber | null = null;
    if (fiber.child) {
      next = fiber.child;
    } else {
        let nextFiber: Fiber | null = fiber;
        while (nextFiber) {
            if (nextFiber.sibling) {
                next = nextFiber.sibling;
                break;
            }
            nextFiber = nextFiber.return;
        }
    }

    // Update global pointer
    this.workInProgress = next;
    return next;
  }

  private *updateFunctionComponentGenerator(fiber: Fiber) {
    this.wipFiber = fiber;
    this.hookIndex = 0;
    this.wipFiber.memoizedState = null;

    setHookRuntime(this);

    // Execute function
    // PROBLEM: The component function `fiber.type(props)` is a black box.
    // We cannot "pause" inside it unless we transform the user code into a generator too.
    // OR we rely on `useState` calling back into Runtime, and Runtime yielding inside useState.
    // BUT Runtime.useState is called synchronously by the user code.
    // If user code is `const [c] = useState(0)`, we are inside that stack frame.
    // We cannot yield from `useState` back to `step` unless `useState` throws a Promise (Suspense)
    // or we use a generator-based component runner.

    // OPTION A: Transform User Code to Generator (Complex)
    // OPTION B: Use "Re-entry" / Replay (Run until hook 1, stop. Run until hook 2, stop.)
    // This is how React handles Suspense / Hooks roughly.
    // But for visualization we want "Pause at line X".

    // Let's go with OPTION C: Mock "Pause" by recording actions and playing them back?
    // No, user wants interactive step.

    // REVISED STRATEGY:
    // We cannot pause INSIDE the component function execution in JS without Generators.
    // So we must execute the component function completely, BUT we intercept hooks.
    // We can't really "yield" execution back to the UI loop from within `useState` unless we throw.

    // Alternative: We execute the component *multiple times*?
    // No, side effects.

    // Solution: The Engine runs synchronously, but we BUFFER the "Micro-Steps".
    // Then `step()` plays back the buffered micro-steps.
    // Only when buffer is empty do we run the next Fiber.

    // Let's switch implementation to "Action Buffer".

    // 1. Run component logic (synchronously).
    // 2. Capture all Hook calls into a `microSteps` queue.
    // 3. `step()` consumes `microSteps`.

    // Let's revert the Generator approach for `performUnitOfWork` and use Buffer.

    const children = [fiber.type(fiber.pendingProps)]; // This runs the whole component

    setHookRuntime(null);

    this.reconcileChildren(fiber, children);
  }

  // New Micro-Step Buffer
  microSteps: RuntimeAction[] = [];

  // Override step to consume microSteps first
  stepBuffered(): boolean {
      if (this.microSteps.length > 0) {
          this.currentAction = this.microSteps.shift()!;
          this.notify();
          return true;
      }

      // If buffer empty, run standard Work Loop logic to generate more steps
      return this.step();
  }

  useState<S>(initial: S): [S, (action: S | ((p: S) => S)) => void] {
    const currentIndex = this.hookIndex;

    // Record Action: Enter Hook
    this.microSteps.push({ type: 'HOOK_ENTER', index: currentIndex, name: 'useState' });

    const oldHook =
        this.wipFiber?.alternate?.memoizedState &&
        this.getHookAtIndex(this.wipFiber.alternate.memoizedState, this.hookIndex);

    const hook: Hook = {
        memoizedState: oldHook ? oldHook.memoizedState : initial,
        baseState: oldHook ? oldHook.baseState : initial,
        queue: oldHook ? oldHook.queue : { pending: null },
        next: null,
    };

    // Record Action: Read State
    this.microSteps.push({ type: 'HOOK_READ_STATE', index: currentIndex, value: hook.memoizedState });

    const actions = oldHook ? oldHook.queue?.pending : null;

    if (actions) {
        let update = actions;
        let curr: any = update;
        do {
            const action = curr.action;
            const prev = hook.memoizedState;
            hook.memoizedState = typeof action === 'function'
                ? (action as Function)(hook.memoizedState)
                : action;

            // Record Action: Compute
            this.microSteps.push({ type: 'HOOK_COMPUTE', index: currentIndex, prev, next: hook.memoizedState });

            curr = curr.next;
        } while(curr && curr !== actions); // Circular check if we implemented circular

        if (oldHook && oldHook.queue) {
            oldHook.queue.pending = null;
        }
        if (hook.queue) {
             hook.queue.pending = null;
        }
    }

    if (this.wipFiber) {
        if (this.hookIndex === 0) {
            this.wipFiber.memoizedState = hook;
        } else {
            const lastHook = this.getHookAtIndex(this.wipFiber.memoizedState, this.hookIndex - 1);
            if (lastHook) {
                lastHook.next = hook;
            }
        }
    }

    this.hookIndex++;

    const setState = (action: S | ((p: S) => S)) => {
        const update = {
            action,
            next: null
        };

        if (!hook.queue) {
             hook.queue = { pending: null };
        }

        // Trigger Dispatch Particle immediately
        this.notifyAction({ type: 'DISPATCH_ACTION', index: currentIndex });

        const pending = hook.queue.pending;
        if (pending) {
             let last = pending;
             while(last.next) {
                 last = last.next;
             }
             last.next = update;
        } else {
            hook.queue.pending = update;
        }

        this.scheduleUpdate();
    };

    // Record Action: Exit
    this.microSteps.push({ type: 'HOOK_EXIT', index: currentIndex, value: hook.memoizedState });

    return [hook.memoizedState, setState];
  }

  useEffect(create: () => (() => void) | void, deps?: any[]) {
      const currentIndex = this.hookIndex;
      this.microSteps.push({ type: 'HOOK_ENTER', index: currentIndex, name: 'useEffect' });

      const oldHook =
        this.wipFiber?.alternate?.memoizedState &&
        this.getHookAtIndex(this.wipFiber.alternate.memoizedState, this.hookIndex);

      const hasChanged = !oldHook || !deps || !this.areHookInputsEqual(deps, oldHook.memoizedState.deps);

      this.microSteps.push({ type: 'EFFECT_CHECK', index: currentIndex, changed: hasChanged, deps: deps || [] });

      const hook: Hook = {
        memoizedState: {
            create,
            destroy: oldHook ? oldHook.memoizedState.destroy : undefined,
            deps,
        },
        baseState: null,
        queue: null,
        next: null,
      };

      if (hasChanged) {
          this.pendingEffects.push({ fiber: this.wipFiber!, hook, index: currentIndex });
      }

      if (this.wipFiber) {
        if (this.hookIndex === 0) {
            this.wipFiber.memoizedState = hook;
        } else {
            const lastHook = this.getHookAtIndex(this.wipFiber.memoizedState, this.hookIndex - 1);
            if (lastHook) {
                lastHook.next = hook;
            }
        }
      }
      this.hookIndex++;

      this.microSteps.push({ type: 'HOOK_EXIT', index: currentIndex, value: deps });
  }

  private areHookInputsEqual(nextDeps: any[], prevDeps: any[] | null) {
      if (prevDeps === null) return false;
      for (let i = 0; i < prevDeps.length && i < nextDeps.length; i++) {
          if (Object.is(nextDeps[i], prevDeps[i])) {
              continue;
          }
          return false;
      }
      return true;
  }

  private flushPassiveEffects() {
      this.pendingEffects.forEach(({ fiber, hook, index }) => {
          if (hook.memoizedState.destroy) {
               this.microSteps.push({ type: 'EFFECT_CLEANUP', index });
               const destroy = hook.memoizedState.destroy;
               if (typeof destroy === 'function') {
                   destroy();
               }
          }

          this.microSteps.push({ type: 'EFFECT_Run', index });
          const create = hook.memoizedState.create;
          const destroy = create();
          hook.memoizedState.destroy = destroy;
      });

      this.pendingEffects = [];
  }

  private getHookAtIndex(firstHook: Hook | null, index: number): Hook | null {
      let current = firstHook;
      for (let i = 0; i < index; i++) {
          if (!current) return null;
          current = current.next;
      }
      return current;
  }

  private updateHostComponent(fiber: Fiber) {
    if (!fiber.stateNode && fiber.tag !== 'HostRoot') {
        fiber.stateNode = { type: fiber.type, props: fiber.pendingProps };
    }
    const children = fiber.pendingProps?.children || [];
    this.reconcileChildren(fiber, children.flat());
  }

  private reconcileChildren(wipFiber: Fiber, elements: any[]) {
    let index = 0;
    let oldFiber = wipFiber.alternate && wipFiber.alternate.child;
    let prevSibling: Fiber | null = null;

    while (index < elements.length || oldFiber != null) {
      const element = elements[index];
      let newFiber: Fiber | null = null;

      // Handle Text Nodes
      const isTextElement = typeof element === 'string' || typeof element === 'number';

      // Compare old and new
      const sameType = oldFiber && element && (
          isTextElement
            ? oldFiber.tag === 'HostText'
            : element.type === oldFiber.type
      );

      if (sameType) {
        // Update
        newFiber = {
          tag: oldFiber!.tag,
          type: oldFiber!.type,
          pendingProps: isTextElement ? { nodeValue: element } : element.props,
          memoizedProps: null,
          memoizedState: oldFiber!.memoizedState,
          key: isTextElement ? null : element.key,
          stateNode: oldFiber!.stateNode,
          return: wipFiber,
          child: null,
          sibling: null,
          index,
          alternate: oldFiber,
          flags: 1, // UPDATE
          subtreeFlags: 0,
          deletions: null,
          _debugID: ++debugIdCounter,
        };
      }

      if (element && !sameType) {
        // New Fiber
        let tag: any = 'HostComponent';
        if (isTextElement) {
            tag = 'HostText';
        } else if (typeof element.type === 'function') {
            tag = 'FunctionComponent';
        }

        newFiber = {
          tag,
          type: isTextElement ? 'TEXT' : element.type,
          pendingProps: isTextElement ? { nodeValue: element } : element.props,
          memoizedProps: null,
          memoizedState: null,
          key: isTextElement ? null : element.key,
          stateNode: null,
          return: wipFiber,
          child: null,
          sibling: null,
          index,
          alternate: null,
          flags: 2, // PLACEMENT
          subtreeFlags: 0,
          deletions: null,
          _debugID: ++debugIdCounter,
        };
      }

      if (oldFiber && !sameType) {
        oldFiber.flags = 4; // DELETION
        this.deletions.push(oldFiber);
      }

      if (oldFiber) {
        oldFiber = oldFiber.sibling;
      }

      if (index === 0) {
        wipFiber.child = newFiber;
      } else if (element && prevSibling) {
        prevSibling.sibling = newFiber;
      }

      prevSibling = newFiber;
      index++;
    }
  }

  private commitRoot() {
    this.deletions.forEach(this.commitWork);
    this.commitWork(this.wipRoot!.child);
    this.currentRoot = this.wipRoot;
    this.wipRoot = null;
  }

  private commitWork = (fiber: Fiber | null) => {
    if (!fiber) return;
    this.commitWork(fiber.child);
    this.commitWork(fiber.sibling);
  }
}

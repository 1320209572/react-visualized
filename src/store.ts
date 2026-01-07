import { create } from 'zustand';
import { ReactRuntime, type RuntimeAction } from './engine/Runtime';
import type { Fiber, ReactElement } from './engine/types';
import { useState } from './engine/hooks';
import { useStateScenarios, type Scenario } from './examples/useState';
import { useEffectScenarios } from './examples/useEffect';
import { syncStepController } from './hooks/useStepController';

const allScenarios = [...useStateScenarios, ...useEffectScenarios];

interface AppState {
  runtime: ReactRuntime;
  currentRoot: Fiber | null;
  wipRoot: Fiber | null;
  workInProgress: Fiber | null;
  lastAction: { type: string, payload?: any, timestamp: number } | null;
  currentStepAction: RuntimeAction;
  currentScenario: Scenario | null;

  // Actions
  init: () => void;
  step: () => void;
  loadScenario: (id: string) => void;
  reset: () => void;
}

export const useStore = create<AppState>((set, get) => {
  const runtime = new ReactRuntime();

  // Bind action listener
  (runtime as any).onAction = (action: any) => {
      console.log('Store: onAction received', action);
      set({ lastAction: { ...action, timestamp: Date.now() } });
  };

    // Sync runtime state to store
    runtime.subscribe((state) => {
      set({
        currentRoot: state.currentRoot,
        wipRoot: state.wipRoot,
        workInProgress: state.workInProgress,
        currentStepAction: state.currentAction
      });
      syncStepController(); // Sync our new controller
    });

  return {
    runtime,
    currentRoot: null,
    wipRoot: null,
    workInProgress: null,
    lastAction: null,
    currentStepAction: { type: 'IDLE' },
    currentScenario: null,

    init: () => {},

    step: () => {
      const working = runtime.stepBuffered();
      // ...
    },

    reset: () => {
        // ...
    },

    loadScenario: (id: string) => {
        const scenario = allScenarios.find(s => s.id === id);
        if (scenario) {
            set({ currentScenario: scenario });
            scenario.render(runtime);
        }
    }
  };
});

import { create } from 'zustand';
import { useStore } from '../store';
import type { RuntimeAction } from '../engine/Runtime';

// 1. 数据驱动脚本 (The Script)
export type StepPhase = 'INVOKE' | 'HEAP_LOOKUP' | 'DATA_TRANSFER' | 'VDOM_GEN' | 'COMMIT_SYNC' | 'STACK_CLEANUP' | 'IDLE';

interface StepDefinition {
    id: StepPhase;
    codeLine: number | null; // null if not specific line
    phase: 'RENDER' | 'COMMIT' | 'IDLE';
    description: string;
    actionType?: string; // Matching RuntimeAction type
}

export const STEP_DEFINITIONS: Record<StepPhase, StepDefinition> = {
    'INVOKE': {
        id: 'INVOKE',
        codeLine: 1,
        phase: 'RENDER',
        description: "Function Invocation (函数入栈): React Scheduler calls the component. Stack frame allocated. (React 调度器调用组件，分配栈帧)",
        actionType: 'RENDER_START'
    },
    'HEAP_LOOKUP': {
        id: 'HEAP_LOOKUP',
        codeLine: 2,
        phase: 'RENDER',
        description: "Heap Lookup (堆寻址): Locating hook state in Fiber's memoizedState linked list. (在 Fiber 链表中定位 Hook 状态)",
        actionType: 'HOOK_ENTER'
    },
    'DATA_TRANSFER': {
        id: 'DATA_TRANSFER',
        codeLine: 2,
        phase: 'RENDER',
        description: "Data Transfer (数据流转): Persistent state beamed from Heap to Stack. (持久化状态从堆“传送”到栈局部变量)",
        actionType: 'HOOK_READ_STATE'
    },
    'VDOM_GEN': {
        id: 'VDOM_GEN',
        codeLine: 3, // return block
        phase: 'RENDER',
        description: "VDOM Generation (生成蓝图): Component returns UI description. Reconciliation begins. (组件返回 UI 描述，开始协调)",
        actionType: 'RECONCILE_START'
    },
    'COMMIT_SYNC': {
        id: 'COMMIT_SYNC',
        codeLine: null,
        phase: 'COMMIT',
        description: "Commit Sync (物理提交): React syncs changes to real DOM. UI updates. (React 同步变更到真实 DOM，界面刷新)",
        actionType: 'COMMIT_START'
    },
    'STACK_CLEANUP': {
        id: 'STACK_CLEANUP',
        codeLine: null,
        phase: 'IDLE',
        description: "Stack Cleanup (栈销毁): Execution context destroyed. State persists in Heap. (执行上下文销毁，状态安全存储于堆中)",
        actionType: 'IDLE' // or triggered after commit
    },
    'IDLE': {
        id: 'IDLE',
        codeLine: null,
        phase: 'IDLE',
        description: "Idle (就绪): Waiting for user interaction... (等待用户交互...)",
        actionType: 'IDLE'
    }
};

// Map Runtime Action to Step Phase
const mapActionToStep = (action: RuntimeAction): StepPhase => {
    switch (action.type) {
        case 'RENDER_START': return 'INVOKE';
        case 'HOOK_ENTER': return 'HEAP_LOOKUP';
        case 'HOOK_READ_STATE': return 'DATA_TRANSFER';
        case 'HOOK_EXIT': return 'DATA_TRANSFER'; // Keep showing transfer until next
        case 'HOOK_COMPUTE': return 'DATA_TRANSFER';
        case 'RECONCILE_START': return 'VDOM_GEN';
        case 'COMMIT_START': return 'COMMIT_SYNC';
        case 'IDLE': return 'STACK_CLEANUP'; // When runtime goes idle, we do cleanup
        default: return 'IDLE';
    }
};

// Store for Step Controller
interface StepState {
    currentStep: StepPhase;
    definition: StepDefinition;
    stepIndex: number;
    actionsHistory: string[];
}

export const useStepController = create<StepState>((set) => ({
    currentStep: 'IDLE',
    definition: STEP_DEFINITIONS['IDLE'],
    stepIndex: 0,
    actionsHistory: []
}));

// Sync with Main Store
export const syncStepController = () => {
    const action = useStore.getState().currentStepAction;
    const phase = mapActionToStep(action);

    // Special handling: if we were in COMMIT_SYNC and now IDLE, it's STACK_CLEANUP
    // The Runtime emits IDLE at the end.

    useStepController.setState(state => {
        // Debounce or logic to prevent flickering?
        // For now direct map
        return {
            currentStep: phase,
            definition: STEP_DEFINITIONS[phase],
            stepIndex: state.stepIndex + 1,
            actionsHistory: [...state.actionsHistory, action.type]
        };
    });
};

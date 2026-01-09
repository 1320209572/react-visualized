import { create } from 'zustand';

export type Phase = 'IDLE' | 'RENDER' | 'COMMIT';

export interface UpdateAction {
    id: string;
    type: 'constant' | 'function';
    value: number | ((prev: number) => number);
    displayValue: string;
    visualLabel: string;
    capturedValue: number;
    sequence?: number;
}

interface LastRunSnapshot {
    captured: number | null;
    payloads: string[];
    mode: 'constant' | 'function' | null;
    committed: number | null;
}

export interface SimulationState {
    count: number;
    phase: Phase;
    snapshotValue: number | null;
    narrative: string;
    updateQueue: UpdateAction[];
    collapseQueue: UpdateAction[]; // frozen queue for collapse animation
    logs: string[];

    // Animation triggers
    activePhoton: {
        id: string;
        label: string;
        payload: UpdateAction;
    } | null;
    lastRippleTimestamp: number; // For triggering ripple effect

    // Visual State for Hypercube
    isLocked: boolean;
    isMutating: boolean;
    showSummary: boolean; // New: Step E Summary
    summaryText: string;
    activeLine: number; // -1 for none
    stackSlots: Array<{ id: string, label: string, value: number, isLocked: boolean }>;
    lastRun: LastRunSnapshot | null;
    collapsingQueue: boolean;

    dispatchUpdate: (type: 'constant' | 'function', val: number | string) => void;
    dispatchBatch: (updates: Array<{type: 'constant' | 'function', val: number | string}>) => void;
    processNextUpdate: (update: UpdateAction) => void;
    onPhotonArrival: () => void; // New action when photon hits
    commitUpdates: () => void;
    reset: () => void;
}

export const useSimulationStore = create<SimulationState>((set, get) => ({
    count: 0,
    phase: 'IDLE',
    stackHeight: 2,
    heapHeight: -2,
    snapshotValue: null,
    narrative: "",
    updateQueue: [],
    collapseQueue: [],
    logs: ['Genesis Initialized. Fiber Heap Ready. / 系统初始化完成。Fiber 堆已就绪。'],
    activePhoton: null,
    lastRippleTimestamp: 0,

    // Init Visual State
    isLocked: false,
    isMutating: false,
    showSummary: false,
    summaryText: "",
    activeLine: -1,
    stackSlots: [],
    lastRun: null,
    collapsingQueue: false,

    dispatchUpdate: (type, val) => {
        const currentCount = get().count;
        const numericVal = typeof val === 'number' ? val : currentCount;
        const visualLabel = type === 'constant'
            ? `${currentCount} → ${numericVal} (captured)`
            : 'fn: n => n + 1 (fresh)';
        const newUpdate: UpdateAction = {
            id: Math.random().toString(36).substr(2, 9),
            type,
            value: typeof val === 'number' ? val : 0,
            displayValue: val.toString(),
            visualLabel,
            capturedValue: currentCount,
            sequence: 1,
        };

        // Step A & B: Invoke & Snapshot
        set(state => ({
            updateQueue: [...state.updateQueue, newUpdate],
            snapshotValue: currentCount,
            narrative: `Step 1: Snapshot Capture. Locking closure value ${currentCount}. / 第一步：捕获快照。锁定闭包值 ${currentCount}。`,
            logs: [...state.logs, `Dispatch: setCount(${val})`],
            phase: 'RENDER',
            isLocked: true, // "Red Frozen" state
            activeLine: 1,
            stackSlots: [{ id: 's1', label: 'count', value: currentCount, isLocked: true }],
            showSummary: false,
            lastRun: {
                captured: currentCount,
                payloads: [visualLabel],
                mode: type,
                committed: null
            }
        }));

        setTimeout(() => {
            // Step C: Dispatch
            set({ narrative: `Step 2: Dispatching Packet. ${newUpdate.visualLabel}... / 第二步：派遣指令包。${newUpdate.visualLabel}...` });
            get().processNextUpdate(newUpdate);

            // Step D: Commit & Collapse
            setTimeout(() => {
                 set({ narrative: "Step 3: Collapse & Commit. Merging state... / 第三步：队列坍缩与提交。合并状态..." });
                 setTimeout(() => get().commitUpdates(), 2000);
            }, 3500);
        }, 2000);
    },

    dispatchBatch: (updates) => {
        const currentCount = get().count;
        const newUpdates: UpdateAction[] = updates.map((u, idx) => {
            const nextVal = typeof u.val === 'number' ? u.val : currentCount + 1;
            const visualLabel = u.type === 'constant'
                ? `#${idx + 1}: snapshot ${currentCount} → ${nextVal}`
                : `#${idx + 1}: fn n=>n+1 (snap ${currentCount})`;

            return {
                id: Math.random().toString(36).substr(2, 9),
                type: u.type,
                value: typeof u.val === 'number' ? u.val : 0,
                displayValue: u.val.toString(),
                visualLabel,
                capturedValue: currentCount,
                sequence: idx + 1,
            };
        });

        // Step A: Mount Stack Frame (Purple Slice Slides In)
        set(state => ({
            logs: [...state.logs, `Batch Dispatch`],
            phase: 'RENDER',
            activeLine: 1, // "function Counter() {" or similar top level
            stackSlots: [{ id: 's1', label: 'count', value: currentCount, isLocked: false }], // Initial Unlocked
            showSummary: false,
            narrative: "Step A: Render Start. Creating execution context... / 步骤A：渲染开始。创建执行上下文...",
            lastRun: {
                captured: currentCount,
                payloads: newUpdates.map(n => n.visualLabel),
                mode: newUpdates[0]?.type ?? null,
                committed: null
            }
        }));

        let sequence = Promise.resolve();

        // Step B: Snapshot Lock (Red Freeze)
        sequence = sequence.then(() => new Promise(resolve => {
            setTimeout(() => {
                set({
                    isLocked: true,
                    activeLine: 2, // "const handleClick = () => {"
                    stackSlots: [{ id: 's1', label: 'count', value: currentCount, isLocked: true }],
                    narrative: `Step B: Snapshot Capture. Locking closure value ${currentCount}. / 步骤B：捕获快照。锁定闭包值 ${currentCount}。`
                });
                resolve();
            }, 1000); // 1s delay for observation
        }));

        // Initial Delay after lock
        sequence = sequence.then(() => new Promise(resolve => setTimeout(resolve, 1500)));

        // Step C: Dispatch Loop
        newUpdates.forEach((u, index) => {
            sequence = sequence.then(() => {
                return new Promise(resolve => {
                    set({
                        narrative: `Step C-${index+1}: Dispatching Packet. ${u.visualLabel} / 步骤C-${index+1}：派遣指令包。${u.visualLabel}`,
                        activeLine: 4 + index // "setCount(count + 1);" lines (Indices 4, 5, 6)
                    });

                    get().processNextUpdate(u);
                    // Wait for photon travel time (approx 2s) + pause
                    setTimeout(resolve, 2500);
                });
            });
        });

        sequence.then(() => {
             // Step D: Collapse Prep
             set({ narrative: "Final Step: Collapse & Commit. Batch processing... / 最后一步：队列坍缩与提交。批量处理..." });
             setTimeout(() => get().commitUpdates(), 2000);
        });
    },

    processNextUpdate: (update: UpdateAction) => {
        set({
            activePhoton: {
                id: Math.random().toString(),
                label: update.visualLabel,
                payload: update
            }
        });
    },

    onPhotonArrival: () => {
        const { activePhoton, updateQueue } = get();
        if (activePhoton) {
            set({
                activePhoton: null,
                updateQueue: [...updateQueue, activePhoton.payload], // Add to rack ON ARRIVAL
                lastRippleTimestamp: Date.now()
            });
        }
    },

    commitUpdates: () => {
        // Prevent double commit or re-entry if state is already idle
        if (get().phase !== 'RENDER') return;

        set(state => {
            let newCount = state.count;
            state.updateQueue.forEach(u => {
                if (u.type === 'constant') {
                    newCount = u.value as number;
                } else if (u.type === 'function') {
                    newCount = newCount + 1;
                }
            });

            return {
                count: newCount,
                updateQueue: [],
                collapseQueue: state.updateQueue, // keep a frozen copy for collapse animation
                phase: 'COMMIT',
                activePhoton: null,
                snapshotValue: null, // Unlock snapshot
                narrative: `Commit Phase: All updates merged. Result: ${newCount}. / 提交阶段：所有更新已合并。结果：${newCount}。`,
                logs: [...state.logs, `Commit: ${newCount}`],
                isLocked: false, // Unlock visuals
                isMutating: true, // Trigger mutation flash
                activeLine: -1,
                stackSlots: [], // Clear slots
                showSummary: true,
                summaryText: `Truth: The stack frame was destroyed, but its locked '0' caused 3 letters of '1' to be sent. The heap eventually received '1'. / 真相：栈帧被销毁了，但它锁死的 0 导致发出了 3 封内容为 1 的信。堆内存最终只收到了 1。`,
                lastRun: state.lastRun ? { ...state.lastRun, committed: newCount } : null,
                collapsingQueue: state.updateQueue.length > 0
            };
        });

        setTimeout(() => {
            set({
                phase: 'IDLE',
                narrative: "",
                isMutating: false,
                showSummary: false,
                collapsingQueue: false,
                collapseQueue: []
            });
        }, 8000); // Longer summary time
    },

    reset: () => set({
        count: 0,
        updateQueue: [],
        collapseQueue: [],
        logs: ['System Reset. / 系统重置。'],
        snapshotValue: null,
        narrative: "",
        activePhoton: null,
        phase: 'IDLE',
        isLocked: false,
        isMutating: false,
        activeLine: -1,
        stackSlots: [],
        showSummary: false,
        summaryText: "",
        lastRun: null,
        collapsingQueue: false
    })
}));

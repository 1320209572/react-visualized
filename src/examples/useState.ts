import type { ReactElement } from '../engine/types';
import { useState } from '../engine/hooks';

export type Scenario = {
    id: string;
    title: string;
    description: string;
    code: string;
    render: (runtime: any) => void;
};

export const useStateScenarios: Scenario[] = [
    {
        id: 'counter-basic',
        title: '基础计数器',
        description: '展示最基础的 useState 用法。State 初始化、读取和更新。',
        code: `function Counter() {
  const [count, setCount] = useState(1);
  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
}`,
        render: (runtime) => {
            const Counter = (props: any) => {
                const [count, setCount] = useState(1);
                return {
                    type: 'button',
                    props: {
                        children: [`Count: ${count}`],
                        onClick: () => {
                            setCount((c: number) => c + 1);
                            // Hack: Emit manual action for demo viz
                            // In real engine this should be automatic inside dispatch
                            // runtime.notifyAction...
                        }
                    },
                    key: 'btn'
                };
            };
            runtime.render({
                type: Counter,
                props: {},
                key: null
            });
        }
    },
    {
        id: 'counter-multiple',
        title: '多个 State',
        description: '展示多个 useState 如何在链表中存储。注意 Hook 的顺序。',
        code: `function MultiCounter() {
  const [a, setA] = useState(0);
  const [b, setB] = useState(10);
  return (
    <div>{a} - {b}</div>
  );
}`,
        render: (runtime) => {
             const MultiCounter = () => {
                const [a, setA] = useState(0);
                const [b, setB] = useState(10);
                return {
                    type: 'div',
                    props: {
                        children: [`A: ${a}`, ` B: ${b}`],
                        onClick: () => setA((v: number) => v + 1)
                    },
                    key: null
                };
             };
             runtime.render({ type: MultiCounter, props: {}, key: null });
        }
    },
    {
        id: 'hook-order-error',
        title: 'Hook 顺序错误 (Trap)',
        description: '展示为什么不能在条件语句中使用 Hook。当条件改变时，Hook 链表会发生错位。',
        code: `function BadComponent() {
  const [count, setCount] = useState(0);

  // 🔴 错误：在条件语句中使用 Hook
  if (count % 2 === 0) {
    useState('Cond');
  }

  const [text, setText] = useState('Fixed');

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count} - {text}
    </button>
  );
}`,
        render: (runtime) => {
             const BadComponent = () => {
                const [count, setCount] = useState(0);

                if (count % 2 === 0) {
                    useState('Cond');
                }

                const [text, setText] = useState('Fixed');

                return {
                    type: 'button',
                    props: {
                        children: [`${count} - ${text}`],
                        onClick: () => setCount((c: number) => c + 1)
                    },
                    key: null
                };
             };
             runtime.render({ type: BadComponent, props: {}, key: null });
        }
    }
];

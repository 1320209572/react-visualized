import type { Scenario } from './useState';
import { useState, useEffect } from '../engine/hooks';

export const useEffectScenarios: Scenario[] = [
    {
        id: 'effect-basic',
        title: 'useEffect 基础',
        description: '展示 Effect 如何在依赖变化时触发。观察 Effect 节点的 Deps 数组变化。',
        code: `function EffectDemo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Run Effect', count);
    return () => console.log('Cleanup', count);
  }, [count]);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
}`,
        render: (runtime) => {
            const EffectDemo = () => {
                const [count, setCount] = useState(0);

                useEffect(() => {
                    // console.log('Run Effect', count);
                    return () => {
                         // console.log('Cleanup', count);
                    };
                }, [count]);

                return {
                    type: 'button',
                    props: {
                        children: [`Count: ${count}`],
                        onClick: () => setCount((c: number) => c + 1)
                    },
                    key: null
                };
            };
            runtime.render({ type: EffectDemo, props: {}, key: null });
        }
    },
    {
        id: 'effect-mount',
        title: 'On Mount (Empty Deps)',
        description: '依赖为空数组 []，只在挂载时运行一次。',
        code: `function MountDemo() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    console.log('Mounted!');
  }, []);

  return (
    <button onClick={() => setCount(c => c + 1)}>
      {count}
    </button>
  );
}`,
        render: (runtime) => {
            const MountDemo = () => {
                const [count, setCount] = useState(0);

                useEffect(() => {
                    console.log('Mounted!');
                }, []);

                return {
                    type: 'button',
                    props: {
                        children: [`Update: ${count}`],
                        onClick: () => setCount((c: number) => c + 1)
                    },
                    key: null
                };
            };
            runtime.render({ type: MountDemo, props: {}, key: null });
        }
    }
];

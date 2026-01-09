import React from 'react';

export interface Scenario {
  id: string;
  title: string;
  description: string;
  hookType: 'useState' | 'useEffect' | 'useRef';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  code: string;
}

export const SCENARIOS: Scenario[] = [
  {
    id: 'closure-trap',
    title: 'The Closure Trap / 闭包陷阱',
    description: 'Why calling setCount(count + 1) multiple times doesn\'t work as expected. / 为什么连续调用多次 setCount(count + 1) 结果不如预期。',
    hookType: 'useState',
    difficulty: 'Beginner',
    code: `function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // 🔴 Problem: 'count' is captured as 0 in this closure
    // 问题：'count' 在此闭包中被捕获为 0
    setCount(count + 1); // schedules update to 1
    setCount(count + 1); // schedules update to 1
    setCount(count + 1); // schedules update to 1

    console.log(count); // Still 0!
  };

  return <button onClick={handleClick}>{count}</button>;
}`
  },
  {
    id: 'updater-function',
    title: 'Functional Updates / 函数式更新',
    description: 'Using the updater function to access the latest state. / 使用更新函数来访问最新状态。',
    hookType: 'useState',
    difficulty: 'Intermediate',
    code: `function Counter() {
  const [count, setCount] = useState(0);

  const handleClick = () => {
    // ✅ Solution: 'n' is always the pending state
    // 解决方案：'n' 始终是待处理的最新状态
    setCount(n => n + 1); // 0 -> 1
    setCount(n => n + 1); // 1 -> 2
    setCount(n => n + 1); // 2 -> 3
  };

  return <button onClick={handleClick}>{count}</button>;
}`
  }
];

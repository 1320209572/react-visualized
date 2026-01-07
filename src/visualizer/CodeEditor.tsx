import React, { useRef } from 'react';
import { useStore } from '../store';
import { clsx } from 'clsx';

// We'll manually tokenize the example code for simplicity since we know the content.
// In a real app, use PrismJS or similar.
const codeLines = [
  { text: '// Interactive Example', type: 'comment' },
  { text: '// Click \'Load & Render\' then \'Step\'', type: 'comment' },
  { text: '', type: 'whitespace' },
  { text: 'function Counter(props) {', type: 'code' },
  { text: '  // Hook 0: Linked List Head', type: 'comment' },
  { text: '  const [count, setCount] = useState(1);', type: 'code', hasHook: true, hookIndex: 0 },
  { text: '  ', type: 'whitespace' },
  { text: '  // Hook 1: Linked via .next', type: 'comment' },
  { text: '  const [text, setText] = useState(\'foo\');', type: 'code', hasHook: true, hookIndex: 1 },
  { text: '', type: 'whitespace' },
  { text: '  return (', type: 'code' },
  { text: '    <div>', type: 'code' },
  { text: '      <button onClick={() => setCount(c => c + 1)}>', type: 'code' },
  { text: '        Count: {count}', type: 'code' },
  { text: '      </button>', type: 'code' },
  { text: '      <div>Text: {text}</div>', type: 'code' },
  { text: '    </div>', type: 'code' },
  { text: '  );', type: 'code' },
  { text: '}', type: 'code' },
];

export const CodeEditor: React.FC<{ code?: string }> = ({ code }) => {
  const activeHookIndex = useStore(s => {
      const action = s.currentStepAction;
      if (action.type.startsWith('HOOK_') && 'index' in action) {
          return (action as any).index;
      }
      return -1;
  });
  const lineRefs = useRef<(HTMLDivElement | null)[]>([]);

  const lines = code ? code.split('\n').map((text, i) => {
      const hasHook = text.includes('useState');
      // Simple hook index guess: count how many hooks appeared before this line
      const hookIndex = hasHook ? (code.split('\n').slice(0, i).filter(l => l.includes('useState')).length) : -1;
      return { text, type: 'code', hasHook, hookIndex };
  }) : [];

  return (
    <div className="h-full flex flex-col font-mono text-sm relative group">
      {/* Header Bar */}
      <div className="px-4 py-2 border-b border-white/10 bg-black/20 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-red-500/20 border border-red-500/50" />
          <div className="w-3 h-3 rounded-full bg-yellow-500/20 border border-yellow-500/50" />
          <div className="w-3 h-3 rounded-full bg-green-500/20 border border-green-500/50" />
        </div>
        <span className="text-xs text-gray-500">Source.tsx</span>
      </div>

      {/* Editor Body */}
      <div className="flex-1 overflow-auto p-4 custom-scrollbar bg-[#0a0a0c]/80">
        {lines.map((line, i) => (
          <div
            key={i}
            className="flex hover:bg-white/5 transition-colors rounded-sm px-2 -mx-2"
          >
            {/* Line Number */}
            <span className="text-gray-700 w-8 text-right mr-4 select-none text-xs leading-6">{i + 1}</span>

            {/* Code Content */}
            <div className={clsx(
              "leading-6 whitespace-pre",
              line.type === 'comment' ? "text-gray-500 italic" : "text-gray-300"
            )}>
              {line.hasHook ? (
                <span>
                  {line.text.split('useState')[0]}
                  <span
                    ref={el => lineRefs.current[i] = el}
                    data-hook-index={line.hookIndex}
                    id={`code-hook-${line.hookIndex}`}
                    className={clsx(
                      "font-bold px-1 rounded transition-all duration-300 cursor-pointer border border-transparent",
                      activeHookIndex === line.hookIndex
                        ? "text-cyan-300 bg-cyan-500/20 border-cyan-500/50 shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                        : "text-cyan-400 hover:text-cyan-300 hover:bg-cyan-500/10"
                    )}
                  >
                    useState
                  </span>
                  {line.text.split('useState')[1]}
                </span>
              ) : (
                line.text
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Decorative Glow */}
      <div className="absolute inset-0 pointer-events-none bg-gradient-to-tr from-cyan-500/5 to-purple-500/5 opacity-50" />
    </div>
  );
};

import React from 'react';
import { SCENARIOS } from '../../data/scenarios';
import { ArrowRight, ChevronLeft, Box, Activity, Layers, Code2 } from 'lucide-react';

interface ScenarioListPageProps {
  hookType: string;
  onSelectScenario: (id: string) => void;
  onBack: () => void;
}

export const ScenarioListPage: React.FC<ScenarioListPageProps> = ({ hookType, onSelectScenario, onBack }) => {
  const filteredScenarios = SCENARIOS.filter(s => s.hookType === hookType);

  return (
    <div className="min-h-screen bg-[#050505] text-white p-8 md:p-16 relative overflow-hidden font-sans">
      {/* Background Decor */}
      <div className="absolute top-0 right-0 w-full h-[500px] bg-gradient-to-b from-cyan-900/10 to-transparent pointer-events-none" />

      <div className="max-w-6xl mx-auto relative z-10">
        <header className="mb-12">
          <button
            onClick={onBack}
            className="mb-8 flex items-center gap-2 text-gray-500 hover:text-white transition-colors uppercase tracking-widest text-xs font-bold"
          >
            <ChevronLeft size={16} /> BACK TO HOOKS
          </button>

          <h1 className="text-5xl md:text-7xl font-black tracking-tighter mb-4 text-white">
            {hookType} <span className="text-gray-600">Scenarios</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl font-light">
            Select a specific edge case or pattern to visualize.
            <br />
            <span className="text-gray-500 text-sm mt-2 block">
              选择一个特定的边界情况或模式进行可视化。
            </span>
          </p>
        </header>

        <div className="grid grid-cols-1 gap-4">
          {filteredScenarios.map((scenario) => (
            <button
              key={scenario.id}
              onClick={() => onSelectScenario(scenario.id)}
              className="group relative bg-white/5 border border-white/10 rounded-xl p-6 text-left hover:bg-white/10 transition-all hover:border-white/20 flex flex-col md:flex-row gap-6 items-start md:items-center"
            >
              <div className={`p-4 rounded-lg bg-black/40 border border-white/5 shrink-0 ${
                  scenario.difficulty === 'Beginner' ? 'text-green-400' :
                  scenario.difficulty === 'Intermediate' ? 'text-yellow-400' : 'text-red-400'
              }`}>
                <Code2 size={24} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3 mb-1">
                    <h3 className="text-xl font-bold text-white group-hover:text-cyan-400 transition-colors truncate">
                        {scenario.title.split('/')[0]}
                    </h3>
                    <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded border border-white/10 ${
                        scenario.difficulty === 'Beginner' ? 'text-green-400 bg-green-900/10' :
                        scenario.difficulty === 'Intermediate' ? 'text-yellow-400 bg-yellow-900/10' : 'text-red-400 bg-red-900/10'
                    }`}>
                        {scenario.difficulty}
                    </span>
                </div>
                <div className="text-sm text-gray-500 font-mono mb-2">
                     {scenario.title.split('/')[1]}
                </div>
                <p className="text-sm text-gray-400 line-clamp-2">
                    {scenario.description.split('/')[0]}
                </p>
              </div>

              <div className="flex items-center text-sm font-bold text-gray-500 group-hover:text-white transition-colors shrink-0">
                START LAB <ArrowRight size={16} className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </button>
          ))}

          {filteredScenarios.length === 0 && (
              <div className="p-12 text-center border border-dashed border-white/10 rounded-xl text-gray-500">
                  No scenarios available for this hook yet.
              </div>
          )}
        </div>
      </div>
    </div>
  );
};

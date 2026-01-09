import React, { useEffect, useState } from 'react';
import { ChevronLeft, Play, Pause, Zap, BookOpen, SkipForward } from 'lucide-react';
import { CodeEditor } from '../../visualizer/CodeEditor';
import { FiberTree } from '../../visualizer/FiberTree';
import { MemoryView } from '../../visualizer/MemoryView';
import { RenderPreview } from '../../visualizer/RenderPreview';
import { ConnectionOverlay } from '../../visualizer/ConnectionOverlay';
import { ActionOverlay } from '../../visualizer/ActionOverlay';
import { useStore } from '../../store';
import { LabBackground } from '../../components/ui/LabBackground';
import { GlassPanel } from '../../components/ui/GlassPanel';
import { clsx } from 'clsx';
import { useStateScenarios } from '../../examples/useState';
import { useEffectScenarios } from '../../examples/useEffect';
import { TutorialOverlay } from '../../components/ui/TutorialOverlay';
import { PhysicsLinks } from '../../visualizer/PhysicsLinks';
import { useStepController } from '../../hooks/useStepController';
import { PhaseEffects } from '../../visualizer/PhaseEffects';
import { VisualOrchestrator } from '../../visualizer/VisualOrchestrator';
import { SubtitleBar } from '../../components/ui/SubtitleBar';

const allScenarios = [...useStateScenarios, ...useEffectScenarios];

interface LabLayoutProps {
  labId: string;
  onBack: () => void;
}

export const LabLayout: React.FC<LabLayoutProps> = ({ labId, onBack }) => {
  const step = useStore(s => s.step);
  const loadScenario = useStore(s => s.loadScenario);
  const currentScenario = useStore(s => s.currentScenario);

  // Step Controller
  const { definition, stepIndex, currentStep } = useStepController();

  const [isPlaying, setIsPlaying] = useState(false);
  const [showSidebar, setShowSidebar] = useState(true);
  const [showTutorial, setShowTutorial] = useState(true);

  // Phase Detection from Controller
  const phase = definition.phase.toLowerCase();

  useEffect(() => {
      if (!currentScenario) {
          loadScenario(useStateScenarios[0].id);
      }
  }, [currentScenario, loadScenario]);

  useEffect(() => {
    let timer: any;
    if (isPlaying) {
      timer = setInterval(() => {
         const store = useStore.getState();
         // Stop if idle and no WIP, but allow start
         if (!store.workInProgress && !store.wipRoot && currentStep === 'IDLE') {
             setIsPlaying(false);
             return;
         }
         step();
      }, 1500); // Much slower to observe atomic steps
    }
    return () => clearInterval(timer);
  }, [isPlaying, step, currentStep]);

  // Spotlight Logic
  const isFocusMode = ['HOOK_ENTER', 'HOOK_READ_STATE', 'HOOK_COMPUTE'].includes(currentStep);

  return (
    <div className={clsx(
        "flex flex-col h-screen w-screen bg-[#050505] text-white transition-colors duration-1000 overflow-hidden font-sans relative",
        phase === 'render' && "shadow-[inset_0_0_100px_rgba(147,51,234,0.1)]",
        phase === 'commit' && "shadow-[inset_0_0_100px_rgba(34,197,94,0.1)]"
    )}>
      {/* Global Spotlight Overlay */}
      <div className={clsx(
          "absolute inset-0 bg-black/60 z-30 pointer-events-none transition-opacity duration-500",
          isFocusMode ? "opacity-100" : "opacity-0"
      )} />

      <LabBackground />
      <ConnectionOverlay />
      <ActionOverlay />
      <PhysicsLinks />
      <PhaseEffects />
      <VisualOrchestrator />
      <SubtitleBar />

      {showTutorial && !isPlaying && (
          <TutorialOverlay onDismiss={() => setShowTutorial(false)} />
      )}

      {/* Header */}
      <header className="h-16 px-6 border-b border-white/5 bg-black/40 backdrop-blur-md flex items-center justify-between z-50 relative">
        <div className="flex items-center gap-4">
          <button
            onClick={onBack}
            className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
          >
            <ChevronLeft size={20} />
          </button>
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-bold tracking-tight text-white/50">
                {currentScenario?.title || 'REACT LAB'}
            </h2>
            {/* Removed internal step controller UI since we have SubtitleBar now */}
          </div>
        </div>

        <div className="flex items-center gap-2">
           <button
             onClick={() => setShowSidebar(!showSidebar)}
             className="p-2 hover:bg-white/10 rounded-lg transition-colors text-gray-400 hover:text-white"
           >
             <BookOpen size={20} />
           </button>
           <button onClick={() => loadScenario(currentScenario?.id || 'counter-basic')} className="btn-secondary">
            <Zap size={14} /> Reload
          </button>
           <button onClick={() => { setIsPlaying(!isPlaying); setShowTutorial(false); }} className={isPlaying ? "btn-active" : "btn-primary"}>
            {isPlaying ? <Pause size={14} /> : <Play size={14} />}
            {isPlaying ? 'PAUSE' : 'AUTO'}
          </button>
          <button onClick={() => { step(); setShowTutorial(false); }} className="btn-secondary">
            <SkipForward size={14} /> Step
          </button>
        </div>
      </header>

      {/* 3D Stage Container */}
      <main className="flex-1 flex p-8 gap-8 perspective-[2000px] overflow-hidden relative z-40">

        {/* Scenario Sidebar */}
        <div className={clsx(
            "w-[250px] flex flex-col gap-4 transition-all duration-500 ease-out z-50",
            showSidebar ? "translate-x-0 opacity-100" : "-translate-x-[300px] opacity-0 absolute"
        )}>
            <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest px-2">Scenarios</h3>
            <div className="flex flex-col gap-2">
                {allScenarios.map(s => (
                    <button
                        key={s.id}
                        onClick={() => loadScenario(s.id)}
                        className={clsx(
                            "text-left px-4 py-3 rounded-xl border transition-all duration-200 text-sm",
                            currentScenario?.id === s.id
                                ? "bg-cyan-500/20 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                : "bg-white/5 border-white/5 text-gray-400 hover:bg-white/10 hover:border-white/20"
                        )}
                    >
                        <div className="font-bold mb-1">{s.title}</div>
                        <div className="text-xs opacity-70 line-clamp-2">{s.description}</div>
                    </button>
                ))}
            </div>
        </div>

        {/* Left Wing (Code) - Spotlight Target 1 */}
        <div
            className={clsx(
                "w-[400px] flex flex-col gap-6 transition-all duration-700 ease-out origin-right",
                isFocusMode ? "opacity-30 blur-sm scale-95" : "opacity-100"
            )}
            style={{ transform: 'rotateY(5deg) translateZ(-50px)' }}
        >
          <GlassPanel className="flex-1 flex flex-col border-l-4 border-l-cyan-500/20">
            {/* Highlight current code line from step definition */}
            <CodeEditor code={currentScenario?.code} />
          </GlassPanel>
          <GlassPanel className="h-[35%] flex flex-col border-l-4 border-l-green-500/20">
            <RenderPreview />
          </GlassPanel>
        </div>

        {/* Center Stage (Visualizer) */}
        <div
            className="flex-1 flex flex-col gap-6 transition-transform duration-700 ease-out relative"
            style={{ transform: 'translateZ(0px)' }}
        >
          {/* Fiber Tree - Layered Space */}
          <GlassPanel className={clsx(
              "flex-1 flex flex-col border-t-4 border-t-purple-500/20 transition-all duration-500",
              isFocusMode ? "opacity-30 blur-sm" : "opacity-100"
          )} variant="heap">
            <FiberTree />
          </GlassPanel>

          {/* Memory Deck & Stack - Spotlight Target 2 (Active Area) */}
          <div className={clsx(
              "h-[300px] relative transition-all duration-500",
              isFocusMode ? "z-50 scale-105" : ""
          )}>
             <div className="absolute inset-0 bg-black/40 blur-xl -z-10 transform scale-95 translate-y-4" />
             <GlassPanel className="h-full w-full flex flex-col border-b-4 border-b-cyan-500/20" variant="stack">
                <MemoryView />
             </GlassPanel>
          </div>
        </div>
      </main>
    </div>
  );
};

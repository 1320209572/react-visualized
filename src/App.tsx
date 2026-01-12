import { Suspense, useState } from 'react';
import { GenesisScene } from './components/3d/Scene';
import { Overlay } from './components/ui/Overlay';
import { HookCollectionPage } from './pages/Home/HookCollectionPage';
import { ScenarioListPage } from './pages/Home/ScenarioListPage';
import { SCENARIOS } from './data/scenarios';
import { useSimulationStore } from './store/simulationStore';
import FiberDeepDiveStudio from './pages/Lab/FiberDeepDiveStudio'; // Import new Studio

type ViewState = 'hooks' | 'scenarios' | 'lab';

function App() {
  const [view, setView] = useState<ViewState>('hooks');
  const [selectedHook, setSelectedHook] = useState<string | null>(null);
  const [currentScenarioId, setCurrentScenarioId] = useState<string | null>(null);
  const reset = useSimulationStore(s => s.reset);

  const handleSelectHook = (hookType: string) => {
      setSelectedHook(hookType);
      setView('scenarios');
  };

  const handleSelectScenario = (id: string) => {
    reset();
    setCurrentScenarioId(id);
    setView('lab');
  };

  const handleBackToHooks = () => {
      setSelectedHook(null);
      setView('hooks');
  };

  const handleBackToScenarios = () => {
      setCurrentScenarioId(null);
      setView('scenarios');
  };

  const currentScenario = SCENARIOS.find(s => s.id === currentScenarioId);

  // Temporary: Directly show the new Studio for review if needed
  // Or integrate it as the 'lab' view.
  // For now, let's keep the flow but replace the Lab content with the new Studio if desired,
  // OR just mount it temporarily to see it immediately.

  // UNCOMMENT THIS TO VIEW THE NEW STUDIO IMMEDIATELY:
  // return <FiberDeepDiveStudio />;

  return (
    <div className="relative w-screen h-screen overflow-hidden bg-black text-white">
      {view === 'hooks' && (
          <HookCollectionPage onSelectHook={handleSelectHook as any} />
      )}

      {view === 'scenarios' && selectedHook && (
          <ScenarioListPage
            hookType={selectedHook}
            onSelectScenario={handleSelectScenario}
            onBack={handleBackToHooks}
          />
      )}

      {view === 'lab' && (
        <Suspense fallback={
            <div className="absolute inset-0 flex items-center justify-center font-mono text-cyan-500 animate-pulse">
            INITIALIZING GENESIS ENGINE...
            </div>
        }>
            {/* Swapping old Lab with new Studio for this scenario */}
            {/* To keep old behavior for other scenarios, we could check ID */}
            {/* But user asked to "see it in browser", so let's render it here or just override return */}

            {/* Option A: Render the 3D Scene (Old) */}
            {/* <GenesisScene />
            <Overlay
                scenario={currentScenario}
                onBack={handleBackToScenarios}
            /> */}

            {/* Option B: Render the new 2D/3D Hybrid Studio (New) */}
             <FiberDeepDiveStudio />

             {/* Add a temporary back button for navigation testing */}
             <button
                onClick={handleBackToScenarios}
                className="absolute top-4 right-4 z-[100] px-4 py-2 bg-red-500/20 text-red-400 border border-red-500/50 rounded hover:bg-red-500/40"
             >
                EXIT STUDIO
             </button>
        </Suspense>
      )}
    </div>
  );
}

export default App;

import { Suspense, useState } from 'react';
import { GenesisScene } from './components/3d/Scene';
import { Overlay } from './components/ui/Overlay';
import { HookCollectionPage } from './pages/Home/HookCollectionPage';
import { ScenarioListPage } from './pages/Home/ScenarioListPage';
import { SCENARIOS } from './data/scenarios';
import { useSimulationStore } from './store/simulationStore';

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
            <GenesisScene />
            <Overlay
                scenario={currentScenario}
                onBack={handleBackToScenarios}
            />
        </Suspense>
      )}
    </div>
  );
}

export default App;

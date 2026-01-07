import React, { useState } from 'react';
import { Gallery } from './pages/Gallery/Gallery';
import { LabLayout } from './pages/Lab/LabLayout';

function App() {
  const [currentView, setCurrentView] = useState<'gallery' | 'lab'>('gallery');
  const [selectedLabId, setSelectedLabId] = useState<string | null>(null);

  const handleSelectLab = (id: string) => {
    setSelectedLabId(id);
    setCurrentView('lab');
  };

  const handleBackToGallery = () => {
    setCurrentView('gallery');
    setSelectedLabId(null);
  };

  if (currentView === 'gallery') {
    return <Gallery onSelectLab={handleSelectLab} />;
  }

  return <LabLayout labId={selectedLabId!} onBack={handleBackToGallery} />;
}

export default App;

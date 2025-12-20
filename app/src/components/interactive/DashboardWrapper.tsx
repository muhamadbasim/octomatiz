import { useState, useEffect } from 'react';
import { ProjectProvider } from '../../context/ProjectContext';
import { DashboardContent } from './DashboardContent';
import { PinLockScreen } from './PinLockScreen';

const SESSION_KEY = 'octomatiz_session_unlocked';

export function DashboardWrapper() {
  const [isUnlocked, setIsUnlocked] = useState<boolean | null>(null);

  useEffect(() => {
    // Check if session is already unlocked
    const sessionUnlocked = sessionStorage.getItem(SESSION_KEY) === 'true';
    setIsUnlocked(sessionUnlocked);
  }, []);

  const handleUnlock = () => {
    sessionStorage.setItem(SESSION_KEY, 'true');
    setIsUnlocked(true);
  };

  // Loading state
  if (isUnlocked === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  // Show PIN lock screen
  if (!isUnlocked) {
    return <PinLockScreen onUnlock={handleUnlock} />;
  }

  return (
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  );
}

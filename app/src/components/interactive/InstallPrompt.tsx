import { useState, useEffect } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

interface InstallPromptProps {
  delayMs?: number;
}

export function InstallPrompt({ delayMs = 2000 }: InstallPromptProps) {
  const [showPrompt, setShowPrompt] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if already installed
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setIsInstalled(true);
      return;
    }

    // Listen for install prompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      
      // Show prompt after short delay (2 seconds default)
      setTimeout(() => {
        setShowPrompt(true);
      }, delayMs);
    };

    // Listen for app installed event
    const handleAppInstalled = () => {
      setIsInstalled(true);
      setShowPrompt(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [delayMs]);

  const handleInstall = async () => {
    if (!deferredPrompt) return;

    await deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    
    setShowPrompt(false);
    setDeferredPrompt(null);
  };

  const handleDismiss = () => {
    setShowPrompt(false);
  };

  if (isInstalled || !showPrompt || !deferredPrompt) {
    return null;
  }

  return (
    <div className="fixed bottom-20 left-4 right-4 z-50 max-w-md mx-auto animate-in slide-in-from-bottom duration-300">
      <div className="bg-surface-dark border border-white/10 rounded-2xl p-4 shadow-xl">
        <div className="flex items-start gap-4">
          <div className="shrink-0 size-12 rounded-xl bg-primary/20 flex items-center justify-center">
            <img src="/favicon.svg" alt="OCTOmatiz" className="w-7 h-7" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-white font-bold text-base mb-1">Install OCTOmatiz</h3>
            <p className="text-text-muted text-sm">
              Tambahkan ke home screen untuk akses cepat dan pengalaman seperti aplikasi native.
            </p>
          </div>
          <button 
            onClick={handleDismiss}
            className="shrink-0 text-text-muted hover:text-white transition-colors"
            aria-label="Tutup"
          >
            <span className="material-symbols-outlined text-xl">close</span>
          </button>
        </div>
        <div className="flex gap-3 mt-4">
          <button
            onClick={handleDismiss}
            className="flex-1 h-10 rounded-full bg-white/5 hover:bg-white/10 text-white text-sm font-medium transition-colors"
          >
            Nanti
          </button>
          <button
            onClick={handleInstall}
            className="flex-1 h-10 rounded-full bg-primary hover:bg-primary-hover text-background-dark text-sm font-bold transition-colors"
          >
            Install
          </button>
        </div>
      </div>
    </div>
  );
}

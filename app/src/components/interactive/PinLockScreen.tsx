import { useState, useEffect, useRef } from 'react';
import {
  verifyPin,
  isLocked,
  recordFailedAttempt,
  resetAttempts,
} from '../../lib/pinSecurity';
import { InstallPrompt } from './InstallPrompt';

interface PinLockScreenProps {
  onUnlock: () => void;
}

export function PinLockScreen({ onUnlock }: PinLockScreenProps) {
  const [pin, setLocalPin] = useState('');
  const [error, setError] = useState('');
  const [lockInfo, setLockInfo] = useState({ locked: false, remainingTime: 0 });
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Check lock status
    const checkLock = () => {
      const info = isLocked();
      setLockInfo(info);
    };
    
    checkLock();
    const interval = setInterval(checkLock, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handlePinChange = (value: string) => {
    if (!/^\d*$/.test(value)) return;
    if (value.length > 6) return;
    
    setError('');
    setLocalPin(value);
  };

  const triggerShake = () => {
    setShake(true);
    setTimeout(() => setShake(false), 500);
  };

  const handleSubmit = () => {
    if (lockInfo.locked) return;

    if (verifyPin(pin)) {
      resetAttempts();
      onUnlock();
    } else {
      const result = recordFailedAttempt();
      if (result.locked) {
        setError('Terlalu banyak percobaan. Coba lagi dalam 5 menit.');
      } else {
        setError(`PIN salah. ${result.attemptsLeft} percobaan tersisa.`);
      }
      setLocalPin('');
      triggerShake();
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  const handleNumberClick = (num: string) => {
    if (lockInfo.locked) return;
    if (pin.length < 6) {
      handlePinChange(pin + num);
    }
  };

  const handleBackspace = () => {
    setLocalPin(prev => prev.slice(0, -1));
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8">
        <div className="w-20 h-20 rounded-full bg-primary/20 flex items-center justify-center">
          <span className="text-4xl">🐙</span>
        </div>
      </div>

      {/* Title */}
      <h1 className="text-xl font-bold text-white mb-2">Masukkan PIN</h1>
      <p className="text-gray-400 text-sm mb-8 text-center">
        Masukkan PIN untuk membuka dashboard
      </p>

      {/* Lock message */}
      {lockInfo.locked && (
        <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-center">
          <span className="material-symbols-outlined text-red-400 text-2xl mb-2">lock</span>
          <p className="text-red-400 text-sm">
            Akun terkunci. Coba lagi dalam {formatTime(lockInfo.remainingTime)}
          </p>
        </div>
      )}

      {/* PIN Dots */}
      <div className={`flex gap-3 mb-6 ${shake ? 'animate-shake' : ''}`}>
        {[0, 1, 2, 3, 4, 5].map((i) => (
          <div
            key={i}
            className={`w-4 h-4 rounded-full transition-all duration-200 ${
              i < pin.length
                ? 'bg-primary scale-110'
                : 'bg-gray-700'
            }`}
          />
        ))}
      </div>

      {/* Error message */}
      {error && (
        <p className="text-red-400 text-sm mb-4">{error}</p>
      )}

      {/* Hidden input for keyboard */}
      <input
        ref={inputRef}
        type="tel"
        inputMode="numeric"
        pattern="[0-9]*"
        value={pin}
        onChange={(e) => handlePinChange(e.target.value)}
        onKeyPress={handleKeyPress}
        className="sr-only"
        autoFocus
        disabled={lockInfo.locked}
      />

      {/* Number pad */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', 'back'].map((key) => (
          <button
            key={key}
            onClick={() => {
              if (key === 'back') handleBackspace();
              else if (key) handleNumberClick(key);
            }}
            disabled={lockInfo.locked || key === ''}
            className={`w-16 h-16 rounded-full flex items-center justify-center text-xl font-bold transition-all ${
              key === ''
                ? 'invisible'
                : key === 'back'
                ? 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                : 'bg-gray-800 text-white hover:bg-gray-700 active:scale-95'
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {key === 'back' ? (
              <span className="material-symbols-outlined">backspace</span>
            ) : (
              key
            )}
          </button>
        ))}
      </div>

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={pin.length < 4 || lockInfo.locked}
        className="w-full max-w-xs h-12 rounded-full bg-primary text-black font-bold text-sm transition-all hover:bg-primary/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        Buka
      </button>

      {/* Install Prompt */}
      <InstallPrompt />
    </div>
  );
}

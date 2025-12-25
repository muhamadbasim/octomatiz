import { useEffect } from 'react';

interface TipsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const tips = [
  {
    icon: 'light_mode',
    title: 'Pencahayaan Terang',
    description: 'Foto di tempat dengan cahaya alami atau lampu terang. Hindari bayangan gelap.',
  },
  {
    icon: 'center_focus_strong',
    title: 'Fokus pada Produk',
    description: 'Pastikan produk berada di tengah frame dan terlihat jelas tanpa blur.',
  },
  {
    icon: 'crop_free',
    title: 'Background Bersih',
    description: 'Gunakan latar belakang polos atau sederhana agar produk lebih menonjol.',
  },
  {
    icon: 'straighten',
    title: 'Jarak yang Tepat',
    description: 'Ambil foto dari jarak 30-50cm agar detail produk terlihat dengan baik.',
  },
  {
    icon: 'rotate_90_degrees_ccw',
    title: 'Posisi Landscape',
    description: 'Foto landscape (horizontal) biasanya lebih cocok untuk landing page.',
  },
];

export function TipsModal({ isOpen, onClose }: TipsModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleEscape);
    return () => window.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/70 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-surface-dark border border-white/10 rounded-t-3xl sm:rounded-2xl w-full max-w-md max-h-[80vh] overflow-hidden shadow-2xl animate-in slide-in-from-bottom duration-300">
        {/* Header */}
        <div className="sticky top-0 bg-surface-dark border-b border-white/5 p-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-primary">lightbulb</span>
            <h3 className="text-lg font-bold text-white">Tips Foto Produk</h3>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full hover:bg-white/10 transition-colors"
          >
            <span className="material-symbols-outlined text-gray-400">close</span>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-3 overflow-y-auto max-h-[60vh]">
          {tips.map((tip, index) => (
            <div 
              key={index}
              className="flex gap-3 p-3 rounded-xl bg-white/5 border border-white/5"
            >
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-primary text-xl">{tip.icon}</span>
              </div>
              <div>
                <h4 className="text-white font-medium text-sm mb-0.5">{tip.title}</h4>
                <p className="text-gray-400 text-xs leading-relaxed">{tip.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-surface-dark border-t border-white/5 p-4">
          <button
            onClick={onClose}
            className="btn-primary w-full"
          >
            Mengerti
          </button>
        </div>
      </div>
    </div>
  );
}

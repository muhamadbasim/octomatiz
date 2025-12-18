import { useEffect, useState, useCallback } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { countWords, HEADLINE_MAX_LENGTH, STORYTELLING_MIN_WORDS, STORYTELLING_MAX_WORDS } from '../../lib/contentValidation';
import type { GeminiResult } from '../../lib/gemini';

const MAX_REGENERATE = 3;

export function Step3Review() {
  const { currentProject, loadProject, updateProject, setCurrentStep } = useProjectContext();
  const [headline, setHeadline] = useState('');
  const [storytelling, setStorytelling] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [regenerateCount, setRegenerateCount] = useState(0);
  const [aiError, setAiError] = useState<string | null>(null);
  const [showImagePreview, setShowImagePreview] = useState(false);

  const canRegenerate = regenerateCount < MAX_REGENERATE && !!currentProject?.productImage;

  // State for product image from localStorage
  const [localProductImage, setLocalProductImage] = useState<string | null>(null);

  // Load data on mount - read directly from localStorage to avoid race conditions
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    
    if (projectId) {
      // Read directly from localStorage first (synchronous, guaranteed fresh data)
      try {
        const projectsData = localStorage.getItem('octomatiz_projects');
        if (projectsData) {
          const projects = JSON.parse(projectsData);
          const project = projects.find((p: { id: string }) => p.id === projectId);
          if (project) {
            console.log('Direct localStorage read:', {
              headline: project.headline,
              storytelling: project.storytelling,
              hasImage: !!project.productImage
            });
            setHeadline(project.headline || '');
            setStorytelling(project.storytelling || '');
            setLocalProductImage(project.productImage || null);
          }
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
      
      // Also load to context for other functionality
      loadProject(projectId);
    }
  }, []);

  const handleRegenerate = useCallback(async () => {
    if (!currentProject?.productImage || !canRegenerate) return;
    
    setIsGenerating(true);
    setAiError(null);
    setRegenerateCount(prev => prev + 1);

    try {
      const response = await fetch('/api/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: currentProject.productImage,
          category: currentProject.category,
          businessName: currentProject.businessName,
        }),
      });

      const result: GeminiResult = await response.json();

      if (result.success && result.data) {
        setHeadline(result.data.headline);
        setStorytelling(result.data.storytelling);
        updateProject(currentProject.id, {
          headline: result.data.headline,
          storytelling: result.data.storytelling,
        });
      } else {
        setAiError(result.error?.message || 'Gagal menghasilkan konten baru');
      }
    } catch (err) {
      setAiError('Koneksi gagal. Periksa internet dan coba lagi.');
    } finally {
      setIsGenerating(false);
    }
  }, [currentProject, canRegenerate, updateProject]);

  const headlineLength = headline.length;
  const storyWordCount = countWords(storytelling);
  const isHeadlineTooLong = headlineLength > HEADLINE_MAX_LENGTH;
  const isStoryTooShort = storyWordCount < STORYTELLING_MIN_WORDS && storyWordCount > 0;
  const isStoryTooLong = storyWordCount > STORYTELLING_MAX_WORDS;

  const handleContinue = () => {
    if (!currentProject) return;
    
    updateProject(currentProject.id, { headline, storytelling });
    setCurrentStep(4);
    window.location.href = `/create/step-4?id=${currentProject.id}`;
  };

  // Use localProductImage as primary (from direct localStorage read), fallback to context
  const productImage = localProductImage || currentProject?.productImage;
  const hasImage = !!productImage;

  return (
    <>
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-16">
        <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
          {/* Image Preview Card */}
          {hasImage ? (
            <div 
              className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-white/5 group cursor-pointer"
              onClick={() => setShowImagePreview(true)}
            >
              <div
                className="absolute inset-0 bg-cover bg-center transition-transform duration-700 group-hover:scale-105"
                style={{ backgroundImage: `url('${productImage}')` }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60" />
              <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                  <span className="material-symbols-outlined text-primary text-[18px]">photo_camera</span>
                  <span className="text-white text-xs font-medium">Foto Produk</span>
                </div>
                <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-2 py-1 rounded-full border border-white/10">
                  <span className="material-symbols-outlined text-white/70 text-[14px]">zoom_in</span>
                </div>
              </div>
            </div>
          ) : (
            <div className="w-full aspect-[4/3] rounded-xl bg-surface-dark border border-dashed border-white/20 flex flex-col items-center justify-center gap-2">
              <span className="material-symbols-outlined text-4xl text-gray-600">image</span>
              <span className="text-gray-500 text-sm">Tidak ada foto produk</span>
            </div>
          )}

          {/* AI Generated Badge */}
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
            <span className="text-sm font-medium text-text-muted">Konten dibuat oleh AI berdasarkan foto</span>
          </div>

          {isGenerating ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4" />
              <p className="text-gray-400">AI sedang membuat konten...</p>
            </div>
          ) : (
            <>
              {/* Headline Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white ml-1 flex justify-between items-center">
                  Headline Utama
                  <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                    isHeadlineTooLong ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'
                  }`}>
                    {headlineLength}/{HEADLINE_MAX_LENGTH}
                  </span>
                </label>
                <div className={`group relative flex items-center w-full rounded-xl bg-surface-dark border transition-all shadow-sm ${
                  isHeadlineTooLong 
                    ? 'border-red-500 focus-within:ring-1 focus-within:ring-red-500' 
                    : 'border-border-dark focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'
                }`}>
                  <input
                    type="text"
                    className="w-full bg-transparent border-none p-4 pr-12 text-base font-medium text-white placeholder-text-muted focus:ring-0 focus:outline-none"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                    placeholder="Headline menarik untuk produk Anda"
                  />
                  <div className="absolute right-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </div>
                </div>
                {isHeadlineTooLong && (
                  <p className="text-red-400 text-xs ml-1">Headline terlalu panjang</p>
                )}
              </div>

              {/* Storytelling Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white ml-1 flex justify-between items-center">
                  Cerita Produk (Storytelling)
                  <span className={`text-xs font-normal px-2 py-0.5 rounded-full ${
                    isStoryTooShort || isStoryTooLong ? 'bg-red-500/10 text-red-400' : 'bg-primary/10 text-primary'
                  }`}>
                    {storyWordCount} kata ({STORYTELLING_MIN_WORDS}-{STORYTELLING_MAX_WORDS})
                  </span>
                </label>
                <div className={`group relative w-full rounded-xl bg-surface-dark border transition-all shadow-sm ${
                  isStoryTooShort || isStoryTooLong
                    ? 'border-red-500 focus-within:ring-1 focus-within:ring-red-500'
                    : 'border-border-dark focus-within:border-primary focus-within:ring-1 focus-within:ring-primary'
                }`}>
                  <textarea
                    className="w-full bg-transparent border-none p-4 pr-12 text-base leading-relaxed text-white placeholder-text-muted focus:ring-0 focus:outline-none resize-none"
                    rows={6}
                    value={storytelling}
                    onChange={(e) => setStorytelling(e.target.value)}
                    placeholder="Ceritakan keunikan dan keunggulan produk Anda..."
                  />
                  <div className="absolute top-4 right-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </div>
                </div>
                {isStoryTooShort && (
                  <p className="text-red-400 text-xs ml-1">Cerita terlalu pendek (min. {STORYTELLING_MIN_WORDS} kata)</p>
                )}
                {isStoryTooLong && (
                  <p className="text-red-400 text-xs ml-1">Cerita terlalu panjang (max. {STORYTELLING_MAX_WORDS} kata)</p>
                )}
              </div>

              {/* Regenerate Button */}
              {currentProject?.productImage && (
                <div className="flex flex-col items-center gap-2">
                  <button
                    onClick={handleRegenerate}
                    disabled={!canRegenerate || isGenerating}
                    className={`flex items-center justify-center gap-2 text-sm font-medium ${
                      canRegenerate ? 'text-primary hover:underline' : 'text-gray-500 cursor-not-allowed'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[18px]">refresh</span>
                    Generate ulang dengan AI
                  </button>
                  <span className="text-xs text-gray-500">
                    {regenerateCount}/{MAX_REGENERATE} regenerasi digunakan
                  </span>
                  {aiError && (
                    <span className="text-xs text-red-400">{aiError}</span>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* Sticky Footer Action */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent z-20 pb-8 pt-12">
        <div className="max-w-lg mx-auto">
          <button
            onClick={handleContinue}
            disabled={!headline || isGenerating}
            className="btn-primary w-full shadow-[0_0_20px_rgba(54,226,123,0.3)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Simpan & Pilih Tampilan</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>

      {/* Full Image Preview Modal */}
      {showImagePreview && productImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setShowImagePreview(false)}
        >
          <button
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            onClick={() => setShowImagePreview(false)}
          >
            <span className="material-symbols-outlined text-white">close</span>
          </button>
          <img 
            src={productImage} 
            alt="Product Preview" 
            className="max-w-full max-h-[80vh] object-contain rounded-lg"
          />
        </div>
      )}
    </>
  );
}

import { useEffect, useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';

export function Step3Review() {
  const { currentProject, loadProject, updateProject, setCurrentStep } = useProjectContext();
  const [headline, setHeadline] = useState('');
  const [storytelling, setStorytelling] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    if (projectId && !currentProject) {
      loadProject(projectId);
    }
  }, []);

  useEffect(() => {
    if (currentProject) {
      // If no headline yet, generate AI content
      if (!currentProject.headline) {
        generateAIContent();
      } else {
        setHeadline(currentProject.headline);
        setStorytelling(currentProject.storytelling || '');
      }
    }
  }, [currentProject?.id]);

  const generateAIContent = () => {
    setIsGenerating(true);
    // Simulate AI generation (in real app, call Gemini API)
    setTimeout(() => {
      const businessName = currentProject?.businessName || 'Produk Anda';
      const category = currentProject?.category || 'kuliner';
      
      const generatedHeadline = category === 'kuliner'
        ? `${businessName} - Cita Rasa Autentik yang Bikin Nagih!`
        : `${businessName} - Kualitas Terbaik untuk Anda`;
      
      const generatedStory = category === 'kuliner'
        ? `Dibuat dengan resep turun-temurun dan bahan pilihan berkualitas. Setiap sajian disiapkan dengan penuh cinta untuk memberikan pengalaman kuliner terbaik.\n\nRasakan kelezatan yang tak terlupakan di setiap gigitan!`
        : `Produk berkualitas tinggi yang dirancang untuk memenuhi kebutuhan Anda. Dengan perhatian pada detail dan komitmen terhadap kepuasan pelanggan.\n\nPercayakan kebutuhan Anda pada kami!`;

      setHeadline(generatedHeadline);
      setStorytelling(generatedStory);
      setIsGenerating(false);
    }, 1500);
  };

  const handleContinue = () => {
    if (!currentProject) return;
    
    updateProject(currentProject.id, { headline, storytelling });
    setCurrentStep(4);
    window.location.href = `/create/step-4?id=${currentProject.id}`;
  };

  const productImage = currentProject?.productImage || 'https://via.placeholder.com/400x300/1a1a2e/36e27b?text=🐙';

  return (
    <>
      <main className="flex-1 overflow-y-auto no-scrollbar pb-32 pt-16">
        <div className="p-4 space-y-6 max-w-lg mx-auto w-full">
          {/* Image Preview Card */}
          <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden shadow-lg border border-white/5 group">
            <div
              className="absolute inset-0 bg-cover bg-center transition-transform duration-700 hover:scale-105"
              style={{ backgroundImage: `url('${productImage}')` }}
            ></div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-60"></div>
            <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
              <div className="flex items-center gap-2 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
                <span className="material-symbols-outlined text-primary text-[18px]">photo_camera</span>
                <span className="text-white text-xs font-medium">Original Photo</span>
              </div>
            </div>
          </div>

          {/* AI Generated Badge */}
          <div className="flex items-center gap-2 px-1">
            <span className="material-symbols-outlined text-primary text-[20px]">auto_awesome</span>
            <span className="text-sm font-medium text-text-muted">Konten dibuat oleh AI berdasarkan foto</span>
          </div>

          {isGenerating ? (
            <div className="flex flex-col items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
              <p className="text-gray-400">AI sedang membuat konten...</p>
            </div>
          ) : (
            <>
              {/* Headline Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white ml-1 flex justify-between items-center">
                  Headline Utama
                  <span className="text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">AI Suggestion</span>
                </label>
                <div className="group relative flex items-center w-full rounded-xl bg-surface-dark border border-border-dark focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm">
                  <input
                    type="text"
                    className="w-full bg-transparent border-none p-4 pr-12 text-base font-medium text-white placeholder-text-muted focus:ring-0 focus:outline-none"
                    value={headline}
                    onChange={(e) => setHeadline(e.target.value)}
                  />
                  <div className="absolute right-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </div>
                </div>
              </div>

              {/* Storytelling Input */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-semibold text-white ml-1 flex justify-between items-center">
                  Cerita Produk (Storytelling)
                  <span className="text-xs text-primary font-normal bg-primary/10 px-2 py-0.5 rounded-full">AI Suggestion</span>
                </label>
                <div className="group relative w-full rounded-xl bg-surface-dark border border-border-dark focus-within:border-primary focus-within:ring-1 focus-within:ring-primary transition-all shadow-sm">
                  <textarea
                    className="w-full bg-transparent border-none p-4 pr-12 text-base leading-relaxed text-white placeholder-text-muted focus:ring-0 focus:outline-none resize-none"
                    rows={6}
                    value={storytelling}
                    onChange={(e) => setStorytelling(e.target.value)}
                  />
                  <div className="absolute top-4 right-4 text-text-muted group-focus-within:text-primary transition-colors pointer-events-none">
                    <span className="material-symbols-outlined text-[20px]">edit</span>
                  </div>
                </div>
              </div>

              {/* Regenerate Button */}
              <button
                onClick={generateAIContent}
                className="flex items-center justify-center gap-2 text-primary text-sm font-medium hover:underline"
              >
                <span className="material-symbols-outlined text-[18px]">refresh</span>
                Generate ulang dengan AI
              </button>
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
    </>
  );
}

import { useEffect, useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { TemplatePreviewModal } from './TemplatePreviewModal';
import type { TemplateStyle, ColorTheme } from '../../types/project';

const TEMPLATES: { id: TemplateStyle; name: string; description: string; bgClass: string; accent: string }[] = [
  { id: 'simple', name: 'Simple Clean', description: 'Minimalis & profesional', bgClass: 'bg-gradient-to-br from-white to-gray-100', accent: '#36e27b' },
  { id: 'warm', name: 'Warm Culinary', description: 'Hangat untuk kuliner', bgClass: 'bg-gradient-to-br from-amber-50 to-orange-100', accent: '#f59e0b' },
  { id: 'modern', name: 'Modern Blue', description: 'Modern & elegan', bgClass: 'bg-gradient-to-br from-slate-800 to-slate-900', accent: '#2563eb' },
];

const COLORS: { id: ColorTheme; hex: string; name: string }[] = [
  { id: 'green', hex: '#36e27b', name: 'Hijau' },
  { id: 'blue', hex: '#2563EB', name: 'Biru' },
  { id: 'amber', hex: '#F59E0B', name: 'Kuning' },
  { id: 'pink', hex: '#EC4899', name: 'Pink' },
];

export function Step4Design() {
  const { currentProject, loadProject, updateProject, setCurrentStep } = useProjectContext();
  const [template, setTemplate] = useState<TemplateStyle>('simple');
  const [colorTheme, setColorTheme] = useState<ColorTheme>('green');
  const [previewTemplate, setPreviewTemplate] = useState<TemplateStyle | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    if (projectId && !currentProject) {
      loadProject(projectId);
    }
  }, []);

  useEffect(() => {
    if (currentProject) {
      setTemplate(currentProject.template || 'simple');
      setColorTheme(currentProject.colorTheme || 'green');
    }
  }, [currentProject?.id]);

  const handlePublish = () => {
    if (!currentProject) {
      console.error('Step 4: currentProject is null!');
      alert('Error: Project tidak ditemukan. Silakan refresh halaman.');
      return;
    }
    
    const projectId = currentProject.id;
    
    console.log('Step 4: handlePublish called with:', {
      projectId,
      selectedTemplate: template,
      selectedColorTheme: colorTheme,
    });
    
    // Save directly to localStorage ONLY (don't use updateProject to avoid race condition)
    const STORAGE_KEY = 'octomatiz_projects';
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const projects = stored ? JSON.parse(stored) : [];
      const index = projects.findIndex((p: { id: string }) => p.id === projectId);
      
      console.log('Step 4: Found project at index:', index);
      
      if (index >= 0) {
        // Update project with new template and colorTheme
        projects[index] = {
          ...projects[index],
          template: template,  // Explicitly set template
          colorTheme: colorTheme,  // Explicitly set colorTheme
          status: 'building',
          currentStep: 5,
          updatedAt: new Date().toISOString(),
        };
        
        // Save to localStorage
        localStorage.setItem(STORAGE_KEY, JSON.stringify(projects));
        
        console.log('Step 4: Saved to localStorage:', {
          template: projects[index].template,
          colorTheme: projects[index].colorTheme,
        });
        
        // Verify save immediately
        const verifyStored = localStorage.getItem(STORAGE_KEY);
        if (verifyStored) {
          const verifyProjects = JSON.parse(verifyStored);
          const verifyProject = verifyProjects.find((p: { id: string }) => p.id === projectId);
          console.log('Step 4: VERIFIED template in localStorage:', verifyProject?.template);
          
          if (verifyProject?.template !== template) {
            console.error('Step 4: VERIFICATION FAILED! Template not saved correctly!');
            alert('Error: Gagal menyimpan template. Silakan coba lagi.');
            return;
          }
        }
        
        // Navigate to Step 5 (DON'T call updateProject - it causes race condition)
        console.log('Step 4: Navigating to Step 5...');
        window.location.href = `/create/step-5?id=${projectId}`;
      } else {
        console.error('Step 4: Project not found in localStorage!');
        alert('Error: Project tidak ditemukan di storage. Silakan mulai ulang.');
      }
    } catch (error) {
      console.error('Failed to save to localStorage:', error);
      alert('Error: Gagal menyimpan. Silakan coba lagi.');
    }
  };

  const handlePreviewTemplate = (templateId: TemplateStyle) => {
    setPreviewTemplate(templateId);
  };

  const handleSelectFromPreview = () => {
    if (previewTemplate) {
      setTemplate(previewTemplate);
      setPreviewTemplate(null);
    }
  };

  const productImage = currentProject?.productImage || 'https://via.placeholder.com/400x300/1a1a2e/36e27b?text=🐙';
  const businessName = currentProject?.businessName || 'Nama Bisnis';

  return (
    <div className="relative flex min-h-screen w-full max-w-md mx-auto flex-col overflow-x-hidden pb-24 pt-16">
      {/* Progress Indicator */}
      <div className="flex w-full flex-row items-center justify-center gap-2 py-3 px-4">
        <div className="h-1.5 flex-1 rounded-full bg-primary"></div>
        <div className="h-1.5 flex-1 rounded-full bg-primary"></div>
        <div className="h-1.5 flex-1 rounded-full bg-primary"></div>
        <div className="h-1.5 flex-1 rounded-full bg-white/20 relative overflow-hidden">
          <div className="absolute inset-y-0 left-0 w-1/2 bg-primary"></div>
        </div>
      </div>

      {/* Preview Area */}
      <section className="flex flex-col items-center justify-center px-6 pt-2 pb-6">
        <h3 className="text-white text-sm font-medium opacity-60 mb-3 uppercase tracking-wide">Preview Tampilan</h3>

        {/* Phone Mockup */}
        <div className="relative w-full aspect-[9/16] max-h-[420px] bg-gray-900 rounded-[2.5rem] border-[6px] border-gray-800 shadow-xl overflow-hidden ring-1 ring-white/10">
          <div className="absolute top-0 w-full h-6 bg-black z-10 flex justify-between px-4 items-center text-[10px] text-white">
            <span>9:41</span>
            <div className="flex gap-1">
              <span className="material-symbols-outlined text-[10px]">signal_cellular_alt</span>
              <span className="material-symbols-outlined text-[10px]">wifi</span>
              <span className="material-symbols-outlined text-[10px]">battery_full</span>
            </div>
          </div>

          <div className="w-full h-full bg-white overflow-y-auto pt-6 pb-4">
            <div
              className="w-full h-40 bg-cover bg-center relative"
              style={{ backgroundImage: `url('${productImage}')` }}
            >
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end p-4">
                <h1 className="text-white font-bold text-xl">{businessName}</h1>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <div className="flex gap-2">
                <span 
                  className="px-2 py-1 rounded-lg text-xs font-bold"
                  style={{ backgroundColor: `${COLORS.find(c => c.id === colorTheme)?.hex}20`, color: COLORS.find(c => c.id === colorTheme)?.hex }}
                >
                  {currentProject?.category || 'Kuliner'}
                </span>
              </div>
              <p className="text-gray-600 text-sm line-clamp-2">{currentProject?.headline || 'Headline produk Anda'}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Controls Section */}
      <div className="flex-1 bg-surface-dark rounded-t-[2.5rem] shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.3)] mt-2 pb-8">
        <div className="w-12 h-1 bg-white/10 rounded-full mx-auto mt-4 mb-6"></div>

        {/* Template Selector */}
        <div className="mb-8 pl-6">
          <div className="flex items-center justify-between pr-6 mb-3">
            <h3 className="text-white text-lg font-bold leading-tight">Gaya Template</h3>
            <span className="text-xs text-gray-400">Tap untuk preview</span>
          </div>
          <div className="flex gap-4 overflow-x-auto no-scrollbar pr-6 pb-2 snap-x">
            {TEMPLATES.map((t) => (
              <button
                key={t.id}
                onClick={() => setTemplate(t.id)}
                className={`snap-center shrink-0 w-36 p-3 rounded-2xl cursor-pointer relative group ${
                  template === t.id
                    ? 'bg-black/40 border-2 border-primary'
                    : 'bg-black/20 border border-white/5 opacity-70 hover:opacity-100'
                } transition-opacity`}
              >
                {template === t.id && (
                  <div className="absolute -top-2 -right-2 bg-primary text-black rounded-full p-0.5">
                    <span className="material-symbols-outlined text-sm font-bold">check</span>
                  </div>
                )}
                <div 
                  className={`w-full aspect-[4/3] rounded-xl mb-3 overflow-hidden relative ${t.bgClass}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    handlePreviewTemplate(t.id);
                  }}
                >
                  {/* Mini template preview */}
                  <div className="w-full h-full p-2 flex flex-col">
                    {/* Header bar */}
                    <div className="h-3 rounded-sm mb-1" style={{ backgroundColor: t.accent }} />
                    {/* Content lines */}
                    <div className={`flex-1 flex flex-col gap-1 ${t.id === 'modern' ? 'opacity-60' : 'opacity-40'}`}>
                      <div className="h-2 w-3/4 rounded-sm" style={{ backgroundColor: t.id === 'modern' ? '#fff' : '#333' }} />
                      <div className="h-1.5 w-full rounded-sm" style={{ backgroundColor: t.id === 'modern' ? '#64748b' : '#666' }} />
                      <div className="h-1.5 w-2/3 rounded-sm" style={{ backgroundColor: t.id === 'modern' ? '#64748b' : '#666' }} />
                    </div>
                    {/* CTA button */}
                    <div className="h-3 w-full rounded-full mt-auto" style={{ backgroundColor: t.accent }} />
                  </div>
                  {/* Preview overlay */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <span className="material-symbols-outlined text-white text-2xl">visibility</span>
                  </div>
                </div>
                <p className={`text-white text-sm text-center ${template === t.id ? 'font-bold' : 'font-medium'}`}>
                  {t.name}
                </p>
                <p className="text-gray-400 text-[10px] text-center mt-0.5">{t.description}</p>
              </button>
            ))}
          </div>
        </div>

        {/* Color Theme Selector */}
        <div className="px-6">
          <h3 className="text-white text-lg font-bold leading-tight mb-4">Tema Warna</h3>
          <div className="flex justify-between items-center gap-4 bg-black/20 p-4 rounded-2xl">
            {COLORS.map((color) => (
              <button
                key={color.id}
                onClick={() => setColorTheme(color.id)}
                className="flex flex-col items-center gap-2"
              >
                <div
                  className={`relative h-12 w-12 rounded-full transition-all ${
                    colorTheme === color.id ? 'ring-2 ring-white ring-offset-2 shadow-lg scale-110' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.hex }}
                >
                  {colorTheme === color.id && (
                    <span className="material-symbols-outlined text-white absolute inset-0 flex items-center justify-center text-xl">
                      check
                    </span>
                  )}
                </div>
                <span className={`text-[10px] ${colorTheme === color.id ? 'text-white font-medium' : 'text-gray-500'}`}>
                  {color.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Sticky Footer CTA */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-12 z-30 flex justify-center pointer-events-none">
        <button
          onClick={handlePublish}
          className="pointer-events-auto shadow-[0_0_40px_rgba(54,226,123,0.4)] btn-primary w-full max-w-sm text-lg"
        >
          <span className="material-symbols-outlined">rocket_launch</span>
          <span className="truncate tracking-wide">PUBLISH SEKARANG</span>
        </button>
      </div>

      {/* Template Preview Modal */}
      {previewTemplate && (
        <TemplatePreviewModal
          isOpen={true}
          template={previewTemplate}
          colorTheme={colorTheme}
          businessName={currentProject?.businessName || 'Nama Bisnis'}
          headline={currentProject?.headline || 'Headline produk Anda'}
          storytelling={currentProject?.storytelling || 'Cerita produk akan muncul di sini...'}
          productImage={productImage}
          whatsapp={currentProject?.whatsapp || ''}
          onClose={() => setPreviewTemplate(null)}
          onSelect={handleSelectFromPreview}
        />
      )}
    </div>
  );
}

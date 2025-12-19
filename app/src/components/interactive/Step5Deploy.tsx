import { useEffect, useState, useCallback } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { deployProject, type DeploymentProgress, type DeploymentStage } from '../../lib/deployService';
import { generateWhatsAppShareUrl } from '../../lib/landingPageGenerator';

interface ChecklistItem {
  id: DeploymentStage;
  label: string;
  completedLabel: string;
}

const CHECKLIST: ChecklistItem[] = [
  { id: 'generating', label: 'Membuat Halaman...', completedLabel: 'Halaman dibuat' },
  { id: 'uploading', label: 'Menyimpan ke Server...', completedLabel: 'Tersimpan' },
  { id: 'building', label: 'Mengaktifkan Website...', completedLabel: 'Website aktif' },
];

export function Step5Deploy() {
  const { currentProject, loadProject, updateProject } = useProjectContext();
  const [stage, setStage] = useState<DeploymentStage>('generating');
  const [progress, setProgress] = useState(0);
  const [isSuccess, setIsSuccess] = useState(false);
  const [generatedHtml, setGeneratedHtml] = useState<string | null>(null);
  const [showPreview, setShowPreview] = useState(false);
  const [deployStarted, setDeployStarted] = useState(false);
  const [shortUrl, setShortUrl] = useState<string | null>(null);
  
  // Store fresh project data from localStorage to avoid stale context data
  const [freshProject, setFreshProject] = useState<typeof currentProject>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    
    if (projectId) {
      // Read directly from localStorage to get fresh data (including template from Step 4)
      try {
        const projectsData = localStorage.getItem('octomatiz_projects');
        console.log('Step 5: Raw localStorage data:', projectsData?.substring(0, 500));
        
        if (projectsData) {
          const projects = JSON.parse(projectsData);
          const project = projects.find((p: { id: string }) => p.id === projectId);
          
          if (project) {
            console.log('Step 5: Found project in localStorage:', {
              id: project.id,
              template: project.template,
              colorTheme: project.colorTheme,
              businessName: project.businessName,
              status: project.status,
              currentStep: project.currentStep,
            });
            
            // CRITICAL: Ensure template has a value
            if (!project.template) {
              console.warn('Step 5: Template is missing! Defaulting to simple');
              project.template = 'simple';
            }
            
            setFreshProject(project);
          } else {
            console.error('Step 5: Project not found in localStorage for id:', projectId);
          }
        }
      } catch (e) {
        console.error('Error reading from localStorage:', e);
      }
      
      // Also load to context
      if (!currentProject) {
        loadProject(projectId);
      }
    }
  }, []);

  const handleProgress = useCallback((progressData: DeploymentProgress) => {
    setStage(progressData.stage);
    setProgress(progressData.progress);
  }, []);

  // Use freshProject for deployment (has latest template data from localStorage)
  // freshProject is prioritized because it has the latest data saved directly to localStorage
  const projectToUse = freshProject || currentProject;

  useEffect(() => {
    // Wait for freshProject to be loaded before starting deployment
    if (!freshProject || deployStarted) return;
    setDeployStarted(true);

    console.log('Step 5: Starting deployment with:', {
      id: freshProject.id,
      template: freshProject.template,
      colorTheme: freshProject.colorTheme,
      businessName: freshProject.businessName,
    });

    // Start deployment with fresh project data from localStorage
    deployProject(freshProject, handleProgress).then((result) => {
      if (result.success && result.url && result.domain) {
        updateProject(freshProject.id, {
          status: 'live',
          deployedUrl: result.url,
          domain: result.domain,
        });
        if (result.html) {
          setGeneratedHtml(result.html);
        }
        if (result.shortUrl) {
          setShortUrl(result.shortUrl);
        }
        setIsSuccess(true);
      }
    });
  }, [freshProject, deployStarted, handleProgress, updateProject]);

  const getStageIndex = (s: DeploymentStage) => CHECKLIST.findIndex(c => c.id === s);
  const currentStageIndex = getStageIndex(stage);

  const businessName = projectToUse?.businessName || 'Website Anda';
  const deployedUrl = projectToUse?.deployedUrl || currentProject?.deployedUrl || '';
  
  // Extract display URL (remove https://)
  const displayUrl = deployedUrl.replace(/^https?:\/\//, '');
  const shortDisplayUrl = shortUrl?.replace(/^https?:\/\//, '') || '';

  const handleCopyLink = (urlToCopy?: string) => {
    navigator.clipboard.writeText(urlToCopy || deployedUrl);
    alert('Link berhasil disalin!');
  };

  const handleShareWhatsApp = () => {
    const waNumber = projectToUse?.whatsapp || '';
    // Pass both URLs - short URL and original URL
    const shareUrl = generateWhatsAppShareUrl(waNumber, businessName, deployedUrl, shortUrl || undefined);
    window.open(shareUrl, '_blank');
  };
  
  const handleVisitSite = () => {
    if (deployedUrl) {
      window.open(deployedUrl, '_blank');
    }
  };

  const handlePreview = () => {
    setShowPreview(true);
  };

  // Delete current project from localStorage and start fresh (for testing)
  const handleTestAgain = () => {
    if (!projectToUse?.id) return;
    
    try {
      const STORAGE_KEY = 'octomatiz_projects';
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const projects = JSON.parse(stored);
        const filtered = projects.filter((p: { id: string }) => p.id !== projectToUse.id);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
        console.log('Project deleted from localStorage:', projectToUse.id);
      }
    } catch (e) {
      console.error('Failed to delete project:', e);
    }
    
    // Redirect to Step 1 to create new project
    window.location.href = '/create/step-1';
  };

  // Preview Modal
  if (showPreview && generatedHtml) {
    return (
      <div className="fixed inset-0 bg-black z-50 flex flex-col">
        <div className="flex items-center justify-between p-4 bg-surface-dark border-b border-white/10">
          <h3 className="text-white font-medium">Preview Landing Page</h3>
          <button
            onClick={() => setShowPreview(false)}
            className="p-2 rounded-full hover:bg-white/10 text-white"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>
        <iframe
          srcDoc={generatedHtml}
          className="flex-1 w-full bg-white"
          title="Landing Page Preview"
        />
      </div>
    );
  }

  if (isSuccess) {
    return (
      <div className="flex-1 flex flex-col items-center pt-8 pb-8 px-6 relative overflow-hidden">
        {/* Confetti Background */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none overflow-hidden z-0">
          <div className="absolute top-10 left-[10%] w-3 h-3 bg-primary rounded-full opacity-60 animate-bounce"></div>
          <div className="absolute top-20 right-[20%] w-2 h-4 bg-yellow-400 rotate-45 opacity-70 animate-pulse"></div>
          <div className="absolute top-40 left-[15%] w-4 h-4 bg-blue-500 rounded-sm rotate-12 opacity-50"></div>
          <div className="absolute top-12 left-[50%] w-2 h-2 bg-red-400 rounded-full opacity-80"></div>
          <div className="absolute top-32 right-[10%] w-3 h-3 bg-purple-500 rounded-full opacity-60"></div>
        </div>

        {/* Hero Icon */}
        <div className="relative z-10 mb-6 mt-4">
          <div className="relative size-32 flex items-center justify-center bg-gradient-to-tr from-primary/20 to-transparent rounded-full border border-primary/20">
            <div className="absolute inset-0 bg-primary/20 blur-2xl rounded-full"></div>
            <div className="size-24 rounded-full bg-primary flex items-center justify-center shadow-[0_0_30px_rgba(54,226,123,0.4)]">
              <span className="material-symbols-outlined text-background-dark text-[48px]">rocket_launch</span>
            </div>
            <span className="material-symbols-outlined absolute -top-2 right-0 text-yellow-400 text-2xl animate-bounce">star</span>
            <span className="material-symbols-outlined absolute bottom-0 -left-2 text-blue-400 text-xl animate-pulse">celebration</span>
          </div>
        </div>

        {/* Text Content */}
        <div className="z-10 text-center w-full mb-8">
          <h1 className="text-white tracking-tight text-3xl font-bold leading-tight mb-3">
            Website {businessName}<br />Sudah Online!
          </h1>
          <p className="text-gray-400 text-base leading-relaxed max-w-[280px] mx-auto">
            Selamat! Website sekarang bisa diakses oleh pelanggan.
          </p>
        </div>

        {/* Link Cards */}
        <div className="z-10 w-full mb-10 space-y-3">
          {/* Short URL (if available) */}
          {shortUrl && (
            <div className="group relative flex items-center justify-between gap-2 p-1 pl-4 pr-1 rounded-2xl bg-primary/10 border border-primary/30 shadow-lg">
              <button 
                onClick={() => window.open(shortUrl, '_blank')}
                className="flex items-center gap-2 overflow-hidden py-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
              >
                <span className="material-symbols-outlined text-primary text-[18px] flex-shrink-0">link</span>
                <p className="text-sm font-bold text-primary truncate">{shortDisplayUrl}</p>
              </button>
              <button
                onClick={() => handleCopyLink(shortUrl)}
                className="flex items-center justify-center size-10 rounded-full bg-primary/20 hover:bg-primary/30 text-primary transition-colors"
                title="Copy link"
              >
                <span className="material-symbols-outlined text-[20px]">content_copy</span>
              </button>
            </div>
          )}
          
          {/* Original URL */}
          <div className="group relative flex items-center justify-between gap-2 p-1 pl-4 pr-1 rounded-2xl bg-surface-dark border border-white/10 shadow-lg hover:border-primary/50 transition-colors">
            <button 
              onClick={handleVisitSite}
              className="flex items-center gap-2 overflow-hidden py-3 hover:opacity-80 transition-opacity flex-1 min-w-0"
            >
              <span className="material-symbols-outlined text-green-500 text-[18px] flex-shrink-0">lock</span>
              <p className="text-sm font-medium text-white truncate">{displayUrl}</p>
            </button>
            <button
              onClick={() => handleCopyLink()}
              className="flex items-center justify-center size-10 rounded-full bg-white/5 hover:bg-white/10 text-white transition-colors"
              title="Copy link"
            >
              <span className="material-symbols-outlined text-[20px]">content_copy</span>
            </button>
          </div>
          <p className="text-center text-xs text-white/30 mt-3">
            {shortUrl ? 'Link pendek untuk dibagikan • Link asli dengan SSL' : 'Link aktif dan aman (SSL)'}
          </p>
        </div>

        {/* Actions */}
        <div className="z-10 w-full mt-auto flex flex-col gap-3">
          <button onClick={handleShareWhatsApp} className="btn-primary w-full">
            <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
              <path d="M17.472 14.382C17.112 14.202 15.344 13.332 15.013 13.217C14.682 13.101 14.441 13.044 14.2 13.404C13.96 13.764 13.272 14.57 13.061 14.811C12.851 15.051 12.64 15.082 12.28 14.902C11.92 14.721 10.758 14.341 9.38 13.114C8.283 12.137 7.543 10.931 7.332 10.57C7.122 10.21 7.31 10.016 7.49 9.837C7.653 9.674 7.853 9.412 8.033 9.202C8.213 8.992 8.273 8.841 8.393 8.601C8.514 8.361 8.453 8.15 8.363 7.97C8.273 7.79 7.552 6.017 7.252 5.312C6.96 4.631 6.662 4.722 6.442 4.712C6.241 4.703 6.011 4.703 5.781 4.703C5.551 4.703 5.18 4.793 4.87 5.133C4.559 5.473 3.688 6.291 3.688 7.954C3.688 9.617 4.899 11.224 5.07 11.454C5.24 11.685 7.456 15.105 10.846 16.568C11.652 16.916 12.281 17.124 12.774 17.28C13.593 17.54 14.335 17.502 14.922 17.414C15.578 17.316 16.942 16.588 17.222 15.797C17.503 15.006 17.503 14.325 17.412 14.175C17.322 14.025 17.081 13.935 16.721 13.755H17.472V14.382Z"></path>
            </svg>
            <span>Share ke WhatsApp</span>
          </button>

          <button
            onClick={handlePreview}
            className="w-full rounded-full border border-white/20 bg-transparent p-4 hover:bg-white/5 transition-all active:scale-[0.98] text-center flex items-center justify-center gap-2"
          >
            <span className="material-symbols-outlined text-white">visibility</span>
            <span className="text-white text-base font-medium">Preview Website</span>
          </button>

          <a href="/" className="text-center text-primary text-sm font-medium mt-2 hover:underline">
            Kembali ke Dashboard
          </a>
          
          {/* Dev/Test button - delete this project and start fresh */}
          <button
            onClick={handleTestAgain}
            className="text-center text-red-400/60 text-xs font-medium mt-4 hover:text-red-400 transition-colors"
          >
            🧪 Test Lagi (Hapus project ini)
          </button>
        </div>
      </div>
    );
  }

  // Loading view
  const circumference = 2 * Math.PI * 42;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className="flex-1 flex flex-col items-center pt-8 pb-12 px-6">
      {/* Headline */}
      <div className="w-full text-center mb-10">
        <h1 className="text-white tracking-tight text-3xl font-bold leading-tight mb-2">Finalisasi Website</h1>
        <p className="text-gray-400 text-sm">Mohon tunggu sebentar, sedang menyiapkan server.</p>
      </div>

      {/* Circular Progress */}
      <div className="relative flex items-center justify-center mb-12">
        <div className="absolute inset-0 bg-primary/20 blur-3xl rounded-full scale-150 animate-pulse"></div>
        <div className="relative size-48">
          <svg className="size-full" viewBox="0 0 100 100">
            <circle className="text-white/10 stroke-current" cx="50" cy="50" fill="transparent" r="42" strokeWidth="8"></circle>
            <circle
              className="text-primary stroke-current drop-shadow-[0_0_10px_rgba(54,226,123,0.5)]"
              cx="50"
              cy="50"
              fill="transparent"
              r="42"
              strokeDasharray={circumference}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap="round"
              strokeWidth="8"
              style={{ transform: 'rotate(-90deg)', transformOrigin: '50% 50%', transition: 'stroke-dashoffset 0.5s' }}
            ></circle>
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-bold text-white tabular-nums tracking-tighter">
              {progress}
              <span className="text-2xl text-primary">%</span>
            </span>
            <span className="text-xs font-medium text-primary uppercase tracking-widest mt-1">Processing</span>
          </div>
        </div>
      </div>

      {/* Checklists */}
      <div className="w-full space-y-4 max-w-sm">
        {CHECKLIST.map((item, index) => {
          const isCompleted = index < currentStageIndex;
          const isCurrent = index === currentStageIndex;

          return (
            <div
              key={item.id}
              className={`flex items-center gap-4 p-4 rounded-2xl bg-surface-dark border shadow-sm ${
                isCurrent ? 'border-primary/30 shadow-[0_0_20px_rgba(54,226,123,0.1)]' : 'border-white/5'
              }`}
            >
              <div
                className={`flex items-center justify-center size-8 rounded-full ${
                  isCompleted ? 'bg-primary text-black' : isCurrent ? 'bg-white/10 text-primary' : 'bg-white/5 text-gray-500'
                }`}
              >
                {isCompleted ? (
                  <span className="material-symbols-outlined text-[20px]">check</span>
                ) : isCurrent ? (
                  <span className="material-symbols-outlined text-[20px] animate-spin">progress_activity</span>
                ) : (
                  <span className="material-symbols-outlined text-[20px]">circle</span>
                )}
              </div>
              <div className="flex flex-col">
                <p className={`text-base font-medium ${isCompleted ? 'text-gray-500 line-through' : isCurrent ? 'text-white font-bold' : 'text-gray-500'}`}>
                  {isCompleted ? item.completedLabel : item.label}
                </p>
                {isCurrent && <span className="text-xs text-primary mt-1 font-medium">Sedang diproses...</span>}
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-auto pt-8 pb-4">
        <p className="text-center text-xs text-white/40">Jangan tutup aplikasi ini saat proses berjalan.</p>
      </div>
    </div>
  );
}

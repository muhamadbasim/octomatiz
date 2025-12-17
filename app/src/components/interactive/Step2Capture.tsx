import { useEffect, useRef, useState } from 'react';
import { useProjectContext } from '../../context/ProjectContext';
import { useContentGeneration } from '../../hooks/useContentGeneration';
import { compressImage, getBase64SizeKB, formatFileSize } from '../../lib/imageCompressor';

export function Step2Capture() {
  const { currentProject, loadProject, updateProject, setCurrentStep } = useProjectContext();
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [isCompressing, setIsCompressing] = useState(false);
  const [scanError, setScanError] = useState<string | null>(null);
  const [imageSize, setImageSize] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { generate, isGenerating, content, error: aiError } = useContentGeneration({
    category: currentProject?.category || 'kuliner',
    businessName: currentProject?.businessName || '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');
    if (projectId && !currentProject) {
      loadProject(projectId);
    }
  }, []);

  useEffect(() => {
    if (currentProject?.productImage) {
      setCapturedImage(currentProject.productImage);
    }
  }, [currentProject?.id]);

  // Handle AI generation result
  useEffect(() => {
    if (content && currentProject && isScanning) {
      // Save AI-generated content to project
      updateProject(currentProject.id, {
        productImage: capturedImage || undefined,
        headline: content.headline,
        storytelling: content.storytelling,
      });
      setCurrentStep(3);
      window.location.href = `/create/step-3?id=${currentProject.id}`;
    }
  }, [content]);

  // Handle AI error
  useEffect(() => {
    if (aiError && isScanning) {
      setScanError(aiError);
      setIsScanning(false);
    }
  }, [aiError]);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    setScanError(null);

    try {
      // Compress image to < 500KB for optimal API performance
      const compressed = await compressImage(file, {
        maxWidth: 1200,
        maxHeight: 1200,
        quality: 0.8,
        maxSizeKB: 500,
      });
      
      const sizeKB = getBase64SizeKB(compressed);
      setImageSize(formatFileSize(sizeKB));
      setCapturedImage(compressed);
    } catch (error) {
      console.error('Image compression failed:', error);
      // Fallback to original if compression fails
      const reader = new FileReader();
      reader.onload = (event) => {
        const imageData = event.target?.result as string;
        const sizeKB = getBase64SizeKB(imageData);
        setImageSize(formatFileSize(sizeKB));
        setCapturedImage(imageData);
      };
      reader.readAsDataURL(file);
    } finally {
      setIsCompressing(false);
    }
  };

  const handleCapture = () => {
    fileInputRef.current?.click();
  };

  const handleContinue = async () => {
    if (!capturedImage || !currentProject) return;

    setIsScanning(true);
    setScanError(null);
    
    // Save image first
    updateProject(currentProject.id, { productImage: capturedImage });

    // Call AI to analyze image
    await generate(capturedImage);
  };

  const handleSkipAI = () => {
    if (!capturedImage || !currentProject) return;
    
    // Save image and go to step 3 without AI
    updateProject(currentProject.id, { productImage: capturedImage });
    setCurrentStep(3);
    window.location.href = `/create/step-3?id=${currentProject.id}`;
  };

  // Compressing state
  if (isCompressing) {
    return (
      <div className="fixed inset-0 bg-background-dark z-50 flex flex-col items-center justify-center px-6">
        <div className="relative mb-8">
          <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-primary/50 bg-surface-dark flex items-center justify-center">
            <span className="material-symbols-outlined text-6xl text-primary/50 animate-pulse">photo_camera</span>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 text-primary mb-2">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            <span className="font-bold">Mengoptimalkan Gambar...</span>
          </div>
          <p className="text-gray-400 text-sm">Mengompres untuk performa terbaik</p>
        </div>
      </div>
    );
  }

  if (isScanning || isGenerating) {
    return (
      <div className="fixed inset-0 bg-background-dark z-50 flex flex-col items-center justify-center px-6">
        <div className="relative mb-8">
          <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-primary">
            {capturedImage && (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover" />
            )}
            {/* Scanning line animation */}
            <div className="absolute inset-0 overflow-hidden">
              <div className="absolute w-full h-1 bg-primary/80 animate-scan shadow-[0_0_20px_rgba(54,226,123,0.8)]"></div>
            </div>
          </div>
        </div>
        <div className="text-center">
          <div className="flex items-center gap-2 text-primary mb-2">
            <span className="material-symbols-outlined animate-spin">progress_activity</span>
            <span className="font-bold">AI Sedang Menganalisis...</span>
          </div>
          <p className="text-gray-400 text-sm">Mengenali produk dan membuat konten</p>
        </div>
      </div>
    );
  }

  // Error state with retry
  if (scanError) {
    return (
      <div className="fixed inset-0 bg-background-dark z-50 flex flex-col items-center justify-center px-6">
        <div className="relative mb-8">
          <div className="w-48 h-48 rounded-2xl overflow-hidden border-2 border-red-500/50">
            {capturedImage && (
              <img src={capturedImage} alt="Captured" className="w-full h-full object-cover opacity-50" />
            )}
          </div>
        </div>
        <div className="text-center max-w-sm">
          <div className="flex items-center justify-center gap-2 text-red-400 mb-2">
            <span className="material-symbols-outlined">error</span>
            <span className="font-bold">Gagal Menganalisis</span>
          </div>
          <p className="text-gray-400 text-sm mb-6">{scanError}</p>
          <div className="flex flex-col gap-3">
            <button
              onClick={handleContinue}
              className="btn-primary w-full"
            >
              <span className="material-symbols-outlined">refresh</span>
              Coba Lagi
            </button>
            <button
              onClick={handleSkipAI}
              className="w-full py-3 rounded-full border border-white/20 text-white text-sm font-medium hover:bg-white/5 transition-colors"
            >
              Lanjut Tanpa AI
            </button>
            <button
              onClick={() => {
                setScanError(null);
                setCapturedImage(null);
              }}
              className="text-gray-400 text-sm hover:text-white transition-colors"
            >
              Ambil Foto Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen bg-background-dark">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFileSelect}
        className="hidden"
      />

      {/* Camera Feed / Preview */}
      <div className="absolute inset-0 w-full h-full z-0">
        {capturedImage ? (
          <img src={capturedImage} alt="Preview" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full bg-gray-900 flex items-center justify-center">
            <span className="text-gray-600 text-lg">Tap tombol kamera untuk foto</span>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80"></div>
      </div>

      {/* Top Bar */}
      <div className="relative z-10 flex items-center justify-between p-6 pt-8">
        <a
          href={`/create/step-1?id=${currentProject?.id || ''}`}
          className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </a>
        {capturedImage && (
          <button
            onClick={() => setCapturedImage(null)}
            className="flex items-center justify-center size-10 rounded-full bg-black/20 backdrop-blur-md text-white hover:bg-black/40 transition-colors"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        )}
      </div>

      {/* Instructions */}
      <div className="relative z-10 mt-8 flex justify-center px-4">
        <div className="bg-black/40 backdrop-blur-lg border border-white/10 rounded-full px-5 py-3 max-w-[90%] text-center shadow-lg">
          <p className="text-white text-sm font-medium leading-tight">
            {capturedImage
              ? `Foto sudah diambil${imageSize ? ` (${imageSize})` : ''}. Lanjut atau ambil ulang.`
              : 'Foto produk unggulan dari jarak dekat dan pencahayaan terang.'}
          </p>
        </div>
      </div>

      {/* Focus Reticle */}
      {!capturedImage && (
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 size-48 border border-white/30 rounded-lg pointer-events-none z-0">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-primary rounded-tl-lg"></div>
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-primary rounded-tr-lg"></div>
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-primary rounded-bl-lg"></div>
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-primary rounded-br-lg"></div>
        </div>
      )}

      {/* Bottom Controls */}
      <div className="absolute bottom-0 left-0 right-0 z-20 pb-10 pt-20 px-8 flex items-center justify-between bg-gradient-to-t from-background-dark/95 to-transparent">
        {/* Gallery Button */}
        <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center gap-1 group/btn">
          <div className="flex items-center justify-center size-12 rounded-full bg-surface-dark border border-white/10 text-white shadow-lg group-hover/btn:bg-primary/20 transition-all">
            <span className="material-symbols-outlined">photo_library</span>
          </div>
          <span className="text-[10px] font-medium text-white/80">Galeri</span>
        </button>

        {/* Shutter / Continue Button */}
        {capturedImage ? (
          <button onClick={handleContinue} className="relative group/shutter">
            <div className="size-20 rounded-full border-4 border-primary flex items-center justify-center shadow-[0_0_20px_rgba(54,226,123,0.3)] transition-transform group-active/shutter:scale-95 bg-primary">
              <span className="material-symbols-outlined text-background-dark text-3xl">arrow_forward</span>
            </div>
          </button>
        ) : (
          <button onClick={handleCapture} className="relative group/shutter">
            <div className="size-20 rounded-full border-4 border-white flex items-center justify-center shadow-[0_0_20px_rgba(255,255,255,0.3)] transition-transform group-active/shutter:scale-95">
              <div className="size-16 rounded-full bg-primary shadow-inner"></div>
            </div>
          </button>
        )}

        {/* Tips Button */}
        <button className="flex flex-col items-center gap-1 group/btn">
          <div className="flex items-center justify-center size-12 rounded-full bg-surface-dark border border-white/10 text-white shadow-lg group-hover/btn:bg-primary/20 transition-all">
            <span className="material-symbols-outlined">lightbulb</span>
          </div>
          <span className="text-[10px] font-medium text-white/80">Tips</span>
        </button>
      </div>
    </div>
  );
}

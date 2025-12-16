import { useState, useEffect, useCallback } from 'react';
import { useProject } from '../../hooks/useProject';
import { useAutoSave } from '../../hooks/useAutoSave';
import { validateStep1 } from '../../lib/validation';
import type { BusinessCategory } from '../../types/project';

const CATEGORIES: { value: BusinessCategory; label: string }[] = [
  { value: 'kuliner', label: 'Kuliner' },
  { value: 'fashion', label: 'Fashion' },
  { value: 'jasa', label: 'Jasa' },
  { value: 'kerajinan', label: 'Kerajinan' },
];

interface FormData {
  businessName: string;
  whatsapp: string;
  category: BusinessCategory;
  location: string;
}

export function Step1Form() {
  const { project, updateProject, isLoaded } = useProject();
  
  const [formData, setFormData] = useState<FormData>({
    businessName: '',
    whatsapp: '',
    category: 'kuliner',
    location: '',
  });
  
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Load project data on mount
  useEffect(() => {
    if (project) {
      setFormData({
        businessName: project.businessName || '',
        whatsapp: project.whatsapp || '',
        category: project.category || 'kuliner',
        location: project.location || '',
      });
    }
  }, [project?.id]); // Only reload when project ID changes

  // Auto-save form data
  const handleSave = useCallback((data: FormData) => {
    if (!project) return;
    updateProject({
      businessName: data.businessName,
      whatsapp: data.whatsapp,
      category: data.category,
      location: data.location,
    });
  }, [project, updateProject]);

  useAutoSave(formData, handleSave, {
    debounceMs: 500,
    enabled: isLoaded,
  });

  const handleChange = (field: keyof FormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const handleBlur = (field: keyof FormData) => {
    setTouched(prev => ({ ...prev, [field]: true }));
    
    // Validate single field on blur
    const validation = validateStep1(formData);
    if (validation.errors[field]) {
      setErrors(prev => ({ ...prev, [field]: validation.errors[field] }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all fields
    const validation = validateStep1(formData);
    setErrors(validation.errors);
    setTouched({
      businessName: true,
      whatsapp: true,
      category: true,
      location: true,
    });

    if (validation.isValid) {
      // Save and navigate to next step
      handleSave(formData);
      window.location.href = '/create/step-2';
    }
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-6">
      {/* Nama Bisnis */}
      <label className="flex flex-col w-full">
        <p className="text-white text-base font-medium leading-normal pb-2">Nama Bisnis</p>
        <input
          type="text"
          value={formData.businessName}
          onChange={(e) => handleChange('businessName', e.target.value)}
          onBlur={() => handleBlur('businessName')}
          className={`input-field ${errors.businessName && touched.businessName ? 'border-red-500 focus:ring-red-500/50' : ''}`}
          placeholder="Contoh: Sate Maranggi Pak Joyo"
        />
        {errors.businessName && touched.businessName && (
          <p className="text-red-400 text-sm mt-1">{errors.businessName}</p>
        )}
      </label>

      {/* Nomor WhatsApp */}
      <label className="flex flex-col w-full">
        <p className="text-white text-base font-medium leading-normal pb-2">Nomor WhatsApp</p>
        <div className={`flex w-full items-stretch rounded-xl border bg-surface-dark overflow-hidden transition-all ${
          errors.whatsapp && touched.whatsapp 
            ? 'border-red-500 focus-within:ring-2 focus-within:ring-red-500/50' 
            : 'border-border-dark focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary'
        }`}>
          <div className="flex items-center justify-center pl-4 pr-3 border-r border-border-dark bg-[#151c18]">
            <img
              alt="Indonesia Flag"
              className="w-6 h-auto mr-2 rounded-sm shadow-sm"
              src="https://flagcdn.com/w40/id.png"
            />
            <span className="text-white font-medium">+62</span>
          </div>
          <input
            type="tel"
            value={formData.whatsapp}
            onChange={(e) => handleChange('whatsapp', e.target.value.replace(/\D/g, ''))}
            onBlur={() => handleBlur('whatsapp')}
            className="flex w-full min-w-0 flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 h-14 placeholder:text-text-muted px-4 text-base font-normal leading-normal"
            placeholder="812-3456-7890"
          />
          <div className="flex items-center justify-center pr-4 text-success">
            <span className="material-symbols-outlined">chat</span>
          </div>
        </div>
        {errors.whatsapp && touched.whatsapp ? (
          <p className="text-red-400 text-sm mt-1">{errors.whatsapp}</p>
        ) : (
          <p className="text-text-muted text-sm font-normal leading-normal pt-2 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px]">info</span>
            Nomor ini akan jadi tombol pemesanan
          </p>
        )}
      </label>

      {/* Kategori Bisnis */}
      <div className="flex flex-col w-full">
        <p className="text-white text-base font-medium leading-normal pb-3">Kategori Bisnis</p>
        <div className="grid grid-cols-2 gap-3">
          {CATEGORIES.map((cat) => (
            <label key={cat.value} className="cursor-pointer group relative">
              <input
                type="radio"
                name="category"
                value={cat.value}
                checked={formData.category === cat.value}
                onChange={(e) => handleChange('category', e.target.value as BusinessCategory)}
                className="peer sr-only"
              />
              <div className="flex items-center justify-center rounded-xl border border-border-dark bg-surface-dark hover:border-primary/50 text-white py-4 px-3 peer-checked:bg-primary peer-checked:text-background-dark peer-checked:border-primary transition-all">
                <span className="font-medium peer-checked:font-bold text-base text-center w-full block">
                  {cat.label}
                </span>
              </div>
            </label>
          ))}
        </div>
        {errors.category && touched.category && (
          <p className="text-red-400 text-sm mt-1">{errors.category}</p>
        )}
      </div>

      {/* Lokasi Bisnis */}
      <div className="flex flex-col w-full">
        <p className="text-white text-base font-medium leading-normal pb-2">Lokasi Bisnis</p>
        <div className="flex w-full items-stretch rounded-xl border border-border-dark bg-surface-dark overflow-hidden focus-within:ring-2 focus-within:ring-primary/50 focus-within:border-primary transition-all relative">
          <input
            type="text"
            value={formData.location}
            onChange={(e) => handleChange('location', e.target.value)}
            className="flex w-full min-w-0 flex-1 bg-transparent border-none text-white focus:outline-none focus:ring-0 h-14 placeholder:text-text-muted px-4 pr-14 text-base font-normal leading-normal"
            placeholder="Cari kota atau kecamatan..."
          />
          <button
            type="button"
            className="absolute right-0 top-0 h-14 w-14 flex items-center justify-center text-primary hover:bg-primary/5 active:scale-95 transition-all"
            title="Deteksi Lokasi Otomatis"
          >
            <span className="material-symbols-outlined">my_location</span>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="fixed bottom-0 left-0 w-full p-4 bg-gradient-to-t from-background-dark via-background-dark to-transparent pt-8 z-20">
        <div className="max-w-md mx-auto">
          <button type="submit" className="btn-primary w-full">
            <span>Lanjut ke Foto</span>
            <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
          </button>
        </div>
      </div>
    </form>
  );
}

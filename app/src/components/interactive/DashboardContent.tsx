import { useState } from 'react';
import { useProjects } from '../../hooks/useProject';
import { DashboardSkeleton } from './SkeletonCard';
import { DeleteConfirmModal } from './DeleteConfirmModal';
import { Toast, useToast } from './Toast';
import type { Project } from '../../types/project';

interface ProjectCardProps {
  project: Project;
  onContinue: (id: string) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string, name: string) => void;
  onCopyLink: (domain: string) => void;
}

function ProjectCard({ project, onContinue, onEdit, onDelete, onCopyLink }: ProjectCardProps) {
  const statusConfig: Record<string, { label: string; bgClass: string; textClass: string; borderClass: string; showPulse?: boolean; icon?: string }> = {
    live: {
      label: 'Live',
      bgClass: 'bg-primary/10',
      textClass: 'text-primary',
      borderClass: 'border-primary/20',
      showPulse: true,
    },
    building: {
      label: 'Building',
      bgClass: 'bg-yellow-500/10',
      textClass: 'text-yellow-500',
      borderClass: 'border-yellow-500/20',
      icon: 'handyman',
    },
    draft: {
      label: 'Draft',
      bgClass: 'bg-gray-500/10',
      textClass: 'text-gray-400',
      borderClass: 'border-gray-500/20',
    },
  };

  const config = statusConfig[project.status];
  const displayName = project.businessName || 'Proyek Baru';
  const displayImage = project.productImage || 'https://via.placeholder.com/80x80/1a1a2e/36e27b?text=🐙';

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDelete(project.id, displayName);
  };

  const handleCopyLink = () => {
    if (project.domain) {
      onCopyLink(project.domain);
    }
  };

  const handleVisitSite = () => {
    if (project.domain) {
      window.open(`https://${project.domain}`, '_blank');
    }
  };

  return (
    <div className={`group relative flex flex-col gap-4 card p-4 transition-all duration-300 ${project.status === 'draft' ? 'opacity-80 hover:opacity-100' : ''}`}>
      <div className="flex gap-4">
        {/* Thumbnail */}
        <div className="w-20 h-20 shrink-0 rounded-lg bg-gray-800 overflow-hidden relative">
          <img
            className={`w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 ${project.status === 'draft' ? 'grayscale group-hover:grayscale-0' : ''}`}
            src={displayImage}
            alt={displayName}
          />
          <div className="absolute inset-0 bg-black/10"></div>
        </div>

        {/* Content */}
        <div className="flex flex-col flex-1 min-w-0 justify-center">
          <div className="flex items-center justify-between mb-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full ${config.bgClass} ${config.textClass} text-[10px] font-bold uppercase tracking-wider border ${config.borderClass}`}>
              {config.showPulse && <span className="w-1.5 h-1.5 rounded-full bg-primary animate-pulse"></span>}
              {config.icon && <span className="material-symbols-outlined text-[10px]">{config.icon}</span>}
              {config.label}
            </span>
            {/* Delete button */}
            <button
              onClick={handleDelete}
              className="opacity-0 group-hover:opacity-100 p-1 rounded-full hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-all"
              title="Hapus proyek"
            >
              <span className="material-symbols-outlined text-[16px]">delete</span>
            </button>
          </div>
          <h3 className="text-white text-base font-bold truncate leading-tight">{displayName}</h3>
          {project.domain ? (
            <button 
              onClick={handleVisitSite}
              className="text-gray-400 text-xs hover:text-primary truncate transition-colors text-left"
            >
              {project.domain} ↗
            </button>
          ) : (
            <span className="text-gray-500 text-xs italic">Belum dipublikasi</span>
          )}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-2 pt-2 border-t border-white/5">
        {project.status === 'draft' && (
          <button
            onClick={() => onContinue(project.id)}
            className="w-full h-9 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
          >
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            Lanjutkan
          </button>
        )}
        {project.status === 'building' && (
          <button className="w-full h-9 rounded-full bg-yellow-500/10 hover:bg-yellow-500/20 text-yellow-500 text-xs font-bold flex items-center justify-center gap-1.5 transition-colors">
            <span className="material-symbols-outlined text-[16px]">visibility</span>
            Preview
          </button>
        )}
        {project.status === 'live' && (
          <div className="flex gap-2 w-full">
            <button 
              onClick={handleCopyLink}
              className="flex-1 h-9 rounded-full bg-primary/10 hover:bg-primary/20 text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">content_copy</span>
              Copy Link
            </button>
            <button 
              onClick={() => onEdit(project.id)}
              className="h-9 px-3 rounded-full bg-white/5 hover:bg-white/10 text-white text-xs font-bold flex items-center justify-center gap-1 transition-colors"
            >
              <span className="material-symbols-outlined text-[16px]">edit</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}


export function DashboardContent() {
  const { projects, isLoading, createProject, deleteProject, loadProject, updateProject } = useProjects();
  const { toast, showToast, hideToast } = useToast();
  const [deleteModal, setDeleteModal] = useState<{ isOpen: boolean; id: string; name: string }>({
    isOpen: false,
    id: '',
    name: '',
  });

  const handleCreateProject = () => {
    const newProject = createProject();
    window.location.href = `/create/step-1?id=${newProject.id}`;
  };

  const handleContinueProject = (id: string) => {
    loadProject(id);
    const project = projects.find(p => p.id === id);
    const step = project?.currentStep || 1;
    window.location.href = `/create/step-${step}?id=${id}`;
  };

  const handleEditProject = (id: string) => {
    // Set project back to draft mode for editing
    updateProject(id, { status: 'draft', currentStep: 1 });
    loadProject(id);
    window.location.href = `/create/step-1?id=${id}`;
  };

  const handleCopyLink = async (domain: string) => {
    try {
      await navigator.clipboard.writeText(`https://${domain}`);
      showToast('Link berhasil disalin!', 'success');
    } catch {
      showToast('Gagal menyalin link', 'error');
    }
  };

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteModal({ isOpen: true, id, name });
  };

  const handleDeleteConfirm = () => {
    deleteProject(deleteModal.id);
    setDeleteModal({ isOpen: false, id: '', name: '' });
    showToast('Proyek berhasil dihapus', 'success');
  };

  const handleDeleteCancel = () => {
    setDeleteModal({ isOpen: false, id: '', name: '' });
  };

  // Stats
  const totalProjects = projects.length;
  const liveProjects = projects.filter(p => p.status === 'live').length;

  // Show skeleton while loading
  if (isLoading) {
    return <DashboardSkeleton />;
  }

  return (
    <>
      {/* Welcome Section */}
      <div className="flex flex-col gap-1 pt-2">
        <p className="text-gray-400 text-sm font-medium">Selamat Datang,</p>
        <h2 className="text-2xl font-bold text-white leading-tight">Project Terbaru Anda</h2>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        <div className="card p-4 flex flex-col gap-1">
          <span className="text-2xl font-bold text-primary">{totalProjects}</span>
          <span className="text-xs text-gray-400">Total Proyek</span>
        </div>
        <div className="card p-4 flex flex-col gap-1">
          <span className="text-2xl font-bold text-blue-400">{liveProjects}</span>
          <span className="text-xs text-gray-400">Sudah Live</span>
        </div>
      </div>

      {/* Project List */}
      <div className="flex flex-col gap-4">
        {projects.length === 0 ? (
          <div className="card p-8 text-center">
            <div className="text-4xl mb-3">🐙</div>
            <p className="text-gray-400 text-sm mb-4">Belum ada proyek. Mulai buat landing page pertamamu!</p>
            <button
              onClick={handleCreateProject}
              className="btn-primary px-6 py-2 text-sm"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              Buat Proyek Baru
            </button>
          </div>
        ) : (
          projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onContinue={handleContinueProject}
              onEdit={handleEditProject}
              onDelete={handleDeleteClick}
              onCopyLink={handleCopyLink}
            />
          ))
        )}
      </div>

      {/* FAB */}
      <button
        onClick={handleCreateProject}
        className="fixed bottom-6 right-6 w-14 h-14 rounded-full bg-primary hover:bg-primary/90 text-black flex items-center justify-center shadow-lg shadow-primary/30 transition-all hover:scale-105 active:scale-95 z-50"
        aria-label="Buat proyek baru"
      >
        <span className="material-symbols-outlined text-[28px]">add</span>
      </button>

      {/* Delete Confirmation Modal */}
      <DeleteConfirmModal
        isOpen={deleteModal.isOpen}
        projectName={deleteModal.name}
        onConfirm={handleDeleteConfirm}
        onCancel={handleDeleteCancel}
      />

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={hideToast}
        />
      )}
    </>
  );
}

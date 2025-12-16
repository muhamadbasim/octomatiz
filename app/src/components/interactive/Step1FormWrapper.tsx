import { useEffect } from 'react';
import { ProjectProvider, useProjectContext } from '../../context/ProjectContext';
import { Step1Form } from './Step1Form';

function Step1FormLoader() {
  const { currentProject, loadProject, createProject, isLoading } = useProjectContext();

  useEffect(() => {
    // Get project ID from URL
    const params = new URLSearchParams(window.location.search);
    const projectId = params.get('id');

    if (projectId) {
      // Load existing project
      loadProject(projectId);
    } else if (!currentProject) {
      // Create new project and update URL
      const newProject = createProject();
      const newUrl = `${window.location.pathname}?id=${newProject.id}`;
      window.history.replaceState({}, '', newUrl);
    }
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <Step1Form />;
}

export function Step1FormWrapper() {
  return (
    <ProjectProvider>
      <Step1FormLoader />
    </ProjectProvider>
  );
}

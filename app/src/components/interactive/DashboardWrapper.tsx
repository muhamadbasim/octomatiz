import { ProjectProvider } from '../../context/ProjectContext';
import { DashboardContent } from './DashboardContent';

export function DashboardWrapper() {
  return (
    <ProjectProvider>
      <DashboardContent />
    </ProjectProvider>
  );
}

import { ProjectProvider } from '../../context/ProjectContext';
import { Step5Deploy } from './Step5Deploy';

export function Step5Wrapper() {
  return (
    <ProjectProvider>
      <Step5Deploy />
    </ProjectProvider>
  );
}

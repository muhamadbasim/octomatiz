import { ProjectProvider } from '../../context/ProjectContext';
import { Step2Capture } from './Step2Capture';

export function Step2Wrapper() {
  return (
    <ProjectProvider>
      <Step2Capture />
    </ProjectProvider>
  );
}

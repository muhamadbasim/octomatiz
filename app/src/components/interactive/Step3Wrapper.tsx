import { ProjectProvider } from '../../context/ProjectContext';
import { Step3Review } from './Step3Review';

export function Step3Wrapper() {
  return (
    <ProjectProvider>
      <Step3Review />
    </ProjectProvider>
  );
}

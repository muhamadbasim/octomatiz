import { ProjectProvider } from '../../context/ProjectContext';
import { Step4Design } from './Step4Design';

export function Step4Wrapper() {
  return (
    <ProjectProvider>
      <Step4Design />
    </ProjectProvider>
  );
}

import { ProjectProvider } from '../../context/ProjectContext';
import { Step1Form } from './Step1Form';

export function Step1FormWrapper() {
  return (
    <ProjectProvider>
      <Step1Form />
    </ProjectProvider>
  );
}

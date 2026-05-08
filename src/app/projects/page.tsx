import { auth } from '@/lib/auth';
import { ProjectsPage } from '@/components/projects/ProjectsPage';

export const metadata = { title: 'Projects – ChatVid' };

export default async function ProjectsRoute() {
  const session = await auth();
  return <ProjectsPage user={session?.user ?? null} />;
}

import { EditorShell } from '@/components/editor/EditorShell';

interface Props {
  searchParams: Promise<{ projectId?: string }>;
}

export default async function EditorPage({ searchParams }: Props) {
  const { projectId } = await searchParams;
  return <EditorShell projectId={projectId} />;
}

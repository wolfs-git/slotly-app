import { healthResponseSchema } from '@slotly/shared';
import { useQuery } from '@tanstack/react-query';

async function fetchHealth() {
  const response = await fetch('/api/health');
  if (!response.ok) throw new Error(`HTTP ${response.status}`);
  return healthResponseSchema.parse(await response.json());
}

export function App() {
  const health = useQuery({ queryKey: ['health'], queryFn: fetchHealth });

  return (
    <main>
      <h1>Slotly</h1>
      {health.isPending && <p>Перевірка API…</p>}
      {health.isError && <p role="alert">API недоступний</p>}
      {health.isSuccess && <p>API: {health.data.status}</p>}
    </main>
  );
}

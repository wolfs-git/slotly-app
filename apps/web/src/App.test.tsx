import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { App } from './App';

function renderWithResponse(response: Response) {
  vi.stubGlobal('fetch', vi.fn().mockResolvedValue(response));
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  render(
    <QueryClientProvider client={client}>
      <App />
    </QueryClientProvider>,
  );
}

describe('App', () => {
  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  it('shows status from a valid health response', async () => {
    renderWithResponse(Response.json({ status: 'ok', database: 'up' }));
    expect(await screen.findByText('API: ok')).toBeTruthy();
  });

  it('shows an error when the response breaks the shared schema', async () => {
    renderWithResponse(Response.json({ status: 'broken' }));
    expect(await screen.findByRole('alert')).toBeTruthy();
  });

  it('shows an error on a failed request', async () => {
    renderWithResponse(new Response(null, { status: 503 }));
    expect(await screen.findByRole('alert')).toBeTruthy();
  });
});

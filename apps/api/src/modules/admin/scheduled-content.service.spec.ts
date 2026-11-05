import type { SupabaseService } from '../../supabase/supabase.service.js';
import type { RevalidationService } from './revalidation.service.js';
import { ScheduledContentService } from './scheduled-content.service.js';

function setup(results: { count: number | null; error?: { message: string } | null }[]) {
  const windows: { gt: string; lte: string }[] = [];
  const query = {
    select: () => query,
    eq: () => query,
    gt(_: string, value: string) {
      windows.push({ gt: value, lte: '' });
      return query;
    },
    lte(_: string, value: string) {
      (windows.at(-1) as { lte: string }).lte = value;
      const next = results.shift();
      return Promise.resolve({ count: next?.count ?? 0, error: next?.error ?? null });
    },
  };
  const supabase = { isConfigured: true, publicClient: { from: () => query } };
  const revalidation = { revalidateContent: vi.fn(() => Promise.resolve(true)) };
  const service = new ScheduledContentService(
    supabase as unknown as SupabaseService,
    revalidation as unknown as RevalidationService,
  );
  return { service, revalidation, windows };
}

const T1 = new Date('2030-01-01T00:01:00Z');
const T2 = new Date('2030-01-01T00:02:00Z');

describe('ScheduledContentService', () => {
  it('stays quiet when nothing has come due', async () => {
    const { service, revalidation } = setup([{ count: 0 }]);
    await service.check(T1);
    expect(revalidation.revalidateContent).not.toHaveBeenCalled();
  });

  it('refreshes the site when an article comes due, then moves its window on', async () => {
    const { service, revalidation, windows } = setup([{ count: 1 }, { count: 0 }]);
    await service.check(T1);
    await service.check(T2);
    expect(revalidation.revalidateContent).toHaveBeenCalledOnce();
    expect(windows[1]?.gt).toBe(T1.toISOString());
  });

  it('retries the same window when the site could not be told', async () => {
    const { service, revalidation, windows } = setup([{ count: 1 }, { count: 1 }]);
    revalidation.revalidateContent.mockResolvedValueOnce(false);
    await service.check(T1);
    await service.check(T2);
    expect(windows[1]?.gt).toBe(windows[0]?.gt);
    expect(revalidation.revalidateContent).toHaveBeenCalledTimes(2);
  });

  it('retries the same window after a database error', async () => {
    const { service, windows } = setup([{ count: null, error: { message: 'down' } }, { count: 0 }]);
    await service.check(T1);
    await service.check(T2);
    expect(windows[1]?.gt).toBe(windows[0]?.gt);
  });

  it('does not start a timer without Supabase', () => {
    const { service } = setup([]);
    (service as unknown as { supabase: { isConfigured: boolean } }).supabase.isConfigured = false;
    service.onModuleInit();
    expect((service as unknown as { timer?: unknown }).timer).toBeUndefined();
  });
});

import 'server-only';
import { getStore } from '@/lib/store';

export const DAILY_ANALYSIS_LIMIT = 5;

export type UsageStatus = {
  used: number;
  limit: number;
  remaining: number;
  resetsAt: string;
};

/** Rolling 24-hour window start. */
function windowStartIso(): string {
  return new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
}

export async function getUsageStatus(userId: string): Promise<UsageStatus> {
  const used = await getStore().countUsageSince(userId, windowStartIso(), 'analysis');
  return {
    used,
    limit: DAILY_ANALYSIS_LIMIT,
    remaining: Math.max(0, DAILY_ANALYSIS_LIMIT - used),
    resetsAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
  };
}

export async function assertWithinLimit(userId: string): Promise<UsageStatus> {
  const status = await getUsageStatus(userId);
  if (status.remaining <= 0) {
    throw new UsageLimitError(status);
  }
  return status;
}

export class UsageLimitError extends Error {
  constructor(public status: UsageStatus) {
    super('Daily analysis limit reached.');
    this.name = 'UsageLimitError';
  }
}

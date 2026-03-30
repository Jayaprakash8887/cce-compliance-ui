import { describe, it, expect } from 'vitest';
import { formatDate, formatDateTime, daysUntil, daysSince, toUtcString } from '../../utils/dates';

describe('formatDate', () => {
  it('formats ISO date string', () => {
    const result = formatDate('2026-03-15T10:30:00Z');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
    expect(result).toContain('2026');
  });
});

describe('formatDateTime', () => {
  it('includes time', () => {
    const result = formatDateTime('2026-03-15T10:30:00Z');
    expect(result).toContain('Mar');
    expect(result).toContain('15');
  });
});

describe('daysUntil / daysSince', () => {
  it('daysUntil returns positive for future dates', () => {
    const future = new Date();
    future.setDate(future.getDate() + 5);
    expect(daysUntil(future.toISOString())).toBe(5);
  });

  it('daysSince returns positive for past dates', () => {
    const past = new Date();
    past.setDate(past.getDate() - 3);
    expect(daysSince(past.toISOString())).toBe(3);
  });
});

describe('toUtcString', () => {
  it('returns ISO string', () => {
    expect(toUtcString('2026-03-15T10:30:00Z')).toBe('2026-03-15T10:30:00.000Z');
  });
});

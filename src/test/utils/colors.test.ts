import { describe, it, expect } from 'vitest';
import { STATE_COLORS, STATUS_COLORS, COMPLETION_COLORS } from '../../utils/colors';

describe('STATE_COLORS', () => {
  const states = ['pending', 'due', 'overdue', 'missed', 'completed', 'skipped'] as const;

  states.forEach((state) => {
    it(`has bg/text/dot for ${state}`, () => {
      const colors = STATE_COLORS[state];
      expect(colors.bg).toBeTruthy();
      expect(colors.text).toBeTruthy();
      expect(colors.dot).toBeTruthy();
    });
  });
});

describe('STATUS_COLORS', () => {
  const statuses = ['active', 'completed', 'withdrawn', 'expired'] as const;

  statuses.forEach((status) => {
    it(`has bg/text for ${status}`, () => {
      const colors = STATUS_COLORS[status];
      expect(colors.bg).toBeTruthy();
      expect(colors.text).toBeTruthy();
    });
  });
});

describe('COMPLETION_COLORS', () => {
  const completions = ['early', 'on_time', 'late'] as const;

  completions.forEach((cs) => {
    it(`has bg/text for ${cs}`, () => {
      const colors = COMPLETION_COLORS[cs];
      expect(colors.bg).toBeTruthy();
      expect(colors.text).toBeTruthy();
    });
  });
});
